"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Buscar, matchesSearch } from "@/components/buscar";
import { Field } from "@/components/auth/field";
import { createClient } from "@/lib/supabase/client";
import { AdjuntarPresupuesto, type PresupuestoDocumento } from "@/components/presupuesto/adjuntar-presupuesto";
import { EditarConfirma } from "@/components/presupuesto/editar-confirma";
import { formatHistoryDate, type EstadoFecha } from "@/lib/presupuesto-historial";

export type PresupuestoItem = {
  id: string;
  fecha: string;
  fechaDia: string;
  direccion: string;
  capacidad: string;
  capacidadValor: string;
  servicio: string;
  ubicacion: string;
  facilAcceso: string;
  instalacionElectrica: string;
  nuevo: string;
  desinstalar: string;
  fotos: { src: string; alt: string }[];
  documento: PresupuestoDocumento | null;
  estado: string;
  historial: EstadoFecha[];
  cliente: string;
  email: string;
  telefono: string;
};

export function MisPresupuestos({ items, todos = false }: { items: PresupuestoItem[]; todos?: boolean }) {
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const visible = items.filter((item) => {
    const actual = item.estado.trim().toLowerCase();
    const matchesEstado = !estado || actual === estado;
    const matchesFecha = (!desde || item.fechaDia >= desde) && (!hasta || item.fechaDia <= hasta);
    return (
      matchesEstado &&
      matchesFecha &&
      matchesSearch(query, [
        item.id,
        item.fecha,
        item.direccion,
        item.capacidad,
      item.servicio,
        item.estado,
        item.cliente,
        item.email,
        item.telefono,
        ...item.historial.flatMap((entry) => [entry.estado, formatHistoryDate(entry.fecha)]),
      ])
    );
  });
  const filtering = query.trim().length > 0 || estado.length > 0 || desde.length > 0 || hasta.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 ? null : (
        <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
          <div className="min-w-0 lg:min-w-48 lg:flex-1">
            <Buscar value={query} onChange={setQuery} />
          </div>
          <FiltroEstado value={estado} onChange={setEstado} />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex">
            <FiltroFecha label="Desde" value={desde} onChange={setDesde} />
            <FiltroFecha label="Hasta" value={hasta} onChange={setHasta} />
          </div>
        </div>
      )}
      <PresupuestosTabla items={visible} todos={todos} empty={items.length === 0} filtering={filtering} />
      {todos ? null : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/lista-de-precios"
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-teal text-sm font-semibold text-navy shadow-[0_8px_24px_rgba(20,200,232,0.45)] transition hover:bg-[#0eb6d4]"
          >
            Lista de precios
          </Link>
          <Link
            href="/presupuesto"
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-[#b7d7ea] bg-white text-sm font-semibold text-navy transition hover:border-teal"
          >
            {items.length === 0 ? "Pedir presupuesto" : "Pedir otro presupuesto"}
          </Link>
        </div>
      )}
    </div>
  );
}

const head = "px-1 py-1.5 text-left font-semibold";
const cell = "px-1 py-1.5";

