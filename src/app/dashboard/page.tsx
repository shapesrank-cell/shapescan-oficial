import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  TrendingUp,
  BarChart3,
  Calendar,
  GitCompare,
  LineChart,
  Sparkles,
  Plus,
  Trophy,
  ClipboardList,
  Camera,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  fraseDoDia,
  inspiracaoDoDia,
  urlInspiracao,
  INSPIRACOES,
} from "@/lib/motivacao";
import { calcularStreak, diaDeHojeSP } from "@/lib/streak";
import { TIERS } from "@/lib/ranking";
import { StreakCard } from "./StreakCard";

const BIOTIPO_LABEL: Record<string, string> = {
  ectomorfo: "Ectomorfo",
  mesomorfo: "Mesomorfo",
  endomorfo: "Endomorfo",
  misto: "Biotipo Misto",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Queries em paralelo (antes rodavam em série, somando latência)
  const [
    { data: perfil },
    { data: analises },
    { data: diasHabito },
    { data: ultimoCheckin },
  ] = await Promise.all([
    supabase.from("profiles").select("nome, altura").eq("id", user.id).single(),
    supabase
      .from("analyses")
      .select("id, criado_em, dados_entrada, resultado")
      .eq("user_id", user.id)
      .order("criado_em", { ascending: false }),
    supabase
      .from("habit_log")
      .select("dia")
      .eq("user_id", user.id)
      .order("dia", { ascending: false })
      .limit(400),
    supabase
      .from("checkins")
      .select("peso")
      .eq("user_id", user.id)
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const streak = calcularStreak(
    (diasHabito ?? []).map((d) => d.dia as string),
    diaDeHojeSP()
  );

  const nomeExibicao = perfil?.nome || user.email?.split("@")[0] || "atleta";
  const primeiroNome = nomeExibicao.split(/\s+/)[0];
  const totalAnalises = analises?.length ?? 0;
  const ultimaAnalise = analises?.[0];

  const ultimaDados = ultimaAnalise?.dados_entrada as
    | { peso?: string; altura?: string }
    | undefined;
  const ultimoResultado = ultimaAnalise?.resultado as
    | { biotipo?: string }
    | undefined;

  // IMC com o dado mais atual: peso do último check-in (se houver), senão o da
  // última análise. Altura sempre do perfil (mais confiável), com fallback.
  const peso = ultimoCheckin?.peso ?? Number(ultimaDados?.peso ?? 0);
  const altura = perfil?.altura ?? Number(ultimaDados?.altura ?? 0);
  const imc =
    peso && altura ? (peso / Math.pow(altura / 100, 2)).toFixed(1) : null;

  const biotipoLabel = ultimoResultado?.biotipo
    ? BIOTIPO_LABEL[ultimoResultado.biotipo] ?? "—"
    : null;

  // Já tem algum ranking gerado? (decide se mostra o teaser do rank)
  const temRanking = (analises ?? []).some((a) => {
    const r = (a.resultado as { ranking?: { grupos?: unknown[] } })?.ranking;
    return Array.isArray(r?.grupos) && r.grupos.length > 0;
  });

  const diasDesdeUltima = ultimaAnalise
    ? Math.floor(
        (Date.now() - new Date(ultimaAnalise.criado_em).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const frase = fraseDoDia();
  const inspHero = inspiracaoDoDia();

  return (
    <div className="flex flex-1 flex-col px-4 py-6 sm:py-10 bg-[#111111] animate-[fadeIn_0.4s_ease-out]">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 sm:gap-8">
        {/* Saudação */}
        <div className="flex flex-col gap-0.5 pt-1">
          <p className="text-sm text-white/40">
            {totalAnalises === 0
              ? "Bem-vindo ao ShapeScan"
              : `${totalAnalises} ${totalAnalises === 1 ? "análise" : "análises"} no seu histórico`}
          </p>
          <h1 className="text-3xl sm:text-5xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
            Olá, <span className="text-orange-400">{primeiroNome}</span>
          </h1>
        </div>

        {/* Ofensiva (streak) — motivo de abrir todo dia */}
        <StreakCard inicial={streak} />

        {/* Hero motivacional com imagem do dia */}
        <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] min-h-[280px] sm:min-h-[300px] flex">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlInspiracao(inspHero.id, 1100)}
            alt={inspHero.alt}
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/10" />
          <div className="relative mt-auto flex flex-col gap-3 sm:gap-4 p-5 sm:p-7 w-full">
            <div className="flex items-center gap-1.5 text-orange-400">
              <Sparkles size={14} />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">
                Foco do dia
              </span>
            </div>
            <p className="text-[22px] leading-[1.2] sm:text-3xl sm:leading-snug font-bold text-white text-balance max-w-xl">
              {frase}
            </p>
            <Link
              href="/analise/nova"
              className="self-start inline-flex items-center gap-2 h-11 px-5 rounded-full bg-orange-400 text-black font-semibold text-sm hover:bg-orange-300 active:scale-95 transition-all"
            >
              <Plus size={16} />
              {totalAnalises === 0 ? "Fazer primeira análise" : "Nova análise"}
            </Link>
          </div>
        </section>

        {/* Stats — só com análise */}
        {totalAnalises > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              icon={<Activity size={18} />}
              label="Biotipo atual"
              value={biotipoLabel ?? "—"}
              highlight
            />
            <StatCard
              icon={<TrendingUp size={18} />}
              label="IMC atual"
              value={imc ?? "—"}
            />
            <StatCard
              icon={<BarChart3 size={18} />}
              label="Total análises"
              value={String(totalAnalises)}
            />
            <StatCard
              icon={<Calendar size={18} />}
              label="Última análise"
              value={
                diasDesdeUltima === 0
                  ? "Hoje"
                  : diasDesdeUltima === 1
                    ? "Ontem"
                    : `${diasDesdeUltima}d atrás`
              }
            />
          </div>
        )}

        {/* Teaser do Ranking — só pra quem ainda não desbloqueou o rank */}
        {!temRanking && <RankingTeaser />}

        {/* Hub: TODAS as funcionalidades à mão */}
        <section className="flex flex-col gap-3">
          <h2 className="text-lg sm:text-xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
            Explore o app
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <AtalhoCard
              href="/dashboard/ranking"
              icon={<Trophy size={20} />}
              titulo="Ranking de shape"
              descricao="Seu ELO por grupo muscular, de Ferro a Desafiante."
              destaque
            />
            <AtalhoCard
              href="/dashboard/plano"
              icon={<ClipboardList size={20} />}
              titulo="Meu plano"
              descricao="Seu protocolo de treino e dieta num só lugar."
            />
            <AtalhoCard
              href="/dashboard/evolucao"
              icon={<LineChart size={20} />}
              titulo="Evolução do corpo"
              descricao="Peso, medidas e fotos pra acompanhar seu progresso."
            />
            <AtalhoCard
              href="/dashboard/coach"
              icon={<Sparkles size={20} />}
              titulo="Coach IA"
              descricao="Tire dúvidas sobre treino, dieta e sua evolução."
            />
          </div>
        </section>

        {/* Galeria de inspiração */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
              Inspiração pra treinar
            </h2>
            <span className="text-xs text-white/30">arraste →</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
            {INSPIRACOES.map((insp) => (
              <article
                key={insp.id}
                className="relative flex-shrink-0 w-40 sm:w-52 aspect-[3/4] rounded-2xl overflow-hidden border border-white/[0.08] snap-start"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={urlInspiracao(insp.id, 420)}
                  alt={insp.alt}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <p className="absolute bottom-0 left-0 right-0 p-3 text-xs sm:text-sm font-semibold text-white leading-snug">
                  {insp.legenda}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Histórico */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
              Histórico de análises
            </h2>
            {totalAnalises >= 2 && (
              <Link
                href="/dashboard/comparar"
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-orange-400/10 text-orange-400 border border-orange-400/20 hover:bg-orange-400/20 transition-all"
              >
                <GitCompare size={12} /> Comparar
              </Link>
            )}
          </div>

          {totalAnalises === 0 ? (
            <div className="bg-white/[0.05] border border-dashed border-white/[0.12] rounded-2xl p-8 sm:p-10 text-center flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/[0.08] flex items-center justify-center text-white/30">
                <BarChart3 size={24} />
              </div>
              <p className="font-medium text-white/60">Nenhuma análise ainda</p>
              <p className="text-sm text-white/40 max-w-xs">
                Faça sua primeira análise e desbloqueie:
              </p>
              <ul className="flex flex-col gap-1.5 text-sm text-white/60 text-left">
                <li className="flex items-center gap-2">
                  <Trophy size={14} className="text-orange-400 shrink-0" /> Seu
                  rank de shape (Ferro → Desafiante)
                </li>
                <li className="flex items-center gap-2">
                  <ClipboardList size={14} className="text-orange-400 shrink-0" />{" "}
                  Plano de treino + dieta personalizados
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles size={14} className="text-orange-400 shrink-0" /> Coach
                  IA pra tirar suas dúvidas
                </li>
              </ul>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {analises?.map((analise, index) => {
                const resultado = analise.resultado as { biotipo?: string };
                const data = new Date(analise.criado_em).toLocaleDateString(
                  "pt-BR",
                  { day: "2-digit", month: "short", year: "numeric" }
                );
                const label =
                  BIOTIPO_LABEL[resultado?.biotipo ?? ""] ?? "Análise";
                const inicial = label.charAt(0).toUpperCase();

                return (
                  <li
                    key={analise.id}
                    style={{ animationDelay: `${index * 60}ms` }}
                    className="animate-[fadeIn_0.4s_ease-out]"
                  >
                    <Link
                      href={`/dashboard/analise/${analise.id}`}
                      className="flex items-center gap-4 p-4 bg-white/[0.05] border border-white/[0.08] rounded-2xl hover:border-orange-400/30 hover:bg-white/[0.08] active:scale-[0.99] transition-all group"
                    >
                      <div className="h-10 w-10 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-400 font-bold text-sm">
                          {inicial}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm sm:text-base">
                          {label}
                        </p>
                        <p className="text-xs text-white/40">{data}</p>
                      </div>
                      <span className="text-sm text-white/30 group-hover:text-orange-400 group-hover:translate-x-1 transition-all">
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-2 p-4 sm:p-5 rounded-2xl border transition-all ${
        highlight
          ? "bg-orange-400/10 border-orange-400/30"
          : "bg-white/[0.05] border-white/[0.10]"
      }`}
    >
      <div className={highlight ? "text-orange-400" : "text-white/40"}>
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider font-medium truncate">
          {label}
        </span>
        <span
          className={`font-bold text-base sm:text-xl mt-0.5 leading-tight truncate ${
            highlight ? "text-orange-400" : "text-white"
          }`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function AtalhoCard({
  href,
  icon,
  titulo,
  descricao,
  destaque,
}: {
  href: string;
  icon: React.ReactNode;
  titulo: string;
  descricao: string;
  destaque?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 p-5 rounded-2xl active:scale-[0.99] transition-all ${
        destaque
          ? "bg-orange-400/[0.08] border border-orange-400/30 hover:border-orange-400/50 hover:bg-orange-400/[0.12]"
          : "bg-white/[0.05] border border-white/[0.10] hover:border-orange-400/30 hover:bg-white/[0.08]"
      }`}
    >
      <div className="h-11 w-11 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center flex-shrink-0 text-orange-400">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm sm:text-base">
          {titulo}
        </p>
        <p className="text-xs sm:text-sm text-white/40">{descricao}</p>
      </div>
      <span className="text-sm text-white/30 group-hover:text-orange-400 group-hover:translate-x-1 transition-all">
        →
      </span>
    </Link>
  );
}

/**
 * Teaser do Ranking pra quem ainda não tem rank: mostra a escada de tiers e
 * convida pra fazer uma análise com foto. Desperta a curiosidade do recurso
 * mais "jogável" do app antes do usuário desbloqueá-lo.
 */
function RankingTeaser() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-orange-400/25 bg-gradient-to-br from-orange-400/[0.10] to-white/[0.02] p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2 text-orange-400">
        <Trophy size={18} />
        <span className="text-[11px] font-bold uppercase tracking-widest">
          Novo · Ranking de shape
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-bebas)] tracking-wide text-white leading-none">
          Qual é o seu rank?
        </h2>
        <p className="text-sm text-white/55 max-w-md">
          A IA avalia seu shape por grupo muscular e te dá um nível — de{" "}
          <strong className="text-white/80">Ferro</strong> a{" "}
          <strong className="text-white/80">Desafiante</strong>. Treine, evolua e
          veja seu rank subir.
        </p>
      </div>

      {/* Escada de tiers */}
      <div className="flex flex-wrap gap-1.5">
        {TIERS.map((t) => (
          <span
            key={t.id}
            className="text-[11px] font-semibold px-2 py-1 rounded-full border"
            style={{
              color: t.cor,
              borderColor: `${t.cor}40`,
              backgroundColor: `${t.cor}14`,
            }}
          >
            {t.nome}
          </span>
        ))}
      </div>

      <Link
        href="/analise/nova"
        className="self-start inline-flex items-center gap-2 h-11 px-5 rounded-full bg-orange-400 text-black font-semibold text-sm hover:bg-orange-300 active:scale-95 transition-all"
      >
        <Camera size={18} /> Descobrir meu rank
      </Link>
    </section>
  );
}
