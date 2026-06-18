-- ============================================
-- ShapeScan: Medidas extras nos check-ins (pra ranking mais preciso)
-- ============================================
-- Cole INTEIRO no SQL Editor do Supabase (projeto ATIVO):
-- https://supabase.com/dashboard/project/gnvsgftorqfkcphkjgau/sql/new
-- É seguro rodar várias vezes — só adiciona o que ainda não existe.
-- ============================================

-- Novas circunferências (cm), todas OPCIONAIS. Os ranges espelham
-- src/lib/checkinValidation.ts (validação dupla: app + banco).
alter table public.checkins
  add column if not exists ombros numeric(5,1)
    check (ombros is null or (ombros >= 60 and ombros <= 250)),
  add column if not exists panturrilha numeric(5,1)
    check (panturrilha is null or (panturrilha >= 15 and panturrilha <= 100)),
  add column if not exists antebraco numeric(5,1)
    check (antebraco is null or (antebraco >= 10 and antebraco <= 80)),
  add column if not exists pescoco numeric(5,1)
    check (pescoco is null or (pescoco >= 20 and pescoco <= 100));
