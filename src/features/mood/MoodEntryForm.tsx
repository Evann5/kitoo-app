"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { MoodSlider } from "./MoodSlider";
import { TagChips } from "./TagChips";
import { saveMood } from "./actions";
import { scoreToOption } from "./mood-config";
import type { MoodTag } from "./queries";

export type MoodEntryFormProps = {
  tags: MoodTag[];
  /** Entrée du jour préchargée (édition), ou `null` (création). */
  initial: { score: number; comment: string; tagIds: string[] } | null;
};

type Step = 1 | 2;

/**
 * Saisie d'humeur du jour en **2 étapes** : (1) valence via un curseur
 * horizontal (`MoodSlider`) — visuel + libellé réactifs, score 0–100 caché ;
 * (2) ressentis (tags + commentaire) puis enregistrement. Tout en flux normal
 * (la page scrolle naturellement). Persistance inchangée (A10 : upsert
 * score/level/tags/commentaire en une fois, 1/jour, RLS).
 */
export function MoodEntryForm({ tags, initial }: MoodEntryFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [step, setStep] = useState<Step>(1);
  const [score, setScore] = useState<number | null>(initial?.score ?? null);
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initial?.tagIds ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const moodLabel =
    score !== null ? scoreToOption(score).label : "Règle ton humeur";
  const confirmLabel = initial
    ? "Mettre à jour mon humeur"
    : "Enregistrer mon humeur";

  function updateScore(next: number) {
    setSaved(false);
    setError(null);
    setScore(next);
  }

  function toggleTag(id: string) {
    setSaved(false);
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  function goNext() {
    if (score === null) {
      setError("Déplace le curseur pour indiquer ton humeur.");
      return;
    }
    setError(null);
    setStep(2);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    if (score === null) {
      setStep(1);
      setError("Déplace le curseur pour indiquer ton humeur.");
      return;
    }
    startTransition(async () => {
      const result = await saveMood({ score, comment, tagIds: selectedTags });
      if (result.ok) {
        setSaved(true);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* En-tête : Retour (gauche) · titre · Annuler (droite). */}
      <header className="flex items-center justify-between gap-2">
        {step === 1 ? (
          <Link
            href="/tableau-de-bord"
            aria-label="Retour"
            className="text-ink-600 hover:text-ink-900 grid h-10 w-10 place-items-center rounded-full"
          >
            <ArrowLeft aria-hidden size={20} strokeWidth={2} />
          </Link>
        ) : (
          <button
            type="button"
            aria-label="Étape précédente"
            onClick={() => setStep(1)}
            className="text-ink-600 hover:text-ink-900 grid h-10 w-10 place-items-center rounded-full"
          >
            <ArrowLeft aria-hidden size={20} strokeWidth={2} />
          </button>
        )}
        <h1 className="font-display text-heading text-ink-900">
          {step === 1 ? "Mon humeur" : "Tes ressentis"}
        </h1>
        <Link
          href="/tableau-de-bord"
          aria-label="Annuler"
          className="text-ink-500 hover:text-ink-800 grid h-10 w-10 place-items-center rounded-full"
        >
          <X aria-hidden size={20} strokeWidth={2} />
        </Link>
      </header>

      {step === 1 ? (
        <div className="flex flex-col gap-6">
          <h2 className="font-display text-title text-ink-900 text-center">
            Comment tu te sens maintenant ?
          </h2>

          <MoodSlider
            value={score}
            onChange={updateScore}
            ariaValueText={moodLabel}
            disabled={pending}
          />

          {error ? (
            <p
              role="alert"
              className="rounded-control bg-danger/10 text-small text-danger px-4 py-3"
            >
              {error}
            </p>
          ) : null}

          <Button type="button" size="lg" fullWidth onClick={goNext}>
            Suivant
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-small text-ink-800 font-bold">
                Qu&apos;est-ce qui a marqué ta journée ?{" "}
                <span className="text-ink-600 font-normal">(facultatif)</span>
              </span>
              <TagChips
                tags={tags}
                selected={selectedTags}
                onToggle={toggleTag}
                disabled={pending}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="comment"
                className="text-small text-ink-800 font-bold"
              >
                Envie d&apos;en dire plus ?{" "}
                <span className="text-ink-600 font-normal">(facultatif)</span>
              </label>
              <textarea
                id="comment"
                name="comment"
                value={comment}
                onChange={(e) => {
                  setSaved(false);
                  setComment(e.target.value);
                }}
                disabled={pending}
                rows={3}
                maxLength={1000}
                placeholder="Aujourd'hui, je me sens…"
                className="rounded-control text-body border-ink-300 hover:border-ink-400 focus-visible:border-brand-400 text-ink-900 placeholder:text-ink-400 min-h-[88px] w-full resize-y border bg-white px-4 py-3"
              />
            </div>
          </Card>

          {error ? (
            <p
              role="alert"
              className="rounded-control bg-danger/10 text-small text-danger px-4 py-3"
            >
              {error}
            </p>
          ) : null}

          {saved ? (
            <p
              role="status"
              className="rounded-control bg-success/10 text-small text-success px-4 py-3 text-center font-bold"
            >
              Noté, prends soin de toi 🌱
            </p>
          ) : null}

          <Button type="submit" size="lg" fullWidth loading={pending}>
            {confirmLabel}
          </Button>
        </div>
      )}
    </form>
  );
}

export default MoodEntryForm;
