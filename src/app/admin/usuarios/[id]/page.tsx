import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Calendar,
  BarChart3,
  User,
  ChevronRight,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { RoleSelector } from "../RoleSelectorCliente";
import { AcoesUsuario } from "./AcoesUsuario";

export const dynamic = "force-dynamic";

const BIOTIPO_LABEL: Record<string, string> = {
  ectomorfo: "Ectomorfo",
  mesomorfo: "Mesomorfo",
  endomorfo: "Endomorfo",
  misto: "Biotipo Misto",
};

export default async function UsuarioDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const supabase = await createClient();

  const [
    { data: perfil },
    { data: authUser },
    { data: analises },
    { data: { user: mim } },
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("id, nome, role, status, criado_em")
      .eq("id", id)
      .single(),
    admin.auth.admin.getUserById(id),
    admin
      .from("analyses")
      .select("id, criado_em, resultado, dados_entrada, provider_ia")
      .eq("user_id", id)
      .order("criado_em", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  if (!perfil) notFound();

  const email = authUser?.user?.email ?? "—";
  const total = analises?.length ?? 0;
  const primeira = analises?.[total - 1]?.criado_em;
  const ultima = analises?.[0]?.criado_em;
  const ehVoceMesmo = perfil.id === mim?.id;

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.4s_ease-out]">
      {/* Breadcrumb */}
      <Link
        href="/admin/usuarios"
        className="self-start text-sm text-white/40 hover:text-white inline-flex items-center gap-1.5"
      >
        <ArrowLeft size={14} /> Usuários
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="h-16 w-16 rounded-2xl bg-orange-400/10 border border-orange-400/30 flex items-center justify-center flex-shrink-0">
          <span className="text-orange-400 text-2xl font-bold">
            {(perfil.nome || email).charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {perfil.nome || "Sem nome"}
            </h1>
            {perfil.status === "suspended" && (
              <span className="text-[10px] px-2 py-1 rounded-md bg-red-500/15 text-red-400 border border-red-500/20 uppercase font-bold tracking-wider">
                Suspenso
              </span>
            )}
            {ehVoceMesmo && (
              <span className="text-[10px] px-2 py-1 rounded-md bg-orange-400/15 text-orange-400 border border-orange-400/20 uppercase font-bold tracking-wider">
                Você
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-white/50 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <Mail size={13} /> {email}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} />{" "}
              {new Date(perfil.criado_em).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Total análises" value={String(total)} />
        <Stat
          label="Primeira"
          value={
            primeira
              ? new Date(primeira).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })
              : "—"
          }
        />
        <Stat
          label="Última"
          value={
            ultima
              ? new Date(ultima).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })
              : "—"
          }
        />
      </div>

      {/* Grid: timeline + ações */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Timeline de análises */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 size={14} className="text-orange-400" />
            Análises ({total})
          </h2>
          {analises && analises.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {analises.map((a) => {
                const r = a.resultado as { biotipo?: string };
                const biotipo = BIOTIPO_LABEL[r?.biotipo ?? ""] ?? "Análise";
                const data = new Date(a.criado_em).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <li key={a.id}>
                    <Link
                      href={`/admin/analises/${a.id}`}
                      className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl hover:border-orange-400/30 hover:bg-white/[0.05] transition-all group"
                    >
                      <div className="h-9 w-9 rounded-lg bg-orange-400/10 border border-orange-400/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-400 text-xs font-bold">
                          {biotipo.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">
                          {biotipo}
                        </p>
                        <p className="text-xs text-white/30">{data}</p>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider">
                        {a.provider_ia ?? "gemini"}
                      </span>
                      <ChevronRight
                        size={14}
                        className="text-white/20 group-hover:text-orange-400 group-hover:translate-x-1 transition-all"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="bg-white/[0.03] border border-dashed border-white/[0.10] rounded-xl p-8 text-center">
              <User size={24} className="mx-auto text-white/20 mb-2" />
              <p className="text-sm text-white/40">Nenhuma análise ainda</p>
            </div>
          )}
        </div>

        {/* Sidebar de ações */}
        <div className="flex flex-col gap-5">
          {/* Role */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">
              Nível de acesso
            </h3>
            <RoleSelector
              userId={perfil.id}
              roleAtual={
                (perfil.role as
                  | "user"
                  | "workspace_admin"
                  | "super_admin") ?? "user"
              }
              ehVoceMesmo={ehVoceMesmo}
            />
          </div>

          <AcoesUsuario
            userId={perfil.id}
            status={(perfil.status as "active" | "suspended") ?? "active"}
            ehVoceMesmo={ehVoceMesmo}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
      <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
        {label}
      </p>
      <p className="text-lg font-bold text-white mt-1">{value}</p>
    </div>
  );
}
