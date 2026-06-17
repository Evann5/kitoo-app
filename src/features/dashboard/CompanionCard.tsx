"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, X } from "lucide-react";
import { Card } from "@/components/ui";
import { Mascot } from "@/components/illustrations";
import type { MascotPose } from "@/lib/illustrations";
import { setCompanionName } from "./actions";
import { COMPANION_NAME_MAX } from "./companion";

export type CompanionCardProps = {
  /** Nom du compagnon (défaut « Kitoo »). */
  name: string;
  /** Message de la bulle (ton chaleureux, encourageant). */
  message: string;
  /** Pose de la mascotte (reflète l'humeur du jour, ou `classic`). */
  pose: MascotPose;
  /** Série en cours (jours), indicateur positif. */
  streak: number;
  /** Ressenti qualitatif de la semaine (libellé, JAMAIS le score 0–100). */
  weekLabel: string | null;
};

/** Petit indicateur **positif** (jamais une jauge qui se vide). */
function Indicator({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-control flex flex-col gap-0.5 bg-white px-4 py-3 text-center">
      <span className="text-small text-ink-600">{label}</span>
      <span className="text-body text-ink-900 font-bold">{value}</span>
    </div>
  );
}

/**
 * Carte « compagnon » centrale : nom éditable, bulle de dialogue contextuelle,
 * koala (avec étincelles douces, neutralisées sous `prefers-reduced-motion`) et
 * **deux indicateurs positifs** (série + ressenti de la semaine). Aucune jauge
 * punitive type « faim/bonheur », et **jamais le score d'humeur 0–100 caché**.
 */
export function CompanionCard({
  name,
  message,
  pose,
  streak,
  weekLabel,
}: CompanionCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState(name);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  function save() {
    startTransition(async () => {
      const res = await setCompanionName(draft);
      if (res.ok) {
        setDisplayName(res.name);
        setEditing(false);
        router.refresh();
      }
    });
  }

  return (
    <Card soft className="flex flex-col gap-4">
      {/* Nom du compagnon + édition. */}
      <div className="flex items-center justify-center gap-2">
        {editing ? (
          <>
            <label htmlFor="companion-name" className="sr-only">
              Nom du compagnon
            </label>
            <input
              id="companion-name"
              value={draft}
              maxLength={COMPANION_NAME_MAX}
              disabled={pending}
              autoFocus
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  save();
                }
                if (e.key === "Escape") setEditing(false);
              }}
              className="rounded-control border-ink-300 focus-visible:border-brand-400 text-body text-ink-900 w-40 border bg-white px-3 py-1 text-center font-bold"
            />
            <button
              type="button"
              aria-label="Valider le nom"
              onClick={save}
              disabled={pending}
              className="text-brand-700 grid h-9 w-9 place-items-center rounded-full"
            >
              <Check aria-hidden size={18} strokeWidth={2.4} />
            </button>
            <button
              type="button"
              aria-label="Annuler"
              onClick={() => {
                setDraft(displayName);
                setEditing(false);
              }}
              className="text-ink-500 grid h-9 w-9 place-items-center rounded-full"
            >
              <X aria-hidden size={18} strokeWidth={2.4} />
            </button>
          </>
        ) : (
          <>
            <span className="font-display text-title text-ink-900">
              {displayName}
            </span>
            <button
              type="button"
              aria-label="Renommer le compagnon"
              onClick={() => {
                setDraft(displayName);
                setEditing(true);
              }}
              className="text-ink-500 hover:text-ink-800 grid h-9 w-9 place-items-center rounded-full"
            >
              <Pencil aria-hidden size={16} strokeWidth={2} />
            </button>
          </>
        )}
      </div>

      {/* Bulle de dialogue façon « message de chat », pointe vers le koala. */}
      <div className="relative mx-auto max-w-[18rem]">
        <p className="rounded-3xl rounded-bl-md text-body text-ink-800 bg-white px-4 py-3 shadow-sm">
          {message}
        </p>
        <span
          aria-hidden
          className="absolute -bottom-1.5 left-6 h-3.5 w-3.5 rotate-45 rounded-[3px] bg-white"
        />
      </div>

      {/* Grand koala + étincelles décoratives. */}
      <div className="relative mx-auto w-64 max-w-full max-[360px]:w-52">
        <Mascot pose={pose} priority className="w-full" />
        <span
          aria-hidden
          className="bg-brand-400 absolute top-2 right-6 h-3 w-3 rounded-full motion-safe:animate-pulse motion-reduce:hidden"
        />
        <span
          aria-hidden
          className="bg-brand-300 absolute top-10 left-2 h-2.5 w-2.5 rounded-full motion-safe:animate-pulse motion-reduce:hidden"
        />
        <span
          aria-hidden
          className="bg-brand-500 absolute right-2 bottom-10 h-2 w-2 rounded-full motion-safe:animate-pulse motion-reduce:hidden"
        />
      </div>

      {/* Indicateurs positifs (jamais le score 0–100). */}
      <div className="grid grid-cols-2 gap-3">
        <Indicator
          label="Série"
          value={`${streak} ${streak > 1 ? "jours" : "jour"}`}
        />
        <Indicator label="Cette semaine" value={weekLabel ?? "À découvrir"} />
      </div>
    </Card>
  );
}

export default CompanionCard;
