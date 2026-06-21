import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Trophy, ClipboardList, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AnaliseView } from "@/app/onboarding/AnaliseView";
import { BotaoSalvarPDF } from "./BotaoSalvarPDF";
import { PreferenciasResumo } from "./PreferenciasResumo";
import type { AnaliseBiotipo, PreferenciasAnalise } from "@/lib/gemini";

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

  const dadosEntrada = analise.dados_entrada as {
    nome?: string;
    preferencias?: PreferenciasAnalise;
  };
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
        <div className="no-print flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            ← Voltar ao dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30">
              Análise de {data}
            </span>
            <BotaoSalvarPDF />
          </div>
        </div>

        <PreferenciasResumo
          estiloObjetivo={resultado?.estiloObjetivo}
          preferencias={dadosEntrada?.preferencias}
        />

        <AnaliseView analise={resultado} nome={nome} />

        {/* Próximos passos — conecta a análise aos destinos dedicados */}
        <section className="no-print flex flex-col gap-3">
          <h2 className="text-lg font-[family-name:var(--font-bebas)] tracking-wide text-white">
            Próximos passos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ProximoPasso
              href="/dashboard/plano"
              icon={<ClipboardList size={18} />}
              titulo="Ver meu plano"
              descricao="Treino e dieta organizados"
            />
            <ProximoPasso
              href="/dashboard/ranking"
              icon={<Trophy size={18} />}
              titulo="Ver meu ranking"
              descricao="Seu ELO por grupo"
            />
            <ProximoPasso
              href="/dashboard/coach"
              icon={<Sparkles size={18} />}
              titulo="Falar com o Coach"
              descricao="Tire dúvidas do plano"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function ProximoPasso({
  href,
  icon,
  titulo,
  descricao,
}: {
  href: string;
  icon: React.ReactNode;
  titulo: string;
  descricao: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 p-4 rounded-2xl bg-white/[0.05] border border-white/[0.10] hover:border-orange-400/30 hover:bg-white/[0.08] active:scale-[0.99] transition-all"
    >
      <span className="h-10 w-10 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center text-orange-400">
        {icon}
      </span>
      <div>
        <p className="font-semibold text-white text-sm">{titulo}</p>
        <p className="text-xs text-white/40">{descricao}</p>
      </div>
    </Link>
  );
}
