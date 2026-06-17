-- Kitoo — chat de soutien SIMULÉ (données de santé sensibles).
-- Une conversation par utilisateur ; messages user/pro. RLS stricte : chacun
-- n'accède qu'à ses propres données. Les réponses « pro » sont scénarisées
-- côté serveur (jamais un clinicien réel ni un service d'urgence).
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index conversations_user_key on public.conversations (user_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  sender text not null check (sender in ('user', 'pro')),
  content text not null check (char_length(content) between 1 and 2000),
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);
create index messages_conv_idx on public.messages (conversation_id, created_at);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "conversations_select_own" on public.conversations
  for select to authenticated using (auth.uid() = user_id);
create policy "conversations_insert_own" on public.conversations
  for insert to authenticated with check (auth.uid() = user_id);
create policy "conversations_update_own" on public.conversations
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "messages_select_own" on public.messages
  for select to authenticated using (auth.uid() = user_id);
create policy "messages_insert_own" on public.messages
  for insert to authenticated with check (auth.uid() = user_id);
