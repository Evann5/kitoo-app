-- Kitoo — demandes d'être rappelé par un·e professionnel·le de santé.
-- Donnée sensible (contact). RLS stricte : chacun ne voit/crée que les siennes.
create table public.callback_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  phone text check (phone is null or char_length(phone) between 3 and 30),
  note text check (note is null or char_length(note) <= 500),
  status text not null default 'pending'
    check (status in ('pending', 'done', 'cancelled')),
  created_at timestamptz not null default now()
);
create index callback_requests_user_idx
  on public.callback_requests (user_id, created_at desc);

alter table public.callback_requests enable row level security;

create policy "callback_requests_select_own" on public.callback_requests
  for select to authenticated using (auth.uid() = user_id);
create policy "callback_requests_insert_own" on public.callback_requests
  for insert to authenticated with check (auth.uid() = user_id);
