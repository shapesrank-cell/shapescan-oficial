import type { MetadataRoute } from "next";

/**
 * Manifest do PWA — define como o ShapeScan se comporta quando instalado
 * como app no celular (Android ou iOS).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ShapeScan — Análise de Biotipo com IA",
    short_name: "ShapeScan",
    description:
      "Descubra seu biotipo e receba dieta e treino personalizados por IA.",
    // Abre direto "dentro do app" quando instalado (não na landing de marketing).
    // Logado → /dashboard; deslogado → o proxy redireciona pra /login.
    start_url: "/dashboard",
    id: "/dashboard",
    display: "standalone",
    orientation: "portrait",
    background_color: "#111111", // mesma cor do app (dark)
    theme_color: "#fb923c", // orange-400 — identidade ShapeScan
    lang: "pt-BR",
    categories: ["health", "fitness", "lifestyle"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
