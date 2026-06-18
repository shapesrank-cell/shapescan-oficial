"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { criarCheckin } from "@/app/dashboard/evolucao/actions";

/**
 * Salva as medidas a partir da aba Ranking:
 * - altura/idade → tabela `profiles` (dados fixos do perfil)
 * - peso + circunferências → novo check-in (reusa criarCheckin, que valida,
 *   aplica rate limit e insere). Assim entra na Evolução e alimenta a próxima
 *   análise/ranking.
 */
export async function salvarMedidasRanking(input: {
  altura?: number | null;
  idade?: number | null;
  peso: number;
  peito?: number | null;
  braco?: number | null;
  cintura?: number | null;
  quadril?: number | null;
  coxa?: number | null;
}): Promise<{ erro?: string } | { ok: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Você precisa estar logado." };

  // 1. Altura/idade no perfil (só o que veio preenchido)
  const updates: Record<string, unknown> = {};
  if (input.altura != null) {
    if (!Number.isFinite(input.altura) || input.altura < 50 || input.altura > 300) {
      return { erro: "Altura deve estar entre 50 e 300 cm (ex: 175)." };
    }
    updates.altura = Math.round(input.altura * 10) / 10;
  }
  if (input.idade != null) {
    if (!Number.isFinite(input.idade) || input.idade < 10 || input.idade > 110) {
      return { erro: "Idade deve estar entre 10 e 110 anos." };
    }
    updates.idade = Math.round(input.idade);
  }
  if (Object.keys(updates).length > 0) {
    updates.perfil_atualizado_em = new Date().toISOString();
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);
    if (error) return { erro: "Erro ao salvar altura/idade. Tente de novo." };
  }

  // 2. Peso + circunferências → check-in (valida e aplica rate limit lá dentro)
  const res = await criarCheckin({
    peso: input.peso,
    peito: input.peito ?? null,
    braco: input.braco ?? null,
    cintura: input.cintura ?? null,
    quadril: input.quadril ?? null,
    coxa: input.coxa ?? null,
  });
  if ("erro" in res) return { erro: res.erro };

  revalidatePath("/dashboard/ranking");
  revalidatePath("/perfil");
  return { ok: true };
}
