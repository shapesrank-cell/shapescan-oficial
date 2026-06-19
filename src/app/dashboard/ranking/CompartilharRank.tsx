"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

/**
 * Botão que gera a imagem do rank (/dashboard/ranking/card) e:
 * - no celular: abre o menu de compartilhar (Web Share API) com a imagem;
 * - no desktop / sem suporte: baixa a imagem.
 */
export function CompartilharRank() {
  const [estado, setEstado] = useState<"idle" | "gerando" | "ok" | "erro">(
    "idle"
  );

  async function compartilhar() {
    setEstado("gerando");
    try {
      const res = await fetch("/dashboard/ranking/card");
      if (!res.ok) throw new Error("falha ao gerar");
      const blob = await res.blob();
      const file = new File([blob], "meu-rank-shapescan.png", {
        type: "image/png",
      });

      const podeCompartilhar =
        typeof navigator !== "undefined" &&
        navigator.canShare &&
        navigator.canShare({ files: [file] });

      if (podeCompartilhar) {
        await navigator.share({
          files: [file],
          title: "Meu rank no ShapeScan",
          text: "Esse é o meu rank de shape no ShapeScan 🔥",
        });
        setEstado("ok");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "meu-rank-shapescan.png";
        a.click();
        URL.revokeObjectURL(url);
        setEstado("ok");
      }
    } catch {
      setEstado("erro");
    } finally {
      setTimeout(() => setEstado("idle"), 2500);
    }
  }

  return (
    <button
      type="button"
      onClick={compartilhar}
      disabled={estado === "gerando"}
      className="w-full h-12 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-white/[0.1] active:scale-[0.99] transition-all disabled:opacity-60"
    >
      {estado === "ok" ? (
        <>
          <Check size={18} className="text-green-400" /> Pronto!
        </>
      ) : (
        <>
          <Share2 size={18} />
          {estado === "gerando"
            ? "Gerando imagem..."
            : estado === "erro"
              ? "Erro — tente de novo"
              : "Compartilhar meu rank"}
        </>
      )}
    </button>
  );
}
