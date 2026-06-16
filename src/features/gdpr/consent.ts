import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type Consent = Tables<"consents">;

/** Type de consentement au traitement des données de santé. */
export const DATA_PROCESSING = "data_processing";

/**
 * Consentement actif (non révoqué) de l'utilisateur pour un type donné, ou
 * `null`. Lecture sous RLS (chacun ne voit que ses consentements).
 */
export async function getActiveConsent(
  type: string = DATA_PROCESSING,
): Promise<Consent | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("consents")
    .select("*")
    .eq("type", type)
    .is("revoked_at", null)
    .order("granted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

/** Vrai si un consentement actif existe pour ce type. */
export async function hasActiveConsent(
  type: string = DATA_PROCESSING,
): Promise<boolean> {
  return (await getActiveConsent(type)) !== null;
}
