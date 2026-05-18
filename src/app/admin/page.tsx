import { Users, BarChart3, Zap, Key, TrendingUp, Activity } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminDashboardPage() {
  const admin = createAdminClient();

  // Métricas em paralelo
  const [
    { count: totalUsuarios },
    { count: totalAnalises },
    { count: analises30d },
    { data: settings },
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("analyses").select("*", { count: "exact", head: true }),
    admin
      .from("analyses")
      .select("*", { count: "exact", head: true })
      .gte("criado_em", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    admin
      .from("app_settings")
      .select("key, value")
      .in("key", ["gemini_api_key", "anthropic_api_key"]),
  ]);

  // Últimas análises
  const { data: ultimasAnalises } = await admin
    .from("analyses")
    .select("id, criado_em, resultado, user_id")
    .order("criado_em", { ascending: false })
    .limit(8);

  // Status das API keys
  const geminiKey = settings?.find((s) => s.key === "gemini_api_key")?.value || "";
  const anthropicKey = settings?.find((s) => s.key === "anthropic_api_key")?.value || "";
  const geminiEnv = !!process.env.GEMINI_API_KEY;
  const anthropicEnv = !!process.env.ANTHROPIC_API_KEY;
  const geminiAtivo = geminiKey.length > 4 || geminiEnv;
  const anthropicAtivo = anthropicKey.length > 4 || anthropicEnv;

  return (
    <div className="flex flex-col gap-8 animate-[fadeIn_0.4s_ease-out]">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl sm:text-5xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
          Painel <span className="text-orange-400">Admin</span>
        </h1>
        <p className="text-sm text-white/40">Visão geral do sistema ShapeScan</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          icon={<Users size={18} />}
          label="Total usuários"
          value={String(totalUsuarios ?? 0)}
          highlight
        />
        <MetricCard
          icon={<BarChart3 size={18} />}
          label="Total análises"
          value={String(totalAnalises ?? 0)}
        />
        <MetricCard
          icon={<TrendingUp size={18} />}
          label="Análises (30d)"
          value={String(analises30d ?? 0)}
        />
        <MetricCard
          icon={<Activity size={18} />}
          label="Média/usuário"
          value={
            totalUsuarios && totalUsuarios > 0
              ? ((totalAnalises ?? 0) / totalUsuarios).toFixed(1)
              : "0"
          }
        />
      </div>

      {/* API Keys Status */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Key size={16} className="text-orange-400" />
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
            Status das integrações de IA
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <IntegracaoCard
            nome="Gemini (Google)"
            ativo={geminiAtivo}
            fonte={geminiKey.length > 4 ? "banco" : geminiEnv ? "env var" : "não configurado"}
          />
          <IntegracaoCard
            nome="Claude (Anthropic)"
            ativo={anthropicAtivo}
            fonte={anthropicKey.length > 4 ? "banco" : anthropicEnv ? "env var" : "não configurado"}
          />
        </div>
        <p className="text-xs text-white/30">
          Para atualizar as chaves,{" "}
          <a href="/admin/configuracoes" className="text-orange-400 hover:underline">
            acesse Configurações
          </a>
          .
        </p>
      </div>

      {/* Últimas análises */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
          <Zap size={14} className="text-orange-400" />
          Últimas análises
        </h2>
        {ultimasAnalises && ultimasAnalises.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {ultimasAnalises.map((a) => {
              const resultado = a.resultado as { biotipo?: string };
              const biotipo =
                {
                  ectomorfo: "Ectomorfo",
                  mesomorfo: "Mesomorfo",
                  endomorfo: "Endomorfo",
                  misto: "Biotipo Misto",
                }[resultado?.biotipo ?? ""] ?? "Análise";
              const data = new Date(a.criado_em).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <li
                  key={a.id}
                  className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl"
                >
                  <div className="h-8 w-8 rounded-lg bg-orange-400/10 border border-orange-400/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-400 text-xs font-bold">
                      {biotipo.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{biotipo}</p>
                    <p className="text-xs text-white/30">{data}</p>
                  </div>
                  <p className="text-[10px] text-white/20 font-mono hidden sm:block truncate max-w-[120px]">
                    {a.user_id.slice(0, 8)}...
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-white/30 py-4 text-center">
            Nenhuma análise ainda
          </p>
        )}
      </div>
    </div>
  );
}

function MetricCard({
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
      className={`flex flex-col gap-2 p-4 sm:p-5 rounded-2xl border ${
        highlight
          ? "bg-orange-400/10 border-orange-400/30"
          : "bg-white/[0.04] border-white/[0.08]"
      }`}
    >
      <div className={highlight ? "text-orange-400" : "text-white/40"}>{icon}</div>
      <div className="flex flex-col">
        <span className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider font-medium">
          {label}
        </span>
        <span
          className={`font-bold text-xl sm:text-2xl mt-0.5 ${
            highlight ? "text-orange-400" : "text-white"
          }`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function IntegracaoCard({
  nome,
  ativo,
  fonte,
}: {
  nome: string;
  ativo: boolean;
  fonte: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-white">{nome}</span>
        <span className="text-xs text-white/30">Fonte: {fonte}</span>
      </div>
      <span
        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          ativo
            ? "bg-green-500/15 text-green-400 border border-green-500/20"
            : "bg-red-500/15 text-red-400 border border-red-500/20"
        }`}
      >
        {ativo ? "Ativo" : "Inativo"}
      </span>
    </div>
  );
}
