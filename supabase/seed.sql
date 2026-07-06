-- Kitoo — seed de données de démonstration.
--
-- Exécuté automatiquement par `supabase db reset` (dev local) APRÈS les
-- migrations, et applicable à distance par `scripts/deploy.sh`
-- (`psql "$SUPABASE_DB_URL" -f supabase/seed.sql`).
--
-- IMPORTANT :
--  * Les données de référence de PRODUCTION sont déjà embarquées dans les
--    migrations versionnées (`supabase/migrations/`). Un simple
--    `supabase db push` sur un projet neuf suffit donc à obtenir une base
--    complète (schéma + RLS + triggers + contenu).
--  * Ce fichier est **100 % idempotent** : ré-exécutable sans doublon ni effet
--    de bord (ON CONFLICT / garde « si vide »). Il sert de filet pour peupler
--    une base au schéma nu et de seed standard pour le dev local.
--  * Aucune donnée personnelle, aucun secret. Le compte de démo se crée par
--    l'inscription in-app (cf. DEPLOY.md).

-- 1. Tags d'humeur prédéfinis (référence en lecture seule). ------------------
insert into public.mood_tags (slug, label) values
  ('stress',     'Stress'),
  ('fatigue',    'Fatigue'),
  ('joie',       'Joie'),
  ('anxiete',    'Anxiété'),
  ('motivation', 'Motivation'),
  ('sommeil',    'Sommeil'),
  ('solitude',   'Solitude'),
  ('gratitude',  'Gratitude'),
  ('colere',     'Colère'),
  ('serenite',   'Sérénité')
on conflict (slug) do nothing;

-- 2. Exercices interactifs de démonstration (clé unique = slug). -------------
insert into public.exercises
  (slug, title, category, description, duration_sec, steps, theme, mood_levels)
values
  (
    'respiration-478',
    'Respiration 4-7-8',
    'respiration',
    'Une respiration apaisante : inspire 4s, retiens 7s, expire 8s. Quatre cycles pour relâcher la tension.',
    76,
    '{"cycles":4,"phases":[{"label":"Inspire","seconds":4},{"label":"Retiens","seconds":7},{"label":"Expire","seconds":8}]}'::jsonb,
    'stress',
    array[1, 2, 3]
  ),
  (
    'coherence-cardiaque',
    'Cohérence cardiaque',
    'respiration',
    'Inspire 5s, expire 5s, en rythme régulier. Six cycles pour revenir au calme.',
    60,
    '{"cycles":6,"phases":[{"label":"Inspire","seconds":5},{"label":"Expire","seconds":5}]}'::jsonb,
    'stress',
    array[1, 2, 3, 4]
  ),
  (
    'ancrage-5-sens',
    'Ancrage des 5 sens',
    'ancrage',
    'Un exercice d''ancrage pour revenir au présent en mobilisant tes cinq sens, à ton rythme.',
    75,
    '{"cycles":1,"phases":[{"label":"5 choses que tu vois","seconds":15},{"label":"4 choses que tu peux toucher","seconds":15},{"label":"3 choses que tu entends","seconds":15},{"label":"2 choses que tu sens","seconds":15},{"label":"1 chose que tu goûtes","seconds":15}]}'::jsonb,
    'stress',
    array[1, 2]
  )
on conflict (slug) do nothing;

-- 3. Ressources de démonstration. --------------------------------------------
-- Inséré UNIQUEMENT si la table est vide, pour ne jamais dupliquer le hub de
-- ressources déjà seedé par les migrations (et ne rien ajouter en production).
insert into public.resources
  (slug, title, summary, theme, type, format, content,
   author_or_validation, read_time, mood_levels)
select * from (values
  (
    'demo-apprivoiser-le-stress',
    'Apprivoiser le stress au quotidien',
    'Comprendre ce qui se joue quand le stress monte, et des gestes simples pour relâcher la pression.',
    'stress', 'article', 'article',
    E'Le stress est une réaction normale du corps face à un défi. Le souci, c''est quand il s''installe.\n\n## Trois gestes pour relâcher\n- Respire lentement : inspire 4 secondes, expire 6.\n- Bouge un peu : marcher 5 minutes décharge la tension.\n- Pose ce qui t''encombre : écris ce qui te pèse, sans filtre.',
    'Rédigé et validé par des professionnels de santé', '6 min', array[1, 2, 3]
  ),
  (
    'demo-mieux-dormir',
    'Retrouver un sommeil réparateur',
    'Des repères doux pour des nuits plus calmes.',
    'sommeil', 'article', 'article',
    E'Ton corps aime la régularité : se lever à des heures proches stabilise l''horloge interne.\n\n## Préparer la nuit\n- Baisse la lumière une heure avant le coucher.\n- Garde le lit pour dormir.\n- Un rituel court signale au corps qu''il peut relâcher.',
    'Rédigé et validé par des professionnels de santé', '7 min', array[1, 2, 3]
  ),
  (
    'demo-3114',
    '3114 - Prévention du suicide',
    'Numéro national de prévention du suicide : écoute professionnelle, gratuite et confidentielle, 24h/24.',
    'ecoute', 'lien', 'lien',
    '', null, null, array[1, 2, 3, 4, 5]
  )
) as seed(slug, title, summary, theme, type, format, content,
          author_or_validation, read_time, mood_levels)
where not exists (select 1 from public.resources);

-- Note « lien » de démo : renseigner son URL après insertion si besoin
-- (les liens réels vivent dans la migration 20260619100100_seed_resources_hub).
update public.resources
set url = 'https://3114.fr', source = '3114'
where slug = 'demo-3114' and url is null;
