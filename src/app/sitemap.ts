import type { MetadataRoute } from "next";

const siteUrl = "https://www.climatecno.com.ar";

// La home y la lista de precios son públicas. El resto pide sesión.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/lista-de-precios`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
