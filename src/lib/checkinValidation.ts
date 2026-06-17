/**
 * Validação das medidas de um check-in de evolução.
 *
 * Pura e sem dependências de servidor (testável). Os ranges espelham
 * EXATAMENTE os CHECKs da migration 006_checkins.sql (validação dupla).
 */
export const RANGES = {
  peso: [20, 400],
  cintura: [20, 300],
  quadril: [20, 300],
  braco: [10, 150],
  peito: [30, 300],
  coxa: [20, 200],
} as const;

export type MedidaResult = { erro?: string; valor: number | null };

export function validaMedida(
  valor: number | null | undefined,
  [min, max]: readonly [number, number],
  rotulo: string,
  obrigatorio: boolean
): MedidaResult {
  if (valor === null || valor === undefined || Number.isNaN(valor)) {
    if (obrigatorio) return { erro: `${rotulo} é obrigatório.`, valor: null };
    return { valor: null };
  }
  if (!Number.isFinite(valor) || valor < min || valor > max) {
    return { erro: `${rotulo} fora do esperado (${min}-${max}).`, valor: null };
  }
  // Arredonda pra 1 casa decimal (bate com numeric(5,1))
  return { valor: Math.round(valor * 10) / 10 };
}
