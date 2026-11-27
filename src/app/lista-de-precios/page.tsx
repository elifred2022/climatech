import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";
import { ListaPrecios, type PrecioItem } from "@/components/precios/lista-precios";
import { isAdmin } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

const title = "Lista de precios de instalación y service de aires acondicionados | Climatecno";
const description =
  "Valores de referencia de mano de obra y materiales para instalación, desinstalación, limpieza y mantenimiento, detección de fugas, carga de gas y reparaciones de aires acondicionados en CABA y AMBA.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/lista-de-precios" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Climatecno",
    url: "/lista-de-precios",
    title,
    description,
    images: ["/split-frio.jpg"],
  },
};

export default async function ListaDePreciosPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.trim().toLowerCase();
  const { data: usuario } = email
    ? await supabase.from("usuarios").select("rol").eq("email", email).limit(1)
    : { data: null };
  const admin = isAdmin(text(usuario?.[0]?.rol));

  const { data: rows, error } = await supabase
    .from("lista_precios")
    .select("id, Servicio, Valor_servicio_mo, Valor_materiales_aprox, Valor_total")
    .order("created_at", { ascending: true });
  const items = error ? [] : (rows ?? []).map(toItem);

  return (
    <AuthScreen
      fit
      title={
        <>
          Lista de precios según la Cámara Argentina de Instaladores Matriculados{" "}
          <a
            href="https://www.instagram.com/caimarg/"
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-teal underline"
          >
            https://www.instagram.com/caimarg/
          </a>
        </>
      }
      subtitle={
        error
          ? "No se pudo cargar la lista de precios. Intentá de nuevo en unos minutos."
          : admin
            ? "Cargá cada servicio con la mano de obra y los materiales. El total se calcula solo."
            : "Estos son los valores de cada servicio."
      }
    >
      <ListaPrecios items={items} editable={admin} />
    </AuthScreen>
  );
}

function toItem(row: {
  id: number | string;
  Servicio: string | null;
  Valor_servicio_mo: number | string | null;
  Valor_materiales_aprox: number | string | null;
  Valor_total: number | string | null;
}): PrecioItem {
  return {
    id: String(row.id),
    servicio: text(row.Servicio) || "—",
    manoDeObra: amount(row.Valor_servicio_mo),
    materiales: amount(row.Valor_materiales_aprox),
    total: amount(row.Valor_total),
  };
}

function amount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }
  return null;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
