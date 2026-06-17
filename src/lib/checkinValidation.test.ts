import { describe, it, expect } from "vitest";
import { RANGES, validaMedida } from "./checkinValidation";

describe("validaMedida", () => {
  it("aceita peso válido e arredonda pra 1 casa", () => {
    expect(validaMedida(75.04, RANGES.peso, "Peso", true)).toEqual({
      valor: 75,
    });
    expect(validaMedida(75.06, RANGES.peso, "Peso", true)).toEqual({
      valor: 75.1,
    });
  });

  it("exige peso quando obrigatório e veio vazio", () => {
    const r = validaMedida(null, RANGES.peso, "Peso", true);
    expect(r.valor).toBeNull();
    expect(r.erro).toMatch(/obrigatório/i);
  });

  it("permite medida opcional ausente sem erro", () => {
    expect(validaMedida(null, RANGES.cintura, "Cintura", false)).toEqual({
      valor: null,
    });
    expect(validaMedida(undefined, RANGES.cintura, "Cintura", false)).toEqual({
      valor: null,
    });
  });

  it("rejeita valor abaixo do mínimo", () => {
    const r = validaMedida(5, RANGES.peso, "Peso", true);
    expect(r.valor).toBeNull();
    expect(r.erro).toMatch(/fora do esperado/i);
  });

  it("rejeita valor acima do máximo", () => {
    const r = validaMedida(999, RANGES.peso, "Peso", true);
    expect(r.erro).toMatch(/20-400/);
  });

  it("rejeita NaN/Infinity", () => {
    expect(validaMedida(NaN, RANGES.peso, "Peso", true).erro).toBeTruthy();
    expect(validaMedida(Infinity, RANGES.peso, "Peso", true).erro).toBeTruthy();
  });

  it("aceita valores nos limites exatos", () => {
    expect(validaMedida(20, RANGES.peso, "Peso", true)).toEqual({ valor: 20 });
    expect(validaMedida(400, RANGES.peso, "Peso", true)).toEqual({ valor: 400 });
  });
});
