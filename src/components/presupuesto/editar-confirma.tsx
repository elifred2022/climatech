"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { appendHistory, localDate } from "@/lib/presupuesto-historial";

const options = [
  { value: "si", label: "Sí" },
  { value: "no", label: "No" },
] as const;

export function EditarConfirma({ id, estado }: { id: string; estado: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(choiceOf(estado));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onChange(next: string) {
    const estadoNuevo = next === "si" ? "aceptado" : "rechazado";
    setValue(next);
    setError("");
    setPending(true);
    const supabase = createClient();
    const currentRow = await supabase.from("presupuestos").select("fecha_presupuesto").eq("id", Number(id)).maybeSingle();
    const { error: updateError } = await supabase
      .from("presupuestos")
      .update({
        estado: estadoNuevo,
        fecha_presupuesto: appendHistory(currentRow.data?.fecha_presupuesto, estadoNuevo, localDate(), estado),
      })
      .eq("id", Number(id));
    setPending(false);
    if (updateError) {
      setValue(choiceOf(estado));
      setError("No se pudo guardar la confirmación.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-navy px-2 py-1 text-center text-[11px] font-semibold leading-tight text-white transition hover:bg-[#0f2438]"
      >
        Editar confirma
      </button>
    );
  }

  return (
    <div className="mt-1 flex flex-col gap-1">
      <select
        aria-label="Editar confirma"
        value={value}
        disabled={pending}
        onChange={(event) => {
          void onChange(event.target.value);
        }}
        className="w-full rounded-lg border border-[#b7d7ea] bg-white px-1 py-1 text-[11px] text-navy"
      >
        {value ? null : (
          <option value="" disabled>
            Sí / No
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-[11px] font-medium text-red-700">{error}</p> : null}
    </div>
  );
}

function choiceOf(estado: string) {
  const value = estado.trim().toLowerCase();
  if (value === "aceptado") return "si";
  if (value === "rechazado") return "no";
  return "";
}
