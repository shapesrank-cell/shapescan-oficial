"use client";

import type { AnaliseBiotipo } from "@/lib/gemini";

export function AnaliseResultado({
  analise,
  nome,
  onReset,
}: {
  analise: AnaliseBiotipo;
  nome: string;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-8 sm:py-12 animate-[fadeIn_0.4s_ease-out]">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onReset}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
          >
            ← Nova análise
          </button>
        </div>

        {/* Biotipo principal */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/20">
          <p className="text-sm sm:text-base opacity-90 mb-1">
            Análise de {nome}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold capitalize mb-3">
            Você é{" "}
            {analise.biotipo === "ectomorfo"
              ? "ectomorfo"
              : analise.biotipo === "mesomorfo"
              ? "mesomorfo"
              : analise.biotipo === "endomorfo"
              ? "endomorfo"
              : "biotipo misto"}
          </h1>
          <p className="text-sm sm:text-base opacity-95 leading-relaxed">
            {analise.resumoBiotipo}
          </p>
        </div>

        {/* Pontos fortes e desafios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card titulo="💪 Pontos fortes">
            <ul className="flex flex-col gap-2">
              {analise.pontosFortes.map((p, i) => (
                <li key={i} className="flex gap-2 text-sm sm:text-base">
                  <span className="text-green-600 dark:text-green-400">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card titulo="🎯 Desafios">
            <ul className="flex flex-col gap-2">
              {analise.desafios.map((d, i) => (
                <li key={i} className="flex gap-2 text-sm sm:text-base">
                  <span className="text-amber-600 dark:text-amber-400">•</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Dieta */}
        <Card titulo="🥗 Sua dieta personalizada">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <Stat
              label="Calorias/dia"
              valor={`${analise.dieta.caloriasEstimadas}`}
              sufixo="kcal"
            />
            <Stat
              label="Proteína"
              valor={`${analise.dieta.distribuicaoMacros.proteinaGramas}`}
              sufixo="g"
            />
            <Stat
              label="Carboidrato"
              valor={`${analise.dieta.distribuicaoMacros.carboidratoGramas}`}
              sufixo="g"
            />
            <Stat
              label="Gordura"
              valor={`${analise.dieta.distribuicaoMacros.gorduraGramas}`}
              sufixo="g"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Sugestões alimentares:
            </p>
            <ul className="flex flex-col gap-2">
              {analise.dieta.sugestoesAlimentares.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm sm:text-base">
                  <span className="text-indigo-600 dark:text-indigo-400">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Treino */}
        <Card titulo="💪 Seu plano de treino">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Stat
              label="Frequência"
              valor={`${analise.treino.frequenciaSemanal}x`}
              sufixo="por semana"
            />
            <Stat label="Foco" valor={analise.treino.focoPrincipal} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Exercícios recomendados:
            </p>
            <ul className="flex flex-col gap-2">
              {analise.treino.exerciciosRecomendados.map((e, i) => (
                <li key={i} className="flex gap-2 text-sm sm:text-base">
                  <span className="text-purple-600 dark:text-purple-400">•</span>
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Aviso legal */}
        <div className="p-4 sm:p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            ⚠️ <strong>Importante:</strong> {analise.avisoImportante}
          </p>
        </div>
      </div>
    </div>
  );
}

function Card({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
        {titulo}
      </h2>
      {children}
    </div>
  );
}

function Stat({
  label,
  valor,
  sufixo,
}: {
  label: string;
  valor: string;
  sufixo?: string;
}) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3">
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
      <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 capitalize">
        {valor}{" "}
        {sufixo && (
          <span className="text-xs font-normal text-zinc-500">{sufixo}</span>
        )}
      </p>
    </div>
  );
}
