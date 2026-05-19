-- ============================================
-- ShapeScan: Perfil com dados básicos (separação perfil vs análise)
-- ============================================
-- Cole este arquivo INTEIRO no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/omoniqnveezoxbaakjrb/sql/new
-- ============================================

-- Adiciona dados básicos no perfil (preenchidos no onboarding)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS sexo TEXT
    CHECK (sexo IN ('masculino', 'feminino', 'outro')),
  ADD COLUMN IF NOT EXISTS idade INTEGER
    CHECK (idade IS NULL OR (idade >= 10 AND idade <= 110)),
  ADD COLUMN IF NOT EXISTS peso NUMERIC(5,1)
    CHECK (peso IS NULL OR (peso >= 20 AND peso <= 400)),
  ADD COLUMN IF NOT EXISTS altura INTEGER
    CHECK (altura IS NULL OR (altura >= 80 AND altura <= 250)),
  ADD COLUMN IF NOT EXISTS nivel_atividade TEXT
    CHECK (nivel_atividade IN ('sedentario', 'leve', 'moderado', 'intenso')),
  ADD COLUMN IF NOT EXISTS objetivo TEXT
    CHECK (objetivo IN ('emagrecer', 'ganhar_massa', 'definir', 'saude_geral')),
  ADD COLUMN IF NOT EXISTS perfil_completo BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS perfil_atualizado_em TIMESTAMPTZ;

-- Index pra checar rapidamente quem ainda não completou perfil (analytics)
CREATE INDEX IF NOT EXISTS profiles_perfil_completo_idx
  ON public.profiles (perfil_completo);
