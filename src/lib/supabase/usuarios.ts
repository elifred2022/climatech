import type { SupabaseClient, User } from "@supabase/supabase-js";

type Profile = {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
};

export async function ensureUsuario(
  supabase: SupabaseClient,
  user: User,
  profile?: Profile,
) {
  const email = user.email?.trim().toLowerCase();
  if (!email) {
    return { error: "La cuenta no tiene email." };
  }

  const { data: existing, error: selectError } = await supabase
    .from("usuarios")
    .select("id")
    .eq("email", email)
    .limit(1);

  if (selectError) {
    return { error: selectError.message };
  }

  if (existing && existing.length > 0) {
    return { error: null };
  }

  const meta = user.user_metadata ?? {};
  const nombre = firstText(profile?.nombre, meta.first_name, meta.given_name, firstWord(meta.full_name), firstWord(meta.name));
  const apellido = firstText(profile?.apellido, meta.last_name, meta.family_name, restWords(meta.full_name), restWords(meta.name));
  const telefono = phoneNumber(firstText(profile?.telefono, meta.phone));
  const direccion = firstText(profile?.direccion, meta.direccion);

  const { error: insertError } = await supabase.from("usuarios").insert({
    email,
    nombre,
    apellido,
    telefono,
    direccion,
    rol: "cliente",
  });

  if (insertError?.code === "23505") {
    return { error: null };
  }

  return { error: insertError?.message ?? null };
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function firstWord(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().split(/\s+/)[0] ?? "";
}

function restWords(value: unknown) {
  if (typeof value !== "string") return "";
  const parts = value.trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(" ") : "";
}

function phoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  const number = Number(digits);
  if (!Number.isSafeInteger(number)) return null;
  return number;
}
