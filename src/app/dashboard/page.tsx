import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./LogoutButton";

/**
 * Dashboard do usuário logado.
 *
 * Server Component — busca dados do usuário direto do Supabase no servidor.
 * Se não tiver usuário logado, manda pro login (camada extra além do proxy).
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Busca perfil (nome) — criado automaticamente pelo trigger SQL no cadastro
  const { data: perfil } = await supabase
    .from("profiles")
    .select("nome")
    .eq("id", user.id)
    .single();

  // Busca análises salvas do usuário
  const { data: analises } = await supabase
    .from("analyses")
    .select("id, criado_em, resultado")
    .eq("user_id", user.id)
    .order("criado_em", { ascending: false });

  const nomeExibicao = perfil?.nome || user.email?.split("@")[0] || "atleta";
  const totalAnalises = analises?.length ?? 0;

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:py-12">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-base">S</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              ShapeScan
            </span>
          </Link>
          <LogoutButton />
        </header>

        {/* Boas-vindas */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            Olá,{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              {nomeExibicao}
            </span>{" "}
            👋
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            Bem-vindo ao seu painel. Aqui você acompanha suas análises.
          </p>
        </div>

        {/* Card de ação principal */}
        <div className="bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl sm:text-2xl font-bold">
              Faça uma nova análise
            </h2>
            <p className="text-sm sm:text-base text-white/90">
              Descubra seu biotipo atualizado em 2 minutos
            </p>
          </div>
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-white text-indigo-600 font-semibold hover:bg-zinc-100 transition-colors whitespace-nowrap"
          >
            Começar análise →
          </Link>
        </div>

        {/* Histórico */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Suas análises
            </h2>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {totalAnalises} {totalAnalises === 1 ? "análise" : "análises"}
            </span>
          </div>

          {totalAnalises === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 text-center">
              <p className="text-2xl mb-2">📊</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Você ainda não fez nenhuma análise.
                <br />
                Comece pela primeira no botão acima.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {analises?.map((analise) => {
                const resultado = analise.resultado as { biotipo?: string };
                const data = new Date(analise.criado_em).toLocaleDateString(
                  "pt-BR",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                );
                return (
                  <li
                    key={analise.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {resultado?.biotipo || "Análise"}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {data}
                      </span>
                    </div>
                    {/* Espaço reservado pra rota de detalhes futuramente */}
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      em breve →
                    </span>
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
