import type { Metadata } from "next";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { AuthScreen } from "@/components/auth/auth-screen";
import { PresupuestoPanel } from "@/components/presupuesto/presupuesto-panel";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Pedir presupuesto | Climatech",
};

export default async function PresupuestoPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    const profile = await profileOf(supabase, data.user);
    return (
      <PresupuestoPanel {...profile} userId={data.user.id} />
    );
  }

  return (
    <AuthScreen
      title="Pedir presupuesto"
      subtitle="Para pedir un presupuesto tenés que iniciar sesión. Si todavía no tenés cuenta, registrate."
    >
      <div className="flex flex-col gap-3">
        <Link
          href="/ingresar?siguiente=/presupuesto"
          className="inline-flex h-12 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white transition hover:bg-[#0f2438]"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/registro?siguiente=/presupuesto"
          className="inline-flex h-12 items-center justify-center rounded-full border border-[#b7d7ea] bg-ice text-sm font-semibold text-navy transition hover:border-teal"
        >
          Crear cuenta
        </Link>
      </div>
    </AuthScreen>
  );
}

async function profileOf(supabase: Awaited<ReturnType<typeof createClient>>, user: User) {
  const email = user.email?.trim().toLowerCase() ?? "";
  const { data } = email
    ? await supabase
        .from("usuarios")
        .select("nombre, apellido, telefono, direccion")
        .eq("email", email)
        .limit(1)
    : { data: null };
  const row = data?.[0];
  const meta = user.user_metadata ?? {};

  return {
    email,
    nombre: text(row?.nombre) || text(meta.first_name) || text(meta.given_name) || firstWord(meta.full_name) || firstWord(meta.name),
    apellido: text(row?.apellido) || text(meta.last_name) || text(meta.family_name),
    telefono: text(row?.telefono) || text(meta.phone),
    direccion: text(row?.direccion) || text(meta.direccion),
  };
}

function text(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function firstWord(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().split(/\s+/)[0] ?? "";
}
