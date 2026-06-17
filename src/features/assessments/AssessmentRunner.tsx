"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { recordAssessment } from "./actions";
import { AssessmentResult } from "./AssessmentResult";
import { SCALES, type ScaleKey, type ScaleResult } from "./scales";

/**
 * Questionnaire pas-à-pas (en liste) d'un test standardisé. Chaque question est
 * un `fieldset`/`legend` avec un groupe de radios (opérable au clavier). On peut
 * **quitter sans enregistrer**. À la soumission, le serveur recalcule et
 * enregistre, puis on affiche le résultat orienté.
 */
export function AssessmentRunner({ scaleKey }: { scaleKey: ScaleKey }) {
  const def = SCALES[scaleKey];
  const [answers, setAnswers] = useState<(number | null)[]>(
    def.items.map(() => null),
  );
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScaleResult | null>(null);
  const [pending, startTransition] = useTransition();

  const answeredCount = answers.filter((a) => a !== null).length;

  if (result) {
    return <AssessmentResult scaleKey={scaleKey} result={result} />;
  }

  function setAnswer(i: number, value: number) {
    setError(null);
    setAnswers((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (answers.some((a) => a === null)) {
      setError("Réponds à toutes les questions pour voir ton résultat.");
      return;
    }
    startTransition(async () => {
      const res = await recordAssessment({
        scale: scaleKey,
        answers: answers as number[],
      });
      if (res.ok) setResult(res.result);
      else setError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-title text-ink-900">{def.title}</h1>
        <p className="text-body text-ink-700">{def.instruction}</p>
        <p className="text-small text-ink-600">
          {def.summary} — Kitoo ne remplace pas un suivi médical professionnel.
        </p>
        <p className="text-small text-ink-600" aria-live="polite">
          {answeredCount} / {def.items.length} réponses
        </p>
      </div>

      {def.items.map((item, i) => (
        <fieldset
          key={i}
          className="rounded-card flex flex-col gap-3 bg-white p-5 shadow-sm"
        >
          <legend className="text-body text-ink-900 float-none mb-1 font-bold">
            {i + 1}. {item}
          </legend>
          <div className="flex flex-col gap-2">
            {def.options.map((opt) => {
              const id = `q${i}-${opt.value}`;
              return (
                <label
                  key={opt.value}
                  htmlFor={id}
                  className="rounded-control border-ink-200 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-100 flex min-h-[44px] cursor-pointer items-center gap-3 border px-3 py-2"
                >
                  <input
                    type="radio"
                    id={id}
                    name={`q${i}`}
                    value={opt.value}
                    checked={answers[i] === opt.value}
                    onChange={() => setAnswer(i, opt.value)}
                    className="accent-brand-700 h-5 w-5"
                  />
                  <span className="text-body text-ink-800">{opt.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      {error ? (
        <p
          role="alert"
          className="rounded-control bg-danger/10 text-small text-danger px-4 py-3"
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" fullWidth loading={pending}>
        Voir mon résultat
      </Button>
      <Link
        href="/tests"
        className="text-small text-ink-600 text-center font-bold"
      >
        Quitter sans enregistrer
      </Link>
    </form>
  );
}

export default AssessmentRunner;
