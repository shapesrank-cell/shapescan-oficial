/**
 * Guarda contra open redirect.
 *
 * Garante que o destino de um redirect é um caminho INTERNO seguro.
 * Rejeita URLs absolutas (http://evil.com), protocol-relative (//evil.com),
 * backslashes (\\evil.com — alguns navegadores tratam como //) e qualquer
 * coisa que não comece com "/". Cai no fallback nesses casos.
 */
export function destinoSeguro(
  next: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!next) return fallback;
  // Normaliza backslashes (evita bypass tipo "/\evil.com" ou "\\evil.com")
  const normalizado = next.replace(/\\/g, "/");
  if (!normalizado.startsWith("/")) return fallback;
  if (normalizado.startsWith("//")) return fallback;
  return normalizado;
}
