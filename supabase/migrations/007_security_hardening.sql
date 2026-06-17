-- ============================================
-- ShapeScan: Security Hardening v2 (auditoria de segurança)
-- ============================================
-- Cole este arquivo INTEIRO no SQL Editor do Supabase (projeto ATIVO):
-- https://supabase.com/dashboard/project/gnvsgftorqfkcphkjgau/sql/new
-- É seguro rodar várias vezes.
-- ============================================

-- --------------------------------------------
-- CRÍTICO: impedir escalonamento de privilégio em profiles
-- --------------------------------------------
-- A policy "profiles_update_own" permite o usuário editar a PRÓPRIA linha.
-- Porém, sem restrição de COLUNA, um usuário malicioso poderia rodar no
-- navegador:
--     supabase.from('profiles').update({ role: 'super_admin' }).eq('id', <seu_id>)
-- e virar super admin (a checagem isSuperAdmin lê justamente essa coluna).
--
-- Correção: tirar o UPDATE total do papel "authenticated" e devolver o UPDATE
-- apenas nas colunas que o usuário PODE editar. As colunas sensíveis (role,
-- status) ficam de fora — só o painel admin (service_role) consegue alterá-las,
-- pois o service_role ignora esses grants.

REVOKE UPDATE ON public.profiles FROM anon, authenticated;

GRANT UPDATE (
  nome,
  sexo,
  idade,
  peso,
  altura,
  nivel_atividade,
  objetivo,
  perfil_completo,
  perfil_atualizado_em,
  termos_aceitos_em
) ON public.profiles TO authenticated;

-- Defesa extra na própria policy: garante que a linha continua sendo a do
-- usuário (não dá pra "mover" o perfil pra outro id num UPDATE).
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- --------------------------------------------
-- Verificação rápida (opcional): rode pra conferir os grants de coluna
-- --------------------------------------------
-- SELECT grantee, privilege_type, column_name
-- FROM information_schema.column_privileges
-- WHERE table_name = 'profiles' AND grantee = 'authenticated'
-- ORDER BY column_name;
-- (role e status NÃO devem aparecer na lista de UPDATE)
