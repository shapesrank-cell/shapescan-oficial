import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Calendar, Cpu } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { calcularCustoEstimado } from "@/lib/auditLog";
import { DeletarAnaliseBotao } from "./DeletarAnaliseBotao";

export const dynamic = "force-dynamic";

const BIOTIPO_LABEL: Record<string, string> = {
  ectomorfo: "Ectomorfo",
  mesomorfo: "Mesomorfo",
  endomorfo: "Endomorfo",
  misto: "Biotipo Misto",
};

export default async function AnaliseDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: analise } = await admin
    .from("analyses")
    .select("id, user_id, criado_em, resultado, dados_entrada, provider_ia")
    .eq("id", id)
    .single();

  if (!analise) notFound();

  const { data: perfil } = await admin
    .from("profiles")
    .select("nome")
    .eq("id", analise.user_id)
    .single();
  const { data: authUser } = await admin.auth.admin.getUserById(analise.user_id);

  const r = analise.resultado as Record<string, unknown>;
  const d = analise.dados_entrada as Record<string, unknown>;
  const biotipo = BIOTIPO_LABEL[(r?.biotipo as string) ?? ""] ?? "Análise";
  const provider = (analise.provider_ia ?? "gemini") as "gemini" | "claude";
  const custo = calcularCustoEstimado(1, provider);
  const data = new Date(analise.criado_em).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.4s_ease-out]">
      <Link
        href="/admin/analises"
        className="self-start text-sm text-white/40 hover:text-white inline-flex items-center gap-1.5"
      >
        <ArrowLeft size={14} /> Análises
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-2xl bg-orange-400/10 border border-orange-400/30 flex items-center justify-center flex-shrink-0">
          <span className="text-orange-400 text-xl font-bold">
            {biotipo.charAt(0)}
          </span>
        </div>
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {biotipo}
          </h1>
          <div className="flex items-center gap-3 text-sm text-white/50 flex-wrap">
            <Link
              href={`/admin/usuarios/${analise.user_id}`}
              className="inline-flex items-center gap-1.5 hover:text-orange-400 transition-colors"
            >
              <User size={13} /> {perfil?.nome || authUser?.user?.email || "—"}
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} /> {data}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Cpu size={13} /> {provider} (≈ R$ {custo.brl.toFixed(3)})
            </span>
          </div>
        </div>
      </div>

      {/* Grid: input + output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inputs */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
            Dados de entrada
          </h2>
          <pre className="text-xs text-white/70 bg-black/30 rounded-xl p-4 overflow-auto max-h-96 font-mono whitespace-pre-wrap">
            {JSON.stringify(d, null, 2)}
          </pre>
        </div>

        {/* Output */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
            Resultado da IA
          </h2>
          <pre className="text-xs text-white/70 bg-black/30 rounded-xl p-4 overflow-auto max-h-96 font-mono whitespace-pre-wrap">
            {JSON.stringify(r, null, 2)}
          </pre>
        </div>
      </div>

      {/* Ações destrutivas */}
      <div className="pt-2 border-t border-white/[0.06]">
        <DeletarAnaliseBotao analiseId={analise.id} />
      </div>
    </div>
  );
}
