import Link from "next/link";
import { redirect } from "next/navigation";
import { Trophy, Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { RankingCard } from "@/app/onboarding/RankingCard";
import { TierBadge } from "@/app/onboarding/TierBadge";
import { RankingIntroModal } from "./RankingIntroModal";
import { MedidasForm, type MedidasIniciais } from "./MedidasForm";
import { TIERS, GRUPO_LABEL, GRUPOS_ORDEM, formatarElo } from "@/lib/ranking";
import type { AnaliseBiotipo } from "@/lib/gemini";

/**
 * Aba dedicada ao Ranking de ELO por shape.
 * - Mostra o ranking da análise mais recente que tiver ranking (exige foto).
 * - Explica o sistema (escada de tiers + como funciona).
 * - Pop-up de boas-vindas na primeira visita (RankingIntroModal).
 */
export default async function RankingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Pega as análises recentes (RLS já limita ao próprio usuário) e acha a
  // primeira que tenha ranking gerado. Em paralelo, o último check-in pra
  // pré-preencher o form de medidas.
  const [{ data: analises }, { data: ultimoCheckin }, { data: perfil }] =
    await Promise.all([
      supabase
        .from("analyses")
        .select("id, criado_em, resultado")
        .order("criado_em", { ascending: false })
        .limit(20),
      supabase
        .from("checkins")
        .select("peso, peito, braco, cintura, quadril, coxa")
        .order("criado_em", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("altura, idade")
        .eq("id", user.id)
        .single(),
    ]);

  const medidasIniciais: MedidasIniciais = {
    altura: perfil?.altura ?? null,
    idade: perfil?.idade ?? null,
    peso: ultimoCheckin?.peso ?? null,
    peito: ultimoCheckin?.peito ?? null,
    braco: ultimoCheckin?.braco ?? null,
    cintura: ultimoCheckin?.cintura ?? null,
    quadril: ultimoCheckin?.quadril ?? null,
    coxa: ultimoCheckin?.coxa ?? null,
  };

  const comRank = (analises ?? []).find((a) => {
    const r = (a.resultado as AnaliseBiotipo)?.ranking;
    return r?.grupos && r.grupos.length > 0;
  });

  const ranking = comRank
    ? (comRank.resultado as AnaliseBiotipo).ranking!
    : null;
  const dataRanking = comRank
    ? new Date(comRank.criado_em).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-8 sm:py-12 bg-[#111111]">
      <RankingIntroModal />

      <div className="w-full max-w-3xl flex flex-col gap-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-400/15 border border-orange-400/30 text-orange-400">
            <Trophy size={22} />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-[family-name:var(--font-bebas)] tracking-wide text-white leading-none">
              Ranking
            </h1>
            <p className="text-sm text-white/50">Seu ELO de shape por grupo</p>
          </div>
        </div>

        {/* Estado: tem ranking */}
        {ranking ? (
          <>
            <RankingCard grupos={ranking.grupos} />
            <div className="flex items-center justify-between gap-2 text-xs text-white/40 -mt-2">
              <span>Baseado na sua análise de {dataRanking}.</span>
              {comRank && (
                <Link
                  href={`/dashboard/analise/${comRank.id}`}
                  className="text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Ver análise completa →
                </Link>
              )}
            </div>
          </>
        ) : (
          /* Estado: ainda sem ranking */
          <div className="rounded-2xl border border-white/[0.10] bg-white/[0.04] p-6 sm:p-8 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] text-white/40">
              <Camera size={26} />
            </span>
            <h2 className="text-lg font-semibold text-white mb-1">
              Você ainda não tem um ranking
            </h2>
            <p className="text-sm text-white/60 leading-relaxed max-w-sm mx-auto mb-5">
              O ranking é calculado a partir de uma{" "}
              <strong className="text-white">foto do seu corpo</strong> na
              análise. Faça uma nova análise com foto pra desbloquear seu ELO.
            </p>
            <Link
              href="/analise/nova"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-orange-400 text-black font-semibold text-sm hover:bg-orange-300 active:scale-[0.98] transition-all"
            >
              <Camera size={18} /> Fazer análise com foto
            </Link>
          </div>
        )}

        {/* Form de medidas — alimenta o ranking */}
        <MedidasForm iniciais={medidasIniciais} />

        {/* Explicação: como funciona */}
        <section className="rounded-2xl border border-white/[0.10] bg-white/[0.04] p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-[family-name:var(--font-bebas)] tracking-wide text-white mb-3">
            Como funciona
          </h2>
          <ul className="flex flex-col gap-2.5 text-sm text-white/70 leading-relaxed">
            <li className="flex gap-2">
              <span className="text-orange-400">•</span>
              <span>
                A cada análise <strong className="text-white">com foto</strong>, a
                IA avalia o nível de desenvolvimento de treino de{" "}
                <strong className="text-white">{GRUPOS_ORDEM.length} grupos</strong>:{" "}
                {GRUPOS_ORDEM.map((g) => GRUPO_LABEL[g]).join(", ")}.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-400">•</span>
              <span>
                Cada grupo recebe pontos de{" "}
                <strong className="text-white">ELO (0 a {formatarElo(3000)})</strong>{" "}
                e um tier. O <strong className="text-white">Rank Geral</strong> é a
                média dos grupos.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-400">•</span>
              <span>
                Treinou e evoluiu? Faça uma nova análise e veja seu rank{" "}
                <strong className="text-white">subir</strong>.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-400">•</span>
              <span>
                É sobre <strong className="text-white">você vs. você de ontem</strong>{" "}
                — não é comparação com outras pessoas.
              </span>
            </li>
          </ul>
        </section>

        {/* Explicação: escada de tiers */}
        <section className="rounded-2xl border border-white/[0.10] bg-white/[0.04] p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-[family-name:var(--font-bebas)] tracking-wide text-white mb-1">
            Os tiers
          </h2>
          <p className="text-xs text-white/40 mb-4">
            Do início da jornada ao topo. Cada tier é uma faixa de pontos.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {TIERS.map((t) => (
              <div
                key={t.id}
                className="flex items-start gap-3 rounded-xl px-3 py-3 border"
                style={{
                  borderColor: `${t.cor}33`,
                  background: `linear-gradient(90deg, ${t.cor}1a, transparent 80%)`,
                }}
              >
                <TierBadge tier={t} size={34} className="shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p
                      className="font-semibold text-sm leading-tight"
                      style={{ color: t.cor }}
                    >
                      {t.nome}
                    </p>
                    <p className="text-[11px] text-white/40">
                      {formatarElo(t.min)}–{formatarElo(t.max)} pts
                    </p>
                  </div>
                  <p className="text-[11px] text-white/50 leading-snug mt-0.5">
                    {t.descricao}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="text-xs text-white/30 text-center px-4">
          O ranking é uma estimativa da IA a partir da sua foto, para fins de
          motivação. Não é uma medição clínica.
        </p>
      </div>
    </div>
  );
}
