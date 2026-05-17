import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnaliseView } from "@/app/onboarding/AnaliseView";
import type { AnaliseBiotipo } from "@/lib/gemini";

/**
 * Detalhe de uma análise salva.
 *
 * ⚠️ Next.js 16: params agora é Promise — precisa de await
 */
export default async function AnaliseDetalhePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: analise } = await supabase
    .from("analyses")
    .select("id, criado_em, dados_entrada, resultado")
    .eq("id", id)
    .single();

  if (!analise) notFound();

  const dadosEntrada = analise.dados_entrada as { nome?: string };
  const resultado = analise.resultado as AnaliseBiotipo;
  const nome = dadosEntrada?.nome || "você";
  const data = new Date(analise.criado_em).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-8 sm:py-12 bg-[#111111]">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            ← Voltar ao dashboard
          </Link>
          <span className="text-xs text-white/30">
            Análise de {data}
          </span>
        </div>

        <AnaliseView analise={resultado} nome={nome} />
      </div>
    </div>
  );
}
