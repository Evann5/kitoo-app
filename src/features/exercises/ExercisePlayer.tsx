"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { recordExerciseSession } from "./actions";
import { flattenPhases, parseSteps, scaleForLabel } from "./steps";
import type { Exercise } from "./queries";

type Status = "idle" | "running" | "paused" | "done";
type State = { status: Status; idx: number; secs: number; elapsed: number };

/**
 * Lecteur d'exercice interactif : minuteur enchaînant les phases (`steps`),
 * guidage visuel (cercle qui se dilate/contracte) **neutralisé sous
 * `prefers-reduced-motion`** (le libellé + le compte à rebours suffisent). Les
 * phases sont annoncées via `aria-live`. À la fin (ou à l'arrêt), une
 * `exercise_session` est enregistrée (server action) : `completed` true/false.
 */
export function ExercisePlayer({ exercise }: { exercise: Exercise }) {
  const reduce = useReducedMotion();
  const phases = useMemo(
    () => flattenPhases(parseSteps(exercise.steps)),
    [exercise.steps],
  );

  const [st, setSt] = useState<State>({
    status: "idle",
    idx: 0,
    secs: 0,
    elapsed: 0,
  });
  const recordedRef = useRef(false);

  // Tick du minuteur.
  useEffect(() => {
    if (st.status !== "running") return;
    const id = setInterval(() => {
      setSt((prev) => {
        if (prev.status !== "running") return prev;
        const elapsed = prev.elapsed + 1;
        if (prev.secs > 1) return { ...prev, secs: prev.secs - 1, elapsed };
        const nextIdx = prev.idx + 1;
        if (nextIdx >= phases.length) {
          return { ...prev, status: "done", secs: 0, elapsed };
        }
        return {
          ...prev,
          idx: nextIdx,
          secs: phases[nextIdx].seconds,
          elapsed,
        };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [st.status, phases]);

  // Enregistre la session à la complétion (une seule fois).
  useEffect(() => {
    if (st.status === "done" && !recordedRef.current) {
      recordedRef.current = true;
      void recordExerciseSession({
        exerciseId: exercise.id,
        durationSec: exercise.duration_sec,
        completed: true,
      });
    }
  }, [st.status, exercise.id, exercise.duration_sec]);

  function start() {
    recordedRef.current = false;
    setSt({
      status: "running",
      idx: 0,
      secs: phases[0]?.seconds ?? 0,
      elapsed: 0,
    });
  }

  function stop() {
    // Abandon : on enregistre une session non complétée avec le temps écoulé.
    if ((st.status === "running" || st.status === "paused") && st.elapsed > 0) {
      void recordExerciseSession({
        exerciseId: exercise.id,
        durationSec: st.elapsed,
        completed: false,
      });
    }
    setSt({ status: "idle", idx: 0, secs: 0, elapsed: 0 });
  }

  const active = st.status === "running" || st.status === "paused";
  const currentLabel = active ? (phases[st.idx]?.label ?? "") : "";
  const scale = active ? scaleForLabel(currentLabel) : 0.85;
  const liveText =
    st.status === "done" ? "Exercice terminé" : active ? currentLabel : "";

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Cercle de guidage. */}
      <div className="relative flex h-64 w-64 items-center justify-center">
        <div
          aria-hidden="true"
          className="bg-brand-200 rounded-pill absolute h-56 w-56"
          style={{
            transform: `scale(${scale})`,
            transition: reduce
              ? "none"
              : `transform ${st.secs || 1}s ease-in-out`,
          }}
        />
        <div className="relative flex flex-col items-center gap-1 text-center">
          {/* Libellé de phase annoncé aux lecteurs d'écran. */}
          <p
            aria-live="polite"
            className="font-display text-title text-ink-900"
          >
            {st.status === "idle"
              ? "Prêt ?"
              : st.status === "done"
                ? "Terminé"
                : currentLabel}
          </p>
          {active ? (
            <span aria-hidden="true" className="text-body text-ink-700">
              {st.secs}s
            </span>
          ) : null}
          <span className="sr-only">{liveText}</span>
        </div>
      </div>

      {/* Contrôles. */}
      <div className="flex w-full max-w-xs flex-col gap-2">
        {st.status === "idle" ? (
          <Button size="lg" fullWidth onClick={start}>
            Commencer
          </Button>
        ) : null}

        {st.status === "running" ? (
          <>
            <Button
              size="lg"
              fullWidth
              variant="outline"
              onClick={() => setSt((p) => ({ ...p, status: "paused" }))}
            >
              Pause
            </Button>
            <Button variant="ghost" fullWidth onClick={stop}>
              Arrêter
            </Button>
          </>
        ) : null}

        {st.status === "paused" ? (
          <>
            <Button
              size="lg"
              fullWidth
              onClick={() => setSt((p) => ({ ...p, status: "running" }))}
            >
              Reprendre
            </Button>
            <Button variant="ghost" fullWidth onClick={stop}>
              Arrêter
            </Button>
          </>
        ) : null}

        {st.status === "done" ? (
          <>
            <p
              role="status"
              className="rounded-control bg-success/10 text-body text-success px-4 py-3 text-center font-bold"
            >
              Bien joué, prends ce moment pour toi 🌱
            </p>
            <Button variant="outline" fullWidth onClick={start}>
              Recommencer
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default ExercisePlayer;
