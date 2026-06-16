"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DATA_PROCESSING } from "./consent";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Enregistre le consentement explicite au traitement des données de santé.
 * Exécutée côté serveur ; `user_id = auth.uid()` (exigé par la policy `insert`).
 */
export async function grantConsent(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu dois être connecté." };

  const { error } = await supabase
    .from("consents")
    .insert({ user_id: user.id, type: DATA_PROCESSING });
  if (error) return { ok: false, error: "Enregistrement impossible." };

  revalidatePath("/tableau-de-bord");
  revalidatePath("/profil");
  return { ok: true };
}

/** Révoque le(s) consentement(s) actif(s) (RGPD : retrait à tout moment). */
export async function revokeConsent(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu dois être connecté." };

  const { error } = await supabase
    .from("consents")
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("type", DATA_PROCESSING)
    .is("revoked_at", null);
  if (error) return { ok: false, error: "Révocation impossible." };

  revalidatePath("/profil");
  revalidatePath("/tableau-de-bord");
  return { ok: true };
}

/**
 * Droit à l'effacement : supprime le compte et **toutes** les données liées via
 * la fonction `delete_current_user` (SECURITY DEFINER, ne supprime que
 * `auth.uid()` ; cascade vers profiles/mood_entries/consents). Puis déconnecte.
 * Aucune clé service_role n'est utilisée côté app.
 */
export async function deleteAccount(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu dois être connecté." };

  const { error } = await supabase.rpc("delete_current_user");
  if (error) {
    return { ok: false, error: "Suppression impossible. Réessaie plus tard." };
  }

  // Le compte n'existe plus : on efface la session locale, puis on sort.
  await supabase.auth.signOut();
  redirect("/?compte=supprime");
}
