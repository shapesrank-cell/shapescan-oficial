import { describe, it, expect } from "vitest";
import { sanitizarPreferencias } from "./preferencias";

describe("sanitizarPreferencias", () => {
  it("retorna undefined quando não há nada válido", () => {
    expect(sanitizarPreferencias(undefined)).toBeUndefined();
    expect(sanitizarPreferencias(null)).toBeUndefined();
    expect(sanitizarPreferencias({})).toBeUndefined();
  });

  it("mantém valores válidos das whitelists", () => {
    const r = sanitizarPreferencias({
      prazo: "3_meses",
      local: "academia",
      experiencia: "intermediario",
      orcamento: "economico",
    });
    expect(r).toEqual({
      prazo: "3_meses",
      local: "academia",
      experiencia: "intermediario",
      orcamento: "economico",
    });
  });

  it("descarta valores fora da whitelist (injeção)", () => {
    const r = sanitizarPreferencias({
      // @ts-expect-error valor inválido proposital
      prazo: "10_anos",
      // @ts-expect-error valor inválido proposital
      local: "lua",
      // @ts-expect-error valor inválido proposital
      orcamento: "DROP TABLE",
    });
    expect(r).toBeUndefined();
  });

  it("valida e arredonda pesoAlvo dentro do range", () => {
    expect(sanitizarPreferencias({ pesoAlvo: 72.04 })).toEqual({ pesoAlvo: 72 });
    expect(sanitizarPreferencias({ pesoAlvo: 10 })).toBeUndefined(); // abaixo de 20
    expect(sanitizarPreferencias({ pesoAlvo: 999 })).toBeUndefined(); // acima de 400
  });

  it("limita diasSemana (1-7) e refeicoesDia (1-10) e arredonda", () => {
    expect(sanitizarPreferencias({ diasSemana: 4 })).toEqual({ diasSemana: 4 });
    expect(sanitizarPreferencias({ diasSemana: 9 })).toBeUndefined();
    expect(sanitizarPreferencias({ refeicoesDia: 5.7 })).toEqual({
      refeicoesDia: 6,
    });
  });

  it("filtra restrições inválidas e remove duplicadas", () => {
    const r = sanitizarPreferencias({
      // @ts-expect-error mistura válidas e inválidas
      restricoes: ["lactose", "lactose", "gluten", "veneno"],
    });
    expect(r?.restricoes).toEqual(["lactose", "gluten"]);
  });

  it("faz trim e corta textos longos em 200 chars", () => {
    const longo = "a".repeat(500);
    const r = sanitizarPreferencias({ lesoes: `  joelho  `, evita: longo });
    expect(r?.lesoes).toBe("joelho");
    expect(r?.evita?.length).toBe(200);
  });

  it("ignora strings só com espaços", () => {
    expect(sanitizarPreferencias({ lesoes: "   ", evita: "" })).toBeUndefined();
  });
});
