import type { Json } from "@/lib/supabase/types";

/** Une phase de minuteur : un libellé annoncé et sa durée en secondes. */
export type ExercisePhase = { label: string; seconds: number };
/** Format de `exercises.steps` : des phases répétées `cycles` fois. */
export type ExerciseSteps = { cycles: number; phases: ExercisePhase[] };

/**
 * Parse le `steps` (jsonb) en structure sûre. Tolérant : valeurs par défaut si
 * le format est inattendu (1 cycle, aucune phase). Pur (utilisable client).
 */
export function parseSteps(steps: Json): ExerciseSteps {
  if (!steps || typeof steps !== "object" || Array.isArray(steps)) {
    return { cycles: 1, phases: [] };
  }
  const obj = steps as Record<string, unknown>;
  const cycles =
    typeof obj.cycles === "number" && obj.cycles > 0
      ? Math.floor(obj.cycles)
      : 1;
  const rawPhases = Array.isArray(obj.phases) ? obj.phases : [];
  const phases: ExercisePhase[] = rawPhases
    .map((p) => {
      const r = (p ?? {}) as Record<string, unknown>;
      return {
        label: typeof r.label === "string" ? r.label : "",
        seconds:
          typeof r.seconds === "number" && r.seconds > 0
            ? Math.floor(r.seconds)
            : 0,
      };
    })
    .filter((p) => p.label && p.seconds > 0);
  return { cycles, phases };
}

/** Déroule les phases sur tous les cycles (timeline plate du minuteur). */
export function flattenPhases(steps: ExerciseSteps): ExercisePhase[] {
  const out: ExercisePhase[] = [];
  for (let c = 0; c < steps.cycles; c++) out.push(...steps.phases);
  return out;
}

/** Durée lisible (« 1 min », « 45 s »). */
export function formatDuration(sec: number): string {
  if (sec < 60) return `${sec} s`;
  return `${Math.round(sec / 60)} min`;
}

/** Échelle cible de l'animation de guidage selon la phase. */
export function scaleForLabel(label: string): number {
  const l = label.toLowerCase();
  if (l.includes("inspire")) return 1;
  if (l.includes("expire")) return 0.65;
  if (l.includes("retiens") || l.includes("garde")) return 1;
  return 0.85;
}
