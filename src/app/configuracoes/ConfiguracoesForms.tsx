"use client";

import { useState, useTransition } from "react";
import { mudarSenha, deletarConta } from "./actions";

export function FormMudarSenha() {
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setErro(null);
    setSucesso(false);
    startTransition(async () => {
      const r = await mudarSenha(formData);
      if (r.erro) setErro(r.erro);
      if (r.sucesso) {
        setSucesso(true);
        // limpa os campos
        const form = document.getElementById("form-senha") as HTMLFormElement | null;
        form?.reset();
        setTimeout(() => setSucesso(false), 3000);
      }
    });
  }

  return (
    <form id="form-senha" action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nova_senha" className="text-sm font-medium text-white/70">
          Nova senha
        </label>
        <input
          id="nova_senha"
          name="nova_senha"
          type="password"
          required
          minLength={6}
          placeholder="Mínimo 6 caracteres"
          className="input"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmar_senha" className="text-sm font-medium text-white/70">
          Confirmar nova senha
        </label>
        <input
          id="confirmar_senha"
          name="confirmar_senha"
          type="password"
          required
          minLength={6}
          placeholder="Repita a senha"
          className="input"
        />
      </div>

      {erro && (
        <div role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3">
          {erro}
        </div>
      )}

      {sucesso && (
        <div role="status" className="text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-2xl px-4 py-3 animate-[fadeIn_0.3s_ease-out]">
          ✓ Senha atualizada
        </div>
      )}

      <button
        type="submit"
        disabled={carregando}
        className="h-12 rounded-full bg-orange-400 text-black font-semibold hover:bg-orange-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {carregando ? "Atualizando..." : "Atualizar senha"}
      </button>
    </form>
  );
}

export function BotaoDeletarConta() {
  const [confirmando, setConfirmando] = useState(false);
  const [textoConfirmacao, setTextoConfirmacao] = useState("");
  const [carregando, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deletarConta();
    });
  }

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="h-12 rounded-full border border-red-500/40 text-red-400 font-semibold hover:bg-red-500/10 hover:border-red-500/60 transition-all"
      >
        Deletar minha conta
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 animate-[fadeIn_0.3s_ease-out]">
      <p className="text-sm text-red-200 font-medium">
        Esta ação é <strong>permanente</strong>. Todas suas análises e dados serão apagados.
      </p>
      <p className="text-xs text-red-300/70">
        Digite <strong>DELETAR</strong> para confirmar:
      </p>
      <input
        type="text"
        value={textoConfirmacao}
        onChange={(e) => setTextoConfirmacao(e.target.value)}
        placeholder="DELETAR"
        className="input"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setConfirmando(false); setTextoConfirmacao(""); }}
          className="flex-1 h-11 rounded-full border border-white/20 text-white/70 font-medium hover:bg-white/[0.05] transition-all"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={textoConfirmacao !== "DELETAR" || carregando}
          className="flex-1 h-11 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {carregando ? "Deletando..." : "Deletar definitivo"}
        </button>
      </div>
    </div>
  );
}
