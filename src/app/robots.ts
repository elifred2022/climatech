import type { MetadataRoute } from "next";

const siteUrl = "https://www.climatecno.com.ar";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/ingresar",
        "/registro",
        "/cuenta",
        "/usuarios",
        "/presupuesto",
        "/presupuestos",
        "/tablas-tecnicas",
        "/auth/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
