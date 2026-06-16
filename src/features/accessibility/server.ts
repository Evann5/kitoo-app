import { createClient } from "@/lib/supabase/server";
import { parsePrefs, DEFAULT_PREFS, type AccessibilityPrefs } from "./prefs";

/**
 * Lit les préférences d'accessibilité de l'utilisateur depuis son profil
 * (source de vérité, synchronisée entre appareils). Renvoie les valeurs par
 * défaut si non connecté ou profil absent.
 */
export async function getAccessibilityPrefs(): Promise<AccessibilityPrefs> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEFAULT_PREFS;

  const { data } = await supabase
    .from("profiles")
    .select("accessibility_prefs")
    .eq("id", user.id)
    .maybeSingle();
  return parsePrefs(data?.accessibility_prefs);
}
