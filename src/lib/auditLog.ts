/**
 * Helper centralizado de Audit Log.
 *
 * Toda ação destrutiva ou sensível do admin deve passar por aqui.
 * Use em Server Actions:
 *
 *   await logAction({
 *     action: "user.deleted",
 *     targetType: "user",
 *     targetId: userId,
 *     metadata: { motivo: "abuso" },
 *   });
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AdminAction =
  | "user.role_changed"
  | "user.suspended"
  | "user.reactivated"
  | "user.deleted"
  | "analysis.deleted"
  | "setting.updated"
  | "export.csv";

export type AdminTargetType = "user" | "analysis" | "setting" | "export";

export interface LogActionInput {
  action: AdminAction;
  targetType?: AdminTargetType;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Registra uma ação do admin no audit_log.
 * Pega automaticamente o admin logado do contexto.
 * Silencioso em caso de erro (não trava a ação principal).
 */
export async function logAction({
  action,
  targetType,
  targetId,
  metadata,
}: LogActionInput): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const admin = createAdminClient();
    await admin.from("audit_log").insert({
      admin_id: user?.id ?? null,
      admin_email: user?.email ?? null,
      action,
      target_type: targetType ?? null,
      target_id: targetId ?? null,
      metadata: metadata ?? null,
    });
  } catch (err) {
    // Log no console mas não trava — audit log nunca deve bloquear ação
    console.error("[auditLog] falha ao registrar:", err);
  }
}

// ============================================
// Helpers de custo de IA
// ============================================

// Estimativa em USD por análise (média 5000 tokens: ~3000 in + 2000 out)
const CUSTO_USD = {
  gemini: 0.008, // Gemini 2.5 Flash: $0.30/1M in + $2.50/1M out
  claude: 0.018, // Claude Haiku 4.5: $1/1M in + $5/1M out
};

const USD_PARA_BRL = 5.5;

export function calcularCustoEstimado(
  qtdAnalises: number,
  provider: "gemini" | "claude" = "gemini"
): { usd: number; brl: number } {
  const usd = qtdAnalises * CUSTO_USD[provider];
  return { usd, brl: usd * USD_PARA_BRL };
}

/**
 * Calcula custo total combinando análises por provider.
 */
export function calcularCustoMisto(
  porProvider: Record<"gemini" | "claude", number>
): { usd: number; brl: number } {
  const usd =
    porProvider.gemini * CUSTO_USD.gemini +
    porProvider.claude * CUSTO_USD.claude;
  return { usd, brl: usd * USD_PARA_BRL };
}

/**
 * Labels amigáveis para cada tipo de action.
 */
export const ACTION_LABELS: Record<AdminAction, string> = {
  "user.role_changed": "Role alterado",
  "user.suspended": "Usuário suspenso",
  "user.reactivated": "Usuário reativado",
  "user.deleted": "Usuário deletado",
  "analysis.deleted": "Análise deletada",
  "setting.updated": "Configuração atualizada",
  "export.csv": "Exportação CSV",
};
