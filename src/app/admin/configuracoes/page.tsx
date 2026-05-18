import { Key, Zap } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { FormApiKey, FormFeatureFlags } from "./ConfiguracoesForms";

export default async function AdminConfiguracoesPage() {
  const admin = createAdminClient();

  const { data: settings } = await admin
    .from("app_settings")
    .select("key, value");

  const geminiKey = settings?.find((s) => s.key === "gemini_api_key")?.value ?? "";
  const anthropicKey = settings?.find((s) => s.key === "anthropic_api_key")?.value ?? "";

  let flags = { foto_upload: true, claude_ai: false };
  try {
    const flagsRaw = settings?.find((s) => s.key === "feature_flags")?.value;
    if (flagsRaw) flags = JSON.parse(flagsRaw);
  } catch {
    // usa defaults
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl animate-[fadeIn_0.4s_ease-out]">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
          <span className="text-orange-400">Configurações</span> do sistema
        </h1>
        <p className="text-sm text-white/40">
          Integrações de IA e funcionalidades do app
        </p>
      </div>

      {/* Seção: API Keys */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Key size={16} className="text-orange-400" />
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
            Chaves de API
          </h2>
        </div>
        <p className="text-xs text-white/40 -mt-2">
          As chaves salvas aqui têm prioridade sobre as variáveis de ambiente (.env).
          Os valores são armazenados de forma segura no banco de dados.
        </p>

        <FormApiKey
          chave="gemini_api_key"
          label="Gemini (Google)"
          valorAtual={geminiKey}
        />
        <FormApiKey
          chave="anthropic_api_key"
          label="Claude (Anthropic)"
          valorAtual={anthropicKey}
        />
      </section>

      <hr className="border-white/[0.08]" />

      {/* Seção: Feature Flags */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-orange-400" />
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
            Funcionalidades
          </h2>
        </div>
        <p className="text-xs text-white/40 -mt-2">
          Ative ou desative funcionalidades do app em tempo real.
        </p>

        <FormFeatureFlags
          fotoUpload={flags.foto_upload}
          claudeAi={flags.claude_ai}
        />
      </section>
    </div>
  );
}
