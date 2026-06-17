"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronDown, X } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { MoodSlider } from "./MoodSlider";
import { WeekDateStrip } from "./WeekDateStrip";
import { TagChips } from "./TagChips";
import { saveMood } from "./actions";
import { scoreToOption } from "./mood-config";
import type { MoodTag } from "./queries";

export type MoodEntryFormProps = {
  tags: MoodTag[];
  /** Entrée du jour préchargée (édition), ou `null` (création). */
  initial: { score: number; comment: string; tagIds: string[] } | null;
  /** Jour courant "YYYY-MM-DD" pour l'aperçu de la semaine. */
  today: string;
};

/**
 * Saisie d'humeur du jour, sur **un seul écran scrollable** : aperçu de la
 * semaine, titre, curseur de valence (`MoodSlider`, score 0–100 caché), puis une
 * **section détails facultative repliable** (tags + commentaire) pour « aller
 * plus loin », et l'enregistrement. Persistance inchangée (A10 : upsert
 * score/level/tags/commentaire en une fois, 1/jour, RLS).
 */
export function MoodEntryForm({ tags, initial, today }: MoodEntryFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [score, setScore] = useState<number | null>(initial?.score ?? null);
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initial?.tagIds ?? [],
  );
  // Détails ouverts d'emblée s'il y en a déjà (édition).
  const [showDetails, setShowDetails] = useState(
    Boolean(initial && (initial.comment || initial.tagIds.length > 0)),
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

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    if (score === null) {
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
        <Link
          href="/tableau-de-bord"
          aria-label="Retour"
          className="text-ink-600 hover:text-ink-900 grid h-10 w-10 place-items-center rounded-full"
        >
          <ArrowLeft aria-hidden size={20} strokeWidth={2} />
        </Link>
        <h1 className="font-display text-heading text-ink-900">Mon humeur</h1>
        <Link
          href="/tableau-de-bord"
          aria-label="Annuler"
          className="text-ink-500 hover:text-ink-800 grid h-10 w-10 place-items-center rounded-full"
        >
          <X aria-hidden size={20} strokeWidth={2} />
        </Link>
      </header>

      {/* Aperçu de la semaine. */}
      <WeekDateStrip today={today} />

      <h2 className="font-display text-title text-ink-900 text-center">
        Comment tu te sens maintenant ?
      </h2>

      <MoodSlider
        value={score}
        onChange={updateScore}
        ariaValueText={moodLabel}
        disabled={pending}
      />

      {/* Section détails facultative (repliable) : aller plus loin. */}
      <div className="rounded-card border-ink-200 border">
        <button
          type="button"
          aria-expanded={showDetails}
          aria-controls="mood-details"
          onClick={() => setShowDetails((v) => !v)}
          className="text-small text-ink-800 flex w-full items-center justify-between px-4 py-3 font-bold"
        >
          Ajouter des détails{" "}
          <span className="text-ink-500 font-normal">(facultatif)</span>
          <ChevronDown
            aria-hidden
            size={18}
            strokeWidth={2}
            className={`duration-kitoo ease-kitoo ml-auto transition-transform motion-reduce:transition-none ${
              showDetails ? "rotate-180" : ""
            }`}
          />
        </button>

        {showDetails ? (
          <Card
            id="mood-details"
            className="flex flex-col gap-5 rounded-t-none"
          >
            <div className="flex flex-col gap-2">
              <span className="text-small text-ink-800 font-bold">
                Qu&apos;est-ce qui a marqué ta journée ?
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
                Envie d&apos;en dire plus ?
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
        ) : null}
      </div>

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
    </form>
  );
}

export default MoodEntryForm;
