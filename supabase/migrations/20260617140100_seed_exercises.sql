-- Kitoo — seed d'exercices interactifs. Idempotent (slug unique).
-- `steps` = { cycles, phases:[{label, seconds}] } ; le lecteur enchaîne les
-- phases `cycles` fois. duration_sec = cycles × Σ(seconds des phases).

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
