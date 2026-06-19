-- Kitoo - permet à l'utilisateur d'effacer ses propres messages de chat
-- (bouton « Nouvelle conversation »). RLS stricte : uniquement les siens.
create policy "messages_delete_own" on public.messages
  for delete to authenticated using (auth.uid() = user_id);
