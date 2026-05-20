"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function atualizarPerfil(
  formData: FormData
): Promise<{ erro?: string; sucesso?: boolean }> {
  const nome = (formData.get("nome") as string)?.trim();
  const sexo = formData.get("sexo") as string;
  const idadeRaw = formData.get("idade") as string;
  const pesoRaw = formData.get("peso") as string;
  const alturaRaw = formData.get("altura") as string;
  const nivelAtividade = formData.get("nivel_atividade") as string;
  const objetivo = formData.get("objetivo") as string;

  // Validações
  if (!nome) return { erro: "Digite um nome." };
  if (nome.length < 2) return { erro: "Nome muito curto." };
  if (nome.length > 50) return { erro: "Nome muito longo (máx. 50 caracteres)." };

  const SEXOS_VALIDOS = ["masculino", "feminino", "outro"];
  if (sexo && !SEXOS_VALIDOS.includes(sexo)) return { erro: "Sexo inválido." };

  const idade = idadeRaw ? Number(idadeRaw) : null;
  if (idade !== null && (isNaN(idade) || idade < 10 || idade > 110)) {
    return { erro: "Idade deve estar entre 10 e 110 anos." };
  }

  const peso = pesoRaw ? Number(pesoRaw) : null;
  if (peso !== null && (isNaN(peso) || peso < 20 || peso > 500)) {
    return { erro: "Peso deve estar entre 20 e 500 kg." };
  }

  const altura = alturaRaw ? Number(alturaRaw) : null;
  if (altura !== null && (isNaN(altura) || altura < 50 || altura > 300)) {
    return { erro: "Altura deve estar entre 50 e 300 cm." };
  }
  if (altura !== null && altura < 50) {
    return { erro: "Altura parece estar em metros — use cm (ex: 175)." };
  }

  const NIVEIS_VALIDOS = ["sedentario", "leve", "moderado", "intenso"];
  if (nivelAtividade && !NIVEIS_VALIDOS.includes(nivelAtividade)) {
    return { erro: "Nível de atividade inválido." };
  }

  const OBJETIVOS_VALIDOS = ["emagrecer", "ganhar_massa", "definir", "saude_geral"];
  if (objetivo && !OBJETIVOS_VALIDOS.includes(objetivo)) {
    return { erro: "Objetivo inválido." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { erro: "Você precisa estar logado." };

  const updates: Record<string, unknown> = { nome };
  if (sexo) updates.sexo = sexo;
  if (idade !== null) updates.idade = idade;
  if (peso !== null) updates.peso = peso;
  if (altura !== null) updates.altura = altura;
  if (nivelAtividade) updates.nivel_atividade = nivelAtividade;
  if (objetivo) updates.objetivo = objetivo;
  updates.perfil_atualizado_em = new Date().toISOString();

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    console.error("Erro ao atualizar perfil:", error);
    return { erro: "Erro ao salvar. Tente novamente." };
  }

  revalidatePath("/perfil");
  revalidatePath("/dashboard");
  revalidatePath("/analise/nova");
  return { sucesso: true };
}
