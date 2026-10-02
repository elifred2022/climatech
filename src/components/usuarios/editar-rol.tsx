"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const roles = [
  { value: "cliente", label: "Cliente" },
  { value: "administrador", label: "Administrador" },
] as const;

export function EditarRol({ id, rol }: { id: string; rol: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(normalized(rol));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onChange(next: string) {
    setValue(next);
    setError("");
    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.from("usuarios").update({ rol: next }).eq("id", Number(id));
    setPending(false);
    if (updateError) {
      setValue(normalized(rol));
      setError("No se pudo cambiar el rol.");
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
        Editar rol
      </button>
    );
  }

  return (
    <div className="mt-1 flex flex-col gap-1">
      <select
        aria-label="Editar rol"
        value={value}
        disabled={pending}
        onChange={(event) => {
          void onChange(event.target.value);
        }}
        className="w-full rounded-lg border border-[#b7d7ea] bg-white px-1 py-1 text-[11px] text-navy"
      >
        {roles.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-[11px] font-medium text-red-700">{error}</p> : null}
    </div>
  );
}

function normalized(rol: string) {
  const value = rol.trim().toLowerCase();
  if (value === "administrador" || value === "admin") return "administrador";
  return "cliente";
}
