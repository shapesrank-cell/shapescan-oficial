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

// Preferências específicas DAQUELA análise (rotina muda com o tempo, por isso
// ficam por análise e não no perfil). Tudo opcional — a IA lida com o que faltar.
export type PreferenciasAnalise = {
  // Meta
  pesoAlvo?: number | null; // kg
  prazo?: "1_mes" | "3_meses" | "6_meses" | "sem_pressa" | null;
  // Treino
  diasSemana?: number | null; // 2 a 6
  local?: "academia" | "casa" | "ar_livre" | null;
  experiencia?: "iniciante" | "intermediario" | "avancado" | null;
  lesoes?: string | null;
  // Dieta
  restricoes?: ("lactose" | "gluten" | "vegetariano" | "vegano")[] | null;
  evita?: string | null;
  refeicoesDia?: number | null; // 3 a 6
  orcamento?: "economico" | "medio" | "sem_limite" | null;
};

// Tipos dos dados que o usuário envia no onboarding.
export type DadosUsuario = {
  nome: string;
  sexo: "masculino" | "feminino" | "outro";
  idade: number;
  peso: number; // kg
  altura: number; // cm
  nivelAtividade: "sedentario" | "leve" | "moderado" | "intenso";
  objetivo: "emagrecer" | "ganhar_massa" | "definir" | "saude_geral";
  foto?: string; // base64 da foto do CORPO ATUAL (sem prefixo data:image/...)
  fotoMimeType?: string; // ex: "image/jpeg"
  fotoReferencia?: string; // base64 do SHAPE DE REFERÊNCIA (objetivo visual)
  fotoReferenciaMimeType?: string;
  preferencias?: PreferenciasAnalise;
};

// Rótulos legíveis pra montar o prompt e as telas
export const PRAZO_LABEL: Record<NonNullable<PreferenciasAnalise["prazo"]>, string> = {
  "1_mes": "1 mês",
  "3_meses": "3 meses",
  "6_meses": "6 meses",
  sem_pressa: "sem pressa",
};
export const LOCAL_LABEL: Record<NonNullable<PreferenciasAnalise["local"]>, string> = {
  academia: "Academia",
  casa: "Em casa",
  ar_livre: "Ao ar livre",
};
export const EXPERIENCIA_LABEL: Record<
  NonNullable<PreferenciasAnalise["experiencia"]>,
  string
> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};
export const RESTRICAO_LABEL: Record<
  NonNullable<PreferenciasAnalise["restricoes"]>[number],
  string
> = {
  lactose: "Intolerância a lactose",
  gluten: "Intolerância a glúten",
  vegetariano: "Vegetariano",
  vegano: "Vegano",
};
export const ORCAMENTO_LABEL: Record<
  NonNullable<PreferenciasAnalise["orcamento"]>,
  string
