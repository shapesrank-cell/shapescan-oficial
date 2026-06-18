/**
 * Lógica PURA do Ranking de ELO por shape.
 * Sem dependência de servidor → testável no Vitest (igual a streak.ts).
 *
 * A IA dá uma NOTA de 0 a 100 de desenvolvimento por grupo muscular (só quando
 * há foto do corpo atual). Aqui convertemos essa nota em pontos de ELO (0–3000)
 * e num TIER nomeado (estilo LoL/Valorant). O cálculo é determinístico.
 */

export type GrupoMuscular =
  | "peito"
  | "costas"
  | "ombros"
  | "bracos"
  | "abdomen"
  | "pernas";

// Ordem canônica de exibição dos grupos.
export const GRUPOS_ORDEM: GrupoMuscular[] = [
  "peito",
  "costas",
  "ombros",
  "bracos",
  "abdomen",
  "pernas",
];

export const GRUPO_LABEL: Record<GrupoMuscular, string> = {
  peito: "Peito",
  costas: "Costas",
  ombros: "Ombros",
  bracos: "Braços",
  abdomen: "Abdômen",
  pernas: "Pernas & Glúteos",
};

export type TierId =
  | "ferro"
  | "bronze"
  | "prata"
  | "ouro"
  | "platina"
  | "diamante"
  | "mestre"
  | "desafiante";

export type Tier = {
  id: TierId;
  nome: string;
  min: number; // ponto mínimo (inclusivo)
  max: number; // ponto máximo (inclusivo)
  cor: string; // cor base (hex 6 dígitos) para badges/realces
  corClara: string; // realce/gloss do emblema
  corEscura: string; // sombra/facetas do emblema
  emoji: string; // fallback textual
  descricao: string; // 1 frase motivadora sobre o tier
};

// Pontuação máxima de ELO.
export const ELO_MAX = 3000;

// Escada de tiers — bandas contíguas cobrindo 0–3000 pontos.
export const TIERS: Tier[] = [
  {
    id: "ferro",
    nome: "Ferro",
    min: 0,
    max: 799,
    cor: "#8a8f98",
    corClara: "#c2c8d0",
    corEscura: "#54585f",
    emoji: "🩶",
    descricao:
      "Estágio inicial de desenvolvimento. Massa magra e definição ainda pouco expressivas; base muscular a ser construída.",
  },
  {
    id: "bronze",
    nome: "Bronze",
    min: 800,
    max: 1199,
    cor: "#a9714b",
    corClara: "#d09b6f",
    corEscura: "#6c4226",
    emoji: "🟫",
    descricao:
      "Desenvolvimento incipiente. Ganho de massa magra perceptível, com volume e simetria ainda em formação.",
  },
  {
    id: "prata",
    nome: "Prata",
    min: 1200,
    max: 1599,
    cor: "#c4cdd6",
    corClara: "#eef3f8",
    corEscura: "#8a949f",
    emoji: "⬜",
    descricao:
      "Desenvolvimento intermediário. Volume muscular consistente e composição corporal em progressão clara.",
  },
  {
    id: "ouro",
    nome: "Ouro",
    min: 1600,
    max: 1999,
    cor: "#e8b923",
    corClara: "#ffd95e",
    corEscura: "#a8800a",
    emoji: "🟨",
    descricao:
      "Desenvolvimento acima da média. Boa relação massa magra/gordura, com volume e proporção bem estabelecidos.",
  },
  {
    id: "platina",
    nome: "Platina",
    min: 2000,
    max: 2349,
    cor: "#36c8a0",
    corClara: "#74f0cd",
    corEscura: "#1c8c6c",
    emoji: "🟩",
    descricao:
      "Desenvolvimento avançado. Densidade muscular, definição e simetria consolidadas.",
  },
  {
    id: "diamante",
    nome: "Diamante",
    min: 2350,
    max: 2699,
    cor: "#4aa3ff",
    corClara: "#93c8ff",
    corEscura: "#206fd0",
    emoji: "🟦",
    descricao:
      "Desenvolvimento de alta performance. Volume expressivo, baixo percentual de gordura e proporção refinada.",
  },
  {
    id: "mestre",
    nome: "Mestre",
    min: 2700,
    max: 2899,
    cor: "#b06bf5",
    corClara: "#d3a3ff",
    corEscura: "#7d3fc0",
    emoji: "🟪",
    descricao:
      "Desenvolvimento de nível competitivo. Densidade, vascularização e simetria próximas de padrão atlético.",
  },
  {
    id: "desafiante",
    nome: "Desafiante",
    min: 2900,
    max: 3000,
    cor: "#ff5b5b",
    corClara: "#ff9a8a",
    corEscura: "#c62f3f",
    emoji: "🟥",
    descricao:
      "Desenvolvimento de elite. Composição corporal, proporção e condicionamento em padrão de referência atlética.",
  },
];

