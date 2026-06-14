"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { login, loginComGoogle } from "@/app/auth/actions";

export function LoginForm({ redirect }: { redirect?: string }) {
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, startTransition] = useTransition();
  const [carregandoGoogle, setCarregandoGoogle] = useState(false);

  function handleSubmit(formData: FormData) {
    setErro(null);
    startTransition(async () => {
      const resultado = await login(formData);
      if (resultado?.erro) setErro(resultado.erro);
    });
  }

  async function handleGoogle() {
    setErro(null);
    setCarregandoGoogle(true);
    const fd = new FormData();
    if (redirect) fd.set("redirect", redirect);
    const resultado = await loginComGoogle(fd);
    if (resultado.erro) {
      setErro(resultado.erro);
      setCarregandoGoogle(false);
      return;
    }
    if (resultado.url) window.location.href = resultado.url;
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={handleGoogle}
        disabled={carregando || carregandoGoogle}
        className="h-12 rounded-full bg-white text-black font-medium flex items-center justify-center gap-3 hover:bg-white/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <GoogleLogo />
        {carregandoGoogle ? "Abrindo Google..." : "Continuar com Google"}
      </button>
      <p className="text-[11px] text-white/40 text-center leading-relaxed -mt-1">
        Ao continuar com Google, você aceita os{" "}
        <Link href="/termos" target="_blank" className="text-orange-400 hover:underline">
          Termos
        </Link>{" "}
        e a{" "}
        <Link href="/privacidade" target="_blank" className="text-orange-400 hover:underline">
          Política de Privacidade
        </Link>
        .
      </p>

      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/40">ou</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

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
          <div className="flex items-center justify-between">
            <label htmlFor="senha" className="text-sm font-medium text-white/70">
              Senha
            </label>
            <Link
              href="/esqueci-senha"
              className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
            >
              Esqueceu a senha?
            </Link>
          </div>
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
          type="submit" disabled={carregando || carregandoGoogle}
          className="h-12 rounded-full bg-orange-400 text-black font-semibold hover:bg-orange-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
