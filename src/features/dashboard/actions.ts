"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { COMPANION_NAME_MAX } from "./companion";

export type CompanionNameResult =
  | { ok: true; name: string }
  | { ok: false; error: string };

/**
 * Renomme le compagnon (mascotte) de l'utilisateur connecté. Exécutée côté
 * serveur : `user_id = auth.uid()` via la session, RLS `profiles_update_own`,
 * jamais de clé service_role. Le nom est borné (1–30 caractères) ; vide ⇒
 * réinitialise à « Kitoo » (null en base).
 */
export async function setCompanionName(
  input: string,
): Promise<CompanionNameResult> {
  const trimmed = input.trim().slice(0, COMPANION_NAME_MAX);
  const value = trimmed.length > 0 ? trimmed : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu dois être connecté." };

  const { error } = await supabase
    .from("profiles")
    .update({ companion_name: value })
    .eq("id", user.id);
  if (error) return { ok: false, error: "Enregistrement impossible." };

  revalidatePath("/tableau-de-bord");
  return { ok: true, name: value ?? "Kitoo" };
}
