-- Kitoo - enrichit `resources` en hub multi-format (lire / écouter / regarder /
-- lien). Les exercices restent dans leur table dédiée (A12).
alter table public.resources
  add column if not exists format text not null default 'article'
    check (format in ('article', 'podcast', 'video', 'lien')),
  add column if not exists url text,
  add column if not exists media_embed text,
  add column if not exists source text,
  add column if not exists author_or_validation text,
  add column if not exists read_time text,
  add column if not exists duration text,
  add column if not exists cover_image text,
  add column if not exists slug text;

create unique index if not exists resources_slug_key on public.resources (slug);

comment on column public.resources.format is
  'article | podcast | video | lien';
comment on column public.resources.url is
  'Lien externe (podcast/vidéo/lien utile). À vérifier/maintenir à jour.';
comment on column public.resources.author_or_validation is
  'Mention de rédaction/validation (ex. « Validé par des pros de santé »).';
