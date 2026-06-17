"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function mudarSenha(
  formData: FormData
): Promise<{ erro?: string; sucesso?: boolean }> {
  const novaSenha = formData.get("nova_senha") as string;
  const confirmarSenha = formData.get("confirmar_senha") as string;

  if (!novaSenha || !confirmarSenha) return { erro: "Preencha os dois campos." };
  if (novaSenha.length < 8)
    return { erro: "A senha precisa ter ao menos 8 caracteres." };
  if (novaSenha !== confirmarSenha)
    return { erro: "As senhas não conferem." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Você precisa estar logado." };

  const { error } = await supabase.auth.updateUser({ password: novaSenha });

  if (error) {
    console.error("Erro ao mudar senha:", error);
    return { erro: "Erro ao mudar senha. Tente novamente." };
  }

  return { sucesso: true };
}

export async function deletarConta(): Promise<{ erro?: string } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Você precisa estar logado." };

  // Remove as fotos de progresso do storage (não são apagadas em cascata
  // quando o perfil/check-ins são deletados — precisam ser removidas à mão).
  const { data: checkins } = await supabase
    .from("checkins")
    .select("foto_path")
    .eq("user_id", user.id);
  const fotos = (checkins ?? [])
    .map((c) => c.foto_path)
    .filter((p): p is string => Boolean(p));
  if (fotos.length > 0) {
    await supabase.storage.from("checkins").remove(fotos);
  }

  // Deleta dados do usuário (RLS exige ownership)
  await supabase.from("coach_messages").delete().eq("user_id", user.id);
  await supabase.from("checkins").delete().eq("user_id", user.id);
  await supabase.from("analyses").delete().eq("user_id", user.id);
  await supabase.from("profiles").delete().eq("id", user.id);
  // Faz logout (não conseguimos deletar o auth.user no client — fica órfão mas dados foram removidos)
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * LGPD: exporta todos os dados pessoais do usuário em formato JSON.
 * Inclui perfil, todas as análises e metadados de cadastro.
 */
export async function baixarMeusDados(): Promise<{ erro?: string; json?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Você precisa estar logado." };

  const [
    { data: perfil },
    { data: analises },
    { data: checkins },
    { data: conversaCoach },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("criado_em", { ascending: false }),
    supabase
      .from("checkins")
      .select("*")
      .eq("user_id", user.id)
      .order("criado_em", { ascending: false }),
    supabase
      .from("coach_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("criado_em", { ascending: true }),
  ]);

  const dados = {
    exportado_em: new Date().toISOString(),
    aplicacao: "ShapeScan",
    conformidade: "LGPD - Lei 13.709/2018",
    conta: {
      id: user.id,
      email: user.email,
      criado_em: user.created_at,
      ultimo_login: user.last_sign_in_at,
    },
    perfil,
    analises: analises ?? [],
    checkins: checkins ?? [],
    conversa_coach: conversaCoach ?? [],
  };

  return { json: JSON.stringify(dados, null, 2) };
}
