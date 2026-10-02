import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";
import { RegisterForm } from "@/components/auth/register-form";
import { safeNext } from "@/lib/auth-next";

export const metadata: Metadata = {
  title: "Crear cuenta | Climatech",
};

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ siguiente?: string }>;
}) {
  const next = safeNext((await searchParams).siguiente);
  const porPresupuesto = next === "/presupuesto";

  return (
    <AuthScreen
      title="Crear cuenta"
      subtitle={
        porPresupuesto
          ? "Creá tu cuenta para pedir el presupuesto. Si ya estás registrado, iniciá sesión."
          : "Con Google entrás directo. Si preferís tu email, cargá tus datos y repetí la contraseña."
      }
    >
      <RegisterForm next={next} />
    </AuthScreen>
  );
}
