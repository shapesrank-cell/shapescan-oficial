import { describe, it, expect } from "vitest";
import { diaAnterior, calcularStreak } from "./streak";

describe("diaAnterior", () => {
  it("volta um dia, inclusive virando o mês", () => {
    expect(diaAnterior("2026-06-17")).toBe("2026-06-16");
    expect(diaAnterior("2026-07-01")).toBe("2026-06-30");
    expect(diaAnterior("2026-01-01")).toBe("2025-12-31");
  });
});

describe("calcularStreak", () => {
  const hoje = "2026-06-17";

  it("zera quando não há dias", () => {
    expect(calcularStreak([], hoje)).toEqual({
      atual: 0,
      recorde: 0,
      marcouHoje: false,
    });
  });

  it("conta sequência terminando hoje", () => {
    const r = calcularStreak(["2026-06-15", "2026-06-16", "2026-06-17"], hoje);
    expect(r.atual).toBe(3);
    expect(r.marcouHoje).toBe(true);
    expect(r.recorde).toBe(3);
  });

  it("mantém a sequência viva se marcou ontem mas ainda não hoje", () => {
    const r = calcularStreak(["2026-06-15", "2026-06-16"], hoje);
    expect(r.atual).toBe(2);
    expect(r.marcouHoje).toBe(false);
  });

  it("quebra a sequência se o último dia for anterior a ontem", () => {
    const r = calcularStreak(["2026-06-10", "2026-06-11"], hoje);
    expect(r.atual).toBe(0);
    expect(r.marcouHoje).toBe(false);
    expect(r.recorde).toBe(2);
  });

  it("recorde pega a maior corrida mesmo com buracos", () => {
    const r = calcularStreak(
      ["2026-06-01", "2026-06-02", "2026-06-03", "2026-06-10", "2026-06-17"],
      hoje
    );
    expect(r.recorde).toBe(3);
    expect(r.atual).toBe(1); // só hoje
    expect(r.marcouHoje).toBe(true);
  });
});
