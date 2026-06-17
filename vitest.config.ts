import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // Testes unitários de lógica pura — não precisam de DOM
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"],
    // E2E do Playwright fica fora do Vitest
    exclude: ["e2e/**", "node_modules/**"],
  },
});
