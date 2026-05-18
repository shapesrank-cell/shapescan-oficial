/**
 * Cliente Supabase com Service Role Key — para uso EXCLUSIVO no servidor.
 *
 * Este cliente BYPASSA o Row Level Security (RLS), ou seja, tem acesso
 * total a todas as tabelas. Use SOMENTE em Server Components e Server Actions
 * do painel /admin.
 *
 * NUNCA exponha este cliente no lado cliente (browser).
 * NUNCA use em rotas acessíveis por usuários comuns.
 */
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada. Adicione ao .env.local e nas env vars da Vercel."
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      // Desabilita persistência de sessão — service role não precisa de auth
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
