import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Users, Download, ArrowRight } from "lucide-react";
import { FiltrosUsuarios } from "./FiltrosUsuarios";
import { exportarUsuariosCSV } from "../actions";
import { BotaoExportar } from "../BotaoExportar";

export const dynamic = "force-dynamic";

const POR_PAGINA = 25;

const ROLE_LABELS: Record<string, string> = {
  user: "Usuário",
  workspace_admin: "Admin",
  super_admin: "Super Admin",
};

const ROLE_CORES: Record<string, string> = {
  user: "bg-white/[0.06] text-white/60 border-white/[0.12]",
  workspace_admin: "bg-blue-400/10 text-blue-400 border-blue-400/30",
  super_admin: "bg-orange-400/10 text-orange-400 border-orange-400/30",
};

type SP = Promise<{
  q?: string;
  role?: string;
  status?: string;
  sort?: string;
  page?: string;
}>;

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const { q, role, status, sort, page } = await searchParams;

  const admin = createAdminClient();

  // Busca todos os auth.users uma vez (pra emails e filtro por email)
  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailPorId = new Map(
    authData?.users.map((u) => [u.id, u.email ?? ""]) ?? []
  );

  // Filtro por email: se busca tem @, casa por email
  let idsFiltradosPorEmail: string[] | null = null;
  if (q && q.includes("@")) {
    idsFiltradosPorEmail = (authData?.users ?? [])
      .filter((u) => u.email?.toLowerCase().includes(q.toLowerCase()))
      .map((u) => u.id);
  }

  // Query base
  let query = admin.from("profiles").select("id, nome, role, status, criado_em", {
    count: "exact",
  });

  // Filtros
  if (q && !q.includes("@")) {
    query = query.ilike("nome", `%${q}%`);
  } else if (q && q.includes("@") && idsFiltradosPorEmail) {
    if (idsFiltradosPorEmail.length === 0) {
      // Nenhum match — retorna vazio
      query = query.eq("id", "00000000-0000-0000-0000-000000000000");
    } else {
      query = query.in("id", idsFiltradosPorEmail);
    }
  }
  if (role) query = query.eq("role", role);
  if (status) query = query.eq("status", status);

  // Ordenação
  if (sort === "old") {
    query = query.order("criado_em", { ascending: true });
  } else if (sort === "alpha") {
    query = query.order("nome", { ascending: true });
  } else {
    query = query.order("criado_em", { ascending: false });
  }

  // Paginação
  const pageNum = Math.max(1, parseInt(page ?? "1", 10));
  const from = (pageNum - 1) * POR_PAGINA;
  const to = from + POR_PAGINA - 1;
  query = query.range(from, to);

  const { data: perfis, count } = await query;
  const total = count ?? 0;
  const totalPaginas = Math.ceil(total / POR_PAGINA);

  // Contagem de análises por user (só pros perfis nesta página)
  const userIds = (perfis ?? []).map((p) => p.id);
  const { data: contagemAnalises } =
    userIds.length > 0
      ? await admin
          .from("analyses")
          .select("user_id")
          .in("user_id", userIds)
      : { data: [] };

  const analisesPorUser = new Map<string, number>();
  contagemAnalises?.forEach(({ user_id }) => {
    analisesPorUser.set(user_id, (analisesPorUser.get(user_id) ?? 0) + 1);
  });

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.4s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
            <span className="text-orange-400">Usuários</span>
          </h1>
          <p className="text-sm text-white/40">
            {total} {total === 1 ? "usuário" : "usuários"} no total
          </p>
        </div>
        <BotaoExportar
          actionFn={exportarUsuariosCSV}
          icon={<Download size={14} />}
          label="Exportar CSV"
          filename="usuarios.csv"
        />
      </div>

      {/* Filtros */}
      <FiltrosUsuarios />

      {/* Tabela */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
        {/* Header (desktop) */}
        <div className="hidden md:grid grid-cols-[1fr_1fr_70px_100px_90px_60px] gap-4 px-5 py-3 border-b border-white/[0.06] text-[10px] font-bold text-white/30 uppercase tracking-widest">
          <span>Nome</span>
          <span>Email</span>
          <span className="text-center">Análises</span>
          <span>Cadastro</span>
          <span>Role</span>
          <span></span>
        </div>

        {perfis && perfis.length > 0 ? (
          <ul className="divide-y divide-white/[0.05]">
            {perfis.map((p) => {
              const email = emailPorId.get(p.id) ?? "—";
              const qtd = analisesPorUser.get(p.id) ?? 0;
              const data = new Date(p.criado_em).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "2-digit",
              });
              const isSuspended = p.status === "suspended";
              return (
                <li key={p.id}>
                  <Link
                    href={`/admin/usuarios/${p.id}`}
                    className={`grid md:grid-cols-[1fr_1fr_70px_100px_90px_60px] gap-2 md:gap-4 px-4 md:px-5 py-3 items-center hover:bg-white/[0.03] transition-colors group ${
                      isSuspended ? "opacity-60" : ""
                    }`}
                  >
                    {/* Nome */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-orange-400/10 border border-orange-400/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-400 text-xs font-bold">
                          {(p.nome || email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate flex items-center gap-1.5">
                          {p.nome || "Sem nome"}
                          {isSuspended && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20 uppercase font-bold">
                              suspenso
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-white/30 truncate md:hidden">
                          {email}
                        </p>
                      </div>
                    </div>
                    <p className="hidden md:block text-xs text-white/40 truncate">
                      {email}
                    </p>
                    <span className="hidden md:flex justify-center text-sm font-bold text-white/70">
                      {qtd}
                    </span>
                    <p className="hidden md:block text-xs text-white/30">
                      {data}
                    </p>
                    <div className="hidden md:flex">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                          ROLE_CORES[p.role ?? "user"]
                        }`}
                      >
                        {ROLE_LABELS[p.role ?? "user"]}
                      </span>
                    </div>
                    <ArrowRight
                      size={14}
                      className="hidden md:block text-white/20 group-hover:text-orange-400 group-hover:translate-x-1 transition-all ml-auto"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Users size={32} className="text-white/20" />
            <p className="text-white/40 text-sm">
              {q || role || status
                ? "Nenhum usuário encontrado com esses filtros"
                : "Nenhum usuário cadastrado ainda"}
            </p>
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <Paginacao
          pageAtual={pageNum}
          totalPaginas={totalPaginas}
          searchParams={{ q, role, status, sort }}
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
    return `/admin/usuarios?${p.toString()}`;
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
