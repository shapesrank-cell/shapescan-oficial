-- ============================================
-- ShapeScan: Check-ins de evolução (peso + medidas + foto antes/depois)
-- ============================================
-- Cole este arquivo INTEIRO no SQL Editor do Supabase (projeto ATIVO):
-- https://supabase.com/dashboard/project/gnvsgftorqfkcphkjgau/sql/new
-- É seguro rodar várias vezes — só cria o que ainda não existe.
-- ============================================

-- TABELA: checkins (cada linha = 1 registro de evolução do usuário)
create table if not exists public.checkins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  -- peso é obrigatório (em kg); medidas em cm são opcionais
  peso numeric(5,1) not null
    check (peso >= 20 and peso <= 400),
  cintura numeric(5,1)
    check (cintura is null or (cintura >= 20 and cintura <= 300)),
  quadril numeric(5,1)
    check (quadril is null or (quadril >= 20 and quadril <= 300)),
  braco numeric(5,1)
    check (braco is null or (braco >= 10 and braco <= 150)),
  peito numeric(5,1)
    check (peito is null or (peito >= 30 and peito <= 300)),
  coxa numeric(5,1)
    check (coxa is null or (coxa >= 20 and coxa <= 200)),
  -- caminho da foto dentro do bucket 'checkins' (ex: "<user_id>/<uuid>.jpg")
  foto_path text,
  observacoes text check (observacoes is null or char_length(observacoes) <= 500),
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.checkins enable row level security;

-- Cada usuário só enxerga/mexe nos próprios check-ins
drop policy if exists "checkins_select_own" on public.checkins;
create policy "checkins_select_own" on public.checkins
  for select using (auth.uid() = user_id);

drop policy if exists "checkins_insert_own" on public.checkins;
create policy "checkins_insert_own" on public.checkins
  for insert with check (auth.uid() = user_id);

drop policy if exists "checkins_delete_own" on public.checkins;
create policy "checkins_delete_own" on public.checkins
  for delete using (auth.uid() = user_id);

-- Index pra listar rápido o histórico do usuário em ordem cronológica
create index if not exists checkins_user_data_idx
  on public.checkins (user_id, criado_em desc);

-- ============================================
-- STORAGE: bucket privado pras fotos de progresso
-- ============================================

-- Bucket privado (público = false). As fotos só são acessadas via signed URL.
insert into storage.buckets (id, name, public)
values ('checkins', 'checkins', false)
on conflict (id) do nothing;

-- Policies de storage: o usuário só acessa arquivos dentro da pasta
-- com o próprio user_id (ex: "<user_id>/foto.jpg").
-- storage.foldername(name)[1] = primeira parte do caminho = a pasta raiz.

drop policy if exists "checkins_storage_select_own" on storage.objects;
create policy "checkins_storage_select_own" on storage.objects
  for select using (
    bucket_id = 'checkins'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "checkins_storage_insert_own" on storage.objects;
create policy "checkins_storage_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'checkins'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "checkins_storage_delete_own" on storage.objects;
create policy "checkins_storage_delete_own" on storage.objects
  for delete using (
    bucket_id = 'checkins'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
