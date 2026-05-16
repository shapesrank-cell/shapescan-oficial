/**
 * Cliente Anthropic (Claude) para análise de biotipo e geração de planos.
 *
 * IMPORTANTE: este cliente só pode ser usado no SERVIDOR (API Routes, Server Actions).
 * Nunca importe este arquivo em componentes do lado cliente.
 */
import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Modelo padrão a ser usado para análises do ShapeScan
export const SHAPESCAN_MODEL = "claude-sonnet-4-5-20250929";
