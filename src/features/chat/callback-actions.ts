"use server";

import { createClient } from "@/lib/supabase/server";

export type CallbackResult = { ok: true } | { ok: false; error: string };

/**
 * Enregistre une **demande d'être rappelé·e par un·e professionnel·le de santé**.
 *
 * Sécurité : server action, `user_id = auth.uid()` (session), RLS stricte,
 * jamais de clé service_role. Le téléphone (optionnel) et la note sont bornés.
 * Démo : la demande est enregistrée, aucun appel réel n'est planifié ; en cas
 * d'urgence l'UI oriente vers le 3114 / 15 / 112.
 */
export async function requestCallback(input: {
  phone?: string;
  note?: string;
}): Promise<CallbackResult> {
  const phone = (input.phone ?? "").trim().slice(0, 30) || null;
  const note = (input.note ?? "").trim().slice(0, 500) || null;
  if (phone && phone.length < 3) {
    return { ok: false, error: "Numéro invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu dois être connecté." };

  const { error } = await supabase
    .from("callback_requests")
    .insert({ user_id: user.id, phone, note });
  if (error) return { ok: false, error: "Demande impossible pour le moment." };

  return { ok: true };
}
