"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Apaga TODA a conversa do usuário com o coach (recomeça do zero).
 * RLS garante que só apaga as mensagens do próprio usuário.
 */
export async function limparConversa(): Promise<
  { erro: string } | { ok: true }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Você precisa estar logado." };

  const { error } = await supabase
    .from("coach_messages")
    .delete()
    .eq("user_id", user.id);

  if (error) return { erro: "Erro ao limpar a conversa. Tente novamente." };

  revalidatePath("/dashboard/coach");
  return { ok: true };
}
