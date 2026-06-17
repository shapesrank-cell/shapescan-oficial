"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSuperAdmin } from "@/lib/admin";
import { logAction } from "@/lib/auditLog";

type RoleValido = "user" | "workspace_admin" | "super_admin";

type PermissaoResult =
  | { autorizado: false; erro: string }
  | { autorizado: true; user: { id: string; email?: string } };

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
  return { autorizado: true, user: { id: user.id, email: user.email } };
}

export async function alterarRole(userId: string, novoRole: RoleValido) {
  const check = await checarPermissao();
  if (!check.autorizado) return { erro: check.erro };

  if (userId === check.user.id && novoRole !== "super_admin") {
    return { erro: "Você não pode remover seu próprio acesso de super admin" };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ role: novoRole })
    .eq("id", userId);

  if (error) return { erro: error.message };

  await logAction({
    action: "user.role_changed",
    targetType: "user",
    targetId: userId,
    metadata: { novoRole },
  });

  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${userId}`);
  return { sucesso: true };
}

export async function suspenderUsuario(userId: string) {
  const check = await checarPermissao();
  if (!check.autorizado) return { erro: check.erro };

  if (userId === check.user.id) {
    return { erro: "Você não pode suspender sua própria conta" };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ status: "suspended" })
    .eq("id", userId);

  if (error) return { erro: error.message };

  await logAction({
    action: "user.suspended",
    targetType: "user",
    targetId: userId,
  });

  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${userId}`);
  return { sucesso: true };
}

export async function reativarUsuario(userId: string) {
  const check = await checarPermissao();
  if (!check.autorizado) return { erro: check.erro };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ status: "active" })
    .eq("id", userId);

  if (error) return { erro: error.message };

  await logAction({
    action: "user.reactivated",
    targetType: "user",
    targetId: userId,
  });

  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${userId}`);
  return { sucesso: true };
}

export async function deletarUsuario(userId: string, confirmacao: string) {
  const check = await checarPermissao();
  if (!check.autorizado) return { erro: check.erro };

  if (userId === check.user.id) {
    return { erro: "Você não pode deletar sua própria conta" };
  }

  if (confirmacao !== "DELETAR") {
    return { erro: "Confirmação incorreta. Digite DELETAR." };
  }

  const admin = createAdminClient();

  // Remove as fotos de progresso do storage (não saem em cascata)
  const { data: checkins } = await admin
    .from("checkins")
    .select("foto_path")
    .eq("user_id", userId);
  const fotos = (checkins ?? [])
    .map((c) => c.foto_path)
    .filter((p): p is string => Boolean(p));
  if (fotos.length > 0) {
    await admin.storage.from("checkins").remove(fotos);
  }

  // Apaga check-ins, análises e perfil do usuário
  await admin.from("checkins").delete().eq("user_id", userId);
  await admin.from("analyses").delete().eq("user_id", userId);
  await admin.from("profiles").delete().eq("id", userId);
  // Apaga usuário do auth
  const { error: authErr } = await admin.auth.admin.deleteUser(userId);
  if (authErr) return { erro: authErr.message };

  await logAction({
    action: "user.deleted",
    targetType: "user",
    targetId: userId,
  });

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

// ============================================
// Exportação CSV
// ============================================

export async function exportarUsuariosCSV(): Promise<{ csv?: string; erro?: string }> {
  const check = await checarPermissao();
  if (!check.autorizado) return { erro: check.erro };

  const admin = createAdminClient();
  const { data: perfis } = await admin
    .from("profiles")
    .select("id, nome, role, status, criado_em")
    .order("criado_em", { ascending: false });

  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailPorId = new Map(
    authData?.users.map((u) => [u.id, u.email ?? ""]) ?? []
  );

  const { data: analises } = await admin.from("analyses").select("user_id");
  const contagem = new Map<string, number>();
  analises?.forEach(({ user_id }) => {
    contagem.set(user_id, (contagem.get(user_id) ?? 0) + 1);
  });

  const linhas = [
    ["ID", "Nome", "Email", "Role", "Status", "Análises", "Cadastro"].join(","),
    ...(perfis ?? []).map((p) =>
      [
        p.id,
        escaparCsv(p.nome ?? ""),
        escaparCsv(emailPorId.get(p.id) ?? ""),
        p.role ?? "user",
        p.status ?? "active",
        contagem.get(p.id) ?? 0,
        new Date(p.criado_em).toISOString(),
      ].join(",")
    ),
  ];

  await logAction({
    action: "export.csv",
    targetType: "export",
    metadata: { tipo: "usuarios", total: perfis?.length ?? 0 },
  });

  return { csv: linhas.join("\n") };
}

function escaparCsv(v: string): string {
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}
