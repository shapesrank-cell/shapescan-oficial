import { describe, it, expect } from "vitest";
import { isSuperAdmin, SUPER_ADMIN_EMAILS } from "./admin";

describe("isSuperAdmin", () => {
  it("aceita email do allowlist", () => {
    expect(isSuperAdmin(SUPER_ADMIN_EMAILS[0], "user")).toBe(true);
  });

  it("aceita email do allowlist ignorando maiúsculas/minúsculas", () => {
    expect(isSuperAdmin(SUPER_ADMIN_EMAILS[0].toUpperCase(), null)).toBe(true);
  });

  it("aceita quando role = super_admin mesmo sem estar no allowlist", () => {
    expect(isSuperAdmin("qualquer@email.com", "super_admin")).toBe(true);
  });

  it("rejeita usuário comum", () => {
    expect(isSuperAdmin("comum@email.com", "user")).toBe(false);
  });

  it("rejeita role workspace_admin (não é super admin)", () => {
    expect(isSuperAdmin("comum@email.com", "workspace_admin")).toBe(false);
  });

  it("rejeita email e role nulos/indefinidos", () => {
    expect(isSuperAdmin(null, null)).toBe(false);
    expect(isSuperAdmin(undefined, undefined)).toBe(false);
  });

  it("não confunde substring do email", () => {
    expect(isSuperAdmin(`${SUPER_ADMIN_EMAILS[0]}.evil.com`, null)).toBe(false);
  });
});
