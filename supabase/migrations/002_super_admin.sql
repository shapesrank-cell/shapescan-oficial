-- ============================================
-- ShapeScan: Super Admin — Roles, Workspaces e App Settings
-- ============================================
-- Cole este arquivo INTEIRO no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/omoniqnveezoxbaakjrb/sql/new
-- ============================================

-- 1. Adiciona coluna role em profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'workspace_admin', 'super_admin'));

-- 2. Função helper: verifica se o usuário atual é super_admin
--    SECURITY DEFINER faz ela rodar como postgres (evita recursão de RLS)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- 3. Tabela: workspaces (estrutura para futuro B2B multi-tenant)
CREATE TABLE IF NOT EXISTS public.workspaces (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  owner_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  criado_em  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workspaces_super_admin_all" ON public.workspaces;
CREATE POLICY "workspaces_super_admin_all" ON public.workspaces
  FOR ALL USING (public.is_super_admin());

-- 4. Tabela: app_settings (API keys, feature flags — gerenciadas pelo admin)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_settings_super_admin_all" ON public.app_settings;
CREATE POLICY "app_settings_super_admin_all" ON public.app_settings
  FOR ALL USING (public.is_super_admin());

-- 5. Inserir feature flags padrão (se ainda não existirem)
INSERT INTO public.app_settings (key, value)
VALUES
  ('feature_flags', '{"foto_upload":true,"claude_ai":false}'),
  ('gemini_api_key', ''),
  ('anthropic_api_key', '')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- PASSO MANUAL: Promova o dono para super_admin
-- ============================================
-- 1. Descubra seu UUID:
--    SELECT id FROM auth.users WHERE email = 'goldenf0408@gmail.com';
--
-- 2. Substitua <SEU-UUID> e rode:
--    UPDATE public.profiles SET role = 'super_admin' WHERE id = '<SEU-UUID>';
-- ============================================
