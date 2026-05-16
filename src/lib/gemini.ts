/**
 * Cliente Google Gemini para análise de biotipo e geração de planos.
 *
 * IMPORTANTE: este cliente só pode ser usado no SERVIDOR (API Routes, Server Actions).
 * Nunca importe este arquivo em componentes do lado cliente.
 *
 * O modelo escolhido (gemini-2.5-flash) é gratuito dentro da cota e
 * rápido — perfeito para o MVP do ShapeScan.
 */
import { GoogleGenAI, Type } from "@google/genai";

export const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Modelo padrão do ShapeScan. Flash é rápido e gratuito até certo limite.
export const SHAPESCAN_MODEL = "gemini-2.5-flash";

// Tipos dos dados que o usuário envia no onboarding.
export type DadosUsuario = {
  nome: string;
  sexo: "masculino" | "feminino" | "outro";
  idade: number;
  peso: number; // kg
  altura: number; // cm
  nivelAtividade: "sedentario" | "leve" | "moderado" | "intenso";
  objetivo: "emagrecer" | "ganhar_massa" | "definir" | "saude_geral";
};

// Formato da resposta que a IA vai gerar.
export type AnaliseBiotipo = {
  biotipo: "ectomorfo" | "mesomorfo" | "endomorfo" | "misto";
  resumoBiotipo: string;
  pontosFortes: string[];
  desafios: string[];
  dieta: {
    caloriasEstimadas: number;
    distribuicaoMacros: {
      proteinaGramas: number;
      carboidratoGramas: number;
      gorduraGramas: number;
    };
    sugestoesAlimentares: string[];
  };
  treino: {
    frequenciaSemanal: number;
    focoPrincipal: string;
    exerciciosRecomendados: string[];
  };
  avisoImportante: string;
};

const PROMPT_SISTEMA = `Você é um assistente especializado em análise corporal e fitness do app ShapeScan.

Sua função é analisar os dados do usuário e gerar uma análise personalizada de biotipo, dieta e treino.

REGRAS:
- Use linguagem amigável, em português brasileiro, motivadora mas honesta.
- Baseie suas recomendações em conhecimento estabelecido sobre biotipos (ectomorfo, mesomorfo, endomorfo).
- Calorias devem ser realistas considerando idade, peso, altura, sexo, atividade e objetivo (use a fórmula de Mifflin-St Jeor + fator de atividade).
- Para o objetivo "emagrecer", crie déficit de ~500 kcal. Para "ganhar_massa", superávit de ~300 kcal.
- Distribuição de macros deve somar coerentemente as calorias (proteína 4 kcal/g, carbo 4 kcal/g, gordura 9 kcal/g).
- SEMPRE inclua o avisoImportante lembrando que isto é uma sugestão de IA e não substitui acompanhamento profissional.
- Seja específico nos exercícios e alimentos sugeridos (4 a 6 itens em cada lista).`;

/**
 * Gera análise completa de biotipo para os dados informados.
 * Retorna um objeto JSON tipado e validado pela própria Gemini.
 */
export async function gerarAnaliseBiotipo(
  dados: DadosUsuario
): Promise<AnaliseBiotipo> {
  const resposta = await gemini.models.generateContent({
    model: SHAPESCAN_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Analise os seguintes dados e gere a análise completa:

Nome: ${dados.nome}
Sexo: ${dados.sexo}
Idade: ${dados.idade} anos
Peso: ${dados.peso} kg
Altura: ${dados.altura} cm
Nível de atividade: ${dados.nivelAtividade}
Objetivo: ${dados.objetivo}`,
          },
        ],
      },
    ],
    config: {
      systemInstruction: PROMPT_SISTEMA,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          biotipo: {
            type: Type.STRING,
            enum: ["ectomorfo", "mesomorfo", "endomorfo", "misto"],
          },
          resumoBiotipo: { type: Type.STRING },
          pontosFortes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          desafios: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          dieta: {
            type: Type.OBJECT,
            properties: {
              caloriasEstimadas: { type: Type.NUMBER },
              distribuicaoMacros: {
                type: Type.OBJECT,
                properties: {
                  proteinaGramas: { type: Type.NUMBER },
                  carboidratoGramas: { type: Type.NUMBER },
                  gorduraGramas: { type: Type.NUMBER },
                },
                required: [
                  "proteinaGramas",
                  "carboidratoGramas",
                  "gorduraGramas",
                ],
                propertyOrdering: [
                  "proteinaGramas",
                  "carboidratoGramas",
                  "gorduraGramas",
                ],
              },
              sugestoesAlimentares: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              "caloriasEstimadas",
              "distribuicaoMacros",
              "sugestoesAlimentares",
            ],
            propertyOrdering: [
              "caloriasEstimadas",
              "distribuicaoMacros",
              "sugestoesAlimentares",
            ],
          },
          treino: {
            type: Type.OBJECT,
            properties: {
              frequenciaSemanal: { type: Type.NUMBER },
              focoPrincipal: { type: Type.STRING },
              exerciciosRecomendados: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              "frequenciaSemanal",
              "focoPrincipal",
              "exerciciosRecomendados",
            ],
            propertyOrdering: [
              "frequenciaSemanal",
              "focoPrincipal",
              "exerciciosRecomendados",
            ],
          },
          avisoImportante: { type: Type.STRING },
        },
        required: [
          "biotipo",
          "resumoBiotipo",
          "pontosFortes",
          "desafios",
          "dieta",
          "treino",
          "avisoImportante",
        ],
        propertyOrdering: [
          "biotipo",
          "resumoBiotipo",
          "pontosFortes",
          "desafios",
          "dieta",
          "treino",
          "avisoImportante",
        ],
      },
    },
  });

  const texto = resposta.text;
  if (!texto) {
    throw new Error("A IA não retornou nenhuma resposta.");
  }

  return JSON.parse(texto) as AnaliseBiotipo;
}
