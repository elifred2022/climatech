import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth/auth-screen";
import { MisPresupuestos, type PresupuestoItem } from "@/components/presupuesto/mis-presupuestos";
import { historyOf } from "@/lib/presupuesto-historial";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Mis presupuestos | Climatech",
};

export default async function PresupuestosPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.trim().toLowerCase();

  if (!email) {
    redirect("/ingresar?siguiente=/presupuestos");
  }

  const { data: usuario } = await supabase.from("usuarios").select("rol").eq("email", email).limit(1);
  const todos = isAdmin(text(usuario?.[0]?.rol));

  const query = supabase.from("presupuestos").select("*").order("created_at", { ascending: false });
  const { data: rows, error } = todos ? await query : await query.eq("email", email);

  const items = error
    ? []
    : await Promise.all((rows ?? []).map((row, index) => withSignedDocument(supabase, toItem(row, index))));

  return (
    <AuthScreen
      fit
      title={todos ? "Presupuestos" : "Mis presupuestos"}
      subtitle={
        error
          ? "No se pudieron cargar los presupuestos. Intentá de nuevo en unos minutos."
          : todos
            ? "Estas son todas las solicitudes."
            : "Estas son las solicitudes que enviaste."
      }
    >
      {error ? null : <MisPresupuestos items={items} todos={todos} />}
    </AuthScreen>
  );
}

function toItem(row: Record<string, unknown>, index: number): PresupuestoItem {
  const nuevo = answer(row.nuevo);
  return {
    id: text(row.id) || String(index),
    fecha: dateLabel(row.created_at),
    fechaDia: dayKey(row.created_at),
    direccion: text(row.direccion_instalacion) || "Sin dirección",
    capacidad: capacity(row.capacidad_equipo),
    servicio: text(row.tipo_servicio),
    ubicacion: text(row.ubicacion_fisica),
    facilAcceso: answer(row.facil_acceso),
    instalacionElectrica: answer(row.tiene_electricidad ?? row.tiene_electrcidad),
    nuevo,
    desinstalar: answer(row.usado_desinstalamos),
    fotos: photosOf(row.foto),
    documento: documentOf(row.presupuesto),
    estado: text(row.estado),
    historial: historyOf(row.fecha_presupuesto, text(row.estado)),
    cliente: [text(row.nombre), text(row.apellido)].filter(Boolean).join(" "),
    email: text(row.email),
    telefono: text(row.telefono),
  };
}

function documentOf(value: unknown): PresupuestoItem["documento"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as { path?: unknown; url?: unknown; nombre?: unknown; cargado?: unknown };
  if (typeof record.path !== "string" || !record.path.trim()) return null;
  return {
    path: record.path,
    url: typeof record.url === "string" ? record.url : "",
    nombre: typeof record.nombre === "string" && record.nombre.trim() ? record.nombre.trim() : "Presupuesto",
    cargado: dateOnlyLabel(record.cargado) || dateLabel(record.cargado),
  };
}

async function withSignedDocument(
  supabase: Awaited<ReturnType<typeof createClient>>,
  item: PresupuestoItem,
) {
  if (!item.documento?.path) return item;
  const signed = await supabase.storage.from("documentos").createSignedUrl(item.documento.path, 60 * 60);
  if (!signed.data?.signedUrl) return item;
  return { ...item, documento: { ...item.documento, url: signed.data.signedUrl } };
}

function photosOf(value: unknown) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.flatMap((item, index) => {
    const src = photoSrc(item);
    if (!src) return [];
    return [{ src, alt: `Foto ${index + 1} de la ubicación` }];
  });
}

function photoSrc(value: unknown) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  const record = value as { url?: unknown; imagen?: unknown };
  if (typeof record.url === "string") return record.url;
  if (typeof record.imagen === "string") return record.imagen;
  return "";
}

function capacity(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${new Intl.NumberFormat("es-AR").format(value)} frig`;
  }
  const raw = text(value);
  return raw ? `${raw} frig` : "—";
}

function answer(value: unknown) {
  if (value === true || value === "si") return "Sí";
  if (value === false || value === "no") return "No";
  if (value === "no aplica") return "No aplica";
  return text(value) || "—";
}

function dateOnlyLabel(value: unknown) {
  if (typeof value !== "string") return "";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return "";
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(date);
}

function dayKey(value: unknown) {
  if (typeof value !== "string") return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function dateLabel(value: unknown) {
  if (typeof value !== "string") return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function text(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}
