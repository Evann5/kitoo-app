"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { Mascot } from "@/components/illustrations";
import { MoodPicker } from "./MoodPicker";
import { TagChips } from "./TagChips";
import { saveMood } from "./actions";
import { moodOption, poseForMood, type MoodValue } from "./mood-config";
import type { MoodTag } from "./queries";

export type MoodEntryFormProps = {
  tags: MoodTag[];
  /** Entrée du jour préchargée (édition), ou `null` (création). */
  initial: { level: MoodValue; comment: string; tagIds: string[] } | null;
};

/**
 * Formulaire de saisie d'humeur du jour, avec réaction du koala compagnon
 * (pose + teinte de fond selon l'humeur, transition douce neutralisée sous
 * `prefers-reduced-motion`). Précharge l'entrée existante si elle existe.
 */
export function MoodEntryForm({ tags, initial }: MoodEntryFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [level, setLevel] = useState<MoodValue | null>(initial?.level ?? null);
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initial?.tagIds ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const option = level ? moodOption(level) : undefined;
  const pose = poseForMood(level ?? 3);
  // Teinte de fond compagne : couleur d'humeur très adoucie (sinon lavande neutre).
  const tint = option
    ? `color-mix(in srgb, ${option.color} 22%, white)`
    : "var(--brand-100)";

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
    if (!level) {
      setError("Choisis d'abord comment tu te sens.");
      return;
    }
    startTransition(async () => {
      const result = await saveMood({ level, comment, tagIds: selectedTags });
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
      {/* Compagnon : pose + teinte réagissent à l'humeur. */}
      <div
        className="rounded-panel duration-kitoo ease-kitoo flex flex-col items-center gap-2 p-6 text-center transition-colors motion-reduce:transition-none"
        style={{ backgroundColor: tint }}
      >
        <Mascot pose={pose} priority className="w-40 max-w-[55vw]" />
        <h1 className="font-display text-title text-ink-900">
          Comment tu te sens aujourd&apos;hui ?
        </h1>
        <p className="text-body text-ink-600">
          Pas de pression — note ce qui te vient.
        </p>
      </div>

      <MoodPicker
        value={level}
        onChange={(v) => {
          setSaved(false);
          setLevel(v);
        }}
        disabled={pending}
      />

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
        {initial ? "Mettre à jour mon humeur" : "Enregistrer mon humeur"}
      </Button>
    </form>
  );
}

export default MoodEntryForm;
