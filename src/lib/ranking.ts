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

// ============================================
// 1) EVOLUÇÃO DO RANK NO TEMPO
// ============================================

export type AnaliseComRanking = {
  criadoEm: string; // ISO
  grupos: RankingGrupo[];
};

export type PontoEvolucao = {
  criadoEm: string;
  eloGeral: number;
  porGrupo: Partial<Record<GrupoMuscular, number>>;
};

export type Evolucao = {
  pontos: PontoEvolucao[]; // cronológico (mais antigo → mais novo)
  deltaGeral: number | null; // variação do último ponto vs o anterior
  deltaPorGrupo: Partial<Record<GrupoMuscular, number>>;
};

/**
 * Monta a linha do tempo do ELO (geral + por grupo) a partir das análises que
 * têm ranking, e calcula a variação do mais recente vs o anterior.
 */
export function calcularEvolucao(
  analises: AnaliseComRanking[]
): Evolucao {
  const pontos: PontoEvolucao[] = analises
    .filter((a) => a.grupos && a.grupos.length > 0)
    .map((a) => {
      const geral = calcularRankGeral(a.grupos);
      const porGrupo: Partial<Record<GrupoMuscular, number>> = {};
      for (const g of a.grupos) porGrupo[g.grupo] = notaParaElo(g.nota);
      return {
        criadoEm: a.criadoEm,
        eloGeral: geral ? geral.elo : 0,
        porGrupo,
      };
    })
    .sort((a, b) => a.criadoEm.localeCompare(b.criadoEm));

  let deltaGeral: number | null = null;
  const deltaPorGrupo: Partial<Record<GrupoMuscular, number>> = {};
  if (pontos.length >= 2) {
    const ultimo = pontos[pontos.length - 1];
    const anterior = pontos[pontos.length - 2];
    deltaGeral = ultimo.eloGeral - anterior.eloGeral;
    for (const id of GRUPOS_ORDEM) {
      const a = anterior.porGrupo[id];
      const u = ultimo.porGrupo[id];
      if (a != null && u != null) deltaPorGrupo[id] = u - a;
    }
  }

  return { pontos, deltaGeral, deltaPorGrupo };
}

// ============================================
// 2) PONTO FRACO + PRÓXIMO TIER
// ============================================

export type ProximoTier = { faltamPts: number; alvo: Tier } | null;

/** Quantos pontos faltam pro próximo tier (null se já está no topo). */
export function proximoTier(elo: number): ProximoTier {
  const atual = tierDeElo(elo);
  const idx = TIERS.findIndex((t) => t.id === atual.id);
  if (idx < 0 || idx >= TIERS.length - 1) return null; // já é Desafiante
  const alvo = TIERS[idx + 1];
  return { faltamPts: Math.max(0, alvo.min - Math.round(elo)), alvo };
}

// Foco de treino sugerido por grupo (pra subir de tier).
export const FOCO_GRUPO: Record<GrupoMuscular, string> = {
  peito: "Supino reto e inclinado, crucifixo e flexões — priorize carga progressiva.",
  costas: "Barra fixa, remada curvada e pulldown — foco em amplitude e contração.",
  ombros: "Desenvolvimento, elevação lateral e posterior — atenção ao deltoide medial pra largura.",
  bracos: "Rosca direta/alternada e tríceps na polia/testa — volume e conexão mente-músculo.",
  abdomen: "Prancha, elevação de pernas e cardio — definição vem com baixo % de gordura.",
  pernas: "Agachamento, leg press, stiff e panturrilha — a base que mais agrega volume total.",
};

export type PontoFraco = {
  grupo: GrupoMuscular;
  rank: RankResolvido;
  proximo: ProximoTier;
  foco: string;
};

/** Identifica o grupo mais atrasado e o que fazer pra subir. */
export function pontoFraco(grupos: RankingGrupo[]): PontoFraco | null {
  if (!grupos || grupos.length === 0) return null;
  const pior = [...grupos].sort((a, b) => a.nota - b.nota)[0];
  const rank = resolverRank(pior.nota);
  return {
    grupo: pior.grupo,
    rank,
    proximo: proximoTier(rank.elo),
    foco: FOCO_GRUPO[pior.grupo],
  };
}

// ============================================
// 3) PROPORÇÃO / SIMETRIA (a partir das medidas)
// ============================================

export type MedidasProporcao = {
  altura?: number | null;
  ombros?: number | null;
  cintura?: number | null;
  braco?: number | null;
  antebraco?: number | null;
  coxa?: number | null;
  panturrilha?: number | null;
  pescoco?: number | null;
};

export type Proporcao = {
  nome: string;
  descricao: string;
  valor: number; // razão calculada
  ideal: string; // texto do alvo
  // 0–1, quão perto do ideal (pra barra)
  qualidade: number;
  status: "otimo" | "bom" | "melhorar";
};

/** Classifica uma razão pela distância proporcional ao ideal. */
function classificar(
  valor: number,
  ideal: number,
  toleranciaOtimo: number,
  toleranciaBom: number
): { qualidade: number; status: Proporcao["status"] } {
  const desvio = Math.abs(valor - ideal) / ideal;
  const qualidade = Math.max(0, Math.min(1, 1 - desvio / (toleranciaBom * 2)));
  const status: Proporcao["status"] =
    desvio <= toleranciaOtimo ? "otimo" : desvio <= toleranciaBom ? "bom" : "melhorar";
  return { qualidade, status };
}

/**
 * Calcula as razões clássicas de físico estético a partir das medidas.
 * Só inclui as que têm as medidas necessárias.
 */
export function calcularProporcoes(m: MedidasProporcao): Proporcao[] {
  const out: Proporcao[] = [];

  // V-taper: ombros / cintura — ideal ~1.618 (proporção áurea)
  if (m.ombros && m.cintura) {
    const valor = m.ombros / m.cintura;
    const { qualidade, status } = classificar(valor, 1.618, 0.06, 0.15);
    out.push({
      nome: "V-Taper (ombro : cintura)",
      descricao: "A clássica forma de V — ombros largos sobre cintura fina.",
      valor: Math.round(valor * 100) / 100,
      ideal: "≈ 1,6",
      qualidade,
      status,
    });
  }

  // Cintura / altura — ideal ~0,46 (saúde + estética)
  if (m.cintura && m.altura) {
    const valor = m.cintura / m.altura;
    const { qualidade, status } = classificar(valor, 0.46, 0.08, 0.2);
    out.push({
      nome: "Cintura : altura",
      descricao: "Indicador de definição e saúde — quanto mais baixo, mais seco.",
      valor: Math.round(valor * 100) / 100,
      ideal: "≈ 0,46",
      qualidade,
      status,
    });
  }

  // Braço ≈ panturrilha (regra clássica: devem ser parecidos)
  if (m.braco && m.panturrilha) {
    const valor = m.braco / m.panturrilha;
    const { qualidade, status } = classificar(valor, 1.0, 0.07, 0.18);
    out.push({
      nome: "Braço : panturrilha",
      descricao: "No físico equilibrado, braço e panturrilha ficam parecidos.",
      valor: Math.round(valor * 100) / 100,
      ideal: "≈ 1,0",
      qualidade,
      status,
    });
  }

  return out;
}
