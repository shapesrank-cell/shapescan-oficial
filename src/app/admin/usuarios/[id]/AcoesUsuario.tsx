"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, Trash2, AlertTriangle } from "lucide-react";
import {
  suspenderUsuario,
  reativarUsuario,
  deletarUsuario,
} from "../actions";

export function AcoesUsuario({
  userId,
  status,
  ehVoceMesmo,
}: {
  userId: string;
  status: "active" | "suspended";
  ehVoceMesmo: boolean;
}) {
  const router = useRouter();
  const [carregando, startTransition] = useTransition();
  const [confirmando, setConfirmando] = useState(false);
  const [confirmTexto, setConfirmTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function handleSuspender() {
    setErro(null);
    startTransition(async () => {
      const r = await suspenderUsuario(userId);
      if (r.erro) setErro(r.erro);
      else router.refresh();
    });
  }

  function handleReativar() {
    setErro(null);
    startTransition(async () => {
      const r = await reativarUsuario(userId);
      if (r.erro) setErro(r.erro);
      else router.refresh();
    });
  }

  function handleDeletar() {
    setErro(null);
    startTransition(async () => {
      const r = await deletarUsuario(userId, confirmTexto);
      if (r?.erro) setErro(r.erro);
    });
  }

  if (ehVoceMesmo) {
    return (
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-sm text-white/40">
        Você não pode suspender ou deletar sua própria conta de admin.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
        <AlertTriangle size={14} className="text-orange-400" />
        Ações
      </h3>

      {status === "active" ? (
        <button
          type="button"
          onClick={handleSuspender}
          disabled={carregando}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-yellow-500/40 text-yellow-400 font-medium hover:bg-yellow-500/10 hover:border-yellow-500/60 transition-all disabled:opacity-50"
        >
          <Pause size={14} /> Suspender usuário
        </button>
      ) : (
        <button
          type="button"
          onClick={handleReativar}
          disabled={carregando}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-green-500/40 text-green-400 font-medium hover:bg-green-500/10 hover:border-green-500/60 transition-all disabled:opacity-50"
        >
          <Play size={14} /> Reativar usuário
        </button>
      )}

      {!confirmando ? (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-red-500/40 text-red-400 font-medium hover:bg-red-500/10 hover:border-red-500/60 transition-all"
        >
          <Trash2 size={14} /> Deletar usuário + dados
        </button>
      ) : (
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/30 animate-[fadeIn_0.3s_ease-out]">
          <p className="text-sm text-red-200 font-medium">
            Esta ação é <strong>permanente</strong>. Todas as análises e o perfil
            serão apagados. O usuário será removido do Auth.
          </p>
          <p className="text-xs text-red-300/70">
            Digite <strong>DELETAR</strong> para confirmar:
          </p>
          <input
            type="text"
            value={confirmTexto}
            onChange={(e) => setConfirmTexto(e.target.value)}
            placeholder="DELETAR"
            className="h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.12] text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirmando(false);
                setConfirmTexto("");
                setErro(null);
              }}
              className="flex-1 h-10 rounded-full border border-white/[0.12] text-white/70 font-medium hover:bg-white/[0.05] transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDeletar}
              disabled={confirmTexto !== "DELETAR" || carregando}
              className="flex-1 h-10 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {carregando ? "Deletando..." : "Deletar definitivo"}
            </button>
          </div>
        </div>
      )}

      {erro && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
          {erro}
        </div>
      )}
    </div>
  );
}
