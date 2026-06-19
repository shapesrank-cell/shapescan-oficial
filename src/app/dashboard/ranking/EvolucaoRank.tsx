import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  GRUPO_LABEL,
  GRUPOS_ORDEM,
  formatarElo,
  tierDeElo,
  type Evolucao,
} from "@/lib/ranking";

/**
 * Evolução do ELO no tempo: um mini-gráfico (sparkline) do rank geral + a
 * variação desde a última análise (geral e por grupo).
 */
export function EvolucaoRank({ evolucao }: { evolucao: Evolucao }) {
  const { pontos, deltaGeral, deltaPorGrupo } = evolucao;

  // Precisa de pelo menos 2 análises com ranking pra mostrar evolução.
  if (pontos.length < 2) {
    return (
      <section className="rounded-2xl border border-white/[0.10] bg-white/[0.04] p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={18} className="text-orange-400" />
          <h2 className="text-lg sm:text-xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
            Evolução
          </h2>
        </div>
        <p className="text-xs text-white/40">
          Faça uma nova análise com foto pra começar a acompanhar a evolução do
          seu rank ao longo do tempo. 📈
        </p>
      </section>
    );
  }

  const valores = pontos.map((p) => p.eloGeral);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const span = max - min || 1;
  // Sparkline em viewBox 0..100 x 0..30 (y invertido).
  const coords = valores.map((v, i) => {
    const x = pontos.length === 1 ? 50 : (i / (pontos.length - 1)) * 100;
    const y = 28 - ((v - min) / span) * 26;
    return [x, y] as const;
  });
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c[0]} ${c[1]}`).join(" ");
  const ultimo = pontos[pontos.length - 1];
  const tierAtual = tierDeElo(ultimo.eloGeral);

  return (
    <section className="rounded-2xl border border-white/[0.10] bg-white/[0.04] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-orange-400" />
          <h2 className="text-lg sm:text-xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
            Evolução
          </h2>
        </div>
        <DeltaBadge delta={deltaGeral} sufixo="no geral" />
      </div>

      {/* Sparkline do rank geral */}
      <div className="relative">
        <svg
          viewBox="0 0 100 30"
          preserveAspectRatio="none"
          className="w-full h-16"
        >
          <path
            d={`${path} L 100 30 L 0 30 Z`}
            fill={tierAtual.cor}
            fillOpacity="0.12"
          />
          <path
            d={path}
            fill="none"
            stroke={tierAtual.cor}
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {coords.map((c, i) => (
            <circle
              key={i}
              cx={c[0]}
              cy={c[1]}
              r="1.6"
              fill={tierAtual.cor}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        <div className="flex items-center justify-between text-[11px] text-white/40 mt-1">
          <span>{pontos.length} análises</span>
          <span>
            Agora:{" "}
            <span style={{ color: tierAtual.cor }} className="font-semibold">
              {tierAtual.nome} · {formatarElo(ultimo.eloGeral)}
            </span>
          </span>
        </div>
      </div>

      {/* Variação por grupo desde a última análise */}
      {Object.keys(deltaPorGrupo).length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/[0.08]">
          <p className="text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-2">
            Desde a última análise
          </p>
          <div className="flex flex-wrap gap-2">
            {GRUPOS_ORDEM.filter((g) => deltaPorGrupo[g] != null).map((g) => (
              <span
                key={g}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08]"
              >
                <span className="text-white/60">{GRUPO_LABEL[g]}</span>
                <DeltaTexto delta={deltaPorGrupo[g]!} />
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function corDelta(delta: number) {
  return delta > 0 ? "#4ade80" : delta < 0 ? "#f87171" : "#9ca3af";
}

function DeltaBadge({
  delta,
  sufixo,
}: {
  delta: number | null;
  sufixo: string;
}) {
  if (delta == null) return null;
  const Icone = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const cor = corDelta(delta);
  const sinal = delta > 0 ? "+" : "";
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
      style={{ color: cor, backgroundColor: `${cor}1f` }}
    >
      <Icone size={13} />
      {sinal}
      {formatarElo(delta)} {sufixo}
    </span>
  );
}

function DeltaTexto({ delta }: { delta: number }) {
  const cor = corDelta(delta);
  const sinal = delta > 0 ? "+" : "";
  return (
    <span className="font-bold" style={{ color: cor }}>
      {sinal}
      {formatarElo(delta)}
    </span>
  );
}
