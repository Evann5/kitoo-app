-- Kitoo — score d'humeur continu (0–100), saisi via la molette rotative.
--
-- Le score est la valeur fine (cachée à l'utilisateur, sert à l'analyse). Le
-- `level` (1–5) reste la projection qualitative de l'échelle du design system :
-- il est DÉRIVÉ du score à l'écriture (côté server action), conservé pour les
-- stats/graphes/alertes existants. Mapping (cf. `mood-config.ts`) :
--   0–19 → 1 · 20–39 → 2 · 40–59 → 3 · 60–79 → 4 · 80–100 → 5
--
-- `score` est nullable (compat. d'éventuelles lignes héritées) mais l'app le
-- renseigne toujours ; les lignes existantes sont back-fillées au centre du
-- bucket de leur `level`.
alter table public.mood_entries
  add column if not exists score smallint check (score between 0 and 100);

update public.mood_entries
set score = case level
  when 1 then 10
  when 2 then 30
  when 3 then 50
  when 4 then 70
  when 5 then 90
end
where score is null;
