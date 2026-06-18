import { describe, it, expect } from "vitest";
import {
  notaParaElo,
  tierDeElo,
  resolverRank,
  calcularRankGeral,
  ordenarGrupos,
  formatarElo,
  ELO_MAX,
  type RankingGrupo,
} from "./ranking";

describe("notaParaElo", () => {
  it("mapeia as bordas 0 e 100", () => {
    expect(notaParaElo(0)).toBe(0);
    expect(notaParaElo(100)).toBe(ELO_MAX);
  });

  it("mapeia o meio linearmente", () => {
    expect(notaParaElo(50)).toBe(1500);
  });

  it("faz clamp de notas fora do intervalo", () => {
    expect(notaParaElo(-30)).toBe(0);
    expect(notaParaElo(200)).toBe(ELO_MAX);
  });

  it("trata NaN como 0", () => {
    expect(notaParaElo(NaN)).toBe(0);
  });
});

describe("tierDeElo", () => {
  it("acerta as bordas inferiores de cada tier", () => {
    expect(tierDeElo(0).id).toBe("ferro");
    expect(tierDeElo(800).id).toBe("bronze");
    expect(tierDeElo(1200).id).toBe("prata");
    expect(tierDeElo(1600).id).toBe("ouro");
    expect(tierDeElo(2000).id).toBe("platina");
    expect(tierDeElo(2350).id).toBe("diamante");
    expect(tierDeElo(2700).id).toBe("mestre");
    expect(tierDeElo(2900).id).toBe("desafiante");
  });

  it("acerta as bordas superiores de cada tier", () => {
    expect(tierDeElo(799).id).toBe("ferro");
    expect(tierDeElo(1199).id).toBe("bronze");
    expect(tierDeElo(1599).id).toBe("prata");
    expect(tierDeElo(1999).id).toBe("ouro");
    expect(tierDeElo(3000).id).toBe("desafiante");
  });

  it("faz clamp de valores fora de 0–3000", () => {
    expect(tierDeElo(-100).id).toBe("ferro");
    expect(tierDeElo(99999).id).toBe("desafiante");
  });
});

describe("formatarElo", () => {
  it("usa separador de milhar brasileiro", () => {
    expect(formatarElo(1847)).toBe("1.847");
    expect(formatarElo(900)).toBe("900");
  });
});

describe("resolverRank", () => {
  it("monta o label tier · pontos", () => {
    const r = resolverRank(62); // 1860 pts → Ouro
    expect(r.tier.id).toBe("ouro");
    expect(r.elo).toBe(1860);
    expect(r.label).toBe("Ouro · 1.860");
  });

  it("progressoNoTier fica entre 0 e 1", () => {
    const r = resolverRank(40);
    expect(r.progressoNoTier).toBeGreaterThanOrEqual(0);
    expect(r.progressoNoTier).toBeLessThanOrEqual(1);
  });
});

describe("calcularRankGeral", () => {
  const grupos: RankingGrupo[] = [
    { grupo: "peito", nota: 60, comentario: "" },
    { grupo: "costas", nota: 40, comentario: "" },
  ];

  it("usa a média das notas", () => {
    const geral = calcularRankGeral(grupos);
    expect(geral?.elo).toBe(notaParaElo(50)); // média 50 → 1500
  });

  it("retorna null sem grupos", () => {
    expect(calcularRankGeral([])).toBeNull();
  });
});

describe("ordenarGrupos", () => {
  it("reordena na ordem canônica e descarta ids desconhecidos", () => {
    const grupos = [
      { grupo: "pernas", nota: 50, comentario: "" },
      { grupo: "peito", nota: 70, comentario: "" },
      { grupo: "xpto", nota: 99, comentario: "" } as unknown as RankingGrupo,
    ] as RankingGrupo[];
    const ord = ordenarGrupos(grupos);
    expect(ord.map((g) => g.grupo)).toEqual(["peito", "pernas"]);
  });
});
