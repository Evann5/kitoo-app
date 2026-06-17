import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database, Tables } from "@/lib/supabase/types";

export type Message = Tables<"messages">;

/**
 * Récupère l'id de la conversation de l'utilisateur, en la créant si besoin.
 * **Select-puis-insert** (idempotent) plutôt qu'un `upsert` : garantit qu'on
 * retombe toujours sur la même conversation et que l'historique se recharge.
 */
export async function getOrCreateConversationId(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (error || !created) return null;
  return created.id;
}

/**
 * Conversation unique de l'utilisateur connecté + ses messages triés. Lecture
 * **sous RLS** : chacun n'accède qu'à la sienne.
 */
export async function getConversation(): Promise<{
  conversationId: string;
  messages: Message[];
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const conversationId = await getOrCreateConversationId(supabase, user.id);
  if (!conversationId) return null;

  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;

  return { conversationId, messages: messages ?? [] };
}

/** Vrai si l'utilisateur a déjà une demande de rappel en attente (RLS). */
export async function hasPendingCallback(): Promise<boolean> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("callback_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  return (count ?? 0) > 0;
}
