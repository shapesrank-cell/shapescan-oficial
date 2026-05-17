import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CompararCliente } from "./CompararCliente";

export default async function CompararPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: analises } = await supabase
    .from("analyses")
    .select("id, criado_em, dados_entrada, resultado")
    .eq("user_id", user.id)
    .order("criado_em", { ascending: false });

  const total = analises?.length ?? 0;

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:py-12 bg-[#111111] animate-[fadeIn_0.4s_ease-out]">
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">

        <Link
          href="/dashboard"
          className="text-sm text-white/50 hover:text-white/80 transition-colors self-start"
        >
          ← Voltar ao dashboard
        </Link>

        <div className="flex flex-col gap-1">
          <h1 className="text-3xl sm:text-5xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
            <span className="text-orange-400">Comparar</span> análises
          </h1>
          <p className="text-sm sm:text-base text-white/50">
            Veja sua evolução lado a lado
          </p>
        </div>

        {total < 2 ? (
          <div className="bg-white/[0.05] border border-dashed border-white/[0.12] rounded-2xl p-10 text-center flex flex-col items-center gap-3">
            <p className="font-medium text-white/60">Você precisa de pelo menos 2 análises</p>
            <p className="text-sm text-white/30">Faça mais uma análise pra começar a comparar evolução.</p>
            <Link
              href="/onboarding"
              className="mt-3 inline-flex items-center justify-center h-11 px-5 rounded-full bg-orange-400 text-black font-semibold text-sm hover:bg-orange-300 transition-all"
            >
              Fazer análise →
            </Link>
          </div>
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <CompararCliente analises={(analises as any) ?? []} />
        )}
      </div>
    </div>
  );
}
