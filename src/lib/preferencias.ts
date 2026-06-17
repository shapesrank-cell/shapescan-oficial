/**
 * Sanitização das preferências da análise (meta/treino/dieta).
 *
 * Pura e sem dependências de servidor — só aceita valores das whitelists e
 * ranges seguros. Usada na rota /api/analyze e coberta por testes unitários.
 */
import type { PreferenciasAnalise } from "@/lib/gemini";

export const PRAZOS = ["1_mes", "3_meses", "6_meses", "sem_pressa"] as const;
export const LOCAIS = ["academia", "casa", "ar_livre"] as const;
export const EXPERIENCIAS = ["iniciante", "intermediario", "avancado"] as const;
export const RESTRICOES = ["lactose", "gluten", "vegetariano", "vegano"] as const;
export const ORCAMENTOS = ["economico", "medio", "sem_limite"] as const;

/**
 * Sanitiza as preferências vindas do cliente: só aceita valores das whitelists
 * e ranges seguros. Retorna undefined se nada válido foi enviado.
 */
export function sanitizarPreferencias(
  raw: Partial<PreferenciasAnalise> | undefined | null
): PreferenciasAnalise | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const p: PreferenciasAnalise = {};

  const pesoAlvo = Number(raw.pesoAlvo);
  if (Number.isFinite(pesoAlvo) && pesoAlvo >= 20 && pesoAlvo <= 400)
    p.pesoAlvo = Math.round(pesoAlvo * 10) / 10;

  if (raw.prazo && (PRAZOS as readonly string[]).includes(raw.prazo))
    p.prazo = raw.prazo;

  const dias = Number(raw.diasSemana);
  if (Number.isFinite(dias) && dias >= 1 && dias <= 7)
    p.diasSemana = Math.round(dias);

  if (raw.local && (LOCAIS as readonly string[]).includes(raw.local))
    p.local = raw.local;
  if (
    raw.experiencia &&
    (EXPERIENCIAS as readonly string[]).includes(raw.experiencia)
  )
    p.experiencia = raw.experiencia;
  if (typeof raw.lesoes === "string" && raw.lesoes.trim())
    p.lesoes = raw.lesoes.trim().slice(0, 200);

  if (Array.isArray(raw.restricoes)) {
    const r = raw.restricoes.filter((x) =>
      (RESTRICOES as readonly string[]).includes(x)
    );
    if (r.length) p.restricoes = Array.from(new Set(r));
  }
  if (typeof raw.evita === "string" && raw.evita.trim())
    p.evita = raw.evita.trim().slice(0, 200);

  const refeicoes = Number(raw.refeicoesDia);
  if (Number.isFinite(refeicoes) && refeicoes >= 1 && refeicoes <= 10)
    p.refeicoesDia = Math.round(refeicoes);

  if (raw.orcamento && (ORCAMENTOS as readonly string[]).includes(raw.orcamento))
    p.orcamento = raw.orcamento;

  return Object.keys(p).length > 0 ? p : undefined;
}
