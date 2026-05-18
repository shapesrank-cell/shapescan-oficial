import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { Users } from "lucide-react";
import { RoleSelector } from "./RoleSelectorCliente";

const ROLE_LABELS: Record<string, string> = {
  user: "Usuário",
  workspace_admin: "Admin Workspace",
  super_admin: "Super Admin",
};

export default async function AdminUsuariosPage() {
  const supabase = await createClient();
  const { data: { user: mim } } = await supabase.auth.getUser();

  const admin = createAdminClient();

  // Busca todos os perfis
  const { data: perfis } = await admin
    .from("profiles")
    .select("id, nome, role, criado_em")
    .order("criado_em", { ascending: false });

  // Busca lista de auth.users para pegar emails
  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailPorId = new Map(authData?.users.map((u) => [u.id, u.email]) ?? []);

  // Conta análises por usuário
  const { data: contagemAnalises } = await admin
    .from("analyses")
    .select("user_id");

  const analisesPorUser = new Map<string, number>();
  contagemAnalises?.forEach(({ user_id }) => {
    analisesPorUser.set(user_id, (analisesPorUser.get(user_id) ?? 0) + 1);
  });

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.4s_ease-out]">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
          <span className="text-orange-400">Usuários</span> do sistema
        </h1>
        <p className="text-sm text-white/40">
          {perfis?.length ?? 0} usuários cadastrados
        </p>
      </div>

      {/* Tabela / lista */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
        {/* Header da tabela (só desktop) */}
        <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.06] text-[10px] font-bold text-white/30 uppercase tracking-widest">
          <span>Nome / Email</span>
          <span>Email</span>
          <span className="text-center">Análises</span>
          <span>Cadastro</span>
          <span className="text-right">Role</span>
        </div>

        {/* Linhas */}
        {perfis && perfis.length > 0 ? (
          <ul className="divide-y divide-white/[0.05]">
            {perfis.map((p) => {
              const email = emailPorId.get(p.id) ?? "—";
              const qtdAnalises = analisesPorUser.get(p.id) ?? 0;
              const dataCadastro = new Date(p.criado_em).toLocaleDateString(
                "pt-BR",
                { day: "2-digit", month: "short", year: "numeric" }
              );
              const ehVoceMesmo = p.id === mim?.id;

              return (
                <li
                  key={p.id}
                  className="grid sm:grid-cols-[1fr_1fr_auto_auto_auto] gap-2 sm:gap-4 px-4 sm:px-5 py-4 items-center hover:bg-white/[0.02] transition-colors"
                >
                  {/* Nome */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-orange-400/10 border border-orange-400/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-400 text-xs font-bold">
                        {(p.nome || email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {p.nome || "Sem nome"}
                        {ehVoceMesmo && (
                          <span className="ml-1.5 text-[10px] text-orange-400/70">
                            (você)
                          </span>
                        )}
                      </p>
                      {/* Email só no mobile */}
                      <p className="text-xs text-white/30 truncate sm:hidden">
                        {email}
                      </p>
                    </div>
                  </div>

                  {/* Email (desktop) */}
                  <p className="hidden sm:block text-xs text-white/40 truncate">
                    {email}
                  </p>

                  {/* Qtd análises */}
                  <div className="hidden sm:flex justify-center">
                    <span className="text-sm font-bold text-white/70">
                      {qtdAnalises}
                    </span>
                  </div>

                  {/* Data */}
                  <p className="hidden sm:block text-xs text-white/30">
                    {dataCadastro}
                  </p>

                  {/* Role selector */}
                  <RoleSelector
                    userId={p.id}
                    roleAtual={(p.role as "user" | "workspace_admin" | "super_admin") ?? "user"}
                    ehVoceMesmo={ehVoceMesmo}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Users size={32} className="text-white/20" />
            <p className="text-white/40 text-sm">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
