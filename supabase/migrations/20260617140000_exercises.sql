-- Kitoo — séparation Ressources / Exercices.
--
-- `resources` reste les contenus À LIRE (article / avis / conseil) ; les
-- anciennes lignes `type = 'exercice'` (du texte d'astuce, pas un minuteur)
-- sont reclassées en `conseil`. Les vrais exercices interactifs (minuteur,
-- étapes) vivent dans la nouvelle table `exercises`, et chaque session jouée
-- est historisée dans `exercise_sessions` (RLS stricte).

-- Recentrage de resources : plus de type « exercice ».
update public.resources set type = 'conseil' where type = 'exercice';

-- ---------------------------------------------------------------------------
-- exercises : catalogue d'exercices interactifs (référence, lecture seule).
-- `steps` (jsonb) décrit le minuteur : { cycles, phases:[{label, seconds}] }.
-- ---------------------------------------------------------------------------
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,                 -- respiration / ancrage / relaxation …
  description text not null,
  duration_sec int not null check (duration_sec > 0),
  steps jsonb not null default '{}'::jsonb,
  theme text not null,
  mood_levels int[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.exercises enable row level security;

create policy "exercises_select_authenticated" on public.exercises
  for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- exercise_sessions : historique des sessions jouées (données perso → RLS).
-- ---------------------------------------------------------------------------
create table public.exercise_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_sec int not null default 0 check (duration_sec >= 0),
  completed boolean not null default false
);

create index exercise_sessions_user_idx
  on public.exercise_sessions (user_id, started_at desc);

alter table public.exercise_sessions enable row level security;

create policy "exercise_sessions_select_own" on public.exercise_sessions
  for select to authenticated using (auth.uid() = user_id);

create policy "exercise_sessions_insert_own" on public.exercise_sessions
  for insert to authenticated with check (auth.uid() = user_id);

create policy "exercise_sessions_update_own" on public.exercise_sessions
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
