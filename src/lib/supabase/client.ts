/**
 * Cliente Supabase para uso no NAVEGADOR (componentes React do lado cliente).
 *
 * Use este cliente quando você precisar acessar o banco de dados ou
 * autenticação a partir de um Client Component (arquivos com "use client").
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
