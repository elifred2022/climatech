import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth/auth-screen";
import { ListaUsuarios, type UsuarioItem } from "@/components/usuarios/lista-usuarios";
import { isAdmin } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Usuarios | Climatech",
};

export default async function UsuariosPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.trim().toLowerCase();

  if (!email) {
    redirect("/ingresar?siguiente=/usuarios");
  }

  const { data: usuario } = await supabase.from("usuarios").select("rol").eq("email", email).limit(1);
  if (!isAdmin(text(usuario?.[0]?.rol))) {
    redirect("/cuenta");
  }

  const { data: rows, error } = await supabase
    .from("usuarios")
    .select("id, created_at, nombre, apellido, dni, email, telefono, direccion, rol")
    .order("created_at", { ascending: false });

  const items = error ? [] : (rows ?? []).map((row, index) => toItem(row, index));

  return (
    <AuthScreen
      fit
      title="Usuarios"
      subtitle={
        error
          ? "No se pudieron cargar los usuarios. Intentá de nuevo en unos minutos."
          : "Estos son todos los usuarios registrados."
      }
    >
      {error ? null : <ListaUsuarios items={items} />}
    </AuthScreen>
  );
}

function toItem(row: Record<string, unknown>, index: number): UsuarioItem {
  return {
    id: text(row.id) || String(index),
    fecha: dateLabel(row.created_at),
    nombre: text(row.nombre),
    apellido: text(row.apellido),
    dni: text(row.dni),
    email: text(row.email),
    telefono: text(row.telefono),
    direccion: text(row.direccion),
    rol: text(row.rol),
  };
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
