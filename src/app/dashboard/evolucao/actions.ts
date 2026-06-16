"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface CheckinInput {
  peso: number;
  cintura?: number | null;
  quadril?: number | null;
  braco?: number | null;
  peito?: number | null;
  coxa?: number | null;
  observacoes?: string | null;
  // Foto opcional já redimensionada no cliente (base64 sem o prefixo data:)
  foto?: string | null;
  fotoMimeType?: string | null;
}

// Ranges idênticos aos CHECKs da migration 006 (validação dupla: cliente + servidor)
const RANGES = {
  peso: [20, 400],
  cintura: [20, 300],
  quadril: [20, 300],
  braco: [10, 150],
  peito: [30, 300],
  coxa: [20, 200],
} as const;

const MIMES_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const LIMITE_FOTO_BYTES = 5 * 1024 * 1024; // 5MB no binário decodificado

function validaMedida(
  valor: number | null | undefined,
  [min, max]: readonly [number, number],
  rotulo: string,
  obrigatorio: boolean
): { erro?: string; valor: number | null } {
  if (valor === null || valor === undefined || Number.isNaN(valor)) {
    if (obrigatorio) return { erro: `${rotulo} é obrigatório.`, valor: null };
    return { valor: null };
  }
  if (!Number.isFinite(valor) || valor < min || valor > max) {
    return { erro: `${rotulo} fora do esperado (${min}-${max}).`, valor: null };
  }
  // Arredonda pra 1 casa decimal (bate com numeric(5,1))
  return { valor: Math.round(valor * 10) / 10 };
}

/**
 * Cria um check-in de evolução. Faz upload da foto (se houver) para o bucket
 * privado 'checkins' e salva o caminho na linha. RLS garante que tudo fica
 * sob a pasta do próprio usuário.
 */
export async function criarCheckin(
  dados: CheckinInput
): Promise<{ erro?: string } | { ok: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Você precisa estar logado." };

  // --- Validação dos números ---
  const peso = validaMedida(dados.peso, RANGES.peso, "Peso", true);
  if (peso.erro) return { erro: peso.erro };

  const cintura = validaMedida(dados.cintura, RANGES.cintura, "Cintura", false);
  if (cintura.erro) return { erro: cintura.erro };
  const quadril = validaMedida(dados.quadril, RANGES.quadril, "Quadril", false);
  if (quadril.erro) return { erro: quadril.erro };
  const braco = validaMedida(dados.braco, RANGES.braco, "Braço", false);
  if (braco.erro) return { erro: braco.erro };
  const peito = validaMedida(dados.peito, RANGES.peito, "Peito", false);
  if (peito.erro) return { erro: peito.erro };
  const coxa = validaMedida(dados.coxa, RANGES.coxa, "Coxa", false);
  if (coxa.erro) return { erro: coxa.erro };

  const observacoes = dados.observacoes?.trim().slice(0, 500) || null;

  // --- Upload da foto (opcional) ---
  let fotoPath: string | null = null;
  if (dados.foto) {
    const mime = dados.fotoMimeType ?? "image/jpeg";
    if (!MIMES_PERMITIDOS.includes(mime)) {
      return { erro: "Formato de foto inválido. Use JPG, PNG ou WebP." };
    }

    let binario: Buffer;
    try {
      binario = Buffer.from(dados.foto, "base64");
    } catch {
      return { erro: "Não foi possível processar a foto." };
    }
    if (binario.length === 0) return { erro: "Foto vazia ou inválida." };
    if (binario.length > LIMITE_FOTO_BYTES) {
      return { erro: "Foto muito grande (máx. 5MB)." };
    }

    const extensao =
      mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
    const caminho = `${user.id}/${crypto.randomUUID()}.${extensao}`;

    const { error: erroUpload } = await supabase.storage
      .from("checkins")
      .upload(caminho, binario, { contentType: mime, upsert: false });

    if (erroUpload) {
      return { erro: "Erro ao enviar a foto. Tente novamente." };
    }
    fotoPath = caminho;
  }

  // --- Insere a linha ---
  const { error } = await supabase.from("checkins").insert({
    user_id: user.id,
    peso: peso.valor,
    cintura: cintura.valor,
    quadril: quadril.valor,
    braco: braco.valor,
    peito: peito.valor,
    coxa: coxa.valor,
    observacoes,
    foto_path: fotoPath,
  });

  if (error) {
    // Não deixa foto órfã no storage se o insert falhar
    if (fotoPath) {
      await supabase.storage.from("checkins").remove([fotoPath]);
    }
    return { erro: "Erro ao salvar o check-in. Tente novamente." };
  }

  revalidatePath("/dashboard/evolucao");
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Deleta um check-in do usuário (e a foto associada, se houver).
 */
export async function deletarCheckin(
  id: string
): Promise<{ erro?: string } | { ok: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Você precisa estar logado." };

  // Busca a foto antes de deletar (RLS garante que é do próprio usuário)
  const { data: checkin } = await supabase
    .from("checkins")
    .select("foto_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!checkin) return { erro: "Check-in não encontrado." };

  const { error } = await supabase
    .from("checkins")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { erro: "Erro ao deletar. Tente novamente." };

  if (checkin.foto_path) {
    await supabase.storage.from("checkins").remove([checkin.foto_path]);
  }

  revalidatePath("/dashboard/evolucao");
  revalidatePath("/dashboard");
  return { ok: true };
}
