"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSuperAdmin } from "@/lib/admin";
import { logAction } from "@/lib/auditLog";

async function verificarSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: perfil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!isSuperAdmin(user.email, perfil?.role)) return null;
  return user;
}

export async function salvarApiKey(formData: FormData) {
  const user = await verificarSuperAdmin();
  if (!user) return { erro: "Sem permissão" };

  const chave = formData.get("chave") as string;
  const valor = formData.get("valor") as string;

  const chavesPermitidas = ["gemini_api_key", "anthropic_api_key"];
  if (!chavesPermitidas.includes(chave)) return { erro: "Chave inválida" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("app_settings")
    .upsert({ key: chave, value: valor, updated_at: new Date().toISOString() });

  if (error) return { erro: error.message };

  await logAction({
    action: "setting.updated",
    targetType: "setting",
    targetId: chave,
    metadata: { tipo: "api_key", tamanho_valor: valor.length },
  });

  revalidatePath("/admin/configuracoes");
  revalidatePath("/admin");
  return { sucesso: true };
}

export async function salvarFeatureFlags(formData: FormData) {
  const user = await verificarSuperAdmin();
  if (!user) return { erro: "Sem permissão" };

  const fotoUpload = formData.get("foto_upload") === "on";
  const claudeAi = formData.get("claude_ai") === "on";

  const flagsObj = { foto_upload: fotoUpload, claude_ai: claudeAi };
  const flags = JSON.stringify(flagsObj);

  const admin = createAdminClient();
  const { error } = await admin
    .from("app_settings")
    .upsert({
      key: "feature_flags",
      value: flags,
      updated_at: new Date().toISOString(),
    });

  if (error) return { erro: error.message };

  await logAction({
    action: "setting.updated",
    targetType: "setting",
    targetId: "feature_flags",
    metadata: flagsObj,
  });

  revalidatePath("/admin/configuracoes");
  return { sucesso: true };
}
