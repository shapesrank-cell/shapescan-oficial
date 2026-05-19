"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSuperAdmin } from "@/lib/admin";
import { logAction } from "@/lib/auditLog";

type PermissaoResult =
  | { autorizado: false; erro: string }
  | { autorizado: true };

async function checarPermissao(): Promise<PermissaoResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { autorizado: false, erro: "Não autenticado" };

  const { data: perfil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!isSuperAdmin(user.email, perfil?.role)) {
    return { autorizado: false, erro: "Sem permissão" };
  }
  return { autorizado: true };
}

export async function deletarAnalise(
  analiseId: string,
  confirmacao: string,
  redirecionarPara?: string
) {
  const check = await checarPermissao();
  if (!check.autorizado) return { erro: check.erro };

  if (confirmacao !== "DELETAR") {
    return { erro: "Confirmação incorreta. Digite DELETAR." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("analyses").delete().eq("id", analiseId);
  if (error) return { erro: error.message };

  await logAction({
    action: "analysis.deleted",
    targetType: "analysis",
    targetId: analiseId,
  });

  revalidatePath("/admin/analises");
  if (redirecionarPara) redirect(redirecionarPara);
  return { sucesso: true };
}

export async function exportarAnalisesCSV(): Promise<{ csv?: string; erro?: string }> {
  const check = await checarPermissao();
  if (!check.autorizado) return { erro: check.erro };

  const admin = createAdminClient();
  const { data: analises } = await admin
    .from("analyses")
    .select("id, user_id, criado_em, resultado, dados_entrada, provider_ia")
    .order("criado_em", { ascending: false });

  const linhas = [
    [
      "ID",
      "User ID",
      "Provider",
      "Biotipo",
      "Peso",
      "Altura",
      "Objetivo",
      "Criado em",
    ].join(","),
    ...(analises ?? []).map((a) => {
      const r = a.resultado as { biotipo?: string };
      const d = a.dados_entrada as {
        peso?: string;
        altura?: string;
        objetivo?: string;
      };
      return [
        a.id,
        a.user_id,
        a.provider_ia ?? "gemini",
        r?.biotipo ?? "",
        d?.peso ?? "",
        d?.altura ?? "",
        d?.objetivo ?? "",
        new Date(a.criado_em).toISOString(),
      ].join(",");
    }),
  ];

  await logAction({
    action: "export.csv",
    targetType: "export",
    metadata: { tipo: "analises", total: analises?.length ?? 0 },
  });

  return { csv: linhas.join("\n") };
}
