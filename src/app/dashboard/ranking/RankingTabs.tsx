"use client";

/**
 * Abas internas da página de Ranking. Separa o conteúdo em 3 grupos pra não
 * ficar tudo empilhado num scroll gigante:
 *   - Meu Rank  → o ranking em si (card, foco, evolução, compartilhar)
 *   - Medidas   → form de medidas + proporção/simetria
 *   - Guia      → como funciona + escada de tiers
 *
 * Os painéis chegam prontos como ReactNode (renderizados no server component),
 * e aqui só alternamos qual está visível via estado de cliente.
 */
import { useState } from "react";
import { Trophy, Ruler, BookOpen } from "lucide-react";

const TABS = [
  { id: "rank", label: "Meu Rank", icone: Trophy },
  { id: "medidas", label: "Medidas", icone: Ruler },
  { id: "guia", label: "Guia", icone: BookOpen },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function RankingTabs({
  rank,
  medidas,
  guia,
}: {
  rank: React.ReactNode;
  medidas: React.ReactNode;
  guia: React.ReactNode;
}) {
  const [ativa, setAtiva] = useState<TabId>("rank");

  return (
    <div className="flex flex-col gap-6">
      {/* Segmented control */}
      <div className="flex gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
        {TABS.map((t) => {
          const Icone = t.icone;
          const sel = ativa === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setAtiva(t.id)}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl text-sm font-semibold transition-all ${
                sel
                  ? "bg-orange-400 text-black"
                  : "text-white/50 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Icone size={15} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Painel ativo */}
      <div className="flex flex-col gap-6 animate-[fadeIn_0.25s_ease-out]">
        {ativa === "rank" && rank}
        {ativa === "medidas" && medidas}
        {ativa === "guia" && guia}
      </div>
    </div>
  );
}
