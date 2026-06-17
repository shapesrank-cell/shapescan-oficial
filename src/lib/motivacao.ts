/**
 * Frases motivacionais e imagens de inspiração do ShapeScan.
 *
 * Tudo PURO e determinístico — nada de Math.random/Date.now no corpo de
 * componentes (evita mismatch de hidratação e os erros de react-hooks/purity).
 * A escolha "do dia" é baseada no dia do ano, então é estável durante o dia
 * e muda sozinha no dia seguinte.
 */

// ─── Frases motivacionais ────────────────────────────────────────────────
// Tom: encorajador, honesto, foco em constância e evolução (não em estética).

export const FRASES_MOTIVACAO: string[] = [
  "Constância vence intensidade. Apareça hoje.",
  "Você não precisa ser perfeito, precisa ser constante.",
  "Cada treino é um voto na pessoa que você quer se tornar.",
  "Compare-se com quem você era ontem, não com os outros.",
  "Resultado é a soma de pequenos esforços repetidos todo dia.",
  "O corpo conquista o que a mente acredita. Bora.",
  "Disciplina é lembrar do que você quer de verdade.",
  "Um dia de cada vez. Hoje é o dia.",
  "Progresso, não perfeição.",
  "O melhor projeto que você pode trabalhar é você mesmo.",
  "Sua única competição é quem você era ontem.",
  "Comece onde você está. Use o que você tem. Faça o que você pode.",
  "Suor de hoje é a evolução de amanhã.",
  "Não conte os dias. Faça os dias contarem.",
  "Pequenos progressos ainda são progressos.",
];

/**
 * Frase estável "do dia" (muda a cada dia). Determinística — pode rodar no
 * servidor sem causar mismatch de hidratação.
 */
export function fraseDoDia(d: Date = new Date()): string {
  const inicioAno = Date.UTC(d.getUTCFullYear(), 0, 0);
  const diaDoAno = Math.floor((d.getTime() - inicioAno) / 86_400_000);
  return FRASES_MOTIVACAO[diaDoAno % FRASES_MOTIVACAO.length];
}

// ─── Imagens de inspiração (banco gratuito Unsplash, URLs verificadas) ─────
// Hotlink direto pela CDN do Unsplash (permitido). Temas fitness/treino.

export type Inspiracao = {
  id: string; // id da foto no Unsplash (também usado de key)
  legenda: string; // frase curta exibida sobre a imagem
  alt: string; // texto alternativo (acessibilidade)
};

const UNSPLASH_BASE = "https://images.unsplash.com/";

export const INSPIRACOES: Inspiracao[] = [
  {
    id: "photo-1517836357463-d25dfeac3438",
    legenda: "Force a barra. Os limites são feitos pra mover.",
    alt: "Pessoa treinando com peso na academia",
  },
  {
    id: "photo-1534438327276-14e5300c3a48",
    legenda: "O foco de hoje constrói o shape de amanhã.",
    alt: "Treino intenso com halteres",
  },
  {
    id: "photo-1571019613454-1cb2f99b2d8b",
    legenda: "Cada repetição conta. Não pule etapas.",
    alt: "Mulher treinando na academia",
  },
  {
    id: "photo-1581009146145-b5ef050c2e1e",
    legenda: "Consistência é o seu superpoder.",
    alt: "Homem em sessão de treino de força",
  },
  {
    id: "photo-1540497077202-7c8a3999166f",
    legenda: "Movimento é remédio. Comece a caminhada.",
    alt: "Pessoa correndo ao ar livre",
  },
  {
    id: "photo-1574680096145-d05b474e2155",
    legenda: "Funcional, forte e constante.",
    alt: "Treino funcional com kettlebell",
  },
];

/**
 * Monta a URL da imagem do Unsplash no tamanho desejado.
 * `w` controla a largura entregue pela CDN (mais leve no mobile).
 */
export function urlInspiracao(id: string, w = 600): string {
  return `${UNSPLASH_BASE}${id}?w=${w}&q=75&auto=format&fit=crop`;
}

/** Imagem de inspiração estável "do dia" (combina com a frase do dia). */
export function inspiracaoDoDia(d: Date = new Date()): Inspiracao {
  const inicioAno = Date.UTC(d.getUTCFullYear(), 0, 0);
  const diaDoAno = Math.floor((d.getTime() - inicioAno) / 86_400_000);
  return INSPIRACOES[diaDoAno % INSPIRACOES.length];
}
