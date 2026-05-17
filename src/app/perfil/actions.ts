"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function atualizarPerfil(formData: FormData): Promise<{ erro?: string; sucesso?: boolean }> {
  const nome = (formData.get("nome") as string)?.trim();

  if (!nome) return { erro: "Digite um nome." };
  if (nome.length < 2) return { erro: "Nome muito curto." };
  if (nome.length > 50) return { erro: "Nome muito longo (máx. 50 caracteres)." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { erro: "Você precisa estar logado." };

  const { error } = await supabase
    .from("profiles")
    .update({ nome })
    .eq("id", user.id);

  if (error) {
    console.error("Erro ao atualizar perfil:", error);
    return { erro: "Erro ao salvar. Tente novamente." };
  }

  revalidatePath("/perfil");
  revalidatePath("/dashboard");
  return { sucesso: true };
}
