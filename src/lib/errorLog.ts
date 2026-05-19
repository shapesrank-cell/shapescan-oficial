/**
 * Logging de erros centralizado.
 *
 * Salva erros de produção no Supabase pra observabilidade.
 * Silencioso em caso de falha do próprio logger — nunca trava a request.
 */
import { createAdminClient } from "@/lib/supabase/admin";

export interface LogErrorInput {
  origem: string;
  mensagem: string;
  stack?: string;
  userId?: string | null;
  userEmail?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logError({
  origem,
  mensagem,
  stack,
  userId,
  userEmail,
  metadata,
}: LogErrorInput): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("error_log").insert({
      origem,
      mensagem: mensagem.slice(0, 1000),
      stack: stack?.slice(0, 4000),
      user_id: userId ?? null,
      user_email: userEmail ?? null,
      metadata: metadata ?? null,
    });
  } catch (err) {
    // Falha do logger não pode travar a request
    console.error("[errorLog] falha ao registrar:", err);
  }
}

/**
 * Wrapper utilitário: captura erros de uma async function e loga.
 * Re-throw após logar pra a chamada original ainda receber o erro.
 */
export async function withErrorLogging<T>(
  origem: string,
  fn: () => Promise<T>,
  context?: { userId?: string | null; userEmail?: string | null; metadata?: Record<string, unknown> }
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const e = err as Error;
    await logError({
      origem,
      mensagem: e.message || "Erro desconhecido",
      stack: e.stack,
      userId: context?.userId,
      userEmail: context?.userEmail,
      metadata: context?.metadata,
    });
    throw err;
  }
}
