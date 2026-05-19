"use client";

import { useState, useTransition } from "react";
import { Download } from "lucide-react";
import { baixarMeusDados } from "./actions";

export function ExportarDadosBotao() {
  const [carregando, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function handleClick() {
    setErro(null);
    startTransition(async () => {
      const r = await baixarMeusDados();
      if (r.erro) {
        setErro(r.erro);
        return;
      }
      if (!r.json) return;

      const blob = new Blob([r.json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shapescan-meus-dados-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={carregando}
        className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-white/[0.12] text-white/70 font-medium hover:bg-white/[0.05] hover:text-white transition-all disabled:opacity-50"
      >
        <Download size={14} />
        {carregando ? "Preparando..." : "Baixar meus dados (JSON)"}
      </button>
      {erro && (
        <p className="text-xs text-red-400">{erro}</p>
      )}
    </div>
  );
}
