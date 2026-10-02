"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Field } from "@/components/auth/field";

type Answer = "" | "si" | "no";

type PresupuestoFormProps = {
  userId: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  onSent?: () => void;
};

type LocalPhoto = {
  id: string;
  name: string;
  preview: string;
  blob: Blob;
};

export function PresupuestoForm({
  userId,
  email,
  nombre,
  apellido,
  telefono,
  direccion: direccionInicial,
  onSent,
}: PresupuestoFormProps) {
  const [direccion, setDireccion] = useState(direccionInicial);
  const [servicio, setServicio] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [facilAcceso, setFacilAcceso] = useState<Answer>("");
  const [instalacionElectrica, setInstalacionElectrica] = useState<Answer>("");
  const [equipoNuevo, setEquipoNuevo] = useState<Answer>("");
  const [desinstalar, setDesinstalar] = useState<Answer>("");
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onPhotos(list: FileList | null) {
    setError("");
    const files = [...(list ?? [])];
    if (files.length === 0) return;

    const room = 3 - photos.length;
    if (room <= 0) {
      setError("Podés adjuntar hasta 3 fotos.");
      return;
    }

    const accepted = files.slice(0, room);
    if (files.length > room) {
      setError("Podés adjuntar hasta 3 fotos.");
    }

    const next: LocalPhoto[] = [];
    for (const file of accepted) {
      if (!file.type.startsWith("image/")) {
        setError("Las fotos tienen que ser imágenes.");
        continue;
      }
      try {
        const image = await compressImage(file);
        next.push({ id: crypto.randomUUID(), name: file.name, ...image });
      } catch {
        setError("Una foto no se pudo leer. Probá con JPG o PNG.");
      }
    }

    setPhotos((current) => [...current, ...next].slice(0, 3));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

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
      setError("Respondé todas las preguntas para armar el presupuesto.");
      return;
    }

    if (equipoNuevo === "no" && !desinstalar) {
      setError("Indicá si desinstalamos el equipo usado.");
      return;
    }

    if (photos.length === 0) {
      setError("Adjuntá al menos una foto de la ubicación y el acceso.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const uploaded: string[] = [];

    for (const photo of photos) {
      const path = `${userId}/${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage.from("fotos").upload(path, photo.blob, {
        contentType: "image/jpeg",
      });
      if (uploadError) {
        if (uploaded.length > 0) {
          await supabase.storage.from("fotos").remove(uploaded);
        }
        setPending(false);
        setError(
          uploadError.message.toLowerCase().includes("row-level security")
            ? "No se pudieron guardar las fotos. El bucket fotos tiene que permitir la subida con la sesión iniciada."
            : "No se pudieron guardar las fotos. Intentá de nuevo.",
        );
        return;
      }
      uploaded.push(path);
    }

    const row = {
      email,
      nombre,
      apellido,
      telefono: phoneNumber(telefono),
      direccion_instalacion: direccion.trim(),
      tipo_servicio: servicio,
      capacidad_equipo: frigorias,
      ubicacion_fisica: ubicacion.trim(),
      facil_acceso: facilAcceso,
      nuevo: equipoNuevo,
      usado_desinstalamos: equipoNuevo === "si" ? "no" : desinstalar,
      foto: uploaded.map((path) => ({
        path,
        url: supabase.storage.from("fotos").getPublicUrl(path).data.publicUrl,
      })),
    };

    let { error: insertError } = await supabase
      .from("presupuestos")
      .insert({ ...row, tiene_electricidad: instalacionElectrica });

    if (insertError && /tiene_electricidad/i.test(insertError.message)) {
      const retry = await supabase.from("presupuestos").insert({ ...row, tiene_electrcidad: instalacionElectrica });
      insertError = retry.error;
    }

    if (insertError) {
      await supabase.storage.from("fotos").remove(uploaded);
      setPending(false);
      setError(
        insertError.code === "42501"
          ? "No se pudo guardar el presupuesto con esta sesión."
          : /tipo_servicio/i.test(insertError.message)
            ? "No se pudo guardar el tipo de servicio. En la tabla presupuestos tiene que existir la columna tipo_servicio."
            : "No se pudo guardar el presupuesto. Intentá de nuevo.",
      );
      return;
    }

    setPending(false);
    setSent(true);
    onSent?.();
  }

  if (sent) {
    return (
      <p className="text-sm leading-6 text-navy/80">
        Hemos recibido su información. Nuestro equipo trabajará en su presupuesto y a la brevedad se le enviará vía email o WhatsApp. Muchas gracias.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <dl className="grid gap-3 sm:grid-cols-2">
        <Readonly label="Nombre" value={nombre} />
        <Readonly label="Apellido" value={apellido} />
        <Readonly label="Email" value={email} />
        <Readonly label="Teléfono" value={telefono} />
      </dl>
      <label className="flex flex-col gap-2 text-sm font-semibold">
        Tipo de servicio
        <select
          name="tipo_servicio"
          value={servicio}
          onChange={(event) => setServicio(event.target.value)}
          required
          className="h-12 rounded-2xl border border-[#c5dff0] bg-ice px-4 font-normal text-navy outline-none focus:border-teal"
        >
          <option value="">Elegí un servicio</option>
          {servicios.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <Field
        label="Dirección de instalación del equipo"
        name="direccion"
        value={direccion}
        onChange={(event) => setDireccion(event.target.value)}
        autoComplete="street-address"
        required
      />
      <Field
        label="Capacidad del equipo en frig"
        name="capacidad"
        value={capacidad}
        onChange={(event) => setCapacidad(event.target.value)}
        inputMode="decimal"
        placeholder="Ejemplo: 3000"
        required
      />
      <label className="flex flex-col gap-2 text-sm font-semibold">
        Ubicación física donde instalar el equipo
        <textarea
          name="ubicacion"
          value={ubicacion}
          onChange={(event) => setUbicacion(event.target.value)}
          required
          rows={3}
          placeholder="Por ejemplo: dormitorio, pared que da al patio, segundo piso"
          className="rounded-2xl border border-[#c5dff0] bg-ice px-4 py-3 font-normal text-navy outline-none focus:border-teal"
        />
      </label>
      <YesNo label="¿Tiene fácil acceso?" name="facil_acceso" value={facilAcceso} onChange={setFacilAcceso} />
      <YesNo
        label="¿Cuenta con instalación eléctrica?"
        name="instalacion_electrica"
        value={instalacionElectrica}
        onChange={setInstalacionElectrica}
      />
      <YesNo label="¿El equipo es nuevo?" name="nuevo" value={equipoNuevo} onChange={setEquipoNuevo} />
      {equipoNuevo === "no" ? (
        <YesNo
          label="Si es usado, ¿lo desinstalamos nosotros?"
          name="desinstalar"
          value={desinstalar}
          onChange={setDesinstalar}
        />
      ) : null}
      <div className="flex flex-col gap-3">
        <label className="flex cursor-pointer flex-col items-center gap-1 rounded-2xl border border-dashed border-[#b7d7ea] bg-ice px-4 py-6 text-center">
          <span className="text-sm font-semibold">Adjuntá fotos de la ubicación y el acceso</span>
          <span className="text-sm font-normal text-navy/60">{photos.length} de 3 · JPG o PNG</span>
          <input
            type="file"
            name="foto"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={photos.length >= 3}
            onChange={(event) => {
              void onPhotos(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
        {photos.length > 0 ? (
          <ul className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <li key={photo.id} className="relative">
                <img src={photo.preview} alt={photo.name} className="h-24 w-full rounded-2xl object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((current) => current.filter((item) => item.id !== photo.id))}
                  className="absolute right-1 top-1 rounded-full bg-navy/80 px-2 py-1 text-xs font-semibold text-white"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white transition hover:bg-[#0f2438] disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar datos"}
      </button>
    </form>
  );
}

const servicios = ["Instalación nuevo", "Mantenimiento", "Diagnóstico", "Reparación", "Mudanza"];

function YesNo({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: Answer;
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
              value === option
                ? "border-teal bg-[#e7f5fb] text-navy"
                : "border-[#c5dff0] bg-ice text-navy/70"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="sr-only"
              required
            />
            {text}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Readonly({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-ice px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-navy/50">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

function phoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  const number = Number(digits);
  if (!Number.isSafeInteger(number)) return null;
  return number;
}

async function compressImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1280;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("canvas");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));
  if (!blob) throw new Error("blob");
  return { blob, preview: await blobToDataUrl(blob) };
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(blob);
  });
}
