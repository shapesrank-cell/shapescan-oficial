"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deletarAnalise } from "../actions";

export function DeletarAnaliseBotao({ analiseId }: { analiseId: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, startTransition] = useTransition();

  function handleDelete() {
    setErro(null);
    startTransition(async () => {
      const r = await deletarAnalise(analiseId, texto, "/admin/analises");
      if (r?.erro) setErro(r.erro);
    });
  }

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/40 text-red-400 text-sm font-medium hover:bg-red-500/10 hover:border-red-500/60 transition-all"
      >
        <Trash2 size={13} /> Deletar análise
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/30 animate-[fadeIn_0.3s_ease-out] max-w-md">
      <p className="text-sm text-red-200 font-medium">
        Deletar esta análise é <strong>permanente</strong>.
      </p>
      <p className="text-xs text-red-300/70">
        Digite <strong>DELETAR</strong> para confirmar:
      </p>
      <input
        type="text"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="DELETAR"
        className="h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.12] text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setConfirmando(false);
            setTexto("");
            setErro(null);
          }}
          className="flex-1 h-10 rounded-full border border-white/[0.12] text-white/70 font-medium hover:bg-white/[0.05] transition-all text-sm"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={texto !== "DELETAR" || carregando}
          className="flex-1 h-10 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          {carregando ? "Deletando..." : "Deletar"}
        </button>
      </div>
      {erro && (
        <div className="text-xs text-red-400">{erro}</div>
      )}
    </div>
  );
}
