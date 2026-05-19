import Link from "next/link";
import {
  Users,
  BarChart3,
  TrendingUp,
  Activity,
  DollarSign,
  ArrowRight,
  Zap,
  Calendar,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { calcularCustoMisto, ACTION_LABELS, type AdminAction } from "@/lib/auditLog";

// Força revalidação a cada request (admin precisa de dados frescos)
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = createAdminClient();

  const agora = new Date();
  const ms24h = 24 * 60 * 60 * 1000;
  const inicio7d = new Date(agora.getTime() - 7 * ms24h).toISOString();
  const inicio30d = new Date(agora.getTime() - 30 * ms24h).toISOString();
  const inicioHoje = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    agora.getDate()
  ).toISOString();
  const inicioMes = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    1
  ).toISOString();

  // Queries em paralelo
  const [
    totalUsuariosRes,
    totalAnalisesRes,
    analisesHojeRes,
    analises7dRes,
    analises30dRes,
    analisesMesRes,
    ultimasAnalisesRes,
    analises7dPorDiaRes,
    profilesAtivosRes,
    auditUltimosRes,
    analisesProviderRes,
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("analyses").select("*", { count: "exact", head: true }),
    admin
      .from("analyses")
      .select("*", { count: "exact", head: true })
      .gte("criado_em", inicioHoje),
    admin
      .from("analyses")
      .select("*", { count: "exact", head: true })
      .gte("criado_em", inicio7d),
    admin
      .from("analyses")
      .select("*", { count: "exact", head: true })
      .gte("criado_em", inicio30d),
    admin
      .from("analyses")
      .select("*", { count: "exact", head: true })
      .gte("criado_em", inicioMes),
    admin
      .from("analyses")
      .select("id, criado_em, resultado, user_id, provider_ia")
      .order("criado_em", { ascending: false })
      .limit(6),
    admin
      .from("analyses")
      .select("criado_em")
      .gte("criado_em", inicio7d),
    admin
      .from("analyses")
      .select("user_id")
      .gte("criado_em", inicio30d),
    admin
      .from("audit_log")
      .select("id, action, target_type, admin_email, criado_em")
      .order("criado_em", { ascending: false })
      .limit(5),
    admin
      .from("analyses")
      .select("provider_ia")
      .gte("criado_em", inicioMes),
  ]);

  const totalUsuarios = totalUsuariosRes.count ?? 0;
  const totalAnalises = totalAnalisesRes.count ?? 0;
  const analisesHoje = analisesHojeRes.count ?? 0;
  const analises7d = analises7dRes.count ?? 0;
  const analises30d = analises30dRes.count ?? 0;
  const analisesMes = analisesMesRes.count ?? 0;
  const ultimasAnalises = ultimasAnalisesRes.data ?? [];
  const auditUltimos = auditUltimosRes.data ?? [];

  // Usuários ativos = únicos com análise nos últimos 30d
  const usuariosAtivos = new Set(
    (profilesAtivosRes.data ?? []).map((a) => a.user_id)
  ).size;

  // Custo IA do mês (por provider)
  const porProvider = { gemini: 0, claude: 0 };
  (analisesProviderRes.data ?? []).forEach((a) => {
    const p = (a.provider_ia ?? "gemini") as "gemini" | "claude";
    porProvider[p] = (porProvider[p] ?? 0) + 1;
  });
  const custoMes = calcularCustoMisto(porProvider);

  // Gráfico simples: análises por dia nos últimos 7 dias
  const porDia: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(agora.getTime() - i * ms24h);
    const key = d.toISOString().slice(0, 10);
    porDia[key] = 0;
  }
  (analises7dPorDiaRes.data ?? []).forEach((a) => {
    const key = new Date(a.criado_em).toISOString().slice(0, 10);
    if (key in porDia) porDia[key]++;
  });
  const maxDia = Math.max(...Object.values(porDia), 1);

  // Top usuários (mais análises nos 30d)
  const contagemPorUser: Record<string, number> = {};
  (profilesAtivosRes.data ?? []).forEach((a) => {
    contagemPorUser[a.user_id] = (contagemPorUser[a.user_id] ?? 0) + 1;
  });
  const topIds = Object.entries(contagemPorUser)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const { data: topPerfis } =
    topIds.length > 0
      ? await admin
          .from("profiles")
          .select("id, nome")
          .in("id", topIds.map(([id]) => id))
      : { data: [] };

  const topUsuarios = topIds.map(([id, qtd]) => ({
    id,
    qtd,
    nome: topPerfis?.find((p) => p.id === id)?.nome ?? "Sem nome",
  }));

  return (
    <div className="flex flex-col gap-8 animate-[fadeIn_0.4s_ease-out]">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl sm:text-5xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
          Painel <span className="text-orange-400">Admin</span>
        </h1>
        <p className="text-sm text-white/40">
          Visão executiva do ShapeScan em tempo real
        </p>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi
          icon={<Users size={18} />}
          label="Usuários totais"
          value={String(totalUsuarios)}
          sub={`${usuariosAtivos} ativos (30d)`}
          highlight
        />
        <Kpi
          icon={<BarChart3 size={18} />}
          label="Análises totais"
          value={String(totalAnalises)}
          sub={`${analisesMes} no mês`}
        />
        <Kpi
          icon={<TrendingUp size={18} />}
          label="Análises hoje"
          value={String(analisesHoje)}
          sub={`${analises7d} últimos 7d`}
        />
        <Kpi
          icon={<DollarSign size={18} />}
          label="Custo IA (mês)"
          value={`R$ ${custoMes.brl.toFixed(2)}`}
          sub={`≈ $${custoMes.usd.toFixed(2)} USD`}
        />
      </div>

      {/* Gráfico 7 dias + Top usuários lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Gráfico de análises 7d */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={14} className="text-orange-400" />
              Análises últimos 7 dias
            </h2>
            <span className="text-xs text-white/30">
              Total: {analises7d}
            </span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {Object.entries(porDia).map(([dia, qtd]) => {
              const d = new Date(dia);
              const labelDia = d.toLocaleDateString("pt-BR", {
                weekday: "short",
              });
              const altura = (qtd / maxDia) * 100;
              return (
                <div
                  key={dia}
                  className="flex-1 flex flex-col items-center gap-1.5 group"
                >
                  <span className="text-[10px] text-white/40 group-hover:text-orange-400 transition-colors">
                    {qtd}
                  </span>
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full bg-orange-400/30 group-hover:bg-orange-400 rounded-t-md transition-colors"
                      style={{ height: `${Math.max(altura, 4)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-white/30 capitalize">
                    {labelDia.replace(".", "")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top usuários */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
            <Zap size={14} className="text-orange-400" />
            Top usuários (30d)
          </h2>
          {topUsuarios.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {topUsuarios.map((u, i) => (
                <Link
                  key={u.id}
                  href={`/admin/usuarios/${u.id}`}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
                >
                  <span className="text-[10px] font-bold text-white/30 w-4">
                    #{i + 1}
                  </span>
                  <span className="flex-1 text-sm text-white truncate">
                    {u.nome}
                  </span>
                  <span className="text-xs font-bold text-orange-400">
                    {u.qtd}
                  </span>
                </Link>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/30 py-2">
              Nenhuma atividade no período
            </p>
          )}
        </div>
      </div>

      {/* Últimas análises + Atividade admin */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Últimas análises */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
              <Activity size={14} className="text-orange-400" />
              Últimas análises
            </h2>
            <Link
              href="/admin/analises"
              className="text-xs text-orange-400 hover:underline flex items-center gap-0.5"
            >
              Ver todas <ArrowRight size={11} />
            </Link>
          </div>
          {ultimasAnalises.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {ultimasAnalises.map((a) => {
                const resultado = a.resultado as { biotipo?: string };
                const biotipo =
                  {
                    ectomorfo: "Ectomorfo",
                    mesomorfo: "Mesomorfo",
                    endomorfo: "Endomorfo",
                    misto: "Biotipo Misto",
                  }[resultado?.biotipo ?? ""] ?? "Análise";
                const data = new Date(a.criado_em).toLocaleDateString(
                  "pt-BR",
                  {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );
                return (
                  <Link
                    key={a.id}
                    href={`/admin/analises/${a.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="h-7 w-7 rounded-lg bg-orange-400/10 border border-orange-400/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-400 text-[10px] font-bold">
                        {biotipo.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{biotipo}</p>
                      <p className="text-[10px] text-white/30">{data}</p>
                    </div>
                    <span className="text-[10px] text-white/30 uppercase font-bold">
                      {a.provider_ia ?? "gemini"}
                    </span>
                  </Link>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-white/30 py-2">Nenhuma análise ainda</p>
          )}
        </div>

        {/* Atividade admin */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
              <Activity size={14} className="text-orange-400" />
              Atividade admin
            </h2>
            <Link
              href="/admin/auditoria"
              className="text-xs text-orange-400 hover:underline flex items-center gap-0.5"
            >
              Ver tudo <ArrowRight size={11} />
            </Link>
          </div>
          {auditUltimos.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {auditUltimos.map((a) => {
                const labelAction =
                  ACTION_LABELS[a.action as AdminAction] ?? a.action;
                const data = new Date(a.criado_em).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <li
                    key={a.id}
                    className="flex items-center gap-3 p-2 rounded-lg"
                  >
                    <div className="h-2 w-2 rounded-full bg-orange-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {labelAction}
                      </p>
                      <p className="text-[10px] text-white/30 truncate">
                        {a.admin_email ?? "—"} • {data}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-white/30 py-2">
              Nenhuma ação registrada ainda
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-2 p-4 lg:p-5 rounded-2xl border ${
        highlight
          ? "bg-orange-400/10 border-orange-400/30"
          : "bg-white/[0.03] border-white/[0.08]"
      }`}
    >
      <div className={highlight ? "text-orange-400" : "text-white/40"}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider font-medium">
          {label}
        </span>
        <span
          className={`font-bold text-xl lg:text-2xl mt-0.5 ${
            highlight ? "text-orange-400" : "text-white"
          }`}
        >
          {value}
        </span>
        {sub && (
          <span className="text-[10px] text-white/30 mt-0.5">{sub}</span>
        )}
      </div>
    </div>
  );
}
