import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";
import { LoginForm } from "@/components/auth/login-form";
import { safeNext } from "@/lib/auth-next";

export const metadata: Metadata = {
  title: "Iniciar sesión | Climatech",
};

export default async function IngresarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; siguiente?: string }>;
}) {
  const query = await searchParams;
  const next = safeNext(query.siguiente);
  const porPresupuesto = next === "/presupuesto" || next === "/presupuestos";

  return (
    <AuthScreen
      title="Iniciar sesión"
      subtitle={
        next === "/usuarios"
          ? "Para ver los usuarios, iniciá sesión."
          : next === "/presupuestos"
            ? "Para ver tus presupuestos, iniciá sesión. Si no tenés cuenta, registrate."
          : porPresupuesto
            ? "Para pedir un presupuesto, iniciá sesión. Si no tenés cuenta, registrate."
            : "Entrá con el email y la contraseña de tu cuenta."
      }
    >
      <LoginForm googleError={query.error === "google"} next={next} />
    </AuthScreen>
  );
}
