import type { MetadataRoute } from "next";

const BASE = "https://shapescan-oficial.vercel.app";

/**
 * Sitemap com as páginas públicas indexáveis.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();
  return [
    { url: `${BASE}/`, lastModified: agora, changeFrequency: "weekly", priority: 1 },
    {
      url: `${BASE}/cadastro`,
      lastModified: agora,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/login`,
      lastModified: agora,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE}/termos`,
      lastModified: agora,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE}/privacidade`,
      lastModified: agora,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
