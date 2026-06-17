"use server";

import { createClient } from "@/lib/supabase/server";

export type SessionResult = { ok: true } | { ok: false; error: string };

/**
 * Enregistre une session d'exercice (historique). Exécutée côté serveur :
 * `user_id = auth.uid()` (exigé par la policy RLS `insert`), jamais de clé
 * service_role. `completed` distingue une session terminée d'un abandon ;
 * `durationSec` est le temps réellement passé.
 */
export async function recordExerciseSession(input: {
  exerciseId: string;
  durationSec: number;
  completed: boolean;
}): Promise<SessionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu dois être connecté." };

  const duration =
    Number.isFinite(input.durationSec) && input.durationSec > 0
      ? Math.min(Math.floor(input.durationSec), 24 * 3600)
      : 0;

  const { error } = await supabase.from("exercise_sessions").insert({
    user_id: user.id,
    exercise_id: input.exerciseId,
    duration_sec: duration,
    completed: input.completed,
    completed_at: input.completed ? new Date().toISOString() : null,
  });
  if (error) return { ok: false, error: "Enregistrement impossible." };

  return { ok: true };
}
