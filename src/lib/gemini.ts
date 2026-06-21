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
import {
  formatarHistoricoCheckins,
  type CheckinHistorico,
} from "@/lib/relatorio";
import {
  montarContextoCoach,
  type ContextoCoachInput,
  type MensagemCoach,
} from "@/lib/coach";
import type { GrupoMuscular } from "@/lib/ranking";

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

// Uma foto do corpo atual num ângulo específico. base64 SEM o prefixo data:.
export type AnaliseFoto = {
  data: string;
  mimeType: string;
  angulo: "frente" | "costas" | "lado";
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
  // Fotos do CORPO ATUAL em vários ângulos (frente/costas/lado). Preferencial.
  fotos?: AnaliseFoto[];
  foto?: string; // (legado) base64 da foto do CORPO ATUAL — tratada como "frente"
  fotoMimeType?: string; // ex: "image/jpeg"
  fotoReferencia?: string; // base64 do SHAPE DE REFERÊNCIA (objetivo visual)
  fotoReferenciaMimeType?: string;
  preferencias?: PreferenciasAnalise;
  // Circunferências (cm) vindas do último check-in da Evolução. Refinam o
  // ranking por grupo. Todas opcionais — a IA lida com o que faltar.
  medidas?: {
    cintura?: number | null;
    quadril?: number | null;
    braco?: number | null;
    peito?: number | null;
    coxa?: number | null;
    ombros?: number | null;
    panturrilha?: number | null;
    antebraco?: number | null;
    pescoco?: number | null;
    registradoEm?: string | null; // data do check-in de origem (dd/mm/aaaa)
  };
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
  // Ranking de ELO por grupo muscular. Só vem quando há foto do corpo atual
  // (opcional p/ análises antigas e análises sem foto).
  ranking?: {
    grupos: {
      grupo: GrupoMuscular;
      nota: number; // 0–100, nível de desenvolvimento do treino
      comentario: string; // 1 frase curta, motivadora e respeitosa
    }[];
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
- TREINO (campo treino.divisao): monte uma divisão com EXATAMENTE treino.frequenciaSemanal dias (ex: 3 dias = Treino A/B/C). Para cada dia: nome (ex: "Treino A — Peito e Tríceps"), foco (grupos musculares) e 5 a 7 exercícios com séries (número), repetições (faixa, ex: "8-12") e descanso (ex: "60-90s"). Distribua os grupos musculares de forma equilibrada ao longo da semana, coerente com o biotipo e objetivo.

RANKING DE SHAPE (campo ranking — PREENCHA APENAS se o usuário enviou ao menos uma foto do CORPO ATUAL; se NÃO houver nenhuma foto do corpo atual, OMITA o campo ranking por completo):
- Avalie o NÍVEL DE DESENVOLVIMENTO MUSCULAR visível de cada grupo e dê uma NOTA de 0 a 100 (0 = início da jornada/pouco desenvolvido; 100 = nível de atleta de elite). Avalie SOMENTE pelo que dá pra ver nas fotos; se um grupo não estiver claramente visível em nenhuma foto, estime de forma conservadora pelo restante do corpo.
- Podem vir VÁRIAS fotos do corpo em ângulos diferentes (frente, costas, lado). COMBINE todos os ângulos e avalie cada grupo pelo ângulo que melhor o mostra: costas/trapézio/dorsais, tríceps, glúteos e posterior de coxa pela foto de COSTAS; peito, ombros, abdômen e quadríceps pela de FRENTE; abdômen e postura também pela de LADO. Só estime um grupo quando ele não aparecer em nenhuma das fotos.
- Use EXATAMENTE estes 6 ids de grupo (todos os 6, uma vez cada): peito, costas, ombros, bracos, abdomen, pernas.
- Se houver MEDIDAS CORPORAIS (circunferências), use-as para calibrar as notas com mais precisão, combinando-as com a foto: peito/tórax → grupo peito; ombros → ombros; braço e antebraço → bracos; coxa e panturrilha → pernas; cintura, quadril e pescoço ajudam a estimar o percentual de gordura e o desenvolvimento do abdomen. As medidas tornam a avaliação mais objetiva — leve-as a sério, mas a foto continua sendo a base visual.
- Para cada grupo escreva um "comentario" de 1 frase curta, MOTIVADOR e RESPEITOSO. É sobre desenvolvimento de TREINO, NUNCA sobre beleza ou estética pessoal. Mesmo notas baixas devem soar como "ponto de partida com bom potencial", jamais como crítica ofensiva.
- CALIBRAÇÃO honesta (não infle): a maioria das pessoas comuns fica entre 20 e 60. Notas acima de 80 são raras (físico bem avançado); acima de 90, nível atlético de elite. Seja justo e coerente com o que a foto mostra.`;

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
 * Formata as circunferências corporais (último check-in) num bloco pro prompt.
 * Só inclui o que foi medido. Servem pra CALIBRAR o ranking por grupo.
 */
function formatarMedidas(m?: DadosUsuario["medidas"]): string {
  if (!m) return "";
  const linhas: string[] = [];
  if (m.peito != null) linhas.push(`- Peito/tórax: ${m.peito} cm`);
  if (m.ombros != null) linhas.push(`- Ombros: ${m.ombros} cm`);
  if (m.braco != null) linhas.push(`- Braço: ${m.braco} cm`);
  if (m.antebraco != null) linhas.push(`- Antebraço: ${m.antebraco} cm`);
  if (m.cintura != null) linhas.push(`- Cintura: ${m.cintura} cm`);
  if (m.quadril != null) linhas.push(`- Quadril: ${m.quadril} cm`);
  if (m.coxa != null) linhas.push(`- Coxa: ${m.coxa} cm`);
  if (m.panturrilha != null) linhas.push(`- Panturrilha: ${m.panturrilha} cm`);
  if (m.pescoco != null) linhas.push(`- Pescoço: ${m.pescoco} cm`);
  if (linhas.length === 0) return "";
  const quando = m.registradoEm ? ` (registradas em ${m.registradoEm})` : "";
  return `\n\nMEDIDAS CORPORAIS DO USUÁRIO${quando} — circunferências reais, use-as junto com a foto para CALIBRAR as notas do ranking por grupo com mais precisão:\n${linhas.join(
    "\n"
  )}`;
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
Objetivo: ${dados.objetivo}${formatarPreferencias(dados.preferencias)}${formatarMedidas(dados.medidas)}`,
    },
  ];

  // Fotos do CORPO ATUAL (Gemini Vision) — refinam o biotipo e o ranking por
  // grupo. Aceita vários ângulos; cai no campo legado `foto` se vier só ele.
  const ANGULO_LABEL: Record<AnaliseFoto["angulo"], string> = {
    frente: "FRENTE (mostra peito, ombros, braços, abdômen e quadríceps)",
    costas:
      "COSTAS, braços abertos (mostra dorsais, trapézio, tríceps, glúteos, posterior de coxa e panturrilha)",
    lado: "LADO/perfil (mostra abdômen, postura e projeção de peito/glúteo)",
  };
  const fotosCorpo: AnaliseFoto[] =
    dados.fotos && dados.fotos.length > 0
      ? dados.fotos
      : dados.foto && dados.fotoMimeType
        ? [{ data: dados.foto, mimeType: dados.fotoMimeType, angulo: "frente" }]
        : [];

  for (const f of fotosCorpo) {
    parts.push({
      text: `A imagem a seguir é uma foto do CORPO ATUAL do usuário — ângulo ${ANGULO_LABEL[f.angulo]}. Use-a para avaliar visualmente o biotipo e os grupos musculares visíveis nesse ângulo:`,
    });
    parts.push({ inlineData: { mimeType: f.mimeType, data: f.data } });
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
          ranking: {
            type: Type.OBJECT,
            properties: {
              grupos: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    grupo: {
                      type: Type.STRING,
                      enum: [
                        "peito",
                        "costas",
                        "ombros",
                        "bracos",
                        "abdomen",
                        "pernas",
                      ],
                    },
                    nota: { type: Type.NUMBER },
                    comentario: { type: Type.STRING },
                  },
                  required: ["grupo", "nota", "comentario"],
                  propertyOrdering: ["grupo", "nota", "comentario"],
                },
              },
            },
            required: ["grupos"],
            propertyOrdering: ["grupos"],
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
          "ranking",
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

