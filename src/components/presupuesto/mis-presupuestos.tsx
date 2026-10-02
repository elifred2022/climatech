"use client";

import Link from "next/link";
import { useState } from "react";
import { Buscar, matchesSearch } from "@/components/buscar";
import { AdjuntarPresupuesto, type PresupuestoDocumento } from "@/components/presupuesto/adjuntar-presupuesto";
import { EditarConfirma } from "@/components/presupuesto/editar-confirma";
import { formatHistoryDate, type EstadoFecha } from "@/lib/presupuesto-historial";

export type PresupuestoItem = {
  id: string;
  fecha: string;
  fechaDia: string;
  direccion: string;
  capacidad: string;
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
        <Link
          href="/presupuesto"
          className="inline-flex h-12 items-center justify-center rounded-full border border-[#b7d7ea] bg-white text-sm font-semibold text-navy transition hover:border-teal"
        >
          {items.length === 0 ? "Pedir presupuesto" : "Pedir otro presupuesto"}
        </Link>
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
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
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
          </tr>
        ))}
      </tbody>
    </table>
    </>
  );
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
