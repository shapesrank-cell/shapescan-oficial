import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./LogoutButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("nome")
    .eq("id", user.id)
    .single();

  const { data: analises } = await supabase
    .from("analyses")
    .select("id, criado_em, resultado")
    .eq("user_id", user.id)
    .order("criado_em", { ascending: false });

  const nomeExibicao = perfil?.nome || user.email?.split("@")[0] || "atleta";
  const totalAnalises = analises?.length ?? 0;

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:py-12 animate-[fadeIn_0.4s_ease-out]">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-base">S</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              ShapeScan
            </span>
          </Link>
          <LogoutButton />
        </header>

        {/* Boas-vindas */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            Olá,{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              {nomeExibicao}
            </span>{" "}
            👋
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
            {totalAnalises === 0
              ? "Pronto para descobrir seu biotipo?"
              : `Você tem ${totalAnalises} ${totalAnalises === 1 ? "análise salva" : "análises salvas"}.`}
          </p>
        </div>

        {/* Card CTA */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/20">
          {/* Círculos decorativos */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl sm:text-2xl font-bold">
                {totalAnalises === 0 ? "Comece agora" : "Fazer nova análise"}
              </h2>
              <p className="text-sm sm:text-base text-white/80">
                Descubra seu biotipo atualizado em 2 minutos
              </p>
            </div>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-white text-indigo-600 font-semibold text-sm sm:text-base hover:bg-zinc-100 active:scale-95 transition-all whitespace-nowrap shadow-lg"
            >
              Começar análise →
            </Link>
          </div>
        </div>

        {/* Histórico */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Histórico de análises
            </h2>
            {totalAnalises > 0 && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                {totalAnalises} {totalAnalises === 1 ? "análise" : "análises"}
              </span>
            )}
          </div>

          {totalAnalises === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-10 text-center flex flex-col items-center gap-3">
              <div className="text-4xl">📊</div>
              <p className="font-medium text-zinc-700 dark:text-zinc-300">
                Nenhuma análise ainda
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Clique em "Começar análise" acima para fazer sua primeira análise de biotipo.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {analises?.map((analise, index) => {
                const resultado = analise.resultado as { biotipo?: string };
                const data = new Date(analise.criado_em).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                const biotipoLabel = {
                  ectomorfo: "Ectomorfo",
                  mesomorfo: "Mesomorfo",
                  endomorfo: "Endomorfo",
                  misto: "Biotipo Misto",
                }[resultado?.biotipo ?? ""] ?? "Análise";

                const biotipoEmoji = {
                  ectomorfo: "🏃",
                  mesomorfo: "💪",
                  endomorfo: "🛡️",
                  misto: "⚡",
                }[resultado?.biotipo ?? ""] ?? "📊";

                return (
                  <li key={analise.id} style={{ animationDelay: `${index * 60}ms` }}
                    className="animate-[fadeIn_0.4s_ease-out]">
                    <Link
                      href={`/dashboard/analise/${analise.id}`}
                      className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md hover:shadow-indigo-500/5 active:scale-[0.99] transition-all group"
                    >
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-lg flex-shrink-0">
                        {biotipoEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm sm:text-base">
                          {biotipoLabel}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {data}
                        </p>
                      </div>
                      <span className="text-sm text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all">
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
