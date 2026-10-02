"use client";

import { useState } from "react";
import { AuthScreen } from "@/components/auth/auth-screen";
import { PresupuestoForm } from "@/components/presupuesto/presupuesto-form";

type PresupuestoPanelProps = {
  userId: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
};

export function PresupuestoPanel(props: PresupuestoPanelProps) {
  const [sent, setSent] = useState(false);

  return (
    <AuthScreen
      wide
      title={sent ? "Su solicitud fue recibida" : "Pedir presupuesto"}
      subtitle={sent ? undefined : "Contanos cómo está el lugar y el equipo. Con eso te armamos el presupuesto."}
    >
      <PresupuestoForm {...props} onSent={() => setSent(true)} />
    </AuthScreen>
  );
}