// ============================================
// Relatório de Evolução (análise do progresso dos check-ins)
// ============================================

export type RelatorioInput = {
  sexo: string;
  idade?: number | null;
  objetivo?: string | null; // objetivo do perfil
  biotipo?: string | null; // da última análise (se houver)
  checkins: CheckinHistorico[];
};

export type RelatorioEvolucao = {
  resumoGeral: string;
  tendenciaPeso: {
    direcao: "subindo" | "descendo" | "estavel";
    analise: string;
  };
  destaques: string[]; // o que melhorou / está indo bem
  pontosAtencao: string[]; // o que estagnou / precisa de atenção
  ajustesPlano: {
    dieta: string[];
    treino: string[];
  };
  proximoPasso: string;
  avisoImportante: string;
};

const PROMPT_RELATORIO = `Você é um coach de fitness do app ShapeScan analisando a EVOLUÇÃO de um usuário ao longo do tempo, com base nos check-ins (peso e medidas) que ele registrou.

REGRAS:
- Português brasileiro, tom motivador mas HONESTO. Nunca invente progresso que os números não mostram.
- Baseie TODA conclusão nos dados reais dos check-ins (linha do tempo e variações fornecidas). Cruze com o objetivo do usuário (emagrecer, ganhar massa, definir, saúde geral) e o biotipo, quando informados.
- tendenciaPeso.direcao: classifique como "subindo", "descendo" ou "estavel" conforme a variação real de peso.
- destaques: 2 a 4 pontos do que está indo BEM (alinhado ao objetivo). Se o usuário quer emagrecer e o peso/cintura caíram, isso é destaque. Se quer ganhar massa e o peso subiu de forma controlada, idem.
- pontosAtencao: 2 a 4 pontos honestos do que estagnou, regrediu ou merece cuidado. Se faltam dados (poucos check-ins, medidas em branco), aponte com gentileza.
- ajustesPlano: sugestões CONCRETAS e acionáveis pra dieta (2-4) e treino (2-4), coerentes com a tendência observada e o objetivo. Ex: "aumentar proteína se a massa não subiu", "incluir mais cardio se o peso estagnou no déficit".
- proximoPasso: 1 frase motivadora com a ação mais importante pra próxima fase.
- NUNCA faça comentários negativos sobre aparência/corpo. Foque em comportamento e números.
- avisoImportante: SEMPRE lembre que é uma análise de IA e não substitui acompanhamento profissional (nutricionista/educador físico/médico).`;

