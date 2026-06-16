-- Kitoo — Row-Level Security
-- Principe : RLS activée partout, AUCUN accès par défaut, puis policies explicites.
-- Données perso : chaque utilisateur n'accède qu'à ses propres lignes
-- (auth.uid() = user_id). Référence (resources, mood_tags) : lecture seule pour
-- tout utilisateur authentifié, aucune écriture côté app.

alter table public.profiles enable row level security;
alter table public.mood_entries enable row level security;
alter table public.mood_tags enable row level security;
alter table public.mood_entry_tags enable row level security;
alter table public.resources enable row level security;
alter table public.consents enable row level security;

-- ----------------------------- profiles ------------------------------------
-- Le profil appartient à l'utilisateur : sa clé `id` EST l'uid.
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_delete_own" on public.profiles
  for delete to authenticated using (auth.uid() = id);

-- --------------------------- mood_entries ----------------------------------
create policy "mood_entries_select_own" on public.mood_entries
  for select to authenticated using (auth.uid() = user_id);

create policy "mood_entries_insert_own" on public.mood_entries
  for insert to authenticated with check (auth.uid() = user_id);

create policy "mood_entries_update_own" on public.mood_entries
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "mood_entries_delete_own" on public.mood_entries
  for delete to authenticated using (auth.uid() = user_id);

-- -------------------------- mood_entry_tags --------------------------------
-- L'appartenance passe par l'entrée parente : on n'autorise une ligne de
-- liaison que si l'entrée d'humeur visée appartient à l'utilisateur.
create policy "mood_entry_tags_select_own" on public.mood_entry_tags
  for select to authenticated using (
    exists (
      select 1 from public.mood_entries me
      where me.id = mood_entry_tags.mood_entry_id
        and me.user_id = auth.uid()
    )
  );

create policy "mood_entry_tags_insert_own" on public.mood_entry_tags
  for insert to authenticated with check (
    exists (
      select 1 from public.mood_entries me
      where me.id = mood_entry_tags.mood_entry_id
        and me.user_id = auth.uid()
    )
  );

create policy "mood_entry_tags_delete_own" on public.mood_entry_tags
  for delete to authenticated using (
    exists (
      select 1 from public.mood_entries me
      where me.id = mood_entry_tags.mood_entry_id
        and me.user_id = auth.uid()
    )
  );

-- ------------------------------ consents -----------------------------------
create policy "consents_select_own" on public.consents
  for select to authenticated using (auth.uid() = user_id);

create policy "consents_insert_own" on public.consents
  for insert to authenticated with check (auth.uid() = user_id);

create policy "consents_update_own" on public.consents
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- --------------------- resources & mood_tags (référence) -------------------
-- Lecture seule pour tout utilisateur authentifié ; aucune policy d'écriture
-- (donc insert/update/delete refusés côté app — gérés via migrations/seed).
create policy "resources_select_authenticated" on public.resources
  for select to authenticated using (true);

create policy "mood_tags_select_authenticated" on public.mood_tags
  for select to authenticated using (true);
