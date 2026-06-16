"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { type AccessibilityPrefs } from "./prefs";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Persiste les préférences d'accessibilité dans `profiles.accessibility_prefs`
 * (synchronisées entre appareils). Exécutée côté serveur ; RLS limite à la
 * ligne de l'utilisateur.
 */
export async function saveAccessibilityPrefs(
  prefs: AccessibilityPrefs,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu dois être connecté." };

  const { error } = await supabase
    .from("profiles")
    .update({
      // Coercition en booléens : on ne stocke jamais de valeur arbitraire
      // venant du client dans le jsonb.
      accessibility_prefs: {
        dyslexia: prefs.dyslexia === true,
        colorblind: prefs.colorblind === true,
      },
    })
    .eq("id", user.id);
  if (error) return { ok: false, error: "Enregistrement impossible." };

  revalidatePath("/profil");
  return { ok: true };
}