function PresupuestosTabla({
  items,
  todos,
  empty,
  filtering,
}: {
  items: PresupuestoItem[];
  todos: boolean;
  empty: boolean;
  filtering: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <p className="text-sm leading-6 text-navy/75">
        {filtering
          ? "No hay resultados para ese filtro."
          : empty
            ? todos
              ? "Todavía no hay presupuestos."
              : "Todavía no enviaste un presupuesto."
            : "No hay resultados para ese filtro."}
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-3 lg:hidden">
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-[#d3e7f3] bg-white p-3">
            {editingId === item.id ? (
              <PresupuestoForm item={item} onClose={() => setEditingId(null)} />
            ) : (
              <>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold">#{item.id}</p>
              <p className="text-right text-xs text-navy/60">{item.fecha}</p>
            </div>
            {todos ? (
              <div className="mt-2 text-sm">
                <p className="font-semibold">{item.cliente || "Sin nombre"}</p>
                <p className="[overflow-wrap:anywhere] text-navy/60">
                  <WrappedEmail email={item.email} />
                </p>
                {item.telefono ? <p className="text-navy/60">{item.telefono}</p> : null}
              </div>
            ) : null}
            <dl className="mt-3 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
              <Dato label="Dirección" value={item.direccion} />
              <Dato label="Capacidad" value={item.capacidad} />
              <Dato label="Servicio" value={item.servicio || "—"} />
              <div className="contents">
                <dt className="text-navy/50">Estado</dt>
                <dd>
                  <EstadoValor item={item} todos={todos} />
                </dd>
              </div>
              <div className="contents">
                <dt className="text-navy/50">Fechas</dt>
                <dd>
                  <HistorialValor item={item} />
                </dd>
              </div>
            </dl>
            <div className="mt-3 flex flex-col gap-2">
              {todos ? <AdjuntarPresupuesto id={item.id} documento={item.documento} compact /> : null}
              <DocumentoValor item={item} />
            </div>
            <FilaAcciones item={item} onEdit={() => setEditingId(item.id)} />
              </>
            )}
          </li>
        ))}
      </ul>
    <table className="hidden w-full table-fixed border-collapse text-left text-xs lg:table">
      <thead>
        <tr className="border-b border-[#d3e7f3] text-[11px] leading-tight text-navy/50">
          <th className={head}>ID</th>
          <th className={head}>Fecha</th>
          {todos ? <th className={head}>Cliente</th> : null}
          <th className={head}>Dirección</th>
          <th className={head}>Capacidad</th>
          <th className={head}>Servicio</th>
          <th className={head}>Estado</th>
          <th className={head}>Fecha de presupuesto</th>
          {todos ? <th className={head} /> : null}
          <th className={head}>Presupuestos</th>
          <th className={head}>
            <span className="sr-only">Acciones</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) =>
          editingId === item.id ? (
            <tr key={item.id} className="border-b border-[#e7f3fa] align-top">
              <td className={cell} colSpan={todos ? 11 : 9}>
                <PresupuestoForm item={item} onClose={() => setEditingId(null)} />
              </td>
            </tr>
          ) : (
          <tr key={item.id} className="border-b border-[#e7f3fa] align-top">
            <td className={`${cell} font-semibold`}>{item.id}</td>
            <td className={cell}>{item.fecha}</td>
            {todos ? (
              <td className={cell}>
                <p className="font-semibold">{item.cliente || "Sin nombre"}</p>
                <p className="[overflow-wrap:anywhere] text-navy/60">
                  <WrappedEmail email={item.email} />
                </p>
                {item.telefono ? <p className="text-navy/60">{item.telefono}</p> : null}
              </td>
            ) : null}
            <td className={cell}>{item.direccion}</td>
            <td className={`${cell} whitespace-nowrap`}>{item.capacidad}</td>
            <td className={cell}>{item.servicio || "—"}</td>
            <td className={cell}>
              <EstadoValor item={item} todos={todos} />
            </td>
            <td className={cell}>
              <HistorialValor item={item} />
            </td>
            {todos ? (
              <td className={cell}>
                <AdjuntarPresupuesto id={item.id} documento={item.documento} compact />
              </td>
            ) : null}
            <td className={cell}>
              <DocumentoValor item={item} />
            </td>
            <td className={cell}>
              <FilaAcciones item={item} onEdit={() => setEditingId(item.id)} />
            </td>
          </tr>
          ),
        )}
      </tbody>
    </table>
    </>
  );
}

const servicios = ["Instalación nuevo", "Mantenimiento", "Diagnóstico", "Reparación", "Mudanza"];

