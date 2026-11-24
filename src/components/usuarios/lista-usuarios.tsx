"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Buscar, matchesSearch } from "@/components/buscar";
import { Field } from "@/components/auth/field";
import { createClient } from "@/lib/supabase/client";

export type UsuarioItem = {
  id: string;
  fecha: string;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  direccion: string;
  rol: string;
};

const head = "px-1 py-1.5 text-left font-semibold";
const cell = "px-1 py-1.5";

export function ListaUsuarios({ items }: { items: UsuarioItem[] }) {
  const [query, setQuery] = useState("");
  const visible = items.filter((item) =>
    matchesSearch(query, [
      item.id,
      item.fecha,
      item.nombre,
      item.apellido,
      item.dni,
      item.email,
      item.telefono,
      item.direccion,
      item.rol,
    ]),
  );

  if (items.length === 0) {
    return <p className="text-sm leading-6 text-navy/75">Todavía no hay usuarios.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Buscar value={query} onChange={setQuery} />
      {visible.length === 0 ? (
        <p className="text-sm leading-6 text-navy/75">No hay resultados para esa búsqueda.</p>
      ) : (
        <UsuariosTabla items={visible} />
      )}
    </div>
  );
}

function UsuariosTabla({ items }: { items: UsuarioItem[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <>
      <ul className="flex flex-col gap-3 lg:hidden">
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-[#d3e7f3] bg-white p-3">
            {editingId === item.id ? (
              <UsuarioForm item={item} onClose={() => setEditingId(null)} />
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold">#{item.id}</p>
                  <p className="text-right text-xs text-navy/60">{item.fecha || "—"}</p>
                </div>
                <dl className="mt-3 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
                  <Dato label="Nombre" value={item.nombre || "—"} />
                  <Dato label="Apellido" value={item.apellido || "—"} />
                  <Dato label="DNI" value={item.dni || "—"} />
                  <div className="contents">
                    <dt className="text-navy/50">Email</dt>
                    <dd className="[overflow-wrap:anywhere]">{item.email ? <WrappedEmail email={item.email} /> : "—"}</dd>
                  </div>
                  <Dato label="Teléfono" value={item.telefono || "—"} />
                  <Dato label="Dirección" value={item.direccion || "—"} />
                  <div className="contents">
                    <dt className="text-navy/50">Rol</dt>
                    <dd className="capitalize">{item.rol || "—"}</dd>
                  </div>
                </dl>
                <FilaAcciones item={item} onEdit={() => setEditingId(item.id)} />
              </>
            )}
          </li>
        ))}
      </ul>
      <table className="hidden w-full table-fixed border-collapse text-left text-xs lg:table">
        <colgroup>
          <col className="w-[4%]" />
          <col className="w-[9%]" />
          <col className="w-[9%]" />
          <col className="w-[9%]" />
          <col className="w-[8%]" />
          <col className="w-[16%]" />
          <col className="w-[8%]" />
          <col className="w-[11%]" />
          <col className="w-[10%]" />
          <col className="w-[16%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-[#d3e7f3] text-[11px] leading-tight text-navy/50">
            <th className={head}>ID</th>
            <th className={head}>Fecha</th>
            <th className={head}>Nombre</th>
            <th className={head}>Apellido</th>
            <th className={head}>DNI</th>
            <th className={head}>Email</th>
            <th className={head}>Teléfono</th>
            <th className={head}>Dirección</th>
            <th className={head}>Rol</th>
            <th className={head}>
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) =>
            editingId === item.id ? (
              <tr key={item.id} className="border-b border-[#e7f3fa] align-top">
                <td className={cell} colSpan={10}>
                  <UsuarioForm item={item} onClose={() => setEditingId(null)} />
                </td>
              </tr>
            ) : (
              <tr key={item.id} className="border-b border-[#e7f3fa] align-top">
                <td className={`${cell} font-semibold`}>{item.id}</td>
                <td className={cell}>{item.fecha || "—"}</td>
                <td className={cell}>{item.nombre || "—"}</td>
                <td className={cell}>{item.apellido || "—"}</td>
                <td className={cell}>{item.dni || "—"}</td>
                <td className={`${cell} [overflow-wrap:anywhere]`}>{item.email ? <WrappedEmail email={item.email} /> : "—"}</td>
                <td className={cell}>{item.telefono || "—"}</td>
                <td className={cell}>{item.direccion || "—"}</td>
                <td className={`${cell} capitalize`}>{item.rol || "—"}</td>
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

function UsuarioForm({ item, onClose }: { item: UsuarioItem; onClose: () => void }) {
  const router = useRouter();
  const [nombre, setNombre] = useState(item.nombre);
  const [apellido, setApellido] = useState(item.apellido);
  const [email, setEmail] = useState(item.email);
  const [telefono, setTelefono] = useState(item.telefono);
  const [direccion, setDireccion] = useState(item.direccion);
  const [rol, setRol] = useState(normalized(item.rol));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextEmail = email.trim().toLowerCase();
    if (!nextEmail.includes("@")) {
      setError("Escribí un email válido.");
      return;
    }
    const digits = telefono.replace(/\D/g, "");
    const phone = digits ? Number(digits) : null;
    if (digits && !Number.isSafeInteger(phone)) {
      setError("El teléfono tiene demasiados números.");
      return;
    }

    setError("");
    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("usuarios")
      .update({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: nextEmail,
        telefono: phone,
        direccion: direccion.trim(),
        rol,
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" name={`nombre-${item.id}`} value={nombre} onChange={(event) => setNombre(event.target.value)} />
        <Field label="Apellido" name={`apellido-${item.id}`} value={apellido} onChange={(event) => setApellido(event.target.value)} />
        <Field
          label="Email"
          name={`email-${item.id}`}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Field
          label="Teléfono"
          name={`telefono-${item.id}`}
          inputMode="numeric"
          value={telefono}
          onChange={(event) => setTelefono(event.target.value)}
        />
        <Field
          label="Dirección"
          name={`direccion-${item.id}`}
          value={direccion}
          onChange={(event) => setDireccion(event.target.value)}
        />
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Rol
          <select
            name={`rol-${item.id}`}
            value={rol}
            onChange={(event) => setRol(event.target.value)}
            className="h-12 rounded-2xl border border-[#c5dff0] bg-ice px-4 font-normal text-navy outline-none focus:border-teal"
          >
            <option value="cliente">Cliente</option>
            <option value="administrador">Administrador</option>
          </select>
        </label>
      </div>
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

function FilaAcciones({ item, onEdit }: { item: UsuarioItem; onEdit: () => void }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const quien = item.nombre || item.email || "este usuario";

  async function onDelete() {
    setError("");
    setPending(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("usuarios").delete().eq("id", Number(item.id));
    setPending(false);
    if (deleteError) {
      setError("No se pudo eliminar el usuario.");
      return;
    }
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="mt-3 flex flex-col gap-2 lg:mt-0">
        <p className="text-xs font-medium text-navy/70">¿Eliminar {quien}?</p>
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

function normalized(rol: string) {
  const value = rol.trim().toLowerCase();
  if (value === "administrador" || value === "admin") return "administrador";
  return "cliente";
}

function Dato({ label, value }: { label: string; value: string }) {
  return (
    <div className="contents">
      <dt className="text-navy/50">{label}</dt>
      <dd className="[overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
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
