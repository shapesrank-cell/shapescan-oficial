/**
 * Helpers puros do Coach IA (sem dependências de servidor / SDK).
 *
 * Monta o bloco de CONTEXTO do usuário (perfil + última análise + check-ins)
 * que vai no prompt do sistema do Gemini, e define o prompt-base do coach.
 *
 * Fica separado de gemini.ts pra ser testável no Vitest sem importar o SDK
 * (só usamos `import type`, que é apagado em tempo de compilação).
 */
import {
  formatarHistoricoCheckins,
  type CheckinHistorico,
} from "./relatorio";
import type { AnaliseBiotipo } from "./gemini";

// Quantas mensagens do histórico mandamos pro modelo (controla custo/tokens).
// Conta mensagens (user + assistente), as mais recentes.
export const MAX_HISTORICO_COACH = 20;

// Tamanho máximo de uma mensagem do usuário (bate com o CHECK da migration).
export const MAX_TAMANHO_MENSAGEM = 4000;

// Papel de cada mensagem na conversa.
export type PapelCoach = "user" | "assistente";

export type MensagemCoach = {
  papel: PapelCoach;
  conteudo: string;
};

export type ContextoCoachInput = {
  nome?: string | null;
  sexo?: string | null;
  idade?: number | null;
  peso?: number | null; // do perfil (kg)
  altura?: number | null; // do perfil (cm)
  nivelAtividade?: string | null;
  objetivo?: string | null;
  // Resultado da última análise salva (jsonb). Null se o usuário ainda não gerou.
  analise?: AnaliseBiotipo | null;
  // Histórico de check-ins (mais antigo → mais novo). Vazio se não houver.
  checkins: CheckinHistorico[];
};

const OBJETIVO_LABEL: Record<string, string> = {
  emagrecer: "Emagrecer",
  ganhar_massa: "Ganhar massa muscular",
  definir: "Definir / secar",
  saude_geral: "Saúde geral",
};

const ATIVIDADE_LABEL: Record<string, string> = {
  sedentario: "Sedentário",
  leve: "Levemente ativo",
  moderado: "Moderadamente ativo",
  intenso: "Muito ativo",
};

const BIOTIPO_LABEL: Record<string, string> = {
  ectomorfo: "Ectomorfo",
  mesomorfo: "Mesomorfo",
  endomorfo: "Endomorfo",
  misto: "Biotipo misto",
};

function rotulo(mapa: Record<string, string>, chave?: string | null): string | null {
  if (!chave) return null;
  return mapa[chave] ?? chave;
}

/** Bloco textual com a última análise (biotipo + dieta + treino), compacto. */
function formatarAnalise(a: AnaliseBiotipo): string {
  const linhas: string[] = [];

  linhas.push(`Biotipo: ${BIOTIPO_LABEL[a.biotipo] ?? a.biotipo}`);
  if (a.resumoBiotipo) linhas.push(`Resumo: ${a.resumoBiotipo}`);
  if (a.estiloObjetivo) linhas.push(`Direção do físico-alvo: ${a.estiloObjetivo}`);
  if (a.pontosFortes?.length)
    linhas.push(`Pontos fortes: ${a.pontosFortes.join("; ")}`);
  if (a.desafios?.length) linhas.push(`Desafios: ${a.desafios.join("; ")}`);

  // Dieta
  const macros = a.dieta?.distribuicaoMacros;
  linhas.push("", "DIETA DO PLANO:");
  linhas.push(`- Calorias estimadas: ${a.dieta.caloriasEstimadas} kcal/dia`);
  if (macros)
    linhas.push(
      `- Macros: ${macros.proteinaGramas}g proteína, ${macros.carboidratoGramas}g carbo, ${macros.gorduraGramas}g gordura`
    );
  if (a.dieta.refeicoes?.length) {
    linhas.push("- Cardápio do dia:");
    for (const r of a.dieta.refeicoes) {
      const itens = r.itens
        .map((i) => `${i.quantidade} de ${i.alimento}`)
        .join(", ");
      linhas.push(`  • ${r.nome} (${r.horario}, ~${r.calorias}kcal): ${itens}`);
    }
  } else if (a.dieta.sugestoesAlimentares?.length) {
    linhas.push(`- Sugestões: ${a.dieta.sugestoesAlimentares.join(", ")}`);
  }

  // Treino
  linhas.push("", "TREINO DO PLANO:");
  linhas.push(`- Frequência: ${a.treino.frequenciaSemanal}x por semana`);
  linhas.push(`- Foco principal: ${a.treino.focoPrincipal}`);
  if (a.treino.divisao?.length) {
    linhas.push("- Divisão semanal:");
    for (const d of a.treino.divisao) {
      const exs = d.exercicios
        .map((e) => `${e.nome} ${e.series}x${e.repeticoes}`)
        .join("; ");
      linhas.push(`  • ${d.nome} (${d.foco}): ${exs}`);
    }
  } else if (a.treino.exerciciosRecomendados?.length) {
    linhas.push(`- Exercícios: ${a.treino.exerciciosRecomendados.join(", ")}`);
  }

  return linhas.join("\n");
}

/**
 * Monta o bloco de CONTEXTO do usuário pro prompt do sistema do coach.
 * Inclui só o que existe — campos vazios são omitidos.
 */
export function montarContextoCoach(input: ContextoCoachInput): string {
  const perfil: string[] = [];
  if (input.nome?.trim()) perfil.push(`Nome: ${input.nome.trim()}`);
  if (input.sexo) perfil.push(`Sexo: ${input.sexo}`);
  if (input.idade) perfil.push(`Idade: ${input.idade} anos`);
  if (input.peso) perfil.push(`Peso (perfil): ${input.peso} kg`);
  if (input.altura) perfil.push(`Altura: ${input.altura} cm`);
  const ativ = rotulo(ATIVIDADE_LABEL, input.nivelAtividade);
  if (ativ) perfil.push(`Nível de atividade: ${ativ}`);
  const obj = rotulo(OBJETIVO_LABEL, input.objetivo);
  if (obj) perfil.push(`Objetivo: ${obj}`);

  const blocos: string[] = [];

  blocos.push(
    perfil.length
      ? `PERFIL DO USUÁRIO:\n${perfil.join("\n")}`
      : "PERFIL DO USUÁRIO: ainda não preenchido."
  );

  blocos.push(
    input.analise
      ? `ÚLTIMA ANÁLISE DO USUÁRIO (use como base do plano que ele segue):\n${formatarAnalise(
          input.analise
        )}`
      : "ÚLTIMA ANÁLISE: o usuário ainda não gerou nenhuma análise. Incentive-o a fazer uma em 'Nova análise' para você ter um plano de referência."
  );

  blocos.push(
    input.checkins.length
      ? `EVOLUÇÃO (check-ins, mais antigo → mais novo):\n${formatarHistoricoCheckins(
          input.checkins
        )}`
      : "EVOLUÇÃO: o usuário ainda não registrou check-ins de peso/medidas."
  );

  return blocos.join("\n\n");
}

/**
 * Pega só as últimas N mensagens do histórico (as mais recentes), mantendo
 * a ordem cronológica. Usado pra limitar tokens enviados ao modelo.
 */
export function limitarHistorico(
  mensagens: MensagemCoach[],
  max = MAX_HISTORICO_COACH
): MensagemCoach[] {
  if (mensagens.length <= max) return mensagens;
  return mensagens.slice(mensagens.length - max);
}
