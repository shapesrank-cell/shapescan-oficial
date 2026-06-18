"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { RANGES, validaMedida } from "@/lib/checkinValidation";
import {
  gerarRelatorioEvolucao,
  type RelatorioEvolucao,
} from "@/lib/gemini";

// Limite de check-ins por hora (evita abuso/spam de upload de fotos no storage)
const RATE_LIMIT_CHECKINS_HORA = 20;

export interface CheckinInput {
  peso: number;
  cintura?: number | null;
  quadril?: number | null;
  braco?: number | null;
  peito?: number | null;
  coxa?: number | null;
  ombros?: number | null;
  panturrilha?: number | null;
  antebraco?: number | null;
  pescoco?: number | null;
  observacoes?: string | null;
  // Foto opcional já redimensionada no cliente (base64 sem o prefixo data:)
  foto?: string | null;
  fotoMimeType?: string | null;
}

const MIMES_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const LIMITE_FOTO_BYTES = 5 * 1024 * 1024; // 5MB no binário decodificado

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

  // --- Rate limit (anti-abuso de storage) ---
  const limite = await checkRateLimit({
    identifier: user.id,
    action: "checkin.create",
    limit: RATE_LIMIT_CHECKINS_HORA,
    windowMinutes: 60,
  });
  if (!limite.allowed) {
    return {
      erro: `Você atingiu o limite de ${RATE_LIMIT_CHECKINS_HORA} check-ins por hora. Tente novamente mais tarde.`,
    };
  }

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
  const ombros = validaMedida(dados.ombros, RANGES.ombros, "Ombros", false);
  if (ombros.erro) return { erro: ombros.erro };
  const panturrilha = validaMedida(
    dados.panturrilha,
    RANGES.panturrilha,
    "Panturrilha",
    false
  );
  if (panturrilha.erro) return { erro: panturrilha.erro };
  const antebraco = validaMedida(
    dados.antebraco,
    RANGES.antebraco,
    "Antebraço",
    false
  );
  if (antebraco.erro) return { erro: antebraco.erro };
  const pescoco = validaMedida(dados.pescoco, RANGES.pescoco, "Pescoço", false);
  if (pescoco.erro) return { erro: pescoco.erro };

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
    ombros: ombros.valor,
    panturrilha: panturrilha.valor,
    antebraco: antebraco.valor,
    pescoco: pescoco.valor,
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

// Limite de relatórios de IA por hora (chamada de IA = custo)
const RATE_LIMIT_RELATORIOS_HORA = 5;

/**
 * Gera um relatório de evolução com IA a partir do histórico de check-ins.
 * Exige pelo menos 2 check-ins. Não persiste — é derivado e regenerável.
 */
export async function gerarRelatorio(): Promise<
  { erro: string } | { relatorio: RelatorioEvolucao }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Você precisa estar logado." };

  const limite = await checkRateLimit({
    identifier: user.id,
    action: "relatorio.evolucao",
    limit: RATE_LIMIT_RELATORIOS_HORA,
    windowMinutes: 60,
  });
  if (!limite.allowed) {
    return {
      erro: `Você já gerou ${RATE_LIMIT_RELATORIOS_HORA} relatórios nesta hora. Tente novamente mais tarde.`,
    };
  }

  const { data: checkins } = await supabase
    .from("checkins")
    .select(
      "peso, cintura, quadril, braco, peito, coxa, ombros, panturrilha, antebraco, pescoco, criado_em"
    )
    .eq("user_id", user.id)
    .order("criado_em", { ascending: true });

  if (!checkins || checkins.length < 2) {
    return {
      erro: "Você precisa de pelo menos 2 check-ins pra gerar o relatório.",
    };
  }

  const [{ data: perfil }, { data: ultimaAnalise }] = await Promise.all([
    supabase
      .from("profiles")
      .select("sexo, idade, objetivo")
      .eq("id", user.id)
      .single(),
    supabase
      .from("analyses")
      .select("resultado")
      .eq("user_id", user.id)
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const biotipo =
    (ultimaAnalise?.resultado as { biotipo?: string } | null)?.biotipo ?? null;

  try {
    const relatorio = await gerarRelatorioEvolucao({
      sexo: perfil?.sexo ?? "não informado",
      idade: perfil?.idade ?? null,
      objetivo: perfil?.objetivo ?? null,
      biotipo,
      checkins: checkins.map((c) => ({
        data: c.criado_em,
        peso: c.peso,
        cintura: c.cintura,
        quadril: c.quadril,
        braco: c.braco,
        peito: c.peito,
        coxa: c.coxa,
        ombros: c.ombros,
        panturrilha: c.panturrilha,
        antebraco: c.antebraco,
        pescoco: c.pescoco,
      })),
    });
    return { relatorio };
  } catch {
    return {
      erro: "A IA falhou ao gerar o relatório. Tente novamente em alguns segundos.",
    };
  }
}
