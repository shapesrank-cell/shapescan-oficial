import type { MetadataRoute } from "next";

/**
 * Manifest do PWA — define como o ShapeScan se comporta quando instalado
 * como app no celular (Android ou iOS).
 *
 * Quando o usuário acessa o site pelo celular, o navegador lê este arquivo
 * e oferece a opção "Instalar app" ou "Adicionar à tela inicial".
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ShapeScan — Análise de Biotipo com IA",
    short_name: "ShapeScan",
    description:
      "Descubra seu biotipo e receba dieta e treino personalizados por IA.",
    start_url: "/",
    display: "standalone", // abre em tela cheia, sem barra do navegador
    orientation: "portrait",
    background_color: "#fafafa", // cor da splash screen
    theme_color: "#6366f1", // cor da barra superior (indigo-500)
    lang: "pt-BR",
    categories: ["health", "fitness", "lifestyle"],
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
