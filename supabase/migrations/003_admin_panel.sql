-- ============================================
-- ShapeScan: Admin Panel v2 — Status, Provider IA, Audit Log
-- ============================================
-- Cole este arquivo INTEIRO no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/omoniqnveezoxbaakjrb/sql/new
-- ============================================

-- 1. Coluna status em profiles (active / suspended)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'suspended'));

-- 2. Coluna provider_ia em analyses (para calcular custo)
ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS provider_ia TEXT NOT NULL DEFAULT 'gemini'
  CHECK (provider_ia IN ('gemini', 'claude'));

-- 3. Tabela audit_log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT,
  action      TEXT NOT NULL,
  target_type TEXT,
  target_id   TEXT,
  metadata    JSONB,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_log_criado_em_idx ON public.audit_log (criado_em DESC);
CREATE INDEX IF NOT EXISTS audit_log_admin_id_idx ON public.audit_log (admin_id);
CREATE INDEX IF NOT EXISTS audit_log_action_idx ON public.audit_log (action);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_log_super_admin_all" ON public.audit_log;
CREATE POLICY "audit_log_super_admin_all" ON public.audit_log
  FOR ALL USING (public.is_super_admin());
