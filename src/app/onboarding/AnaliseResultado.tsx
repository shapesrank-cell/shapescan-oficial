"use client";

import Link from "next/link";
import type { AnaliseBiotipo } from "@/lib/gemini";
import { AnaliseView } from "./AnaliseView";

export function AnaliseResultado({
  analise,
  nome,
  onReset,
  analiseId,
  alerta,
}: {
  analise: AnaliseBiotipo;
  nome: string;
  onReset: () => void;
  analiseId: string | null;
  alerta?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-8 sm:py-12 bg-[#111111] animate-[fadeIn_0.4s_ease-out]">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onReset}
            className="text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            ← Nova análise
          </button>
        </div>

        {/* Banner de status */}
        {alerta ? (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-yellow-500/[0.08] border border-yellow-500/30">
            <span className="text-sm text-yellow-300">{alerta}</span>
          </div>
        ) : analiseId ? (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.12]">
            <span className="text-sm text-white/60">
              Análise salva na sua conta
            </span>
            <Link
              href={`/dashboard/analise/${analiseId}`}
              className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors whitespace-nowrap"
            >
              Ver no dashboard →
            </Link>
          </div>
        ) : null}

        <AnaliseView analise={analise} nome={nome} />
      </div>
    </div>
  );
}
