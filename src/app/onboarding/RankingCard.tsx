import {
  GRUPO_LABEL,
  ELO_MAX,
  formatarElo,
  resolverRank,
  calcularRankGeral,
  ordenarGrupos,
  type RankingGrupo,
} from "@/lib/ranking";
import { TierBadge } from "./TierBadge";

/**
 * Card visual do Ranking de ELO por shape.
 * Mostra um "Rank Geral" em destaque + um grid com o ELO de cada grupo muscular.
 * As cores vêm do tier (via style inline, já que são hex dinâmicos por tier).
 */
export function RankingCard({ grupos }: { grupos: RankingGrupo[] }) {
  if (!grupos || grupos.length === 0) return null;

  const ordenados = ordenarGrupos(grupos);
  if (ordenados.length === 0) return null;
  const geral = calcularRankGeral(ordenados);

  return (
    <div className="print-card bg-white/[0.05] border border-white/[0.10] backdrop-blur rounded-2xl p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <h2 className="text-lg sm:text-xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
          Ranking do seu shape
        </h2>
        <span className="text-xs text-orange-400 font-medium">ELO</span>
      </div>
      <p className="text-xs text-white/40 mb-4">
        Nível de desenvolvimento de cada grupo, do Ferro ao Desafiante.
      </p>

      {/* Rank Geral em destaque */}
      {geral && (
        <div
          className="rounded-2xl p-5 sm:p-6 border mb-4"
          style={{
            borderColor: `${geral.tier.cor}55`,
            background: `linear-gradient(135deg, ${geral.tier.cor}26, transparent 72%)`,
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/50 mb-2">
            Rank geral
          </p>
          <div className="flex items-center gap-3">
            <TierBadge tier={geral.tier} size={56} className="shrink-0" />
            <div>
              <p
                className="text-3xl sm:text-4xl font-[family-name:var(--font-bebas)] tracking-wide leading-none"
                style={{ color: geral.tier.cor }}
              >
                {geral.tier.nome}
              </p>
              <p className="text-sm text-white/60 mt-1">
                {formatarElo(geral.elo)}{" "}
                <span className="text-white/30">/ {formatarElo(ELO_MAX)} pts</span>
              </p>
            </div>
          </div>
          <p className="text-xs text-white/50 leading-relaxed mt-3">
            {geral.tier.descricao}
          </p>
        </div>
      )}

      {/* Grid por grupo muscular */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ordenados.map((g) => {
          const r = resolverRank(g.nota);
          return (
            <div
              key={g.grupo}
              className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]"
            >
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="flex items-center gap-2 font-semibold text-white text-sm sm:text-base">
                  <TierBadge tier={r.tier} size={22} className="shrink-0" />
                  {GRUPO_LABEL[g.grupo]}
                </span>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                  style={{
                    color: r.tier.cor,
                    backgroundColor: `${r.tier.cor}1f`,
                    border: `1px solid ${r.tier.cor}44`,
                  }}
                >
                  {r.tier.nome} · {formatarElo(r.elo)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden mb-2">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round(r.progressoTotal * 100)}%`,
                    backgroundColor: r.tier.cor,
                  }}
                />
              </div>
              {g.comentario && (
                <p className="text-xs text-white/50 leading-relaxed">
                  {g.comentario}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
