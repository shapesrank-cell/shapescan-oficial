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
    <div className="flex flex-1 flex-col px-4 py-8 sm:py-12 bg-[#111111] animate-[fadeIn_0.4s_ease-out]">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-2xl bg-orange-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-black font-bold text-base">S</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              ShapeScan
            </span>
          </Link>
          <LogoutButton />
        </header>

        {/* Boas-vindas */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl sm:text-5xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
            Olá,{" "}
            <span className="text-orange-400">{nomeExibicao}</span>
          </h1>
          <p className="text-sm sm:text-base text-white/50">
            {totalAnalises === 0
              ? "Pronto para descobrir seu biotipo?"
              : `Você tem ${totalAnalises} ${totalAnalises === 1 ? "análise salva" : "análises salvas"}.`}
          </p>
        </div>

        {/* Card CTA */}
        <div className="relative overflow-hidden bg-orange-400 rounded-3xl p-6 sm:p-8">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-black/10 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-black/10 rounded-full" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-bebas)] tracking-wide text-black">
                {totalAnalises === 0 ? "Comece agora" : "Fazer nova análise"}
              </h2>
              <p className="text-sm sm:text-base text-black/70">
                Descubra seu biotipo atualizado em 2 minutos
              </p>
            </div>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-black text-white font-semibold text-sm sm:text-base hover:bg-zinc-900 active:scale-95 transition-all whitespace-nowrap"
            >
              Começar análise →
            </Link>
          </div>
        </div>

        {/* Histórico */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
              Histórico de análises
            </h2>
            {totalAnalises > 0 && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-400/10 text-orange-400 border border-orange-400/20">
                {totalAnalises} {totalAnalises === 1 ? "análise" : "análises"}
              </span>
            )}
          </div>

          {totalAnalises === 0 ? (
            <div className="bg-white/[0.05] border border-dashed border-white/[0.12] rounded-2xl p-10 text-center flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/[0.08] flex items-center justify-center text-white/30">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
                </svg>
              </div>
              <p className="font-medium text-white/60">
                Nenhuma análise ainda
              </p>
              <p className="text-sm text-white/30">
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

                const biotipoInitial = biotipoLabel.charAt(0).toUpperCase();

                return (
                  <li key={analise.id} style={{ animationDelay: `${index * 60}ms` }}
                    className="animate-[fadeIn_0.4s_ease-out]">
                    <Link
                      href={`/dashboard/analise/${analise.id}`}
                      className="flex items-center gap-4 p-4 bg-white/[0.05] border border-white/[0.08] rounded-2xl hover:border-orange-400/30 hover:bg-white/[0.08] active:scale-[0.99] transition-all group"
                    >
                      <div className="h-10 w-10 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-400 font-bold text-sm">{biotipoInitial}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm sm:text-base">
                          {biotipoLabel}
                        </p>
                        <p className="text-xs text-white/40">
                          {data}
                        </p>
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
