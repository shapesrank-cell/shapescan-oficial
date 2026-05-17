-- ============================================
-- ShapeScan: Setup de Autenticação e Análises
-- ============================================
-- Cole este arquivo INTEIRO no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/omoniqnveezoxbaakjrb/sql/new
-- É seguro rodar várias vezes — só cria o que ainda não existe.
-- ============================================

-- TABELA: profiles (dados extras do usuário)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  nome text,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- FUNÇÃO + TRIGGER: cria perfil automaticamente no cadastro
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, new.raw_user_meta_data->>'nome');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- TABELA: analyses (análises salvas)
create table if not exists public.analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  dados_entrada jsonb not null,
  resultado jsonb not null,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.analyses enable row level security;

drop policy if exists "analyses_select_own" on public.analyses;
create policy "analyses_select_own" on public.analyses for select using (auth.uid() = user_id);

drop policy if exists "analyses_insert_own" on public.analyses;
create policy "analyses_insert_own" on public.analyses for insert with check (auth.uid() = user_id);
