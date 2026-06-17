import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type Message = Tables<"messages">;

/**
 * Récupère (ou crée) la conversation unique de l'utilisateur connecté, et
 * renvoie ses messages triés. Lecture **sous RLS** : chacun n'accède qu'à la
 * sienne. La création se fait via `upsert` sur `user_id` (index unique).
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

  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .upsert({ user_id: user.id }, { onConflict: "user_id" })
    .select("id")
    .single();
  if (convErr || !conv) return null;

  const { data: messages, error: msgErr } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: true });
  if (msgErr) throw msgErr;

  return { conversationId: conv.id, messages: messages ?? [] };
}
