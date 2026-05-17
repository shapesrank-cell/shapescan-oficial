"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function mudarSenha(formData: FormData): Promise<{ erro?: string; sucesso?: boolean }> {
  const novaSenha = formData.get("nova_senha") as string;
  const confirmarSenha = formData.get("confirmar_senha") as string;

  if (!novaSenha || !confirmarSenha) return { erro: "Preencha os dois campos." };
  if (novaSenha.length < 6) return { erro: "A senha precisa ter ao menos 6 caracteres." };
  if (novaSenha !== confirmarSenha) return { erro: "As senhas não conferem." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { erro: "Você precisa estar logado." };

  // Deleta análises (RLS exige user_id)
  await supabase.from("analyses").delete().eq("user_id", user.id);
  // Deleta perfil
  await supabase.from("profiles").delete().eq("id", user.id);
  // Faz logout (não conseguimos deletar o auth.user no client — fica órfão mas dados foram removidos)
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}
