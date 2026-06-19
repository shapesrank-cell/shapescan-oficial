import { Target } from "lucide-react";
import { GRUPO_LABEL, formatarElo, type PontoFraco } from "@/lib/ranking";
import { TierBadge } from "@/app/onboarding/TierBadge";

/**
 * Destaca o grupo mais atrasado, quanto falta pro próximo tier e o foco de
 * treino pra evoluir. Torna o ranking acionável.
 */
export function PontoFracoCard({ pontoFraco }: { pontoFraco: PontoFraco }) {
  const { grupo, rank, proximo, foco } = pontoFraco;

  return (
    <section className="rounded-2xl border border-orange-400/20 bg-orange-400/[0.04] p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-3">
        <Target size={18} className="text-orange-400" />
        <h2 className="text-lg sm:text-xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
          Foco da vez
        </h2>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <TierBadge tier={rank.tier} size={40} className="shrink-0" />
        <div>
          <p className="text-sm text-white/50">Seu grupo mais atrasado é</p>
          <p className="text-lg font-bold text-white leading-tight">
            {GRUPO_LABEL[grupo]}{" "}
            <span
              className="text-sm font-semibold"
              style={{ color: rank.tier.cor }}
            >
              ({rank.label})
            </span>
          </p>
        </div>
      </div>

      {proximo ? (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-white/50">
              Faltam{" "}
              <span className="font-bold text-white">
                {formatarElo(proximo.faltamPts)} pts
              </span>{" "}
              pra
            </span>
            <span
              className="font-semibold"
              style={{ color: proximo.alvo.cor }}
            >
              {proximo.alvo.nome}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.round(rank.progressoNoTier * 100)}%`,
                backgroundColor: rank.tier.cor,
              }}
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-white/60 mb-3">
          Esse grupo já está no topo. Mantenha! 💪
        </p>
      )}

      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
        <p className="text-[11px] text-orange-400 uppercase tracking-wider font-semibold mb-1">
          Como subir
        </p>
        <p className="text-sm text-white/70 leading-relaxed">{foco}</p>
      </div>
    </section>
  );
}
