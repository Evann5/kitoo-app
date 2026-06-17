"use server";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import { autoReply } from "./auto-reply";
import { getOrCreateConversationId } from "./queries";

type Message = Tables<"messages">;

export type SendMessageResult =
  | { ok: true; userMessage: Message; proMessage: Message }
  | { ok: false; error: string };

/**
 * Envoie un message utilisateur et génère la réponse **simulée** du « pro ».
 *
 * Sécurité : exécutée côté serveur, `user_id = auth.uid()` (session), RLS
 * stricte, jamais de clé service_role. La réponse simulée est calculée
 * **côté serveur** (`autoReply`) — le `flagged` (détresse) n'est pas fourni par
 * le client. Le contenu est borné (1–2000 caractères).
 */
export async function sendMessage(input: {
  content: string;
}): Promise<SendMessageResult> {
  const content = (input.content ?? "").trim().slice(0, 2000);
  if (!content) return { ok: false, error: "Message vide." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu dois être connecté." };

  // Conversation de l'utilisateur (créée si besoin).
  const conversationId = await getOrCreateConversationId(supabase, user.id);
  if (!conversationId) {
    return { ok: false, error: "Conversation indisponible." };
  }

  // Message utilisateur.
  const { data: userMessage, error: userErr } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      user_id: user.id,
      sender: "user",
      content,
    })
    .select("*")
    .single();
  if (userErr || !userMessage) {
    return { ok: false, error: "Envoi impossible." };
  }

  // Réponse simulée du « pro » (calculée côté serveur).
  const reply = autoReply(content);
  const { data: proMessage, error: proErr } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      user_id: user.id,
      sender: "pro",
      content: reply.content,
      flagged: reply.flagged,
    })
    .select("*")
    .single();
  if (proErr || !proMessage) {
    return { ok: false, error: "Réponse indisponible." };
  }

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return { ok: true, userMessage, proMessage };
}
