"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  calcularStreak,
  diaDeHojeSP,
  type ResultadoStreak,
} from "@/lib/streak";

/**
 * Marca o dia de HOJE como "plano cumprido" (idempotente — marcar 2x no mesmo
 * dia não dá erro). Devolve a ofensiva atualizada pra UI atualizar na hora.
 */
export async function marcarDia(): Promise<
  { erro: string } | { ok: true; streak: ResultadoStreak }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Você precisa estar logado." };

  const hoje = diaDeHojeSP();

  const { error } = await supabase
    .from("habit_log")
    .upsert(
      { user_id: user.id, dia: hoje },
      { onConflict: "user_id,dia", ignoreDuplicates: true }
    );
  if (error) return { erro: "Erro ao marcar o dia. Tente de novo." };

  // Recarrega os dias pra recalcular a ofensiva (limita aos mais recentes).
  const { data } = await supabase
    .from("habit_log")
    .select("dia")
    .eq("user_id", user.id)
    .order("dia", { ascending: false })
    .limit(400);

  const dias = (data ?? []).map((r) => r.dia as string);
  const streak = calcularStreak(dias, hoje);

  revalidatePath("/dashboard");
  return { ok: true, streak };
}
