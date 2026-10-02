"use client";

import { useState } from "react";
import { Buscar, matchesSearch } from "@/components/buscar";
import { EditarRol } from "@/components/usuarios/editar-rol";

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
  return (
    <table className="w-full table-fixed border-collapse text-left text-xs">
      <colgroup>
        <col className="w-[5%]" />
        <col className="w-[11%]" />
        <col className="w-[10%]" />
        <col className="w-[10%]" />
        <col className="w-[11%]" />
        <col className="w-[17%]" />
        <col className="w-[10%]" />
        <col className="w-[12%]" />
        <col className="w-[14%]" />
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
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className="border-b border-[#e7f3fa] align-top">
            <td className={`${cell} font-semibold`}>{item.id}</td>
            <td className={cell}>{item.fecha || "—"}</td>
            <td className={cell}>{item.nombre || "—"}</td>
            <td className={cell}>{item.apellido || "—"}</td>
            <td className={cell}>{item.dni || "—"}</td>
            <td className={`${cell} [overflow-wrap:anywhere]`}>{item.email ? <WrappedEmail email={item.email} /> : "—"}</td>
            <td className={cell}>{item.telefono || "—"}</td>
            <td className={cell}>{item.direccion || "—"}</td>
            <td className={cell}>
              <p className="capitalize">{item.rol || "—"}</p>
              <EditarRol id={item.id} rol={item.rol} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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
