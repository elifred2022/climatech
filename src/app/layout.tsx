import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.climatecno.com.ar"),
  title: "Climatecno | Servicio técnico de aires acondicionados",
  description:
    "Instalación, mantenimiento, diagnóstico, reparación y mudanza de equipos en CABA y AMBA. Pedí tu presupuesto por WhatsApp.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Climatecno",
    title: "Climatecno | Servicio técnico de aires acondicionados",
    description:
      "Instalación, mantenimiento, diagnóstico, reparación y mudanza de equipos en CABA y AMBA.",
    images: ["/split-frio.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