/**
 * Gera um relatório de evolução analisando o histórico de check-ins do usuário.
 */
export async function gerarRelatorioEvolucao(
  input: RelatorioInput,
  apiKey?: string
): Promise<RelatorioEvolucao> {
  const gemini = criarClienteGemini(apiKey);

  const contexto = [
    `Objetivo do usuário: ${input.objetivo ?? "não informado"}`,
    `Sexo: ${input.sexo}`,
    input.idade ? `Idade: ${input.idade} anos` : null,
    input.biotipo ? `Biotipo (última análise): ${input.biotipo}` : null,
    "",
    "DADOS DOS CHECK-INS:",
    formatarHistoricoCheckins(input.checkins),
  ]
    .filter(Boolean)
    .join("\n");

  const resposta = await gemini.models.generateContent({
    model: SHAPESCAN_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Analise a evolução abaixo e gere o relatório de progresso:\n\n${contexto}`,
          },
        ],
      },
    ],
    config: {
      systemInstruction: PROMPT_RELATORIO,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          resumoGeral: { type: Type.STRING },
          tendenciaPeso: {
            type: Type.OBJECT,
            properties: {
              direcao: {
                type: Type.STRING,
                enum: ["subindo", "descendo", "estavel"],
              },
              analise: { type: Type.STRING },
            },
            required: ["direcao", "analise"],
            propertyOrdering: ["direcao", "analise"],
          },
          destaques: { type: Type.ARRAY, items: { type: Type.STRING } },
          pontosAtencao: { type: Type.ARRAY, items: { type: Type.STRING } },
          ajustesPlano: {
            type: Type.OBJECT,
            properties: {
              dieta: { type: Type.ARRAY, items: { type: Type.STRING } },
              treino: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["dieta", "treino"],
            propertyOrdering: ["dieta", "treino"],
          },
          proximoPasso: { type: Type.STRING },
          avisoImportante: { type: Type.STRING },
        },
        required: [
          "resumoGeral",
          "tendenciaPeso",
          "destaques",
          "pontosAtencao",
          "ajustesPlano",
          "proximoPasso",
          "avisoImportante",
        ],
        propertyOrdering: [
          "resumoGeral",
          "tendenciaPeso",
          "destaques",
          "pontosAtencao",
          "ajustesPlano",
          "proximoPasso",
          "avisoImportante",
        ],
      },
    },
  });

  const texto = resposta.text;
  if (!texto) {
    throw new Error("A IA não retornou nenhuma resposta.");
  }

  return JSON.parse(texto) as RelatorioEvolucao;
}

// ============================================
// Coach IA conversacional (chat com contexto do usuário)
// ============================================

const PROMPT_COACH = `Você é o Coach IA do ShapeScan: um treinador/nutricionista virtual amigável que conversa com o usuário sobre treino, dieta e evolução corporal.

REGRAS DE COMPORTAMENTO:
- Português brasileiro, tom de coach: próximo, motivador e direto, mas SEMPRE honesto. Nunca invente progresso ou prometa resultados garantidos.
- Você TEM o contexto do usuário abaixo (perfil, última análise e check-ins). USE esses dados pra responder de forma personalizada — cite o plano, o objetivo e os números reais dele quando fizer sentido.
- Responda de forma CONCISA e prática (geralmente 1 a 3 parágrafos curtos, ou uma lista de poucos itens). Nada de textos enormes. Vá ao ponto.
- Pode usar listas simples com "- " quando ajudar a organizar (ex: passos, opções de substituição). Não use tabelas nem markdown pesado.
- Se o usuário pedir mudança no plano (trocar um alimento, ajustar treino), dê alternativas concretas coerentes com o objetivo e as restrições dele.
- Se faltar informação no contexto (ex: sem análise ou sem check-ins), diga isso com gentileza e oriente o próximo passo (gerar análise / registrar check-in).
- NUNCA faça comentários negativos sobre aparência ou peso. Foque em comportamento, hábitos e números.
- SEGURANÇA: você é uma IA e NÃO substitui um médico, nutricionista ou educador físico. Quando o usuário trouxer dor, lesão, sintoma, uso de remédios/suplementos pesados, dietas muito restritivas ou metas extremas, recomende procurar um profissional de verdade. Não dê diagnóstico médico.
- Mantenha o foco em fitness, nutrição e bem-estar do ShapeScan. Se perguntarem algo totalmente fora disso, redirecione gentilmente pro tema do app.

SISTEMA DE RANKING DO SHAPESCAN (conheça bem — o usuário VAI se referir a isso):
- O ShapeScan dá ao usuário um "rank de shape" estilo jogo, calculado pela IA a partir de uma foto do corpo. Cada grupo muscular (peito, costas, ombros, braços, abdômen, pernas) recebe pontos de ELO (0 a 3.000) e o Rank Geral é a média dos grupos.
- Os tiers, do MAIS BAIXO ao MAIS ALTO, são: Ferro → Bronze → Prata → Ouro → Platina → Diamante → Mestre → Desafiante. "Mestre" e "Desafiante" são os DOIS tiers mais altos do app — NÃO trate como gíria de games nem peça pro usuário explicar; ele está falando do ranking do ShapeScan.
- Quando o usuário perguntar coisas como "o que falta pra eu pegar Mestre/Diamante/Ouro?" ou "como subir de rank?", ele quer saber como evoluir no ranking. Use o bloco "RANKING DE SHAPE DO USUÁRIO" do contexto (rank atual, pontos e quanto falta pro próximo tier) pra responder com NÚMEROS REAIS e diga em quais grupos focar pra subir (cite o grupo de maior potencial). Se não houver ranking no contexto, explique que ele desbloqueia o rank fazendo uma análise com foto do corpo.
- É sempre "ele vs. ele mesmo" — o ranking é pessoal, não há comparação/leaderboard com outras pessoas.

MAPA DO APP (você DOMINA o ShapeScan — quando o usuário perguntar onde fazer algo ou como uma função funciona, explique e indique o caminho exato pela navegação: Início · Ranking · Plano · (botão central +) Nova análise · Evolução · Coach · Perfil):
- INÍCIO (dashboard): tela inicial. Tem a Ofensiva (streak) com o botão "Cumpri hoje" 🔥 pra marcar que treinou/seguiu o plano e manter a sequência; resumo (biotipo, IMC, nº de análises); atalhos pras seções; e o histórico de análises.
- NOVA ANÁLISE (botão laranja "+" no centro): o coração do app. O usuário envia uma FOTO do corpo (frente recomendada; costas e lado opcionais deixam o ranking mais preciso) e pode, opcionalmente, mandar uma foto de "shape de referência" (físico que quer alcançar) e personalizar treino/dieta (peso-alvo, prazo, dias de treino, local, experiência, lesões, restrições alimentares, orçamento). Gera biotipo + dieta + treino + ranking. Só o que tem foto do corpo gera ranking.
- RANKING: o rank de shape. Tem 3 abas internas — "Meu Rank" (rank geral + 6 grupos + botão de compartilhar o card + "Foco da vez" com o grupo a focar + evolução do rank no tempo), "Medidas" (registrar medidas e ver Proporção & simetria: V-taper ombro:cintura, cintura:altura, braço:panturrilha) e "Guia" (como funciona + escada de tiers).
- PLANO: o protocolo da última análise, com 2 abas — "Treino" (frequência, foco, exercícios e a divisão da semana, ex: Treino A/B/C com séries, reps e descanso) e "Dieta" (calorias, macros e o cardápio do dia).
- EVOLUÇÃO: acompanhamento no tempo. O usuário registra check-ins (peso + medidas + foto de progresso + observações) em "Check-in"; vê gráfico de peso, comparação de medidas, comparador de fotos antes/depois e um relatório de evolução feito por IA.
- PERFIL: editar nome, sexo, idade, peso, altura, nível de atividade e objetivo. Dali acessa CONFIGURAÇÕES (trocar senha, baixar seus dados em JSON pela LGPD, deletar a conta).
- COMPARAR: quando há 2+ análises, dá pra comparar duas lado a lado (botão "Comparar" no histórico do Início).
- Quando indicar uma ação, seja específico: ex. "pra registrar seu peso, vá em Evolução → Check-in" ou "pra atualizar seu objetivo, vá em Perfil".

A seguir, o CONTEXTO REAL deste usuário. Baseie suas respostas nele:`;

/**
 * Responde no chat do Coach IA usando STREAMING.
 * Retorna um AsyncGenerator de chunks — quem chama itera e repassa o texto.
 *
 * @param contexto   Perfil + última análise + check-ins do usuário
 * @param historico  Mensagens da conversa (ordem cronológica, já limitada),
 *                   INCLUINDO a última mensagem do usuário no final.
 * @param apiKey     (Opcional) Chave vinda do banco; usa GEMINI_API_KEY se omitida.
 */
export async function responderCoach(
  contexto: ContextoCoachInput,
  historico: MensagemCoach[],
  apiKey?: string
) {
  const gemini = criarClienteGemini(apiKey);
  const blocoContexto = montarContextoCoach(contexto);

  const contents = historico.map((m) => ({
    role: m.papel === "assistente" ? "model" : "user",
    parts: [{ text: m.conteudo }],
  }));

  return gemini.models.generateContentStream({
    model: SHAPESCAN_MODEL,
    contents,
    config: {
      systemInstruction: `${PROMPT_COACH}\n\n${blocoContexto}`,
    },
  });
}
