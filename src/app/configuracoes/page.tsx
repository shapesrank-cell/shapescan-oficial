import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FormMudarSenha, BotaoDeletarConta } from "./ConfiguracoesForms";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:py-12 bg-[#111111] animate-[fadeIn_0.4s_ease-out]">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">

        <Link
          href="/dashboard"
          className="text-sm text-white/50 hover:text-white/80 transition-colors self-start"
        >
          ← Voltar ao dashboard
        </Link>

        <div className="flex flex-col gap-1">
          <h1 className="text-3xl sm:text-5xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
            <span className="text-orange-400">Config</span>urações
          </h1>
          <p className="text-sm sm:text-base text-white/50">
            Gerencie sua conta e segurança
          </p>
        </div>

        {/* Mudar senha */}
        <section className="bg-white/[0.05] border border-white/[0.10] rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center text-orange-400">
              <Lock size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Mudar senha</h2>
              <p className="text-xs text-white/40">Atualize sua senha de acesso</p>
            </div>
          </div>
          <FormMudarSenha />
        </section>

        {/* Zona de perigo — deletar conta */}
        <section className="bg-red-500/[0.04] border border-red-500/20 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Zona de perigo</h2>
              <p className="text-xs text-white/40">Ações irreversíveis</p>
            </div>
          </div>
          <p className="text-sm text-white/60">
            Deletar sua conta remove permanentemente todos os seus dados, incluindo
            histórico de análises, perfil e configurações. Não dá pra desfazer.
          </p>
          <BotaoDeletarConta />
        </section>

      </div>
    </div>
  );
}
