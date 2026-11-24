"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/auth/field";
import { createClient } from "@/lib/supabase/client";

export type PrecioItem = {
  id: string;
  servicio: string;
  manoDeObra: number | null;
  materiales: number | null;
  total: number | null;
};

export function ListaPrecios({ items, editable = false }: { items: PrecioItem[]; editable?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {editable ? (
        open ? (
          <ServicioForm onClose={() => setOpen(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-12 items-center justify-center rounded-full bg-navy px-5 text-sm font-semibold text-white transition hover:bg-[#081654]"
          >
            Crear un servicio
          </button>
        )
      ) : null}
      {items.length === 0 ? (
        <p className="text-sm text-navy/70">Todavía no hay servicios cargados.</p>
      ) : (
        <Lista items={items} editable={editable} />
      )}
    </div>
  );
}

function ServicioForm({ item, onClose }: { item?: PrecioItem; onClose: () => void }) {
  const router = useRouter();
  const [servicio, setServicio] = useState(item && item.servicio !== "—" ? item.servicio : "");
  const [manoDeObra, setManoDeObra] = useState(inputValue(item?.manoDeObra));
  const [materiales, setMateriales] = useState(inputValue(item?.materiales));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const total = sum(manoDeObra, materiales);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nombre = servicio.trim();
    const mano = amount(manoDeObra);
    const material = amount(materiales);
    if (!nombre) {
      setError("Escribí el nombre del servicio.");
      return;
    }
    if (mano === null || material === null) {
      setError("Cargá el valor de la mano de obra y el de los materiales.");
      return;
    }

    setError("");
    setPending(true);
    const supabase = createClient();
    const values = {
      Servicio: nombre,
      Valor_servicio_mo: mano,
      Valor_materiales_aprox: material,
      Valor_total: roundMoney(mano + material),
    };
    const { error: saveError } = item
      ? await supabase.from("lista_precios").update(values).eq("id", Number(item.id))
      : await supabase.from("lista_precios").insert(values);
    setPending(false);
    if (saveError) {
      setError(item ? "No se pudieron guardar los cambios." : "No se pudo guardar el servicio.");
      return;
    }
    onClose();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-2xl border border-[#d3e7f3] bg-white p-4">
      <Field label="Servicio" name="servicio" value={servicio} onChange={(event) => setServicio(event.target.value)} required />
      <Field
        label="Valor mano de obra"
        name="valor_mano_de_obra"
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        value={manoDeObra}
        onChange={(event) => setManoDeObra(event.target.value)}
        required
      />
      <Field
        label="Valor materiales aprox"
        name="valor_materiales_aprox"
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        value={materiales}
        onChange={(event) => setMateriales(event.target.value)}
        required
      />
      <Field label="Valor total" name="valor_total" value={total === null ? "" : String(total)} readOnly />
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

function Lista({ items, editable }: { items: PrecioItem[]; editable: boolean }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <>
      <ul className="flex flex-col gap-3 lg:hidden">
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-[#d3e7f3] bg-white p-3">
            {editingId === item.id ? (
              <ServicioForm item={item} onClose={() => setEditingId(null)} />
            ) : (
              <>
                <p className="text-sm font-semibold">
                  <span className="mr-2 text-navy/50">{item.id}</span>
                  {item.servicio}
                </p>
                <dl className="mt-3 grid grid-cols-[9.5rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
                  <Dato label="Mano de obra" value={money(item.manoDeObra)} />
                  <Dato label="Materiales aprox" value={money(item.materiales)} />
                  <Dato label="Total" value={money(item.total)} />
                </dl>
                {editable ? <FilaAcciones item={item} onEdit={() => setEditingId(item.id)} /> : null}
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#d3e7f3] text-xs text-navy/50">
              <th className={head}>Código</th>
              <th className={head}>Servicio</th>
              <th className={head}>Mano de obra</th>
              <th className={head}>Materiales aprox</th>
              <th className={head}>Total</th>
              {editable ? (
                <th className={head}>
                  <span className="sr-only">Acciones</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {items.map((item) =>
              editingId === item.id ? (
                <tr key={item.id} className="border-b border-[#e7f3fa]">
                  <td className={cell} colSpan={editable ? 6 : 5}>
                    <ServicioForm item={item} onClose={() => setEditingId(null)} />
                  </td>
                </tr>
              ) : (
                <tr key={item.id} className="border-b border-[#e7f3fa]">
                  <td className={`${cell} font-semibold`}>{item.id}</td>
                  <td className={`${cell} font-semibold`}>{item.servicio}</td>
                  <td className={cell}>{money(item.manoDeObra)}</td>
                  <td className={cell}>{money(item.materiales)}</td>
                  <td className={`${cell} font-semibold`}>{money(item.total)}</td>
                  {editable ? (
                    <td className={cell}>
                      <FilaAcciones item={item} onEdit={() => setEditingId(item.id)} />
                    </td>
                  ) : null}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function FilaAcciones({ item, onEdit }: { item: PrecioItem; onEdit: () => void }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onDelete() {
    setError("");
    setPending(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("lista_precios").delete().eq("id", Number(item.id));
    setPending(false);
    if (deleteError) {
      setError("No se pudo eliminar el servicio.");
      return;
    }
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="mt-3 flex flex-col gap-2 lg:mt-0">
        <p className="text-xs font-medium text-navy/70">¿Eliminar {item.servicio}?</p>
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

const head = "px-2 py-2 text-left font-semibold";
const cell = "px-2 py-2";
const pesos = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });

function Dato({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-navy/50">{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

function money(value: number | null) {
  return value === null ? "—" : pesos.format(value);
}

function inputValue(value: number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

function amount(value: string) {
  const raw = value.trim().replace(",", ".");
  if (!raw) return null;
  const number = Number(raw);
  if (!Number.isFinite(number) || number < 0) return null;
  return roundMoney(number);
}

function sum(manoDeObra: string, materiales: string) {
  const mano = amount(manoDeObra);
  const material = amount(materiales);
  if (mano === null || material === null) return null;
  return roundMoney(mano + material);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
