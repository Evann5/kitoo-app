-- Kitoo — résultats de tests standardisés (données de santé sensibles).
-- `scale` : phq9 / gad7 / pss10 / who5. `answers` : tableau d'entiers (réponses).
-- `score` + `severity` : résultat orienté (pas un diagnostic). `flagged` : item
-- sensible du PHQ-9 (item 9 > 0) → déclenche un message de soutien.
-- RLS stricte : chacun ne lit/écrit que ses propres résultats.
create table public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  scale text not null check (scale in ('phq9', 'gad7', 'pss10', 'who5')),
  answers jsonb not null default '[]'::jsonb,
  score int not null,
  severity text not null,
  flagged boolean not null default false,
  taken_at timestamptz not null default now()
);

create index assessment_results_user_idx
  on public.assessment_results (user_id, taken_at desc);

alter table public.assessment_results enable row level security;

create policy "assessment_results_select_own" on public.assessment_results
  for select to authenticated using (auth.uid() = user_id);

create policy "assessment_results_insert_own" on public.assessment_results
  for insert to authenticated with check (auth.uid() = user_id);
