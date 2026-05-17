"use client";

import { useState, useTransition } from "react";
import { cadastro } from "@/app/auth/actions";

export function CadastroForm() {
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setErro(null);
    startTransition(async () => {
      const resultado = await cadastro(formData);
      if (resultado?.erro) {
        setErro(resultado.erro);
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="nome" className="text-sm font-medium text-white/70">
          Nome
        </label>
        <input
          id="nome" name="nome" type="text" required autoComplete="name"
          placeholder="Como você se chama"
          className="input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-white/70">
          Email
        </label>
        <input
          id="email" name="email" type="email" required autoComplete="email"
          placeholder="seu@email.com"
          className="input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="senha" className="text-sm font-medium text-white/70">
          Senha
        </label>
        <input
          id="senha" name="senha" type="password" required minLength={6}
          autoComplete="new-password" placeholder="Mínimo 6 caracteres"
          className="input"
        />
      </div>

      {erro && (
        <div role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3">
          {erro}
        </div>
      )}

      <button
        type="submit" disabled={carregando}
        className="h-12 rounded-full bg-orange-400 text-black font-semibold hover:bg-orange-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {carregando ? "Criando conta..." : "Criar conta grátis"}
      </button>

      <p className="text-xs text-center text-white/30">
        Ao cadastrar, você concorda com os Termos de Uso e Política de Privacidade.
      </p>
    </form>
  );
}
