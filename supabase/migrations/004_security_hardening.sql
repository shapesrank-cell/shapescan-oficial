-- ============================================
-- ShapeScan: Security Hardening — Rate Limit + Error Log + LGPD
-- ============================================
-- Cole este arquivo INTEIRO no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/omoniqnveezoxbaakjrb/sql/new
-- ============================================

-- 1. Tabela rate_limit_log: rastreia chamadas pra rate limiting persistente
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,            -- user_id ou IP
  action     TEXT NOT NULL,            -- "analyze", "login", "cadastro", etc
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rate_limit_log_lookup_idx
  ON public.rate_limit_log (identifier, action, criado_em DESC);

ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rate_limit_super_admin" ON public.rate_limit_log;
CREATE POLICY "rate_limit_super_admin" ON public.rate_limit_log
  FOR ALL USING (public.is_super_admin());

-- 2. Tabela error_log: errors em produção pra observabilidade
CREATE TABLE IF NOT EXISTS public.error_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email  TEXT,
  origem      TEXT NOT NULL,           -- "/api/analyze", "auth.login", etc
  mensagem    TEXT NOT NULL,
  stack       TEXT,
  metadata    JSONB,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS error_log_criado_em_idx ON public.error_log (criado_em DESC);
CREATE INDEX IF NOT EXISTS error_log_origem_idx ON public.error_log (origem);

ALTER TABLE public.error_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "error_log_super_admin" ON public.error_log;
CREATE POLICY "error_log_super_admin" ON public.error_log
  FOR ALL USING (public.is_super_admin());

-- 3. Coluna em profiles para aceite de termos
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS termos_aceitos_em TIMESTAMPTZ;

-- 4. Cleanup automático: remove rate_limit_log antigo (>24h) periodicamente
-- (rodar manualmente uma vez por dia ou via pg_cron se ativado)
CREATE OR REPLACE FUNCTION public.limpar_rate_limit_antigo()
RETURNS void LANGUAGE sql AS $$
  DELETE FROM public.rate_limit_log
  WHERE criado_em < NOW() - INTERVAL '24 hours';
$$;
