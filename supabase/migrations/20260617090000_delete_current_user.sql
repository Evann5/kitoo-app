-- Kitoo — droit à l'effacement (RGPD)
-- Permet à un utilisateur authentifié de supprimer SON propre compte sans clé
-- service_role côté app. La suppression de `auth.users` cascade vers
-- `profiles`, `mood_entries` (→ `mood_entry_tags`) et `consents`
-- (FK `on delete cascade`), purgeant toutes ses données.
--
-- SECURITY DEFINER : s'exécute avec les droits du propriétaire (peut écrire dans
-- `auth.users`), mais ne supprime QUE la ligne `auth.uid()` → un utilisateur ne
-- peut effacer que lui-même. `search_path` figé, EXECUTE réservé à `authenticated`.
create or replace function public.delete_current_user()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Aucun utilisateur authentifié';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_current_user() from public, anon;
grant execute on function public.delete_current_user() to authenticated;
