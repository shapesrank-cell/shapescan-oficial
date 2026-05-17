"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

type Analise = {
  id: string;
  criado_em: string;
  dados_entrada: { peso?: string; altura?: string; objetivo?: string };
  resultado: {
    biotipo?: string;
    dieta?: { caloriasEstimadas?: number };
    treino?: { frequenciaSemanal?: number; focoPrincipal?: string };
  };
};

const BIOTIPO_LABEL: Record<string, string> = {
  ectomorfo: "Ectomorfo",
  mesomorfo: "Mesomorfo",
  endomorfo: "Endomorfo",
  misto: "Biotipo Misto",
};

const OBJETIVO_LABEL: Record<string, string> = {
  emagrecer: "Emagrecer",
  ganhar_massa: "Ganhar massa",
  definir: "Definir",
  saude_geral: "Saúde geral",
};

export function CompararCliente({ analises }: { analises: Analise[] }) {
  const [selecionadas, setSelecionadas] = useState<string[]>([]);

  function toggle(id: string) {
    setSelecionadas((sel) => {
      if (sel.includes(id)) return sel.filter((s) => s !== id);
      if (sel.length >= 2) return [sel[1], id]; // mantém a última + a nova
      return [...sel, id];
    });
  }

  const a1 = analises.find((a) => a.id === selecionadas[0]);
  const a2 = analises.find((a) => a.id === selecionadas[1]);

  return (
    <div className="flex flex-col gap-6">
      {/* Lista de análises pra selecionar */}
      <div className="bg-white/[0.05] border border-white/[0.10] rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Selecione 2 análises</h2>
          <span className="text-xs text-white/40">{selecionadas.length}/2 selecionadas</span>
        </div>
        <ul className="flex flex-wrap gap-2">
          {analises.map((a) => {
            const ativa = selecionadas.includes(a.id);
            const biotipo = a.resultado?.biotipo ?? "";
            const label = BIOTIPO_LABEL[biotipo] ?? "Análise";
            const data = new Date(a.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => toggle(a.id)}
                  className={`px-3 py-2 rounded-full text-xs font-medium border transition-all ${
                    ativa
                      ? "bg-orange-400 text-black border-orange-400"
                      : "bg-white/[0.05] text-white/70 border-white/[0.15] hover:border-white/30"
                  }`}
                >
                  {label} • {data}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Comparação lado a lado */}
      {a1 && a2 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          <ColunaAnalise analise={a1} />
          <ColunaAnalise analise={a2} />
        </div>
      ) : (
        <div className="bg-white/[0.04] border border-dashed border-white/[0.10] rounded-2xl p-10 text-center text-white/40">
          {selecionadas.length === 0 && "Selecione 2 análises para comparar"}
          {selecionadas.length === 1 && "Selecione mais uma análise"}
        </div>
      )}

      {/* Linhas comparativas só quando tem 2 selecionadas */}
      {a1 && a2 && (
        <div className="bg-white/[0.05] border border-white/[0.10] rounded-2xl p-5 sm:p-6 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-1">Comparação</h3>
          <LinhaComp label="Biotipo" v1={BIOTIPO_LABEL[a1.resultado?.biotipo ?? ""] ?? "—"} v2={BIOTIPO_LABEL[a2.resultado?.biotipo ?? ""] ?? "—"} />
          <LinhaComp label="Peso" v1={`${a1.dados_entrada?.peso ?? "—"} kg`} v2={`${a2.dados_entrada?.peso ?? "—"} kg`} numerica delta={diffNum(a1.dados_entrada?.peso, a2.dados_entrada?.peso)} />
          <LinhaComp label="IMC" v1={imc(a1)} v2={imc(a2)} numerica delta={diffNum(imc(a1), imc(a2))} />
          <LinhaComp label="Objetivo" v1={OBJETIVO_LABEL[a1.dados_entrada?.objetivo ?? ""] ?? "—"} v2={OBJETIVO_LABEL[a2.dados_entrada?.objetivo ?? ""] ?? "—"} />
          <LinhaComp label="Calorias/dia" v1={`${a1.resultado?.dieta?.caloriasEstimadas ?? "—"} kcal`} v2={`${a2.resultado?.dieta?.caloriasEstimadas ?? "—"} kcal`} numerica delta={diffNum(a1.resultado?.dieta?.caloriasEstimadas, a2.resultado?.dieta?.caloriasEstimadas)} />
          <LinhaComp label="Treino/semana" v1={`${a1.resultado?.treino?.frequenciaSemanal ?? "—"}x`} v2={`${a2.resultado?.treino?.frequenciaSemanal ?? "—"}x`} />
        </div>
      )}

      {/* Ações */}
      {selecionadas.length > 0 && (
        <button
          type="button"
          onClick={() => setSelecionadas([])}
          className="self-center text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-1.5"
        >
          <X size={14} /> Limpar seleção
        </button>
      )}
    </div>
  );
}

function ColunaAnalise({ analise }: { analise: Analise }) {
  const biotipo = analise.resultado?.biotipo ?? "";
  const label = BIOTIPO_LABEL[biotipo] ?? "Análise";
  const data = new Date(analise.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <Link
      href={`/dashboard/analise/${analise.id}`}
      className="flex flex-col gap-2 p-4 rounded-2xl bg-white/[0.06] border border-white/[0.12] hover:border-orange-400/40 transition-all group"
    >
      <div className="h-10 w-10 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center self-start">
        <span className="text-orange-400 font-bold text-sm">{label.charAt(0)}</span>
      </div>
      <p className="text-xs text-white/40">{data}</p>
      <p className="font-bold text-white text-base sm:text-lg">{label}</p>
      <span className="text-xs text-white/40 flex items-center gap-1 group-hover:text-orange-400 transition-colors">
        Ver detalhe <ArrowRight size={12} />
      </span>
    </Link>
  );
}

function LinhaComp({
  label,
  v1,
  v2,
  numerica,
  delta,
}: {
  label: string;
  v1: string;
  v2: string;
  numerica?: boolean;
  delta?: number | null;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center py-2 border-t border-white/[0.05] first:border-t-0 first:pt-0">
      <p className="text-sm font-bold text-white text-right">{v1}</p>
      <p className="text-[10px] uppercase tracking-wider text-white/40 font-medium text-center">{label}</p>
      <div className="flex flex-col items-start">
        <p className="text-sm font-bold text-white">{v2}</p>
        {numerica && delta !== null && delta !== undefined && delta !== 0 && (
          <span className={`text-[10px] font-bold ${delta > 0 ? "text-green-400" : "text-red-400"}`}>
            {delta > 0 ? "+" : ""}{delta.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
}

function imc(a: Analise): string {
  const p = Number(a.dados_entrada?.peso ?? 0);
  const h = Number(a.dados_entrada?.altura ?? 0);
  if (!p || !h) return "—";
  return (p / Math.pow(h / 100, 2)).toFixed(1);
}

function diffNum(v1: string | number | undefined, v2: string | number | undefined): number | null {
  const n1 = Number(v1);
  const n2 = Number(v2);
  if (!isFinite(n1) || !isFinite(n2)) return null;
  return n2 - n1;
}
