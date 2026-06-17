"use client";

import { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Utensils,
  Dumbbell,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { gerarRelatorio } from "./actions";
import type { RelatorioEvolucao } from "@/lib/gemini";

export function RelatorioIA() {
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [relatorio, setRelatorio] = useState<RelatorioEvolucao | null>(null);

  async function gerar() {
    setGerando(true);
    setErro(null);
    const resultado = await gerarRelatorio();
    if ("erro" in resultado) {
      setErro(resultado.erro);
    } else {
      setRelatorio(resultado.relatorio);
    }
    setGerando(false);
  }

  // Estado inicial: card-convite
  if (!relatorio) {
    return (
      <section className="bg-gradient-to-br from-orange-400/[0.12] to-white/[0.03] border border-orange-400/25 rounded-2xl p-5 sm:p-6 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-orange-400">
          <Sparkles size={18} />
          <h2 className="text-sm font-bold text-white/80 uppercase tracking-wider">
            Relatório de evolução com IA
          </h2>
        </div>
        <p className="text-sm text-white/50">
          A IA analisa seu histórico de check-ins e gera um diagnóstico do seu
          progresso: o que melhorou, o que estagnou e ajustes pro seu plano.
        </p>

        {erro && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-400">{erro}</p>
          </div>
        )}

        <button
          type="button"
          onClick={gerar}
          disabled={gerando}
          className="self-start mt-1 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-orange-400 text-black font-semibold text-sm hover:bg-orange-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={16} />
          {gerando ? "Analisando seu progresso..." : "Gerar relatório"}
        </button>
      </section>
    );
  }

  // Relatório gerado
  const TendIcon =
    relatorio.tendenciaPeso.direcao === "descendo"
      ? TrendingDown
      : relatorio.tendenciaPeso.direcao === "subindo"
        ? TrendingUp
        : Minus;

  return (
    <section className="bg-white/[0.04] border border-orange-400/25 rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-orange-400">
          <Sparkles size={18} />
          <h2 className="text-sm font-bold text-white/80 uppercase tracking-wider">
            Relatório de evolução
          </h2>
        </div>
        <button
          type="button"
          onClick={gerar}
          disabled={gerando}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-orange-400 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={gerando ? "animate-spin" : ""} />
          {gerando ? "Gerando..." : "Regenerar"}
        </button>
      </div>

      {/* Resumo */}
      <p className="text-sm text-white/80 leading-relaxed">
        {relatorio.resumoGeral}
      </p>

      {/* Tendência de peso */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
        <div
          className={`mt-0.5 flex-shrink-0 ${
            relatorio.tendenciaPeso.direcao === "descendo"
              ? "text-emerald-400"
              : relatorio.tendenciaPeso.direcao === "subindo"
                ? "text-orange-400"
                : "text-white/50"
          }`}
        >
          <TendIcon size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">
            Tendência de peso
          </span>
          <span className="text-sm text-white/70">
            {relatorio.tendenciaPeso.analise}
          </span>
        </div>
      </div>

      {/* Destaques e atenção */}
      <div className="grid sm:grid-cols-2 gap-4">
        <ListaBox
          titulo="Destaques"
          icone={<CheckCircle2 size={15} />}
          cor="emerald"
          itens={relatorio.destaques}
        />
        <ListaBox
          titulo="Pontos de atenção"
          icone={<AlertTriangle size={15} />}
          cor="amber"
          itens={relatorio.pontosAtencao}
        />
      </div>

      {/* Ajustes no plano */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">
          Ajustes sugeridos no plano
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <ListaBox
            titulo="Dieta"
            icone={<Utensils size={15} />}
            cor="orange"
            itens={relatorio.ajustesPlano.dieta}
          />
          <ListaBox
            titulo="Treino"
            icone={<Dumbbell size={15} />}
            cor="orange"
            itens={relatorio.ajustesPlano.treino}
          />
        </div>
      </div>

      {/* Próximo passo */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-400/10 border border-orange-400/25">
        <ArrowRight size={18} className="text-orange-400 flex-shrink-0" />
        <p className="text-sm font-medium text-white">
          {relatorio.proximoPasso}
        </p>
      </div>

      <p className="text-[11px] text-white/30 leading-relaxed">
        {relatorio.avisoImportante}
      </p>
    </section>
  );
}

const CORES = {
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  orange: "text-orange-400",
} as const;

function ListaBox({
  titulo,
  icone,
  cor,
  itens,
}: {
  titulo: string;
  icone: React.ReactNode;
  cor: keyof typeof CORES;
  itens: string[];
}) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
      <div className={`flex items-center gap-1.5 ${CORES[cor]}`}>
        {icone}
        <span className="text-xs font-bold uppercase tracking-wider">
          {titulo}
        </span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {itens.map((item, i) => (
          <li key={i} className="text-sm text-white/70 flex gap-2">
            <span className={`${CORES[cor]} flex-shrink-0`}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
