import Link from "next/link";
import { BarChart3, Download, ArrowRight } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { FiltrosAnalises } from "./FiltrosAnalises";
import { exportarAnalisesCSV } from "./actions";
import { BotaoExportar } from "../BotaoExportar";

export const dynamic = "force-dynamic";

const POR_PAGINA = 25;

const BIOTIPO_LABEL: Record<string, string> = {
  ectomorfo: "Ectomorfo",
  mesomorfo: "Mesomorfo",
  endomorfo: "Endomorfo",
  misto: "Biotipo Misto",
};

type SP = Promise<{
  biotipo?: string;
  provider?: string;
  periodo?: string;
  page?: string;
}>;

export default async function AdminAnalisesPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const { biotipo, provider, periodo, page } = await searchParams;

  const admin = createAdminClient();

  let query = admin
    .from("analyses")
    .select("id, user_id, criado_em, resultado, dados_entrada, provider_ia", {
      count: "exact",
    });

  if (provider) query = query.eq("provider_ia", provider);

  if (periodo) {
    const ms = { "24h": 1, "7d": 7, "30d": 30 }[periodo] ?? 0;
    if (ms > 0) {
      const inicio = new Date(
        Date.now() - ms * 24 * 60 * 60 * 1000
      ).toISOString();
      query = query.gte("criado_em", inicio);
    }
  }

  // Filtro biotipo: filtro JSON path
  if (biotipo) {
    query = query.eq("resultado->>biotipo", biotipo);
  }

  query = query.order("criado_em", { ascending: false });

  const pageNum = Math.max(1, parseInt(page ?? "1", 10));
  const from = (pageNum - 1) * POR_PAGINA;
  const to = from + POR_PAGINA - 1;
  query = query.range(from, to);

  const { data: analises, count } = await query;
  const total = count ?? 0;
  const totalPaginas = Math.ceil(total / POR_PAGINA);

  // Pega nomes dos users desta página
  const userIds = Array.from(new Set((analises ?? []).map((a) => a.user_id)));
  const { data: perfis } =
    userIds.length > 0
      ? await admin.from("profiles").select("id, nome").in("id", userIds)
      : { data: [] };
  const nomePorId = new Map(perfis?.map((p) => [p.id, p.nome ?? ""]) ?? []);

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.4s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
            <span className="text-orange-400">Análises</span>
          </h1>
          <p className="text-sm text-white/40">
            {total} {total === 1 ? "análise" : "análises"} encontradas
          </p>
        </div>
        <BotaoExportar
          actionFn={exportarAnalisesCSV}
          icon={<Download size={14} />}
          label="Exportar CSV"
          filename="analises.csv"
        />
      </div>

      <FiltrosAnalises />

      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
        {analises && analises.length > 0 ? (
          <ul className="divide-y divide-white/[0.05]">
            {analises.map((a) => {
              const r = a.resultado as { biotipo?: string };
              const d = a.dados_entrada as {
                peso?: string;
                altura?: string;
              };
              const labelBio = BIOTIPO_LABEL[r?.biotipo ?? ""] ?? "Análise";
              const nome = nomePorId.get(a.user_id) || "Sem nome";
              const data = new Date(a.criado_em).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <li key={a.id}>
                  <Link
                    href={`/admin/analises/${a.id}`}
                    className="flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-white/[0.03] transition-colors group"
                  >
                    <div className="h-9 w-9 rounded-lg bg-orange-400/10 border border-orange-400/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-400 text-xs font-bold">
                        {labelBio.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1 sm:gap-4 items-center">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">
                          {labelBio}
                        </p>
                        <p className="text-xs text-white/40 truncate">
                          {nome} • {d?.peso ?? "—"}kg • {d?.altura ?? "—"}cm
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider hidden sm:inline">
                          {a.provider_ia ?? "gemini"}
                        </span>
                        <span className="text-xs text-white/40">{data}</span>
                      </div>
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-white/20 group-hover:text-orange-400 group-hover:translate-x-1 transition-all hidden sm:block"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <BarChart3 size={32} className="text-white/20" />
            <p className="text-white/40 text-sm">
              Nenhuma análise encontrada com esses filtros
            </p>
          </div>
        )}
      </div>

      {totalPaginas > 1 && (
        <Paginacao
          pageAtual={pageNum}
          totalPaginas={totalPaginas}
          searchParams={{ biotipo, provider, periodo }}
        />
      )}
    </div>
  );
}

function Paginacao({
  pageAtual,
  totalPaginas,
  searchParams,
}: {
  pageAtual: number;
  totalPaginas: number;
  searchParams: Record<string, string | undefined>;
}) {
  function buildUrl(page: number) {
    const p = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v) p.set(k, v);
    });
    p.set("page", String(page));
    return `/admin/analises?${p.toString()}`;
  }

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      {pageAtual > 1 && (
        <Link
          href={buildUrl(pageAtual - 1)}
          className="px-3 py-1.5 rounded-lg border border-white/[0.10] text-white/60 hover:border-white/30 hover:text-white text-sm transition-all"
        >
          ← Anterior
        </Link>
      )}
      <span className="px-3 py-1.5 text-xs text-white/50">
        Página {pageAtual} de {totalPaginas}
      </span>
      {pageAtual < totalPaginas && (
        <Link
          href={buildUrl(pageAtual + 1)}
          className="px-3 py-1.5 rounded-lg border border-white/[0.10] text-white/60 hover:border-white/30 hover:text-white text-sm transition-all"
        >
          Próxima →
        </Link>
      )}
    </div>
  );
}