function PresupuestoForm({ item, onClose }: { item: PresupuestoItem; onClose: () => void }) {
  const router = useRouter();
  const [servicio, setServicio] = useState(item.servicio);
  const [direccion, setDireccion] = useState(item.direccion === "Sin dirección" ? "" : item.direccion);
  const [capacidad, setCapacidad] = useState(item.capacidadValor);
  const [ubicacion, setUbicacion] = useState(item.ubicacion === "—" ? "" : item.ubicacion);
  const [facilAcceso, setFacilAcceso] = useState(choice(item.facilAcceso));
  const [instalacionElectrica, setInstalacionElectrica] = useState(choice(item.instalacionElectrica));
  const [equipoNuevo, setEquipoNuevo] = useState(choice(item.nuevo));
  const [desinstalar, setDesinstalar] = useState(choice(item.desinstalar));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const opciones = servicio && !servicios.includes(servicio) ? [servicio, ...servicios] : servicios;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!servicio) {
      setError("Elegí el tipo de servicio.");
      return;
    }
    const frigorias = Number(capacidad.replace(",", "."));
    if (!Number.isFinite(frigorias) || frigorias <= 0) {
      setError("Indicá la capacidad del equipo en frigorías.");
      return;
    }
    if (!facilAcceso || !instalacionElectrica || !equipoNuevo) {
      setError("Respondé todas las preguntas del presupuesto.");
      return;
    }
    if (equipoNuevo === "no" && !desinstalar) {
      setError("Indicá si desinstalamos el equipo usado.");
      return;
    }

    setError("");
    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("presupuestos")
      .update({
        tipo_servicio: servicio,
        direccion_instalacion: direccion.trim(),
        capacidad_equipo: frigorias,
        ubicacion_fisica: ubicacion.trim(),
        facil_acceso: facilAcceso,
        tiene_electrcidad: instalacionElectrica,
        nuevo: equipoNuevo,
        usado_desinstalamos: equipoNuevo === "si" ? "no" : desinstalar,
      })
      .eq("id", Number(item.id));
    setPending(false);
    if (updateError) {
      setError("No se pudieron guardar los cambios.");
      return;
    }
    onClose();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-2xl border border-[#d3e7f3] bg-white p-4">
      <label className="flex flex-col gap-2 text-sm font-semibold">
        Tipo de servicio
        <select
          name={`servicio-${item.id}`}
          value={servicio}
          onChange={(event) => setServicio(event.target.value)}
          required
          className="h-12 rounded-2xl border border-[#c5dff0] bg-ice px-4 font-normal text-navy outline-none focus:border-teal"
        >
          <option value="">Elegí un servicio</option>
          {opciones.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Dirección de instalación"
          name={`direccion-${item.id}`}
          value={direccion}
          onChange={(event) => setDireccion(event.target.value)}
          required
        />
        <Field
          label="Capacidad del equipo en frig"
          name={`capacidad-${item.id}`}
          value={capacidad}
          onChange={(event) => setCapacidad(event.target.value)}
          inputMode="decimal"
          required
        />
      </div>
      <label className="flex flex-col gap-2 text-sm font-semibold">
        Ubicación física
        <textarea
          name={`ubicacion-${item.id}`}
          value={ubicacion}
          onChange={(event) => setUbicacion(event.target.value)}
          rows={3}
          className="rounded-2xl border border-[#c5dff0] bg-ice px-4 py-3 font-normal text-navy outline-none focus:border-teal"
        />
      </label>
      <SiNo label="¿Tiene fácil acceso?" name={`facil-${item.id}`} value={facilAcceso} onChange={setFacilAcceso} />
      <SiNo
        label="¿Cuenta con instalación eléctrica?"
        name={`electrica-${item.id}`}
        value={instalacionElectrica}
        onChange={setInstalacionElectrica}
      />
      <SiNo label="¿El equipo es nuevo?" name={`nuevo-${item.id}`} value={equipoNuevo} onChange={setEquipoNuevo} />
      {equipoNuevo === "no" ? (
        <SiNo
          label="Si es usado, ¿lo desinstalamos nosotros?"
          name={`desinstalar-${item.id}`}
          value={desinstalar}
          onChange={setDesinstalar}
        />
      ) : null}
      {error ? (
        <p className="rounded-2xl bg-[#fff1f1] px-4 py-3 text-sm text-[#9b2c2c]" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white transition hover:bg-[#081654] disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-[#b7d7ea] bg-white text-sm font-semibold text-navy transition hover:border-teal disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function SiNo({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: "si" | "no") => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-semibold">{label}</legend>
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ["si", "Sí"],
            ["no", "No"],
          ] as const
        ).map(([option, text]) => (
          <label
            key={option}
            className={`flex h-12 cursor-pointer items-center justify-center rounded-2xl border text-sm font-semibold ${
              value === option ? "border-teal bg-[#e7f5fb] text-navy" : "border-[#c5dff0] bg-ice text-navy/70"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            {text}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function FilaAcciones({ item, onEdit }: { item: PresupuestoItem; onEdit: () => void }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onDelete() {
    setError("");
    setPending(true);
    const supabase = createClient();
    const current = await supabase.from("presupuestos").select("foto, presupuesto").eq("id", Number(item.id)).maybeSingle();
    const { error: deleteError } = await supabase.from("presupuestos").delete().eq("id", Number(item.id));
    setPending(false);
    if (deleteError) {
      setError("No se pudo eliminar el presupuesto.");
      return;
    }
    const fotos = pathsOf(current.data?.foto);
    const documento = pathOf(current.data?.presupuesto);
    if (fotos.length > 0) await supabase.storage.from("fotos").remove(fotos);
    if (documento) await supabase.storage.from("documentos").remove([documento]);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="mt-3 flex flex-col gap-2 lg:mt-0">
        <p className="text-xs font-medium text-navy/70">¿Eliminar el presupuesto #{item.id}?</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void onDelete()}
            disabled={pending}
            className="inline-flex h-8 items-center justify-center rounded-full bg-[#9b2c2c] px-3 text-xs font-semibold text-white transition hover:bg-[#7f2424] disabled:opacity-60"
          >
            {pending ? "Eliminando..." : "Eliminar"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={pending}
            className="inline-flex h-8 items-center justify-center rounded-full border border-[#b7d7ea] bg-white px-3 text-xs font-semibold text-navy transition hover:border-teal disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
        {error ? <p className="text-xs font-medium text-[#9b2c2c]">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2 lg:mt-0">
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex h-8 items-center justify-center rounded-full border border-[#b7d7ea] bg-white px-3 text-xs font-semibold text-navy transition hover:border-teal"
      >
        Editar
      </button>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex h-8 items-center justify-center rounded-full border border-[#f0c9c9] bg-white px-3 text-xs font-semibold text-[#9b2c2c] transition hover:border-[#9b2c2c]"
      >
        Eliminar
      </button>
    </div>
  );
}

function pathsOf(value: unknown) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.flatMap((item) => {
    const path = pathOf(item);
    return path ? [path] : [];
  });
}

function pathOf(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const path = (value as { path?: unknown }).path;
  return typeof path === "string" ? path : "";
}

function choice(value: string) {
  const text = value.trim().toLowerCase();
  if (text === "sí" || text === "si") return "si";
  if (text === "no") return "no";
  return "";
}

function Dato({ label, value }: { label: string; value: string }) {
  return (
    <div className="contents">
      <dt className="text-navy/50">{label}</dt>
      <dd className="[overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}

function EstadoValor({ item, todos }: { item: PresupuestoItem; todos: boolean }) {
  return (
    <>
      {item.estado ? (
        item.documento?.url ? (
          <a
            href={item.documento.url}
            target="_blank"
            rel="noopener noreferrer"
            className={estadoClass(item.estado, true)}
          >
            {item.estado}
          </a>
        ) : (
          <span className={estadoClass(item.estado, false)}>{item.estado}</span>
        )
      ) : (
        "—"
      )}
      {todos || !puedeConfirmar(item.estado) ? null : <EditarConfirma id={item.id} estado={item.estado} />}
    </>
  );
}

function HistorialValor({ item }: { item: PresupuestoItem }) {
  if (item.historial.length === 0) return "—";
  return (
    <div className="flex flex-col gap-1">
      {item.historial.map((entry, index) => (
        <p key={`${entry.estado}-${entry.fecha}-${index}`} className={estadoClass(entry.estado, false)}>
          {entry.estado} {formatHistoryDate(entry.fecha)}
        </p>
      ))}
    </div>
  );
}

function DocumentoValor({ item }: { item: PresupuestoItem }) {
  if (!item.documento?.url) return "—";
  return (
    <a
      href={item.documento.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-10 items-center font-semibold text-teal underline-offset-2 hover:underline lg:min-h-0"
    >
      Ver presupuesto
    </a>
  );
}

function FiltroFecha({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex h-10 min-w-0 items-center gap-2 rounded-full border border-[#b7d7ea] bg-white px-3 text-sm text-navy">
      <span className="shrink-0 text-navy/60">{label}</span>
      <input
        type="date"
        aria-label={`Fecha ${label.toLowerCase()}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent outline-none"
      />
    </label>
  );
}

const estados = [
  { value: "", label: "Todos los estados" },
  { value: "presupuestado", label: "Presupuestado" },
  { value: "aceptado", label: "Aceptado" },
  { value: "rechazado", label: "Rechazado" },
];

function FiltroEstado({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <select
      aria-label="Filtrar por estado"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-full border border-[#b7d7ea] bg-white px-4 text-sm text-navy outline-none focus:border-teal lg:w-auto"
    >
      {estados.map((option) => (
        <option key={option.value || "todos"} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function puedeConfirmar(estado: string) {
  const value = estado.trim().toLowerCase();
  return value === "presupuestado" || value === "aceptado" || value === "rechazado";
}

function estadoClass(estado: string, linked: boolean) {
  const value = estado.trim().toLowerCase();
  if (value === "rechazado") {
    return linked
      ? "font-semibold capitalize text-red-600 underline-offset-2 hover:underline"
      : "font-semibold capitalize text-red-600";
  }
  if (value === "aceptado") {
    return linked
      ? "font-semibold capitalize text-green-600 underline-offset-2 hover:underline"
      : "font-semibold capitalize text-green-600";
  }
  if (linked) return "font-semibold capitalize text-teal underline-offset-2 hover:underline";
  return "font-semibold capitalize";
}

function WrappedEmail({ email }: { email: string }) {
  const at = email.indexOf("@");
  if (at < 1) return email;
  return (
    <>
      {email.slice(0, at + 1)}
      <wbr />
      {email.slice(at + 1)}
    </>
  );
}
