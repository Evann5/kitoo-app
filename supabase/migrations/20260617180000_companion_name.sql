-- Kitoo — nom personnalisé du compagnon (mascotte) sur la page d'accueil.
-- Champ simple sur `profiles` ; null = « Kitoo » par défaut. Soumis à la RLS
-- existante de `profiles` (chacun ne lit/écrit que la sienne).
alter table public.profiles
  add column if not exists companion_name text
  check (companion_name is null or char_length(companion_name) between 1 and 30);

comment on column public.profiles.companion_name is
  'Nom personnalisé du compagnon (mascotte) ; null = « Kitoo » par défaut.';
