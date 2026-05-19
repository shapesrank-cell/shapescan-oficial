"use client";

import { useState, useTransition } from "react";
import { esqueceuSenha } from "@/app/auth/actions";

export function EsqueciSenhaForm() {
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [carregando, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setErro(null);
    startTransition(async () => {
      const resultado = await esqueceuSenha(formData);
      if (resultado?.erro) {
        setErro(resultado.erro);
      } else if (resultado?.sucesso) {
        setEnviado(true);
      }
    });
  }

  if (enviado) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
          <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        </div>
        <p className="text-white font-medium">Email enviado!</p>
        <p className="text-sm text-white/50">
          Se existe uma conta com esse email, você receberá um link para redefinir sua senha. Verifique também a pasta de spam.
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
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

      {erro && (
        <div role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 animate-[fadeIn_0.3s_ease-out]">
          {erro}
        </div>
      )}

      <button
        type="submit" disabled={carregando}
        className="h-12 rounded-full bg-orange-400 text-black font-semibold hover:bg-orange-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {carregando ? "Enviando..." : "Enviar link de redefinição"}
      </button>
    </form>
  );
}
