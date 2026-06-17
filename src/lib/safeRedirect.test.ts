import { describe, it, expect } from "vitest";
import { destinoSeguro } from "./safeRedirect";

describe("destinoSeguro (guarda anti open-redirect)", () => {
  it("aceita caminho interno", () => {
    expect(destinoSeguro("/dashboard/evolucao")).toBe("/dashboard/evolucao");
    expect(destinoSeguro("/redefinir-senha")).toBe("/redefinir-senha");
  });

  it("usa o fallback quando next é nulo/vazio", () => {
    expect(destinoSeguro(null)).toBe("/dashboard");
    expect(destinoSeguro(undefined)).toBe("/dashboard");
    expect(destinoSeguro("")).toBe("/dashboard");
  });

  it("respeita um fallback customizado", () => {
    expect(destinoSeguro(null, "/login")).toBe("/login");
  });

  it("bloqueia URL absoluta (open redirect clássico)", () => {
    expect(destinoSeguro("https://evil.com")).toBe("/dashboard");
    expect(destinoSeguro("http://evil.com/phish")).toBe("/dashboard");
  });

  it("bloqueia protocol-relative //evil.com", () => {
    expect(destinoSeguro("//evil.com")).toBe("/dashboard");
  });

  it("bloqueia bypass com backslash", () => {
    expect(destinoSeguro("/\\evil.com")).toBe("/dashboard");
    expect(destinoSeguro("\\\\evil.com")).toBe("/dashboard");
  });

  it("bloqueia caminho que não começa com /", () => {
    expect(destinoSeguro("evil.com")).toBe("/dashboard");
    expect(destinoSeguro("javascript:alert(1)")).toBe("/dashboard");
  });
});
