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
  redirect("/dashboard");
}

/**
 * Cadastra novo usuário com email + senha + nome.
 */
export async function cadastro(formData: FormData): Promise<AuthResult> {
  const email = (formData.get("email") as string)?.trim();
  const senha = formData.get("senha") as string;
  const nome = (formData.get("nome") as string)?.trim();

  if (!email || !senha || !nome) {
    return { erro: "Preencha todos os campos." };
  }

  if (senha.length < 6) {
    return { erro: "A senha precisa ter ao menos 6 caracteres." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
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

  revalidatePath("/", "layout");
  redirect("/dashboard");
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
