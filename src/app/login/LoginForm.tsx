"use client";

import { useState, useTransition } from "react";
import { login } from "@/app/auth/actions";

export function LoginForm({ redirect }: { redirect?: string }) {
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setErro(null);
    startTransition(async () => {
      const resultado = await login(formData);
      if (resultado?.erro) setErro(resultado.erro);
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      {redirect && <input type="hidden" name="redirect" value={redirect} />}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-white/70">
          Email
        </label>
        <input
          id="email" name="email" type="email" required autoComplete="email"
          placeholder="seu@email.com"
          className="input"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="senha" className="text-sm font-medium text-white/70">
          Senha
        </label>
        <input
          id="senha" name="senha" type="password" required autoComplete="current-password"
          placeholder="••••••••"
          className="input"
        />
      </div>

      {erro && (
        <div role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 animate-[fadeIn_0.3s_ease-out]">
          {erro}
        </div>
      )}

      <button
        type="submit" disabled={carregando}
        className="h-12 rounded-full bg-orange-400 text-black font-semibold hover:bg-orange-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {carregando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
