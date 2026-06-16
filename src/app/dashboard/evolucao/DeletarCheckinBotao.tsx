"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deletarCheckin } from "./actions";

export function DeletarCheckinBotao({ id }: { id: string }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [removendo, setRemovendo] = useState(false);

  async function remover() {
    setRemovendo(true);
    const resultado = await deletarCheckin(id);
    if ("erro" in resultado) {
      setRemovendo(false);
      setConfirmando(false);
      alert(resultado.erro);
      return;
    }
    router.refresh();
  }

  if (confirmando) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={remover}
          disabled={removendo}
          className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-all disabled:opacity-50"
        >
          {removendo ? "..." : "Confirmar"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          disabled={removendo}
          className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/15 text-white/50 hover:text-white/80 transition-all"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirmando(true)}
      className="inline-flex items-center justify-center h-8 w-8 rounded-full text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
      aria-label="Deletar check-in"
    >
      <Trash2 size={14} />
    </button>
  );
}
