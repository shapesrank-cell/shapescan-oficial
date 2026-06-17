import { describe, it, expect } from "vitest";
import {
  montarContextoCoach,
  limitarHistorico,
  MAX_HISTORICO_COACH,
  type ContextoCoachInput,
  type MensagemCoach,
} from "./coach";
import type { AnaliseBiotipo } from "./gemini";

const analiseBase: AnaliseBiotipo = {
  biotipo: "mesomorfo",
  resumoBiotipo: "Estrutura atlética, ganha massa com facilidade.",
  estiloObjetivo: "Físico estético e seco",
  pontosFortes: ["Ombros largos"],
  desafios: ["Acúmulo na cintura"],
  dieta: {
    caloriasEstimadas: 2400,
    distribuicaoMacros: {
      proteinaGramas: 180,
      carboidratoGramas: 250,
      gorduraGramas: 70,
    },
    sugestoesAlimentares: ["Frango", "Arroz", "Ovos"],
    refeicoes: [
      {
        nome: "Café da manhã",
        horario: "07:00",
        calorias: 500,
        itens: [{ alimento: "ovos", quantidade: "3 unidades" }],
      },
    ],
  },
  treino: {
    frequenciaSemanal: 4,
    focoPrincipal: "Hipertrofia",
    exerciciosRecomendados: ["Supino"],
    divisao: [
      {
        nome: "Treino A — Peito e Tríceps",
        foco: "Peito, tríceps",
        exercicios: [
          { nome: "Supino reto", series: 4, repeticoes: "8-12", descanso: "90s" },
        ],
      },
    ],
  },
  avisoImportante: "Sugestão de IA, não substitui profissional.",
};

describe("montarContextoCoach", () => {
  it("inclui o perfil com rótulos legíveis", () => {
    const input: ContextoCoachInput = {
      nome: "Cauê",
      sexo: "masculino",
      idade: 28,
      peso: 80,
      altura: 178,
      nivelAtividade: "moderado",
      objetivo: "ganhar_massa",
      analise: null,
      checkins: [],
    };
    const txt = montarContextoCoach(input);
    expect(txt).toContain("Nome: Cauê");
    expect(txt).toContain("Idade: 28 anos");
    expect(txt).toContain("Moderadamente ativo");
    expect(txt).toContain("Ganhar massa muscular");
  });

  it("avisa quando não há análise nem check-ins", () => {
    const txt = montarContextoCoach({ checkins: [] });
    expect(txt).toMatch(/ainda não gerou nenhuma análise/i);
    expect(txt).toMatch(/ainda não registrou check-ins/i);
    expect(txt).toMatch(/ainda não preenchido/i);
  });

  it("formata a análise com dieta e treino do plano", () => {
    const txt = montarContextoCoach({
      objetivo: "definir",
      analise: analiseBase,
      checkins: [],
    });
    expect(txt).toContain("Biotipo: Mesomorfo");
    expect(txt).toContain("2400 kcal/dia");
    expect(txt).toContain("180g proteína");
    expect(txt).toContain("Café da manhã");
    expect(txt).toContain("Treino A — Peito e Tríceps");
    expect(txt).toContain("Supino reto 4x8-12");
  });

  it("inclui o histórico de check-ins quando há", () => {
    const txt = montarContextoCoach({
      checkins: [
        { data: "2026-06-01", peso: 80 },
        { data: "2026-06-10", peso: 78 },
      ],
    });
    expect(txt).toContain("Total de check-ins: 2");
    expect(txt).toContain("peso -2kg");
  });
});

describe("limitarHistorico", () => {
  function gerar(n: number): MensagemCoach[] {
    return Array.from({ length: n }, (_, i) => ({
      papel: (i % 2 === 0 ? "user" : "assistente") as MensagemCoach["papel"],
      conteudo: `msg ${i}`,
    }));
  }

  it("não corta quando está dentro do limite", () => {
    const h = gerar(5);
    expect(limitarHistorico(h)).toHaveLength(5);
  });

  it("mantém só as mensagens mais recentes preservando a ordem", () => {
    const h = gerar(MAX_HISTORICO_COACH + 4);
    const r = limitarHistorico(h);
    expect(r).toHaveLength(MAX_HISTORICO_COACH);
    // A primeira do resultado deve ser a 5ª original (índice 4)
    expect(r[0].conteudo).toBe("msg 4");
    expect(r[r.length - 1].conteudo).toBe(`msg ${MAX_HISTORICO_COACH + 3}`);
  });
});
