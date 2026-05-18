"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RoleValido = "user" | "workspace_admin" | "super_admin";

export async function alterarRole(userId: string, novoRole: RoleValido) {
  // Verifica que o solicitante é super_admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { erro: "Não autenticado" };

  const { data: perfil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (perfil?.role !== "super_admin") return { erro: "Sem permissão" };

  // Não permite remover o próprio super_admin status
  if (userId === user.id && novoRole !== "super_admin") {
    return { erro: "Você não pode remover seu próprio acesso de super admin" };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ role: novoRole })
    .eq("id", userId);

  if (error) return { erro: error.message };

  revalidatePath("/admin/usuarios");
  return { sucesso: true };
}
