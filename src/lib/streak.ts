/**
 * Lógica PURA da ofensiva (streak) de constância.
 * Sem dependência de servidor → testável no Vitest.
 *
 * Datas são strings "YYYY-MM-DD" (dia local do usuário, America/Sao_Paulo).
 */

/**
 * Dia de "hoje" no fuso de São Paulo, no formato "YYYY-MM-DD".
 * Usamos um fuso fixo (base de usuários BR) pra a virada do dia ser consistente
 * entre o servidor e o que o usuário enxerga.
 */
export function diaDeHojeSP(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Retorna o dia anterior a uma data "YYYY-MM-DD" (cálculo em UTC, sem drift de fuso). */
export function diaAnterior(dia: string): string {
  const dt = new Date(`${dia}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}

export type ResultadoStreak = {
  atual: number; // sequência atual de dias seguidos (viva)
  recorde: number; // maior sequência já alcançada
  marcouHoje: boolean; // já marcou o dia de hoje?
};

/**
 * Calcula a ofensiva a partir dos dias marcados e do dia de hoje.
 *
 * - A sequência ATUAL conta dias consecutivos terminando em hoje (se marcou hoje)
 *   ou em ontem (se ainda não marcou hoje, mas a sequência continua viva).
 * - Se o último dia marcado for anterior a ontem, a sequência atual é 0.
 */
export function calcularStreak(
  diasMarcados: string[],
  hoje: string
): ResultadoStreak {
  const set = new Set(diasMarcados);
  const marcouHoje = set.has(hoje);

  // Ponto de partida: hoje (se marcado) ou ontem (sequência ainda viva).
  let atual = 0;
  let cursor = marcouHoje ? hoje : diaAnterior(hoje);
  while (set.has(cursor)) {
    atual++;
    cursor = diaAnterior(cursor);
  }

  // Recorde: maior corrida de dias consecutivos em todo o histórico.
  const ordenados = [...set].sort();
  let recorde = 0;
  let corrida = 0;
  let anterior: string | null = null;
  for (const d of ordenados) {
    if (anterior && diaAnterior(d) === anterior) corrida++;
    else corrida = 1;
    if (corrida > recorde) recorde = corrida;
    anterior = d;
  }

  return { atual, recorde, marcouHoje };
}
