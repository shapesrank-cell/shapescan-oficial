"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { cadastro } from "@/app/auth/actions";

export function CadastroForm({ redirect }: { redirect?: string }) {
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, startTransition] = useTransition();
  const [aceitouTermos, setAceitouTermos] = useState(false);

  function handleSubmit(formData: FormData) {
    setErro(null);
    if (!aceitouTermos) {
      setErro("Você precisa aceitar os Termos de Uso e Política de Privacidade.");
      return;
    }
    formData.set("aceitou_termos", "true");
    startTransition(async () => {
      const resultado = await cadastro(formData);
      if (resultado?.erro) {
        setErro(resultado.erro);
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      {redirect && <input type="hidden" name="redirect" value={redirect} />}

      <div className="flex flex-col gap-2">
        <label htmlFor="nome" className="text-sm font-medium text-white/70">
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          required
          autoComplete="name"
          placeholder="Como você se chama"
          className="input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-white/70">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="seu@email.com"
          className="input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="senha" className="text-sm font-medium text-white/70">
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          className="input"
        />
        <p className="text-[11px] text-white/30">
          Use ao menos 8 caracteres. Combine letras e números pra mais segurança.
        </p>
      </div>

      {/* Checkbox de aceite dos termos */}
      <label className="flex items-start gap-3 cursor-pointer group select-none">
        <input
          type="checkbox"
          checked={aceitouTermos}
          onChange={(e) => setAceitouTermos(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/[0.06] accent-orange-400 cursor-pointer flex-shrink-0"
        />
        <span className="text-xs text-white/60 leading-relaxed">
          Li e aceito os{" "}
          <Link
            href="/termos"
            target="_blank"
            className="text-orange-400 hover:underline"
          >
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link
            href="/privacidade"
            target="_blank"
            className="text-orange-400 hover:underline"
          >
            Política de Privacidade
          </Link>
          .
        </span>
      </label>

      {erro && (
        <div
          role="alert"
          className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3"
        >
          {erro}
        </div>
      )}

      <button
        type="submit"
        disabled={carregando || !aceitouTermos}
        className="h-12 rounded-full bg-orange-400 text-black font-semibold hover:bg-orange-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {carregando ? "Criando conta..." : "Criar conta grátis"}
      </button>
    </form>
  );
}
