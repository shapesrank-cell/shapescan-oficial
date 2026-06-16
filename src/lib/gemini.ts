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

// Modelo padrão do ShapeScan. Flash é rápido e gratuito até certo limite.
export const SHAPESCAN_MODEL = "gemini-2.5-flash";

/**
 * Cria uma instância do cliente Gemini.
 * Se apiKey for fornecida (vinda do banco via admin), usa ela.
 * Caso contrário, usa a variável de ambiente GEMINI_API_KEY.
 */
function criarClienteGemini(apiKey?: string) {
  return new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY });
}

// Tipos dos dados que o usuário envia no onboarding.
export type DadosUsuario = {
  nome: string;
  sexo: "masculino" | "feminino" | "outro";
  idade: number;
  peso: number; // kg
  altura: number; // cm
  nivelAtividade: "sedentario" | "leve" | "moderado" | "intenso";
  objetivo: "emagrecer" | "ganhar_massa" | "definir" | "saude_geral";
  foto?: string; // base64 da foto (sem prefixo data:image/...)
  fotoMimeType?: string; // ex: "image/jpeg"
};

// Uma refeição do cardápio do dia (ex: café da manhã com itens e porções).
export type Refeicao = {
  nome: string; // "Café da manhã", "Almoço", "Lanche da tarde"...
  horario: string; // "07:00"
  calorias: number; // calorias aproximadas da refeição
  itens: { alimento: string; quantidade: string }[]; // "Ovos mexidos" / "3 unidades"
};

// Um dia de treino da divisão semanal (ex: Treino A — Peito e Tríceps).
export type DiaTreino = {
  nome: string; // "Treino A — Peito e Tríceps"
  foco: string; // grupos musculares trabalhados
  exercicios: {
    nome: string; // "Supino reto com barra"
    series: number; // 4
    repeticoes: string; // "8-12" (string pra aceitar faixas e "até a falha")
    descanso: string; // "60-90s"
  }[];
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
    // Cardápio detalhado de um dia típico (opcional p/ análises antigas)
    refeicoes?: Refeicao[];
  };
  treino: {
    frequenciaSemanal: number;
    focoPrincipal: string;
    exerciciosRecomendados: string[];
    // Divisão de treino dia a dia (opcional p/ análises antigas)
    divisao?: DiaTreino[];
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
- Seja específico nos exercícios e alimentos sugeridos (4 a 6 itens em cada lista).
- Se o usuário enviar uma foto, analise visualmente a composição corporal (proporção tronco/ombros/cintura, aparência de gordura corporal, postura, etc.) para REFINAR sua avaliação de biotipo. A foto é complementar — os dados manuais continuam sendo a base principal.
- NUNCA faça comentários negativos sobre aparência. Seja respeitoso e motivador.

PLANO DETALHADO DO DIA A DIA (muito importante — é o que o usuário mais valoriza):
- CARDÁPIO (campo dieta.refeicoes): monte um dia típico REAL com 5 a 6 refeições (Café da manhã, Lanche da manhã, Almoço, Lanche da tarde, Jantar e, se fizer sentido, Ceia). Para cada refeição: horário sugerido, calorias aproximadas e 2 a 5 itens com QUANTIDADE concreta (gramas, unidades ou medidas caseiras — ex: "120g de peito de frango", "1 scoop de whey", "2 fatias de pão integral"). A soma das calorias das refeições deve bater aproximadamente com dieta.caloriasEstimadas. Use alimentos brasileiros, acessíveis e coerentes com o objetivo.
- TREINO (campo treino.divisao): monte uma divisão com EXATAMENTE treino.frequenciaSemanal dias (ex: 3 dias = Treino A/B/C). Para cada dia: nome (ex: "Treino A — Peito e Tríceps"), foco (grupos musculares) e 5 a 7 exercícios com séries (número), repetições (faixa, ex: "8-12") e descanso (ex: "60-90s"). Distribua os grupos musculares de forma equilibrada ao longo da semana, coerente com o biotipo e objetivo.`;

/**
 * Gera análise completa de biotipo para os dados informados.
 * Retorna um objeto JSON tipado e validado pela própria Gemini.
 *
 * @param dados    Dados do usuário vindos do onboarding
 * @param apiKey   (Opcional) Chave de API vinda do banco (admin). Usa GEMINI_API_KEY do env se omitido.
 */
export async function gerarAnaliseBiotipo(
  dados: DadosUsuario,
  apiKey?: string
): Promise<AnaliseBiotipo> {
  const gemini = criarClienteGemini(apiKey);

  // Monta as partes da mensagem (texto + foto opcional)
  const parts: Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  > = [
    {
      text: `Analise os seguintes dados e gere a análise completa:

Nome: ${dados.nome}
Sexo: ${dados.sexo}
Idade: ${dados.idade} anos
Peso: ${dados.peso} kg
Altura: ${dados.altura} cm
Nível de atividade: ${dados.nivelAtividade}
Objetivo: ${dados.objetivo}${dados.foto ? "\n\nO usuário também enviou uma foto para refinar a análise visual do biotipo." : ""}`,
    },
  ];

  // Se tem foto, adiciona como parte visual (Gemini Vision)
  if (dados.foto && dados.fotoMimeType) {
    parts.push({
      inlineData: {
        mimeType: dados.fotoMimeType,
        data: dados.foto,
      },
    });
  }

  const resposta = await gemini.models.generateContent({
    model: SHAPESCAN_MODEL,
    contents: [
      {
        role: "user",
        parts,
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
              refeicoes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nome: { type: Type.STRING },
                    horario: { type: Type.STRING },
                    calorias: { type: Type.NUMBER },
                    itens: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          alimento: { type: Type.STRING },
                          quantidade: { type: Type.STRING },
                        },
                        required: ["alimento", "quantidade"],
                        propertyOrdering: ["alimento", "quantidade"],
                      },
                    },
                  },
                  required: ["nome", "horario", "calorias", "itens"],
                  propertyOrdering: ["nome", "horario", "calorias", "itens"],
                },
              },
            },
            required: [
              "caloriasEstimadas",
              "distribuicaoMacros",
              "sugestoesAlimentares",
              "refeicoes",
            ],
            propertyOrdering: [
              "caloriasEstimadas",
              "distribuicaoMacros",
              "sugestoesAlimentares",
              "refeicoes",
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
              divisao: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nome: { type: Type.STRING },
                    foco: { type: Type.STRING },
                    exercicios: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          nome: { type: Type.STRING },
                          series: { type: Type.NUMBER },
                          repeticoes: { type: Type.STRING },
                          descanso: { type: Type.STRING },
                        },
                        required: ["nome", "series", "repeticoes", "descanso"],
                        propertyOrdering: [
                          "nome",
                          "series",
                          "repeticoes",
                          "descanso",
                        ],
                      },
                    },
                  },
                  required: ["nome", "foco", "exercicios"],
                  propertyOrdering: ["nome", "foco", "exercicios"],
                },
              },
            },
            required: [
              "frequenciaSemanal",
              "focoPrincipal",
              "exerciciosRecomendados",
              "divisao",
            ],
            propertyOrdering: [
              "frequenciaSemanal",
              "focoPrincipal",
              "exerciciosRecomendados",
              "divisao",
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
