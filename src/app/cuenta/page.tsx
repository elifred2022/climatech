import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth/auth-screen";
import { LogoutButton } from "@/components/auth/logout-button";
import { createClient } from "@/lib/supabase/server";
import { ensureUsuario } from "@/lib/supabase/usuarios";
import { isAdmin } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Mi cuenta | Climatech",
};

export default async function CuentaPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    redirect("/ingresar");
  }

  await ensureUsuario(supabase, user);

  const email = user.email?.trim().toLowerCase();
  const { data: rows } = email
    ? await supabase.from("usuarios").select("direccion, rol, nombre").eq("email", email).limit(1)
    : { data: null };
  const direccion = text(rows?.[0]?.direccion);
  const rol = text(rows?.[0]?.rol);

  const meta = user.user_metadata ?? {};
  const nombre =
    text(rows?.[0]?.nombre) || text(meta.first_name) || text(meta.given_name) || firstWord(meta.full_name) || firstWord(meta.name);
  const apellido = text(meta.last_name) || text(meta.family_name);
  const telefono = text(meta.phone);
  const saludo = nombre ? (rol ? `Hola ${rol}, ${nombre}` : `Hola, ${nombre}`) : "Tu cuenta";

  return (
    <AuthScreen title={saludo} subtitle="Estos son los datos de tu acceso.">
      <dl className="flex flex-col gap-4 text-sm">
        <Item label="Nombre" value={nombre || "—"} />
        <Item label="Apellido" value={apellido || "—"} />
        <Item label="Teléfono" value={telefono || "—"} />
        <Item label="Dirección" value={direccion || "—"} />
        <Item label="Email" value={user.email ?? "—"} />
      </dl>
      <div className="mt-8 flex flex-col gap-3">
        <a
          href="/presupuestos"
          className="inline-flex h-12 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white transition hover:bg-[#0f2438]"
        >
          {isAdmin(rol) ? "Mostrar presupuestos" : "Mis presupuestos"}
        </a>
        {isAdmin(rol) ? (
          <a
            href="/usuarios"
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#b7d7ea] bg-white text-sm font-semibold text-navy transition hover:border-teal"
          >
            Mostrar usuarios
          </a>
        ) : null}
        <LogoutButton />
      </div>
    </AuthScreen>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-ice px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-navy/50">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function firstWord(value: unknown) {
  const raw = text(value);
  return raw.split(/\s+/)[0] ?? "";
}
