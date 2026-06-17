-- ============================================
-- ShapeScan: Coach IA conversacional (chat com contexto do usuário)
-- ============================================
-- Cole este arquivo INTEIRO no SQL Editor do Supabase (projeto ATIVO):
-- https://supabase.com/dashboard/project/gnvsgftorqfkcphkjgau/sql/new
-- É seguro rodar várias vezes — só cria o que ainda não existe.
-- ============================================

-- TABELA: coach_messages (cada linha = 1 mensagem da conversa com o coach IA)
-- Conversa única e contínua por usuário (sem múltiplas threads no MVP).
create table if not exists public.coach_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  -- quem falou: 'user' (a pessoa) ou 'assistente' (a IA)
  papel text not null check (papel in ('user', 'assistente')),
  conteudo text not null
    check (char_length(conteudo) >= 1 and char_length(conteudo) <= 4000),
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.coach_messages enable row level security;

-- Cada usuário só enxerga/mexe nas próprias mensagens.
-- Observação: o INSERT da resposta da IA é feito via service role (admin),
-- que faz bypass de RLS — então não precisa de policy de insert pra 'assistente'.
-- A policy de insert abaixo cobre o caso de inserir como o próprio usuário.
drop policy if exists "coach_messages_select_own" on public.coach_messages;
create policy "coach_messages_select_own" on public.coach_messages
  for select using (auth.uid() = user_id);

drop policy if exists "coach_messages_insert_own" on public.coach_messages;
create policy "coach_messages_insert_own" on public.coach_messages
  for insert with check (auth.uid() = user_id);

drop policy if exists "coach_messages_delete_own" on public.coach_messages;
create policy "coach_messages_delete_own" on public.coach_messages
  for delete using (auth.uid() = user_id);

-- Index pra carregar rápido a conversa do usuário em ordem cronológica.
create index if not exists coach_messages_user_data_idx
  on public.coach_messages (user_id, criado_em asc);
