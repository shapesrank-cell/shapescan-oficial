import { describe, it, expect } from "vitest";
import {
  formatarData,
  formatarHistoricoCheckins,
  type CheckinHistorico,
} from "./relatorio";

describe("formatarData", () => {
  it("converte ISO pra DD/MM/AAAA sem problema de fuso", () => {
    expect(formatarData("2026-06-16T03:00:00.000Z")).toBe("16/06/2026");
    expect(formatarData("2026-01-05")).toBe("05/01/2026");
  });
});

describe("formatarHistoricoCheckins", () => {
  it("lida com lista vazia", () => {
    expect(formatarHistoricoCheckins([])).toMatch(/nenhum check-in/i);
  });

  it("monta linha do tempo, período e variações", () => {
    const checkins: CheckinHistorico[] = [
      { data: "2026-06-01T12:00:00Z", peso: 75, cintura: 80, coxa: 55 },
      { data: "2026-06-16T12:00:00Z", peso: 73, cintura: 78, coxa: 55 },
    ];
    const txt = formatarHistoricoCheckins(checkins);

    expect(txt).toContain("Total de check-ins: 2");
    expect(txt).toContain("Período acompanhado: 15 dia(s)");
    expect(txt).toContain("01/06/2026: 75kg, cintura 80cm, coxa 55cm");
    expect(txt).toContain("16/06/2026: 73kg, cintura 78cm, coxa 55cm");
    // peso caiu 2, cintura caiu 2, coxa estável
    expect(txt).toContain("peso -2kg");
    expect(txt).toContain("cintura -2cm");
    expect(txt).toContain("coxa estável");
  });

  it("ignora medidas ausentes na variação", () => {
    const checkins: CheckinHistorico[] = [
      { data: "2026-06-01", peso: 80 },
      { data: "2026-06-10", peso: 82, braco: 38 },
    ];
    const txt = formatarHistoricoCheckins(checkins);
    expect(txt).toContain("peso +2kg");
    // braço só existe no último → não entra na variação total
    expect(txt).not.toMatch(/braço .*cm,/);
  });
});
