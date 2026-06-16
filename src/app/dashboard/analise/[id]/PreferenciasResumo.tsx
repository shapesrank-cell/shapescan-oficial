import { Target } from "lucide-react";

// Espelha PreferenciasAnalise (labels locais pra não puxar o SDK do Gemini).
type Preferencias = {
  pesoAlvo?: number | null;
  prazo?: "1_mes" | "3_meses" | "6_meses" | "sem_pressa" | null;
  diasSemana?: number | null;
  local?: "academia" | "casa" | "ar_livre" | null;
  experiencia?: "iniciante" | "intermediario" | "avancado" | null;
  lesoes?: string | null;
  restricoes?: ("lactose" | "gluten" | "vegetariano" | "vegano")[] | null;
  evita?: string | null;
  refeicoesDia?: number | null;
  orcamento?: "economico" | "medio" | "sem_limite" | null;
};

const PRAZO: Record<string, string> = {
  "1_mes": "1 mês",
  "3_meses": "3 meses",
  "6_meses": "6 meses",
  sem_pressa: "Sem pressa",
};
const LOCAL: Record<string, string> = {
  academia: "Academia",
  casa: "Em casa",
  ar_livre: "Ao ar livre",
};
const EXPERIENCIA: Record<string, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};
const RESTRICAO: Record<string, string> = {
  lactose: "Sem lactose",
  gluten: "Sem glúten",
  vegetariano: "Vegetariano",
  vegano: "Vegano",
};
const ORCAMENTO: Record<string, string> = {
  economico: "Econômico",
  medio: "Médio",
  sem_limite: "Sem limite",
};

export function PreferenciasResumo({
  estiloObjetivo,
  preferencias,
}: {
  estiloObjetivo?: string;
  preferencias?: Preferencias | null;
}) {
  const tags: string[] = [];
  const p = preferencias ?? {};
  if (p.pesoAlvo) tags.push(`Meta: ${p.pesoAlvo} kg`);
  if (p.prazo) tags.push(PRAZO[p.prazo]);
  if (p.diasSemana) tags.push(`${p.diasSemana}x/semana`);
  if (p.local) tags.push(LOCAL[p.local]);
  if (p.experiencia) tags.push(EXPERIENCIA[p.experiencia]);
  if (p.restricoes?.length)
    p.restricoes.forEach((r) => tags.push(RESTRICAO[r]));
  if (p.refeicoesDia) tags.push(`${p.refeicoesDia} refeições/dia`);
  if (p.orcamento) tags.push(ORCAMENTO[p.orcamento]);
  if (p.lesoes?.trim()) tags.push(`Atenção: ${p.lesoes.trim()}`);
  if (p.evita?.trim()) tags.push(`Evita: ${p.evita.trim()}`);

  // Nada pra mostrar (análise antiga ou sem personalização)
  if (!estiloObjetivo && tags.length === 0) return null;

  return (
    <div className="bg-orange-400/[0.07] border border-orange-400/20 rounded-2xl p-5 flex flex-col gap-3">
      {estiloObjetivo && (
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 text-orange-400 flex-shrink-0">
            <Target size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-orange-400/80 uppercase tracking-wider font-bold">
              Plano direcionado para
            </span>
            <span className="text-sm text-white font-medium">
              {estiloObjetivo}
            </span>
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((t, i) => (
            <span
              key={i}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.10] text-white/70"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
