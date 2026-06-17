"use client";

/**
 * Error boundary global do app (App Router).
 * Em vez de uma tela branca/quebrada quando algo falha em runtime, o usuário
 * vê uma tela amigável com a opção de tentar de novo ou voltar pro início.
 */
import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Loga no console do navegador pra depuração (o servidor já tem error_log).
    console.error("Erro capturado pelo boundary:", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-screen px-6 py-16 bg-[#111111] text-center">
      <div className="flex flex-col items-center gap-5 max-w-md">
        <div className="h-16 w-16 rounded-2xl bg-orange-400/10 border border-orange-400/25 flex items-center justify-center text-orange-400">
          <AlertTriangle size={30} />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
            Ops, algo deu errado
          </h1>
          <p className="text-sm text-white/50 leading-relaxed">
            Tivemos um problema inesperado ao carregar esta tela. Você pode
            tentar de novo — geralmente resolve.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-1">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-orange-400 text-black font-semibold text-sm hover:bg-orange-300 active:scale-95 transition-all"
          >
            <RotateCcw size={16} /> Tentar de novo
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full border border-white/20 text-white/70 font-medium text-sm hover:border-white/40 hover:text-white transition-all"
          >
            <Home size={16} /> Voltar ao início
          </Link>
        </div>

        {error.digest && (
          <p className="text-[11px] text-white/25 mt-2">
            Código do erro: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
