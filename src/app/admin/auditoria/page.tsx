import Link from "next/link";
import { ScrollText } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { ACTION_LABELS, type AdminAction } from "@/lib/auditLog";
import { FiltrosAuditoria } from "./FiltrosAuditoria";

export const dynamic = "force-dynamic";

const POR_PAGINA = 30;

type SP = Promise<{ action?: string; periodo?: string; page?: string }>;

const COR_POR_TIPO: Record<string, string> = {
  "user.role_changed": "bg-blue-400/15 text-blue-400 border-blue-400/30",
  "user.suspended": "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  "user.reactivated": "bg-green-500/15 text-green-400 border-green-500/30",
  "user.deleted": "bg-red-500/15 text-red-400 border-red-500/30",
  "analysis.deleted": "bg-red-500/15 text-red-400 border-red-500/30",
  "setting.updated": "bg-purple-400/15 text-purple-400 border-purple-400/30",
  "export.csv": "bg-white/[0.06] text-white/60 border-white/[0.12]",
};

export default async function AdminAuditoriaPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const { action, periodo, page } = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("audit_log")
    .select("id, admin_id, admin_email, action, target_type, target_id, metadata, criado_em", {
      count: "exact",
    });

  if (action) query = query.eq("action", action);
  if (periodo) {
    const dias = { "24h": 1, "7d": 7, "30d": 30 }[periodo] ?? 0;
    if (dias > 0) {
      const inicio = new Date(
        Date.now() - dias * 24 * 60 * 60 * 1000
      ).toISOString();
      query = query.gte("criado_em", inicio);
    }
  }

  query = query.order("criado_em", { ascending: false });

  const pageNum = Math.max(1, parseInt(page ?? "1", 10));
  const from = (pageNum - 1) * POR_PAGINA;
  const to = from + POR_PAGINA - 1;
  query = query.range(from, to);

  const { data: logs, count } = await query;
  const total = count ?? 0;
  const totalPaginas = Math.ceil(total / POR_PAGINA);

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.4s_ease-out]">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
          <span className="text-orange-400">Auditoria</span>
        </h1>
        <p className="text-sm text-white/40">
          Log de todas as ações realizadas pelos admins
        </p>
      </div>

      <FiltrosAuditoria />

      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
        {logs && logs.length > 0 ? (
          <ul className="divide-y divide-white/[0.05]">
            {logs.map((log) => {
              const label =
                ACTION_LABELS[log.action as AdminAction] ?? log.action;
              const cor =
                COR_POR_TIPO[log.action] ??
                "bg-white/[0.06] text-white/60 border-white/[0.12]";
              const data = new Date(log.criado_em).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              });
              const linkAlvo =
                log.target_type === "user" && log.target_id
                  ? `/admin/usuarios/${log.target_id}`
                  : log.target_type === "analysis" && log.target_id
                  ? `/admin/analises/${log.target_id}`
                  : null;

              return (
                <li
                  key={log.id}
                  className="flex items-start gap-3 px-4 sm:px-5 py-3"
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border flex-shrink-0 ${cor}`}
                  >
                    {label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">
                      <span className="font-medium">
                        {log.admin_email ?? "—"}
                      </span>
                      {linkAlvo && log.target_id && (
                        <>
                          {" → "}
                          <Link
                            href={linkAlvo}
                            className="text-orange-400 hover:underline font-mono text-xs"
                          >
                            {log.target_id.slice(0, 8)}...
                          </Link>
                        </>
                      )}
                    </p>
                    {log.metadata && (
                      <p className="text-[10px] text-white/30 font-mono mt-0.5 truncate">
                        {JSON.stringify(log.metadata)}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-white/30 flex-shrink-0">
                    {data}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <ScrollText size={32} className="text-white/20" />
            <p className="text-white/40 text-sm">
              {action || periodo
                ? "Nenhum registro encontrado com esses filtros"
                : "Ainda não há ações registradas"}
            </p>
          </div>
        )}
      </div>

      {totalPaginas > 1 && (
        <Paginacao
          pageAtual={pageNum}
          totalPaginas={totalPaginas}
          searchParams={{ action, periodo }}
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
    return `/admin/auditoria?${p.toString()}`;
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
