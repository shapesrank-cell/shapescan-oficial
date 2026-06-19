import { Ruler } from "lucide-react";
import type { Proporcao } from "@/lib/ranking";

const STATUS_INFO: Record<
  Proporcao["status"],
  { rotulo: string; cor: string }
> = {
  otimo: { rotulo: "Ótimo", cor: "#4ade80" },
  bom: { rotulo: "Bom", cor: "#fbbf24" },
  melhorar: { rotulo: "A melhorar", cor: "#f87171" },
};

/**
 * Razões clássicas de físico estético (V-taper, cintura:altura, braço:pant.)
 * calculadas a partir das medidas. Dá uma camada objetiva ao ranking.
 */
export function ProporcoesCard({ proporcoes }: { proporcoes: Proporcao[] }) {
  return (
    <section className="rounded-2xl border border-white/[0.10] bg-white/[0.04] p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-1">
        <Ruler size={18} className="text-orange-400" />
        <h2 className="text-lg sm:text-xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
          Proporção & simetria
        </h2>
      </div>

      {proporcoes.length === 0 ? (
        <p className="text-xs text-white/40 mt-1">
          Preencha <strong className="text-white/60">altura, ombros e
          cintura</strong> nas suas medidas (acima) pra desbloquear a análise de
          proporção do seu físico.
        </p>
      ) : (
        <>
          <p className="text-xs text-white/40 mb-4">
            Razões clássicas do físico estético, a partir das suas medidas.
          </p>
          <div className="flex flex-col gap-4">
            {proporcoes.map((p) => {
              const info = STATUS_INFO[p.status];
              return (
                <div key={p.nome}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">
                      {p.nome}
                    </span>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{
                        color: info.cor,
                        backgroundColor: `${info.cor}1f`,
                      }}
                    >
                      {info.rotulo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-2xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
                      {p.valor.toLocaleString("pt-BR")}
                    </span>
                    <span className="text-xs text-white/40">
                      ideal {p.ideal}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round(p.qualidade * 100)}%`,
                        backgroundColor: info.cor,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-white/40 mt-1 leading-snug">
                    {p.descricao}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
