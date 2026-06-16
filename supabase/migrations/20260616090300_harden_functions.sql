-- Kitoo — durcissement des fonctions (suite aux advisors sécurité Supabase).

-- 1) search_path figé sur set_updated_at (évite le détournement via search_path).
alter function public.set_updated_at() set search_path = '';

-- 2) handle_new_user est une fonction SECURITY DEFINER : elle ne doit servir
--    QUE de trigger, jamais être appelable en RPC (`/rest/v1/rpc/...`).
--    Les triggers s'exécutent sans vérifier EXECUTE, donc l'inscription continue
--    de fonctionner après ce revoke.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
