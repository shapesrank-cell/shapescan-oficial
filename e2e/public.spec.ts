import { test, expect } from "@playwright/test";

test.describe("Rotas públicas", () => {
  test("landing carrega e mostra a marca ShapeScan", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ShapeScan/i);
    await expect(page.getByText("ShapeScan").first()).toBeVisible();
  });

  test("login mostra botão do Google e campo de email", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: /continuar com google/i })
    ).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test("termos e privacidade carregam", async ({ page }) => {
    await page.goto("/termos");
    await expect(page.locator("body")).toContainText(/termos/i);
    await page.goto("/privacidade");
    await expect(page.locator("body")).toContainText(/privacidade/i);
  });

  test("rota inexistente cai no 404", async ({ page }) => {
    const resp = await page.goto("/rota-que-nao-existe-xyz-123");
    expect(resp?.status()).toBe(404);
  });
});

test.describe("SEO", () => {
  test("robots.txt é servido e referencia o sitemap", async ({ page }) => {
    const resp = await page.goto("/robots.txt");
    expect(resp?.status()).toBe(200);
    const body = await page.locator("body").innerText();
    expect(body).toContain("Sitemap");
    expect(body).toMatch(/Disallow.*\/admin/);
  });

  test("sitemap.xml é servido com as URLs públicas", async ({ page }) => {
    const resp = await page.goto("/sitemap.xml");
    expect(resp?.status()).toBe(200);
    const xml = await resp!.text();
    expect(xml).toContain("/cadastro");
    expect(xml).toContain("/termos");
  });

  test("título por página usa o template (Entrar — ShapeScan)", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/Entrar — ShapeScan/);
  });

  test("landing tem dados estruturados JSON-LD", async ({ page }) => {
    await page.goto("/");
    const ld = page.locator('script[type="application/ld+json"]');
    await expect(ld).toHaveCount(1);
    expect(await ld.textContent()).toContain("WebApplication");
  });
});

test.describe("Proteção de rotas (sem login)", () => {
  test("dashboard redireciona pro /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("evolução redireciona pro /login", async ({ page }) => {
    await page.goto("/dashboard/evolucao");
    await expect(page).toHaveURL(/\/login/);
  });

  test("nova análise redireciona pro /login", async ({ page }) => {
    await page.goto("/analise/nova");
    await expect(page).toHaveURL(/\/login/);
  });

  test("painel admin redireciona pro /login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });
});
