import type { MetadataRoute } from "next";

const BASE = "https://shapescan-oficial.vercel.app";

/**
 * robots.txt gerado pelo Next. Libera as páginas públicas e bloqueia
 * rotas privadas/funcionais (que também já são protegidas pelo proxy).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/admin",
        "/api",
        "/perfil",
        "/configuracoes",
        "/onboarding",
        "/analise",
        "/auth",
      ],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
