/**
 * Cliente Supabase para uso no SERVIDOR (Server Components, API Routes, Server Actions).
 *
 * Use este cliente quando você precisar acessar o banco de dados ou
 * autenticação a partir de código que roda no servidor.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // `setAll` é chamado em um Server Component. Pode ser ignorado se
            // você tem middleware atualizando sessões de usuário.
          }
        },
      },
    }
  );
}
