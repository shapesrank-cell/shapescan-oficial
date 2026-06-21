"use client";

/**
 * Abas internas da página "Meu Plano" (o protocolo passado ao usuário).
 * Mesmo conceito de divisão de conteúdo do Ranking: um segmented control no
 * topo alterna entre Treino e Dieta, em vez de empilhar tudo num scroll só.
 *
 * Os painéis chegam prontos como ReactNode (renderizados no server component).
 */
import { useState } from "react";
import { Dumbbell, Utensils } from "lucide-react";

const TABS = [
  { id: "treino", label: "Treino", icone: Dumbbell },
  { id: "dieta", label: "Dieta", icone: Utensils },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function PlanoTabs({
  treino,
  dieta,
}: {
  treino: React.ReactNode;
  dieta: React.ReactNode;
}) {
  const [ativa, setAtiva] = useState<TabId>("treino");

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
        {ativa === "treino" && treino}
        {ativa === "dieta" && dieta}
      </div>
    </div>
  );
}