/** Garante a nota dentro de 0–100. */
function clampNota(nota: number): number {
  if (Number.isNaN(nota)) return 0;
  return Math.max(0, Math.min(100, nota));
}

/** Converte uma nota 0–100 em pontos de ELO 0–3000 (linear, arredondado). */
export function notaParaElo(nota: number): number {
  return Math.round((clampNota(nota) / 100) * ELO_MAX);
}

/** Acha o tier de uma pontuação de ELO (bandas contíguas). */
export function tierDeElo(elo: number): Tier {
  const e = Math.max(0, Math.min(ELO_MAX, Math.round(elo)));
  let achado = TIERS[0];
  for (const t of TIERS) {
    if (e >= t.min) achado = t;
    else break;
  }
  return achado;
}

/** Formata pontos com separador de milhar brasileiro (1.847). */
export function formatarElo(elo: number): string {
  return Math.round(elo).toLocaleString("pt-BR");
}

export type RankResolvido = {
  elo: number; // pontos 0–3000
  tier: Tier;
  label: string; // rótulo pronto pra UI, ex: "Ouro · 1.847"
  progressoTotal: number; // 0–1, posição na escada inteira (pra barra global)
  progressoNoTier: number; // 0–1, progresso dentro do tier atual
};

/** Resolve uma nota 0–100 num pacote pronto pra UI. */
export function resolverRank(nota: number): RankResolvido {
  const elo = notaParaElo(nota);
  const tier = tierDeElo(elo);
  const span = tier.max - tier.min;
  const progressoNoTier = span > 0 ? (elo - tier.min) / span : 1;
  return {
    elo,
    tier,
    label: `${tier.nome} · ${formatarElo(elo)}`,
    progressoTotal: elo / ELO_MAX,
    progressoNoTier: Math.max(0, Math.min(1, progressoNoTier)),
  };
}

// Item de ranking que a IA devolve por grupo.
export type RankingGrupo = {
  grupo: GrupoMuscular;
  nota: number; // 0–100
  comentario: string;
};

/**
 * Calcula o Rank Geral a partir dos grupos (média das notas).
 * Retorna null se não houver grupos (ex: análise sem foto).
 */
export function calcularRankGeral(
  grupos: RankingGrupo[]
): RankResolvido | null {
  if (!grupos || grupos.length === 0) return null;
  const media =
    grupos.reduce((soma, g) => soma + clampNota(g.nota), 0) / grupos.length;
  return resolverRank(media);
}

/**
 * Ordena os grupos da IA na ordem canônica, ignorando ids desconhecidos.
 */
export function ordenarGrupos(grupos: RankingGrupo[]): RankingGrupo[] {
  const porId = new Map<GrupoMuscular, RankingGrupo>();
  for (const g of grupos) porId.set(g.grupo, g);
  return GRUPOS_ORDEM.map((id) => porId.get(id)).filter(
    (g): g is RankingGrupo => Boolean(g)
  );
}
