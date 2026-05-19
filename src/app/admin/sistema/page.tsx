import { Activity, Database, Cpu, DollarSign, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { calcularCustoMisto } from "@/lib/auditLog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSistemaPage() {
  const admin = createAdminClient();
  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();
  const inicioMesPassado = new Date(agora.getFullYear(), agora.getMonth() - 1, 1).toISOString();
  const fimMesPassado = inicioMes;

  // Status do Supabase (se chegou aqui, está ok)
  const supabaseOk = true;

  // Custo IA do mês atual e passado (por provider)
  const [{ data: anMes }, { data: anMesPassado }, { data: settings }, { data: tamanhoAprox }] = await Promise.all([
    admin.from("analyses").select("provider_ia").gte("criado_em", inicioMes),
    admin
      .from("analyses")
      .select("provider_ia")
      .gte("criado_em", inicioMesPassado)
      .lt("criado_em", fimMesPassado),
    admin.from("app_settings").select("key, value"),
    admin
      .from("analyses")
      .select("id, dados_entrada, resultado")
      .order("criado_em", { ascending: false })
      .limit(10),
  ]);

  function contar(arr: { provider_ia: string }[] | null | undefined) {
    const c = { gemini: 0, claude: 0 };
    (arr ?? []).forEach((a) => {
      const p = (a.provider_ia ?? "gemini") as "gemini" | "claude";
      c[p] = (c[p] ?? 0) + 1;
    });
    return c;
  }

  const provMes = contar(anMes);
  const provMesPassado = contar(anMesPassado);
  const custoMes = calcularCustoMisto(provMes);
  const custoMesPassado = calcularCustoMisto(provMesPassado);

  // Status das API keys
  const geminiKey = settings?.find((s) => s.key === "gemini_api_key")?.value ?? "";
  const anthropicKey = settings?.find((s) => s.key === "anthropic_api_key")?.value ?? "";
  const geminiAtivo = geminiKey.length > 4 || !!process.env.GEMINI_API_KEY;
  const anthropicAtivo = anthropicKey.length > 4 || !!process.env.ANTHROPIC_API_KEY;

  // Estimativa de tamanho do banco (super grosseira: ~3KB por análise)
  const tamanhoEstimadoKb = (tamanhoAprox?.length ?? 0) * 3;

  // Variação mês a mês
  const totalMes = provMes.gemini + provMes.claude;
  const totalMesPassado = provMesPassado.gemini + provMesPassado.claude;
  const variacao =
    totalMesPassado > 0
      ? ((totalMes - totalMesPassado) / totalMesPassado) * 100
      : null;

  return (
    <div className="flex flex-col gap-8 animate-[fadeIn_0.4s_ease-out]">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
          <span className="text-orange-400">Sistema</span>
        </h1>
        <p className="text-sm text-white/40">
          Saúde das integrações, custos e métricas operacionais
        </p>
      </div>

      {/* Health checks */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
          <Activity size={14} className="text-orange-400" />
          Status dos serviços
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ServicoCard
            icon={<Database size={18} />}
            nome="Supabase"
            ativo={supabaseOk}
            descricao="Banco + Auth"
          />
          <ServicoCard
            icon={<Cpu size={18} />}
            nome="Gemini API"
            ativo={geminiAtivo}
            descricao={geminiAtivo ? "Configurado" : "Sem chave"}
          />
          <ServicoCard
            icon={<Cpu size={18} />}
            nome="Claude API"
            ativo={anthropicAtivo}
            descricao={anthropicAtivo ? "Configurado" : "Sem chave"}
          />
        </div>
        <p className="text-[10px] text-white/30">
          Para testar conectividade real, faça uma análise via{" "}
          <a href="/analise/nova" className="text-orange-400 hover:underline">
            onboarding
          </a>
          .
        </p>
      </section>

      {/* Custos IA */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
          <DollarSign size={14} className="text-orange-400" />
          Custo estimado de IA
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <CustoCard
            titulo="Mês atual"
            custoUsd={custoMes.usd}
            custoBrl={custoMes.brl}
            gemini={provMes.gemini}
            claude={provMes.claude}
            variacao={variacao}
            highlight
          />
          <CustoCard
            titulo="Mês passado"
            custoUsd={custoMesPassado.usd}
            custoBrl={custoMesPassado.brl}
            gemini={provMesPassado.gemini}
            claude={provMesPassado.claude}
            variacao={null}
          />
        </div>
        <p className="text-[10px] text-white/30">
          Estimativa baseada em ~5000 tokens/análise. Gemini Flash: ~$0.008/análise. Claude Haiku 4.5: ~$0.018/análise. USD a R$ 5,50.
        </p>
      </section>

      {/* Métricas operacionais */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
          <AlertCircle size={14} className="text-orange-400" />
          Operacional
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricaCard label="Análises (mês)" valor={String(totalMes)} />
          <MetricaCard label="Mês anterior" valor={String(totalMesPassado)} />
          <MetricaCard
            label="Tamanho aprox."
            valor={
              tamanhoEstimadoKb > 1024
                ? `${(tamanhoEstimadoKb / 1024).toFixed(1)} MB`
                : `${tamanhoEstimadoKb} KB`
            }
          />
        </div>
      </section>
    </div>
  );
}

function ServicoCard({
  icon,
  nome,
  ativo,
  descricao,
}: {
  icon: React.ReactNode;
  nome: string;
  ativo: boolean;
  descricao: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
      <div
        className={`h-10 w-10 rounded-xl flex items-center justify-center ${
          ativo
            ? "bg-green-500/10 text-green-400 border border-green-500/20"
            : "bg-red-500/10 text-red-400 border border-red-500/20"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{nome}</p>
        <p className="text-xs text-white/40 truncate">{descricao}</p>
      </div>
      {ativo ? (
        <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
      ) : (
        <XCircle size={16} className="text-red-400 flex-shrink-0" />
      )}
    </div>
  );
}

function CustoCard({
  titulo,
  custoUsd,
  custoBrl,
  gemini,
  claude,
  variacao,
  highlight,
}: {
  titulo: string;
  custoUsd: number;
  custoBrl: number;
  gemini: number;
  claude: number;
  variacao: number | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-5 rounded-2xl border flex flex-col gap-3 ${
        highlight
          ? "bg-orange-400/10 border-orange-400/30"
          : "bg-white/[0.03] border-white/[0.08]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
          {titulo}
        </span>
        {variacao !== null && (
          <span
            className={`text-xs font-bold ${
              variacao > 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {variacao > 0 ? "+" : ""}
            {variacao.toFixed(0)}%
          </span>
        )}
      </div>
      <div>
        <p
          className={`text-3xl font-bold ${
            highlight ? "text-orange-400" : "text-white"
          }`}
        >
          R$ {custoBrl.toFixed(2)}
        </p>
        <p className="text-xs text-white/30">≈ ${custoUsd.toFixed(2)} USD</p>
      </div>
      <div className="flex gap-4 text-xs">
        <div className="flex flex-col">
          <span className="text-white/40">Gemini</span>
          <span className="text-white font-bold">{gemini} análises</span>
        </div>
        <div className="flex flex-col">
          <span className="text-white/40">Claude</span>
          <span className="text-white font-bold">{claude} análises</span>
        </div>
      </div>
    </div>
  );
}

function MetricaCard({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
      <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
        {label}
      </p>
      <p className="text-lg font-bold text-white mt-1">{valor}</p>
    </div>
  );
}
