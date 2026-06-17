"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { Card } from "@/components/ui";
import { MoodDial } from "./MoodDial";
import { WeekDateStrip } from "./WeekDateStrip";
import { TagChips } from "./TagChips";
import { saveMood } from "./actions";
import { scoreToOption } from "./mood-config";
import type { MoodTag } from "./queries";

export type MoodEntryFormProps = {
  tags: MoodTag[];
  /** Entrée du jour préchargée (édition), ou `null` (création). */
  initial: { score: number; comment: string; tagIds: string[] } | null;
  /** Jour courant "YYYY-MM-DD" pour le bandeau de dates. */
  today: string;
  /** Initiale de l'utilisateur (avatar d'en-tête). */
  userInitial?: string;
};

/**
 * Saisie d'humeur du jour — disposition **arc** : en-tête, bandeau de dates,
 * titre, `MoodDial` (icônes en arc + jauge + koala central) et bouton rond de
 * validation, puis tags + commentaire. Le score 0–100 reste interne et caché ;
 * seul le ressenti qualitatif (libellé, couleur, koala) est montré. Transitions
 * neutralisées sous `prefers-reduced-motion`. Persistance inchangée (A10).
 */
export function MoodEntryForm({
  tags,
  initial,
  today,
  userInitial,
}: MoodEntryFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [score, setScore] = useState<number | null>(initial?.score ?? null);
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initial?.tagIds ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const option = score !== null ? scoreToOption(score) : undefined;
  const moodLabel = option?.label ?? "Règle ton humeur";
  // Teinte d'ambiance : couleur d'humeur adoucie (sinon lavande neutre).
  const tint = option
    ? `color-mix(in srgb, ${option.color} 22%, white)`
    : "var(--brand-100)";
  const confirmLabel = initial
    ? "Mettre à jour mon humeur"
    : "Enregistrer mon humeur";

  function updateScore(next: number) {
    setSaved(false);
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
      setError("Règle la jauge pour indiquer ton humeur.");
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
      {/* En-tête : avatar · titre centré · fermer. */}
      <header className="flex items-center justify-between gap-2">
        <span
          aria-hidden
          className="bg-brand-100 text-brand-700 grid h-10 w-10 place-items-center rounded-full font-bold"
        >
          {userInitial ?? "🐨"}
        </span>
        <h1 className="font-display text-heading text-ink-900">Mon humeur</h1>
        <Link
          href="/tableau-de-bord"
          aria-label="Fermer"
          className="text-ink-500 hover:text-ink-800 grid h-10 w-10 place-items-center rounded-full"
        >
          <X aria-hidden size={20} strokeWidth={2} />
        </Link>
      </header>

      <WeekDateStrip today={today} />

      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="font-display text-title text-ink-900">
          Comment tu te sens aujourd&apos;hui ?
        </h2>
        <p className="text-body text-ink-600">
          Tourne la molette, à ton rythme — pas de pression.
        </p>
      </div>

      {/* Dial : ambiance teintée par l'humeur. Score caché. */}
      <div
        className="rounded-panel duration-kitoo ease-kitoo flex flex-col items-center gap-2 p-4 transition-colors motion-reduce:transition-none sm:p-6"
        style={{ backgroundColor: tint }}
      >
        <MoodDial
          value={score}
          onChange={updateScore}
          ariaValueText={moodLabel}
          disabled={pending}
        />

        {/* Bouton rond de validation, sous l'arc. */}
        <button
          type="submit"
          disabled={pending}
          aria-label={confirmLabel}
          className="bg-brand-700 shadow-btn hover:bg-brand-800 -mt-2 grid h-16 w-16 place-items-center rounded-full text-white transition-transform disabled:opacity-60 motion-safe:active:scale-95"
        >
          <ArrowRight aria-hidden size={26} strokeWidth={2.4} />
        </button>
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
    </form>
  );
}

export default MoodEntryForm;
