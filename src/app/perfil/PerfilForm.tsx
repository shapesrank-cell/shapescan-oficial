"use client";

import { useState, useTransition } from "react";
import { atualizarPerfil } from "./actions";

export function PerfilForm({ nomeInicial }: { nomeInicial: string }) {
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setErro(null);
    setSucesso(false);
    startTransition(async () => {
      const r = await atualizarPerfil(formData);
      if (r.erro) setErro(r.erro);
      if (r.sucesso) {
        setSucesso(true);
        setTimeout(() => setSucesso(false), 3000);
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nome" className="text-sm font-medium text-white/70">
          Nome de exibição
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          required
          defaultValue={nomeInicial}
          maxLength={50}
          className="input"
        />
        <p className="text-xs text-white/30">Como você quer ser chamado nas análises.</p>
      </div>

      {erro && (
        <div role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3">
          {erro}
        </div>
      )}

      {sucesso && (
        <div role="status" className="text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-2xl px-4 py-3 animate-[fadeIn_0.3s_ease-out]">
          ✓ Perfil atualizado
        </div>
      )}

      <button
        type="submit"
        disabled={carregando}
        className="h-12 rounded-full bg-orange-400 text-black font-semibold hover:bg-orange-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {carregando ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
