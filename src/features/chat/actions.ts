"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import { getReply, type Suggestion } from "./engine";
import { getOrCreateConversationId } from "./queries";

type Message = Tables<"messages">;

export type SendMessageResult =
  | {
      ok: true;
      userMessage: Message;
      proMessage: Message;
      quickReplies: string[];
      suggestion: Suggestion | null;
    }
  | { ok: false; error: string };

export type ClearResult = { ok: true } | { ok: false; error: string };

/**
 * Repart d'une conversation vierge : supprime **tous les messages** de
 * l'utilisateur connecté (RLS stricte, `user_id = auth.uid()`). La ligne de
 * conversation est conservée. `revalidatePath` rafraîchit `/chat`.
 */
export async function clearConversation(): Promise<ClearResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu dois être connecté." };

  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("user_id", user.id);
  if (error) return { ok: false, error: "Suppression impossible." };

  revalidatePath("/chat");
  return { ok: true };
}

/**
 * Envoie un message utilisateur et génère la réponse **simulée** du « pro ».
 *
 * Sécurité : exécutée côté serveur, `user_id = auth.uid()` (session), RLS
 * stricte, jamais de clé service_role. La réponse est calculée **côté serveur**
 * par le moteur à règles (`getReply`) - le `flagged` (détresse) n'est jamais
 * fourni par le client. Le contenu est borné (1–2000 caractères).
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

  // Anti-répétition : les dernières réponses du bot (pour ne pas se répéter).
  const { data: recent } = await supabase
    .from("messages")
    .select("content")
    .eq("conversation_id", conversationId)
    .eq("sender", "pro")
    .order("created_at", { ascending: false })
    .limit(5);
  const recentReplies = (recent ?? []).map((m) => m.content);

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

  // Réponse du moteur à règles (calculée côté serveur).
  const reply = getReply(content, { recentReplies });
  const { data: proMessage, error: proErr } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      user_id: user.id,
      sender: "pro",
      content: reply.reply,
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

  // Rafraîchit le cache de route pour que l'historique soit à jour au retour.
  revalidatePath("/chat");

  return {
    ok: true,
    userMessage,
    proMessage,
    quickReplies: reply.quickReplies,
    suggestion: reply.suggestion,
  };
}
