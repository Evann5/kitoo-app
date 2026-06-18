"use server";

import { createClient } from "@/lib/supabase/server";
import { SCALES, computeResult, isScaleKey, type ScaleResult } from "./scales";

export type RecordResult =
  | { ok: true; result: ScaleResult }
  | { ok: false; error: string };

/**
 * Enregistre une passation de test. Le **score, la sévérité et le flag sont
 * recalculés côté serveur** (`computeResult`) - on ne fait pas confiance au
 * client. `user_id = auth.uid()` (policy RLS). Données de santé sensibles :
 * jamais de clé service_role, jamais exposées à un autre utilisateur.
 */
export async function recordAssessment(input: {
  scale: string;
  answers: number[];
}): Promise<RecordResult> {
  if (!isScaleKey(input.scale)) return { ok: false, error: "Test inconnu." };
  if (!Array.isArray(input.answers)) {
    return { ok: false, error: "Réponses invalides." };
  }

  // Borne le tableau à la longueur de l'échelle : on ne stocke que des entiers
  // valides, pas une charge arbitraire envoyée par le client.
  const answers = SCALES[input.scale].items.map(
    (_, i) => Number(input.answers[i]) || 0,
  );
  const result = computeResult(input.scale, answers);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu dois être connecté." };

  const { error } = await supabase.from("assessment_results").insert({
    user_id: user.id,
    scale: input.scale,
    answers,
    score: result.score,
    severity: result.severity.label,
    flagged: result.flagged,
  });
  if (error) return { ok: false, error: "Enregistrement impossible." };

  return { ok: true, result };
}
