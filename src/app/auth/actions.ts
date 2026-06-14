"use server";

/**
 * Server Actions de autenticação.
 *
 * Server Actions são funções que rodam no servidor mas podem ser chamadas
 * diretamente de formulários HTML — sem precisar criar API routes.
 *
 * Uso no formulário: <form action={login}>
 */

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthResult =
  | { erro: string }
  | undefined; // sucesso → redirect (não retorna)

/**
 * Faz login com email + senha.
 * Retorna { erro } se falhar. Em caso de sucesso, redireciona.
 */
export async function login(formData: FormData): Promise<AuthResult> {
  const email = (formData.get("email") as string)?.trim();
  const senha = formData.get("senha") as string;
  const redirectTo = (formData.get("redirect") as string) || "/dashboard";

  if (!email || !senha) {
    return { erro: "Preencha email e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    // Mensagens amigáveis em PT-BR
    if (error.message.includes("Invalid login credentials")) {
      return { erro: "Email ou senha incorretos." };
    }
    if (error.message.includes("Email not confirmed")) {
      return { erro: "Confirme seu email antes de entrar." };
    }
    return { erro: "Erro ao entrar. Tente novamente." };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

/**
 * Cadastra novo usuário com email + senha + nome.
 */
export async function cadastro(formData: FormData): Promise<AuthResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const senha = formData.get("senha") as string;
  const nome = (formData.get("nome") as string)?.trim();
  const aceitouTermos = formData.get("aceitou_termos") === "true";
  const redirectTo = (formData.get("redirect") as string) || "/dashboard";

  if (!email || !senha || !nome) {
    return { erro: "Preencha todos os campos." };
  }

  if (senha.length < 8) {
    return { erro: "A senha precisa ter ao menos 8 caracteres." };
  }

  if (!aceitouTermos) {
    return { erro: "Aceite os Termos de Uso para continuar." };
  }

  // Validação básica de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { erro: "Email inválido." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { nome }, // vira raw_user_meta_data.nome → o trigger SQL salva em profiles
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { erro: "Este email já tem cadastro. Faça login." };
    }
    return { erro: "Erro ao cadastrar. Tente novamente." };
  }

  // Registra aceite dos termos no perfil
  if (data.user) {
    try {
      await supabase
        .from("profiles")
        .update({ termos_aceitos_em: new Date().toISOString() })
        .eq("id", data.user.id);
    } catch {
      // Não bloqueia o cadastro se falhar — termos foram aceitos no front
    }
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

/**
 * Envia email de redefinição de senha via Supabase.
 */
export async function esqueceuSenha(formData: FormData): Promise<{ erro?: string; sucesso?: boolean }> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email) {
    return { erro: "Preencha o email." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { erro: "Email inválido." };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") || "https://shapescan-oficial.vercel.app";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/redefinir-senha`,
  });

  if (error) {
    console.error("Erro ao enviar email de reset:", error);
    return { erro: "Erro ao enviar email. Tente novamente." };
  }

  return { sucesso: true };
}

/**
 * Inicia login com Google (OAuth via Supabase).
 * Retorna a URL pra qual o client deve redirecionar (tela do Google).
 */
export async function loginComGoogle(formData: FormData): Promise<{ erro?: string; url?: string }> {
  const redirectTo = (formData.get("redirect") as string) || "/dashboard";
  const supabase = await createClient();
  const origin = (await headers()).get("origin") || "https://shapescan-oficial.vercel.app";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
    },
  });

  if (error || !data.url) {
    return { erro: "Erro ao iniciar login com Google. Tente novamente." };
  }

  return { url: data.url };
}

/**
 * Faz logout e volta pra home.
 */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
