import { describe, it, expect } from "vitest";
import {
  notaParaElo,
  tierDeElo,
  resolverRank,
  calcularRankGeral,
  ordenarGrupos,
  formatarElo,
  calcularEvolucao,
  proximoTier,
  pontoFraco,
  calcularProporcoes,
  ELO_MAX,
  type RankingGrupo,
  type AnaliseComRanking,
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

describe("calcularEvolucao", () => {
  const analises: AnaliseComRanking[] = [
    {
      criadoEm: "2026-01-10T00:00:00Z",
      grupos: [
        { grupo: "peito", nota: 40, comentario: "" },
        { grupo: "costas", nota: 40, comentario: "" },
      ],
    },
    {
      criadoEm: "2026-02-10T00:00:00Z",
      grupos: [
        { grupo: "peito", nota: 50, comentario: "" },
        { grupo: "costas", nota: 40, comentario: "" },
      ],
    },
  ];

  it("ordena cronologicamente e calcula o delta do último vs anterior", () => {
    const ev = calcularEvolucao(analises);
    expect(ev.pontos).toHaveLength(2);
    // peito subiu de 40 (1200) pra 50 (1500) = +300; média geral subiu
    expect(ev.deltaPorGrupo.peito).toBe(300);
    expect(ev.deltaGeral).toBeGreaterThan(0);
  });

  it("sem 2 pontos, delta é null", () => {
    const ev = calcularEvolucao(analises.slice(0, 1));
    expect(ev.deltaGeral).toBeNull();
  });
});

describe("proximoTier", () => {
  it("calcula pontos pro próximo tier", () => {
    const p = proximoTier(1700); // Ouro → próximo Platina (2000)
    expect(p?.alvo.id).toBe("platina");
    expect(p?.faltamPts).toBe(300);
  });

  it("retorna null no topo (Desafiante)", () => {
    expect(proximoTier(2950)).toBeNull();
  });
});

describe("pontoFraco", () => {
  it("acha o grupo de menor nota e sugere foco", () => {
    const pf = pontoFraco([
      { grupo: "peito", nota: 70, comentario: "" },
      { grupo: "pernas", nota: 35, comentario: "" },
    ]);
    expect(pf?.grupo).toBe("pernas");
    expect(pf?.foco.length).toBeGreaterThan(0);
  });
});

describe("calcularProporcoes", () => {
  it("calcula V-taper e classifica como ótimo perto de 1,6", () => {
    const props = calcularProporcoes({ ombros: 130, cintura: 80 }); // 1.625
    const vtaper = props.find((p) => p.nome.startsWith("V-Taper"));
    expect(vtaper?.status).toBe("otimo");
  });

  it("só inclui razões com as medidas necessárias", () => {
    const props = calcularProporcoes({ ombros: 130 }); // sem cintura
    expect(props).toHaveLength(0);
  });
});
