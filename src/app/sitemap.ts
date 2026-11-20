import type { MetadataRoute } from "next";

const siteUrl = "https://www.climatecno.com.ar";

// Solo la home es pública. Las demás rutas (login, cuenta, presupuestos,
// usuarios, tablas técnicas) requieren sesión y no deben indexarse.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
