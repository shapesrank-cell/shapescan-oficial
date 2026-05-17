import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, Calendar, BarChart3, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PerfilForm } from "./PerfilForm";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("nome, criado_em")
    .eq("id", user.id)
    .single();

  const { count: totalAnalises } = await supabase
    .from("analyses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const nomeInicial = perfil?.nome || user.email?.split("@")[0] || "atleta";
  const dataCadastro = perfil?.criado_em
    ? new Date(perfil.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:py-12 bg-[#111111] animate-[fadeIn_0.4s_ease-out]">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">

        {/* Voltar */}
        <Link
          href="/dashboard"
          className="text-sm text-white/50 hover:text-white/80 transition-colors self-start"
        >
          ← Voltar ao dashboard
        </Link>

        {/* Título */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl sm:text-5xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
            Meu <span className="text-orange-400">perfil</span>
          </h1>
          <p className="text-sm sm:text-base text-white/50">
            Edite suas informações
          </p>
        </div>

        {/* Avatar grande com inicial */}
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.05] border border-white/[0.10]">
          <div className="h-16 w-16 rounded-full bg-orange-400 flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold text-2xl">{nomeInicial.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-lg truncate">{nomeInicial}</p>
            <p className="text-sm text-white/40 truncate">{user.email}</p>
          </div>
        </div>

        {/* Formulário de edição */}
        <div className="bg-white/[0.05] border border-white/[0.10] rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
          <h2 className="text-lg font-[family-name:var(--font-bebas)] tracking-wide text-white">Informações pessoais</h2>
          <PerfilForm nomeInicial={nomeInicial} />
        </div>

        {/* Infos da conta */}
        <div className="bg-white/[0.05] border border-white/[0.10] rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
          <h2 className="text-lg font-[family-name:var(--font-bebas)] tracking-wide text-white">Informações da conta</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoCard icon={<Mail size={16} />} label="Email" value={user.email ?? "—"} />
            <InfoCard icon={<Calendar size={16} />} label="Cadastro" value={dataCadastro} />
            <InfoCard icon={<BarChart3 size={16} />} label="Análises" value={String(totalAnalises ?? 0)} />
          </div>
        </div>

        {/* Link pra configurações */}
        <Link
          href="/configuracoes"
          className="flex items-center justify-between gap-3 p-5 rounded-2xl bg-white/[0.05] border border-white/[0.10] hover:border-white/20 hover:bg-white/[0.08] transition-all"
        >
          <div className="flex items-center gap-3">
            <Settings size={18} className="text-white/40" />
            <div>
              <p className="font-semibold text-white text-sm">Configurações da conta</p>
              <p className="text-xs text-white/40">Senha, privacidade e mais</p>
            </div>
          </div>
          <span className="text-white/30">→</span>
        </Link>

      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
      <div className="flex items-center gap-1.5 text-white/40 text-xs">
        {icon}
        <span className="uppercase tracking-wider font-medium">{label}</span>
      </div>
      <p className="text-white text-sm font-medium truncate">{value}</p>
    </div>
  );
}
