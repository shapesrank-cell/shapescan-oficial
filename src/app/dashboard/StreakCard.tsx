"use client";

import { useState, useTransition } from "react";
import { Flame, Check, Trophy } from "lucide-react";
import { marcarDia } from "./actions";
import type { ResultadoStreak } from "@/lib/streak";

/**
 * Card da ofensiva (streak) de constância — o "motivo de abrir todo dia".
 * Botão único pra marcar o dia; atualiza na hora (otimista) e o servidor
 * confirma/recalcula a sequência.
 */
export function StreakCard({ inicial }: { inicial: ResultadoStreak }) {
  const [streak, setStreak] = useState(inicial);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, startTransition] = useTransition();

  function marcar() {
    if (streak.marcouHoje || pendente) return;
    setErro(null);
    // Atualização otimista (resposta imediata pro usuário)
    const otimista = {
      atual: streak.atual + 1,
      marcouHoje: true,
      recorde: Math.max(streak.recorde, streak.atual + 1),
    };
    setStreak(otimista);

    startTransition(async () => {
      const r = await marcarDia();
      if ("erro" in r) {
        setErro(r.erro);
        setStreak(inicial); // desfaz se falhou
      } else {
        setStreak(r.streak); // valor confirmado pelo servidor
      }
    });
  }

  const { atual, recorde, marcouHoje } = streak;

  return (
    <section className="rounded-2xl border border-orange-400/25 bg-gradient-to-br from-orange-400/[0.14] to-white/[0.02] p-4 sm:p-5">
      <div className="flex items-center gap-4">
        {/* Chama + número */}
        <div className="relative flex-shrink-0">
          <Flame
            size={46}
            className={atual > 0 ? "text-orange-400" : "text-white/20"}
            fill={atual > 0 ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-black">
            {atual > 0 ? atual : ""}
          </span>
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white leading-tight">
            {atual === 0
              ? "Comece sua ofensiva hoje!"
              : atual === 1
                ? "1 dia de ofensiva 🔥"
                : `${atual} dias seguidos 🔥`}
          </p>
          <p className="text-xs text-white/50 mt-0.5">
            {marcouHoje
              ? "Feito hoje! Volte amanhã pra não perder a sequência."
              : atual === 0
                ? "Cumpriu seu plano de treino/dieta hoje? Marque e comece."
                : "Mantenha viva: marque o dia de hoje."}
          </p>
          {recorde > 1 && (
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-orange-400/80">
              <Trophy size={11} /> Recorde: {recorde} dias
            </p>
          )}
          {erro && <p className="mt-1 text-[11px] text-red-400">{erro}</p>}
        </div>

        {/* Botão / estado */}
        {marcouHoje ? (
          <div className="flex-shrink-0 inline-flex items-center justify-center h-11 w-11 rounded-full bg-orange-400/15 border border-orange-400/30 text-orange-400">
            <Check size={22} />
          </div>
        ) : (
          <button
            type="button"
            onClick={marcar}
            disabled={pendente}
            className="flex-shrink-0 inline-flex items-center gap-2 h-11 px-4 sm:px-5 rounded-full bg-orange-400 text-black font-semibold text-sm hover:bg-orange-300 active:scale-95 transition-all disabled:opacity-60"
          >
            <Check size={16} />
            <span className="hidden sm:inline">Cumpri hoje</span>
            <span className="sm:hidden">Hoje</span>
          </button>
        )}
      </div>
    </section>
  );
}
