-- Kitoo — schéma de données du MVP
-- Données de santé (humeurs) = sensibles RGPD. Les tables perso sont verrouillées
-- par RLS dans la migration suivante (20260616090100_enable_rls.sql).
--
-- Choix « tags » : table de référence `mood_tags` + table de liaison
-- `mood_entry_tags` (plutôt qu'une colonne `text[]`). Raison : tags prédéfinis
-- réutilisables (libellés FR centralisés, stats par tag faciles via jointure) et
-- intégrité référentielle. Le surcoût RLS (vérifier l'appartenance via l'entrée
-- parente) est assumé.

-- Fonction utilitaire : met à jour `updated_at` à chaque UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles : 1 ligne par utilisateur. Pas de données sensibles superflues
-- (prénom + préférences seulement ; aucune adresse, etc.).
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  prenom text,
  notif_prefs jsonb not null default '{}'::jsonb,
  accessibility_prefs jsonb not null default '{}'::jsonb, -- ex. {"dyslexia":true,"colorblind":false}
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Crée automatiquement le profil à l'inscription (auth.users → profiles).
-- SECURITY DEFINER : s'exécute avec les droits du propriétaire (contourne RLS),
-- search_path figé pour la sécurité.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, prenom)
  values (new.id, nullif(new.raw_user_meta_data ->> 'prenom', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- mood_entries : 1 entrée d'humeur par jour et par utilisateur.
-- ---------------------------------------------------------------------------
create table public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null default current_date,
  level int not null check (level between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mood_entries_one_per_day unique (user_id, entry_date)
);

create index mood_entries_user_date_idx
  on public.mood_entries (user_id, entry_date desc);

create trigger mood_entries_set_updated_at
  before update on public.mood_entries
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- mood_tags : tags prédéfinis (référence, pas de données perso).
-- mood_entry_tags : liaison N-N entre une entrée et ses tags.
-- ---------------------------------------------------------------------------
create table public.mood_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null
);

create table public.mood_entry_tags (
  mood_entry_id uuid not null references public.mood_entries (id) on delete cascade,
  tag_id uuid not null references public.mood_tags (id) on delete cascade,
  primary key (mood_entry_id, tag_id)
);

create index mood_entry_tags_tag_idx on public.mood_entry_tags (tag_id);

-- ---------------------------------------------------------------------------
-- resources : contenus bien-être (lecture seule côté app). Pas de données perso.
-- mood_levels : niveaux d'humeur auxquels la ressource est pertinente (suggestion).
-- ---------------------------------------------------------------------------
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  theme text not null,        -- stress / sommeil / confiance / relations …
  type text not null,         -- article / exercice / conseil
  summary text not null,
  content text not null,
  mood_levels int[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- consents : base du consentement RGPD (un type de consentement par ligne).
-- ---------------------------------------------------------------------------
create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,                 -- ex. data_processing
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index consents_user_idx on public.consents (user_id);
