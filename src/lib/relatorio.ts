/**
 * Helpers puros do Relatório de Evolução (sem dependências de servidor).
 * Formatam o histórico de check-ins num texto que vai pro prompt do Gemini.
 */

export type CheckinHistorico = {
  data: string; // ISO (timestamptz do Supabase)
  peso: number;
  cintura?: number | null;
  quadril?: number | null;
  braco?: number | null;
  peito?: number | null;
  coxa?: number | null;
  ombros?: number | null;
  panturrilha?: number | null;
  antebraco?: number | null;
  pescoco?: number | null;
};

const MEDIDAS: { chave: keyof CheckinHistorico; rotulo: string }[] = [
  { chave: "cintura", rotulo: "cintura" },
  { chave: "quadril", rotulo: "quadril" },
  { chave: "braco", rotulo: "braço" },
  { chave: "peito", rotulo: "peito" },
  { chave: "coxa", rotulo: "coxa" },
  { chave: "ombros", rotulo: "ombros" },
  { chave: "panturrilha", rotulo: "panturrilha" },
  { chave: "antebraco", rotulo: "antebraço" },
  { chave: "pescoco", rotulo: "pescoço" },
];

/** "2026-06-16T..." -> "16/06/2026" (sem problema de fuso). */
export function formatarData(iso: string): string {
  const d = iso.slice(0, 10);
  const [ano, mes, dia] = d.split("-");
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

function variacao(ini: number, fim: number, unidade: string): string {
  const d = Math.round((fim - ini) * 10) / 10;
  if (d === 0) return "estável";
  return d > 0 ? `+${d}${unidade}` : `${d}${unidade}`;
}

/**
 * Monta um resumo textual do histórico (linha do tempo + variações + período)
 * pra IA analisar. `checkins` vem do mais antigo pro mais novo.
 */
export function formatarHistoricoCheckins(checkins: CheckinHistorico[]): string {
  if (checkins.length === 0) return "Nenhum check-in registrado.";

  const linhas = checkins.map((c) => {
    const partes = [`${c.peso}kg`];
    for (const m of MEDIDAS) {
      const v = c[m.chave] as number | null | undefined;
      if (v != null) partes.push(`${m.rotulo} ${v}cm`);
    }
    return `- ${formatarData(c.data)}: ${partes.join(", ")}`;
  });

  const primeiro = checkins[0];
  const ultimo = checkins[checkins.length - 1];

  const variacoes: string[] = [
    `peso ${variacao(primeiro.peso, ultimo.peso, "kg")}`,
  ];
  for (const m of MEDIDAS) {
    const ini = primeiro[m.chave] as number | null | undefined;
    const fim = ultimo[m.chave] as number | null | undefined;
    if (ini != null && fim != null) {
      variacoes.push(`${m.rotulo} ${variacao(ini, fim, "cm")}`);
    }
  }

  const dias = Math.max(
    0,
    Math.round(
      (new Date(ultimo.data.slice(0, 10)).getTime() -
        new Date(primeiro.data.slice(0, 10)).getTime()) /
        86_400_000
    )
  );

  return [
    `Total de check-ins: ${checkins.length}`,
    `Período acompanhado: ${dias} dia(s)`,
    "",
    "Linha do tempo (mais antigo → mais novo):",
    ...linhas,
    "",
    `Variação total (primeiro → último): ${variacoes.join(", ")}`,
  ].join("\n");
}
