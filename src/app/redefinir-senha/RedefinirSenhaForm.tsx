"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function RedefinirSenhaForm() {
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    const novaSenha = formData.get("nova_senha") as string;
    const confirmarSenha = formData.get("confirmar_senha") as string;

    if (!novaSenha || !confirmarSenha) {
      setErro("Preencha os dois campos.");
      return;
    }
    if (novaSenha.length < 8) {
      setErro("A senha precisa ter ao menos 8 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    setErro(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: novaSenha });

      if (error) {
        if (error.message.includes("same_password")) {
          setErro("A nova senha precisa ser diferente da anterior.");
        } else {
          setErro("Erro ao redefinir senha. O link pode ter expirado — solicite um novo.");
        }
        return;
      }

      setSucesso(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    });
  }

  if (sucesso) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
          <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <p className="text-white font-medium">Senha redefinida!</p>
        <p className="text-sm text-white/50">
          Redirecionando para o dashboard...
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nova_senha" className="text-sm font-medium text-white/70">
          Nova senha
        </label>
        <input
          id="nova_senha" name="nova_senha" type="password" required autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          className="input"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmar_senha" className="text-sm font-medium text-white/70">
          Confirmar nova senha
        </label>
        <input
          id="confirmar_senha" name="confirmar_senha" type="password" required autoComplete="new-password"
          placeholder="Repita a senha"
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
        {carregando ? "Redefinindo..." : "Redefinir senha"}
      </button>
    </form>
  );
}
