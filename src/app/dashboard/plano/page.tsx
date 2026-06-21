import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PlanoTabs } from "./PlanoTabs";
import type { AnaliseBiotipo } from "@/lib/gemini";

const BIOTIPO_LABEL: Record<AnaliseBiotipo["biotipo"], string> = {
  ectomorfo: "Ectomorfo",
  mesomorfo: "Mesomorfo",
  endomorfo: "Endomorfo",
  misto: "Misto",
};

/**
 * "Meu Plano" — o protocolo (treino + dieta) da análise mais recente, num lugar
 * dedicado. Antes o usuário só via isso entrando no histórico de análises.
 * Abas internas (Treino / Dieta) seguem o mesmo conceito do Ranking.
 */
export default async function PlanoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Pega a análise mais recente (RLS já limita ao próprio usuário).
  const { data: analiseRow } = await supabase
    .from("analyses")
    .select("id, criado_em, resultado")
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  const analise = (analiseRow?.resultado as AnaliseBiotipo) ?? null;
  const dataAnalise = analiseRow?.criado_em
    ? new Date(analiseRow.criado_em).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-8 sm:py-12 bg-[#111111]">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-400/15 border border-orange-400/30 text-orange-400">
            <ClipboardList size={22} />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-[family-name:var(--font-bebas)] tracking-wide text-white leading-none">
              Meu Plano
            </h1>
            <p className="text-sm text-white/50">
              Seu protocolo de treino e dieta
            </p>
          </div>
        </div>

        {analise ? (
          <>
            {/* Resumo da origem do plano */}
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.10] bg-white/[0.04] px-5 py-4">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
                  Biotipo
                </p>
                <p className="text-lg font-bold text-orange-400">
                  {BIOTIPO_LABEL[analise.biotipo]}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/40">Da análise de</p>
                <p className="text-sm text-white/70">{dataAnalise}</p>
                {analiseRow && (
                  <Link
                    href={`/dashboard/analise/${analiseRow.id}`}
                    className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    Ver análise completa →
                  </Link>
                )}
              </div>
            </div>

            <PlanoTabs
              treino={<TreinoPanel analise={analise} />}
              dieta={<DietaPanel analise={analise} />}
            />

            {/* Aviso legal */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <p className="text-xs sm:text-sm text-white/40">
                <strong className="text-white/60">Importante:</strong>{" "}
                {analise.avisoImportante}
              </p>
            </div>
          </>
        ) : (
          /* Estado: ainda sem análise/plano */
          <div className="rounded-2xl border border-white/[0.10] bg-white/[0.04] p-6 sm:p-8 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] text-white/40">
              <Camera size={26} />
            </span>
            <h2 className="text-lg font-semibold text-white mb-1">
              Você ainda não tem um plano
            </h2>
            <p className="text-sm text-white/60 leading-relaxed max-w-sm mx-auto mb-5">
              Seu plano de treino e dieta é montado pela IA na análise. Faça sua
              primeira análise pra desbloquear seu protocolo.
            </p>
            <Link
              href="/analise/nova"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-orange-400 text-black font-semibold text-sm hover:bg-orange-300 active:scale-[0.98] transition-all"
            >
              <Camera size={18} /> Fazer minha análise
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Painel: Treino ---------------- */
function TreinoPanel({ analise }: { analise: AnaliseBiotipo }) {
  return (
    <Card titulo="Seu plano de treino">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Stat
          label="Frequência"
          valor={`${analise.treino.frequenciaSemanal}x`}
          sufixo="por semana"
        />
        <Stat label="Foco" valor={analise.treino.focoPrincipal} />
      </div>
      <div>
        <p className="text-sm font-medium text-white/50 mb-2">
          Exercícios recomendados:
        </p>
        <ul className="flex flex-col gap-2">
          {analise.treino.exerciciosRecomendados.map((e, i) => (
            <li key={i} className="flex gap-2 text-sm sm:text-base">
              <span className="text-orange-400">•</span>
              <span className="text-white/80">{e}</span>
            </li>
          ))}
        </ul>
      </div>

      {analise.treino.divisao && analise.treino.divisao.length > 0 && (
        <div className="mt-5 pt-5 border-t border-white/[0.08]">
          <p className="text-sm font-medium text-white/50 mb-3">
            Divisão da semana:
          </p>
          <div className="flex flex-col gap-3">
            {analise.treino.divisao.map((dia, i) => (
              <div
                key={i}
                className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]"
              >
                <p className="font-semibold text-white text-sm sm:text-base">
                  {dia.nome}
                </p>
                {dia.foco && (
                  <p className="text-xs text-white/40 mb-3">{dia.foco}</p>
                )}
                <div className="flex flex-col gap-1.5">
                  {dia.exercicios.map((ex, j) => (
                    <div
                      key={j}
                      className="flex justify-between gap-3 text-sm border-b border-white/[0.04] last:border-0 pb-1.5 last:pb-0"
                    >
                      <span className="text-white/80">{ex.nome}</span>
                      <span className="text-white/40 whitespace-nowrap text-xs sm:text-sm">
                        {ex.series}x{ex.repeticoes}
                        <span className="text-white/25"> · {ex.descanso}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

/* ---------------- Painel: Dieta ---------------- */
function DietaPanel({ analise }: { analise: AnaliseBiotipo }) {
  return (
    <Card titulo="Sua dieta personalizada">
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
        <p className="text-sm font-medium text-white/50 mb-2">
          Sugestões alimentares:
        </p>
        <ul className="flex flex-col gap-2">
          {analise.dieta.sugestoesAlimentares.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm sm:text-base">
              <span className="text-orange-400">•</span>
              <span className="text-white/80">{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {analise.dieta.refeicoes && analise.dieta.refeicoes.length > 0 && (
        <div className="mt-5 pt-5 border-t border-white/[0.08]">
          <p className="text-sm font-medium text-white/50 mb-3">
            Cardápio de um dia:
          </p>
          <div className="flex flex-col gap-3">
            {analise.dieta.refeicoes.map((r, i) => (
              <div
                key={i}
                className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]"
              >
                <div className="flex items-baseline justify-between mb-2 gap-2">
                  <p className="font-semibold text-white text-sm sm:text-base">
                    {r.nome}
                    {r.horario && (
                      <span className="ml-2 text-xs font-normal text-white/40">
                        {r.horario}
                      </span>
                    )}
                  </p>
                  <span className="text-xs text-orange-400 whitespace-nowrap">
                    ~{r.calorias} kcal
                  </span>
                </div>
                <ul className="flex flex-col gap-1">
                  {r.itens.map((item, j) => (
                    <li
                      key={j}
                      className="flex justify-between gap-3 text-sm text-white/80"
                    >
                      <span>{item.alimento}</span>
                      <span className="text-white/40 whitespace-nowrap">
                        {item.quantidade}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

/* ---------------- Subcomponentes ---------------- */
function Card({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/[0.05] border border-white/[0.10] rounded-2xl p-5 sm:p-6">
      <h2 className="text-lg sm:text-xl font-[family-name:var(--font-bebas)] tracking-wide text-white mb-3">
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
    <div className="bg-white/[0.05] rounded-xl p-3">
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-base sm:text-lg font-bold text-white capitalize">
        {valor}{" "}
        {sufixo && (
          <span className="text-xs font-normal text-white/40">{sufixo}</span>
        )}
      </p>
    </div>
  );
}
