import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnaliseView } from "@/app/onboarding/AnaliseView";
import type { AnaliseBiotipo } from "@/lib/gemini";

/**
 * Detalhe de uma análise salva.
 *
 * Rota: /dashboard/analise/[id]
 *
 * - Busca a análise pelo ID no Supabase
 * - RLS garante que só retorna se for do usuário logado
 * - Reutiliza AnaliseView (mesmo componente do onboarding)
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

  // Busca a análise. RLS já filtra por user_id automaticamente.
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
    <div className="flex flex-1 flex-col items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        {/* Header com voltar pro dashboard */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
          >
            ← Voltar ao dashboard
          </Link>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            Análise de {data}
          </span>
        </div>

        {/* Visual compartilhado com a tela pós-análise */}
        <AnaliseView analise={resultado} nome={nome} />
      </div>
    </div>
  );
}
