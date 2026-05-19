"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface PerfilOnboarding {
  nome: string;
  sexo: "masculino" | "feminino" | "outro";
  idade: number;
  peso: number;
  altura: number;
  nivel_atividade: "sedentario" | "leve" | "moderado" | "intenso";
  objetivo: "emagrecer" | "ganhar_massa" | "definir" | "saude_geral";
}

/**
 * Server Action que salva os dados básicos do perfil ao final do onboarding.
 * NÃO gera análise — isso virou um fluxo separado em /analise/nova.
 */
export async function salvarPerfilOnboarding(
  dados: PerfilOnboarding
): Promise<{ erro?: string } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Você precisa estar logado." };

  // Validação server-side dos ranges
  const nome = dados.nome?.trim().slice(0, 100);
  if (!nome) return { erro: "Nome inválido." };

  if (!["masculino", "feminino", "outro"].includes(dados.sexo)) {
    return { erro: "Sexo inválido." };
  }

  if (
    !Number.isFinite(dados.idade) ||
    dados.idade < 10 ||
    dados.idade > 110
  ) {
    return { erro: "Idade fora do esperado (10-110)." };
  }

  if (
    !Number.isFinite(dados.peso) ||
    dados.peso < 20 ||
    dados.peso > 400
  ) {
    return { erro: "Peso fora do esperado (20-400 kg)." };
  }

  if (
    !Number.isFinite(dados.altura) ||
    dados.altura < 80 ||
    dados.altura > 250
  ) {
    return { erro: "Altura fora do esperado (80-250 cm)." };
  }

  if (
    !["sedentario", "leve", "moderado", "intenso"].includes(
      dados.nivel_atividade
    )
  ) {
    return { erro: "Nível de atividade inválido." };
  }

  if (
    !["emagrecer", "ganhar_massa", "definir", "saude_geral"].includes(
      dados.objetivo
    )
  ) {
    return { erro: "Objetivo inválido." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      nome,
      sexo: dados.sexo,
      idade: dados.idade,
      peso: dados.peso,
      altura: dados.altura,
      nivel_atividade: dados.nivel_atividade,
      objetivo: dados.objetivo,
      perfil_completo: true,
      perfil_atualizado_em: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { erro: "Erro ao salvar perfil. Tente novamente." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
