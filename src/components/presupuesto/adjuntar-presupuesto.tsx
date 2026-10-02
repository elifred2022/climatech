"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { appendHistory, localDate } from "@/lib/presupuesto-historial";

export type PresupuestoDocumento = {
  path: string;
  url: string;
  nombre: string;
  cargado: string;
};

const maxBytes = 15 * 1024 * 1024;

export function AdjuntarPresupuesto({
  id,
  documento,
  compact = false,
}: {
  id: string;
  documento: PresupuestoDocumento | null;
  compact?: boolean;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(documento);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file: File | undefined) {
    setError("");
    if (!file) return;

    const allowed = /\.(pdf|doc|docx|png|jpe?g)$/i.test(file.name);
    if (!allowed) {
      setError("Adjuntá un PDF, Word o una imagen.");
      return;
    }
    if (file.size > maxBytes) {
      setError("El archivo no puede superar 15 MB.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${id}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("documentos").upload(path, file, {
      contentType: file.type || "application/octet-stream",
    });

    if (uploadError) {
      setPending(false);
      setError(
        uploadError.message.toLowerCase().includes("row-level security")
          ? "No se pudo guardar el archivo. El bucket documentos tiene que permitir la subida con la sesión iniciada."
          : "No se pudo guardar el archivo. Intentá de nuevo.",
      );
      return;
    }

    const cargado = localDate();
    const publicUrl = supabase.storage.from("documentos").getPublicUrl(path).data.publicUrl;
    const signed = await supabase.storage.from("documentos").createSignedUrl(path, 60 * 60);
    const next = {
      path,
      url: signed.data?.signedUrl || publicUrl,
      nombre: file.name,
      cargado,
    };
    const currentRow = await supabase.from("presupuestos").select("estado, fecha_presupuesto").eq("id", Number(id)).maybeSingle();
    const { error: updateError } = await supabase
      .from("presupuestos")
      .update({
        presupuesto: { path, url: publicUrl, nombre: file.name },
        estado: "presupuestado",
        fecha_presupuesto: appendHistory(currentRow.data?.fecha_presupuesto, "presupuestado", cargado, textEstado(currentRow.data?.estado)),
      })
      .eq("id", Number(id));

    if (updateError) {
      await supabase.storage.from("documentos").remove([path]);
      setPending(false);
      setError("No se pudo asociar el archivo a la solicitud.");
      return;
    }

    if (current?.path && current.path !== path) {
      await supabase.storage.from("documentos").remove([current.path]);
    }

    setCurrent(next);
    setPending(false);
    router.refresh();
  }

  return (
    <div className={compact ? "flex flex-col items-start gap-1" : "mt-4 flex flex-col gap-2"}>
      {current && !compact ? (
        <a
          href={current.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-teal underline-offset-2 hover:underline"
        >
          {current.nombre}
        </a>
      ) : null}
      <label
        className={`inline-flex cursor-pointer items-center justify-center rounded-full bg-navy font-semibold text-white transition hover:bg-[#0f2438] ${
          compact ? "h-auto min-h-8 w-full px-2 py-1 text-center text-[11px] leading-tight" : "h-11 px-4 text-sm"
        } ${pending ? "opacity-60" : ""}`}
      >
        {pending ? "Guardando…" : current ? "Cambiar presupuesto" : "Adjuntar presupuesto"}
        <input
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,application/pdf"
          className="sr-only"
          disabled={pending}
          onChange={(event) => {
            void onFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </label>
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
    </div>
  );
}

function textEstado(value: unknown) {
  return typeof value === "string" ? value : "";
}
