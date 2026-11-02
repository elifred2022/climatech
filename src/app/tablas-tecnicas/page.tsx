import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth/auth-screen";
import { TablasTecnicas } from "@/components/tablas/tablas-tecnicas";
import { isAdmin } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Tablas técnicas | Climatech",
};

export default async function TablasTecnicasPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.trim().toLowerCase();

  if (!email) {
    redirect("/ingresar?siguiente=/tablas-tecnicas");
  }

  const { data: usuario } = await supabase.from("usuarios").select("rol").eq("email", email).limit(1);
  if (!isAdmin(text(usuario?.[0]?.rol))) {
    redirect("/cuenta");
  }

  return (
    <AuthScreen
      fit
      title="Tablas técnicas"
      subtitle="Referencias de modo frío para el trabajo en equipo split."
    >
      <TablasTecnicas />
    </AuthScreen>
  );
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
