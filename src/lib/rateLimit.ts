/**
 * Rate limiting persistente via Supabase.
 *
 * Sliding window: conta quantas vezes o identifier executou a action
 * nos últimos N minutos. Se passar do limite, bloqueia.
 *
 * Uso típico em API route:
 *
 *   const limit = await checkRateLimit({ identifier: user.id, action: "analyze", limit: 10, windowMinutes: 60 });
 *   if (!limit.allowed) return NextResponse.json({ erro: "Limite excedido" }, { status: 429 });
 */
import { createAdminClient } from "@/lib/supabase/admin";

export interface RateLimitInput {
  identifier: string;
  action: string;
  limit: number;
  windowMinutes: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit({
  identifier,
  action,
  limit,
  windowMinutes,
}: RateLimitInput): Promise<RateLimitResult> {
  const admin = createAdminClient();
  const inicio = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  // Conta as ocorrências dentro da janela
  const { count } = await admin
    .from("rate_limit_log")
    .select("*", { count: "exact", head: true })
    .eq("identifier", identifier)
    .eq("action", action)
    .gte("criado_em", inicio);

  const usado = count ?? 0;
  const restantes = Math.max(0, limit - usado);
  const allowed = usado < limit;

  if (allowed) {
    // Registra a tentativa
    await admin.from("rate_limit_log").insert({
      identifier,
      action,
    });
  }

  const resetAt = new Date(Date.now() + windowMinutes * 60 * 1000);

  return {
    allowed,
    remaining: allowed ? restantes - 1 : restantes,
    resetAt,
  };
}

/**
 * Pega o IP do request (suporta proxies da Vercel).
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