> = {
  economico: "Econômico",
  medio: "Médio",
  sem_limite: "Sem limite",
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
  // Direção estética do objetivo (preenchido a partir da meta/foto de referência).
  // Opcional p/ compatibilidade com análises antigas.
  estiloObjetivo?: string;
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
- Se o usuário enviar uma foto do CORPO ATUAL, analise visualmente a composição corporal (proporção tronco/ombros/cintura, aparência de gordura corporal, postura, etc.) para REFINAR sua avaliação de biotipo. A foto é complementar — os dados manuais continuam sendo a base principal.
- NUNCA faça comentários negativos sobre aparência. Seja respeitoso e motivador.

PERSONALIZAÇÃO PELAS PREFERÊNCIAS DO USUÁRIO (quando informadas):
- As preferências descrevem a ROTINA e o objetivo do usuário NESTE momento. Use-as como restrições reais do plano:
  - Treino: monte a divisão com EXATAMENTE a quantidade de dias/semana informada e SÓ com exercícios possíveis no local indicado (academia = máquinas/barras livres; casa = peso corporal/halteres/elásticos; ar livre = corrida/calistenia). Ajuste volume e complexidade ao nível de experiência. Se houver lesão/limitação, EVITE exercícios que sobrecarreguem a região e ofereça alternativas seguras.
  - Dieta: respeite TODAS as restrições alimentares (lactose, glúten, vegetariano, vegano) — não inclua nenhum item proibido. Não use alimentos que o usuário disse evitar. Monte o número de refeições/dia informado. Ajuste os alimentos ao orçamento (econômico = ovos, frango, arroz, feijão, batata; sem limite = pode incluir cortes nobres, peixes, suplementos variados).
  - Meta: se houver peso-alvo e prazo, calcule um ritmo de ganho/perda REALISTA e SEGURO (perda saudável ~0,5-1% do peso/semana; ganho de massa magro ~0,25-0,5kg/semana). Se o prazo for curto demais pra meta, ajuste pra um ritmo seguro e explique no avisoImportante, sem prometer o impossível.

FOTO DE SHAPE DE REFERÊNCIA (objetivo visual — quando enviada):
- A 2ª imagem é um físico de REFERÊNCIA que o usuário quer alcançar (pode ser de outra pessoa/atleta). Use-a APENAS para definir a DIREÇÃO estética do objetivo: identifique o estilo (ex: volume/força tipo powerlifter; estético e seco tipo clássico; atlético/funcional) e direcione o treino (volume, foco muscular, faixa de repetições) e a dieta (mais hipercalórica para massa, mais controlada para definição) nessa direção.
- REALISMO É OBRIGATÓRIO: NUNCA prometa que o usuário ficará idêntico à referência. Genética, altura, estrutura óssea e tempo são limites reais. Trate a referência como NORTE de estilo, não como garantia de resultado. Não cite nomes de pessoas.

CAMPO estiloObjetivo: sempre preencha com uma frase curta resumindo a DIREÇÃO do físico-alvo do usuário (ex: "Físico estético e seco, ombros largos e cintura fina" ou "Volume e força, ênfase em pernas e costas"). Baseie-se na meta, no objetivo e na foto de referência (se houver).

PLANO DETALHADO DO DIA A DIA (muito importante — é o que o usuário mais valoriza):
- CARDÁPIO (campo dieta.refeicoes): monte um dia típico REAL com 5 a 6 refeições (Café da manhã, Lanche da manhã, Almoço, Lanche da tarde, Jantar e, se fizer sentido, Ceia). Para cada refeição: horário sugerido, calorias aproximadas e 2 a 5 itens com QUANTIDADE concreta (gramas, unidades ou medidas caseiras — ex: "120g de peito de frango", "1 scoop de whey", "2 fatias de pão integral"). A soma das calorias das refeições deve bater aproximadamente com dieta.caloriasEstimadas. Use alimentos brasileiros, acessíveis e coerentes com o objetivo.
- TREINO (campo treino.divisao): monte uma divisão com EXATAMENTE treino.frequenciaSemanal dias (ex: 3 dias = Treino A/B/C). Para cada dia: nome (ex: "Treino A — Peito e Tríceps"), foco (grupos musculares) e 5 a 7 exercícios com séries (número), repetições (faixa, ex: "8-12") e descanso (ex: "60-90s"). Distribua os grupos musculares de forma equilibrada ao longo da semana, coerente com o biotipo e objetivo.`;

/**
 * Formata as preferências da análise num bloco de texto pro prompt.
 * Só inclui o que foi informado (campos vazios são ignorados).
 */
function formatarPreferencias(p?: PreferenciasAnalise): string {
  if (!p) return "";
  const linhas: string[] = [];

  if (p.pesoAlvo) linhas.push(`- Peso-alvo: ${p.pesoAlvo} kg`);
  if (p.prazo) linhas.push(`- Prazo desejado: ${PRAZO_LABEL[p.prazo]}`);
  if (p.diasSemana) linhas.push(`- Dias disponíveis para treinar: ${p.diasSemana}x por semana`);
  if (p.local) linhas.push(`- Onde treina: ${LOCAL_LABEL[p.local]}`);
  if (p.experiencia) linhas.push(`- Experiência com treino: ${EXPERIENCIA_LABEL[p.experiencia]}`);
  if (p.lesoes?.trim()) linhas.push(`- Lesões/limitações: ${p.lesoes.trim()}`);
  if (p.restricoes?.length)
    linhas.push(
      `- Restrições alimentares (NÃO incluir esses itens): ${p.restricoes
        .map((r) => RESTRICAO_LABEL[r])
        .join(", ")}`
    );
  if (p.evita?.trim()) linhas.push(`- Alimentos que NÃO gosta/evita: ${p.evita.trim()}`);
  if (p.refeicoesDia) linhas.push(`- Refeições por dia desejadas: ${p.refeicoesDia}`);
  if (p.orcamento) linhas.push(`- Orçamento para alimentação: ${ORCAMENTO_LABEL[p.orcamento]}`);

  if (linhas.length === 0) return "";
  return `\n\nPREFERÊNCIAS E ROTINA DO USUÁRIO NESTA ANÁLISE (respeite à risca):\n${linhas.join("\n")}`;
}

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

  // Monta as partes da mensagem (texto + preferências + fotos opcionais)
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
Objetivo: ${dados.objetivo}${formatarPreferencias(dados.preferencias)}`,
    },
  ];

  // Foto do CORPO ATUAL (Gemini Vision) — refina o biotipo
  if (dados.foto && dados.fotoMimeType) {
    parts.push({
      text: "A imagem a seguir é a foto do CORPO ATUAL do usuário. Use-a para refinar a avaliação visual do biotipo:",
    });
    parts.push({
      inlineData: { mimeType: dados.fotoMimeType, data: dados.foto },
    });
  }

  // Foto do SHAPE DE REFERÊNCIA — direção estética do objetivo (com realismo)
  if (dados.fotoReferencia && dados.fotoReferenciaMimeType) {
    parts.push({
      text: "A imagem a seguir é um SHAPE DE REFERÊNCIA que o usuário quer alcançar. Use-a apenas como direção estética do objetivo (estilo/foco), com realismo — NÃO prometa resultado idêntico e NÃO cite nomes:",
    });
    parts.push({
      inlineData: {
        mimeType: dados.fotoReferenciaMimeType,
        data: dados.fotoReferencia,
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
          estiloObjetivo: { type: Type.STRING },
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
          "estiloObjetivo",
          "pontosFortes",
          "desafios",
          "dieta",
          "treino",
          "avisoImportante",
        ],
        propertyOrdering: [
          "biotipo",
          "resumoBiotipo",
          "estiloObjetivo",
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
