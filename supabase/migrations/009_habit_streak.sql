-- ============================================
-- ShapeScan: Ofensiva (streak) diária de constância
-- ============================================
-- Cole INTEIRO no SQL Editor do Supabase (projeto ATIVO):
-- https://supabase.com/dashboard/project/gnvsgftorqfkcphkjgau/sql/new
-- É seguro rodar várias vezes — só cria o que ainda não existe.
-- ============================================

-- TABELA: habit_log (1 linha = 1 dia em que o usuário cumpriu o plano)
-- Um registro por dia por usuário (a constraint UNIQUE garante isso).
create table if not exists public.habit_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  -- dia local (America/Sao_Paulo) marcado, no formato date
  dia date not null,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, dia)
);

alter table public.habit_log enable row level security;

-- Cada usuário só enxerga/mexe nos próprios dias.
drop policy if exists "habit_log_select_own" on public.habit_log;
create policy "habit_log_select_own" on public.habit_log
  for select using (auth.uid() = user_id);

drop policy if exists "habit_log_insert_own" on public.habit_log;
create policy "habit_log_insert_own" on public.habit_log
  for insert with check (auth.uid() = user_id);

drop policy if exists "habit_log_delete_own" on public.habit_log;
create policy "habit_log_delete_own" on public.habit_log
  for delete using (auth.uid() = user_id);

-- Index pra buscar rápido os dias do usuário (mais recentes primeiro).
create index if not exists habit_log_user_dia_idx
  on public.habit_log (user_id, dia desc);
