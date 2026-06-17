"use client";

import { useId, useState } from "react";
import {
  Anchor,
  ClipboardCheck,
  Clock,
  Sparkles,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { Badge, Card } from "@/components/ui";
import type { BadgeTone } from "@/components/ui";
import { formatDuration } from "@/features/exercises/steps";
import { AssessmentResult } from "@/features/assessments/AssessmentResult";
import type { SeverityTone } from "@/features/assessments/scales";
import type {
  AssessmentJournalEntry,
  ExerciseJournalEntry,
  JournalEntry,
  MoodJournalEntry,
} from "./aggregate";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function parseLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function EntryDate({ date }: { date: string }) {
  return (
    <time dateTime={date} className="text-small text-ink-600">
      {dateFmt.format(parseLocal(date))}
    </time>
  );
}

const SEVERITY_BADGE: Record<SeverityTone, BadgeTone> = {
  ok: "success",
  mild: "brand",
  moderate: "warning",
  high: "danger",
};

const CATEGORY_ICON: Record<string, LucideIcon> = {
  respiration: Wind,
  ancrage: Anchor,
  relaxation: Sparkles,
};

function MoodItem({ entry }: { entry: MoodJournalEntry }) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="h-5 w-5 shrink-0 rounded-full"
          style={{ backgroundColor: entry.moodColor }}
        />
        <span className="text-body text-ink-900 font-bold">
          {entry.moodLabel}
        </span>
        <span className="ml-auto">
          <EntryDate date={entry.date} />
        </span>
      </div>
      {entry.tags.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <li key={tag}>
              <Badge tone="neutral">{tag}</Badge>
            </li>
          ))}
        </ul>
      ) : null}
      {entry.commentExcerpt ? (
        <p className="text-body text-ink-700">{entry.commentExcerpt}</p>
      ) : null}
    </Card>
  );
}

function ExerciseItem({ entry }: { entry: ExerciseJournalEntry }) {
  const Icon = CATEGORY_ICON[entry.category] ?? Sparkles;
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="bg-brand-100 text-brand-700 rounded-pill flex h-9 w-9 shrink-0 items-center justify-center">
          <Icon aria-hidden size={18} strokeWidth={1.8} />
        </span>
        <span className="text-body text-ink-900 font-bold">{entry.title}</span>
        <span className="ml-auto">
          <EntryDate date={entry.date} />
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {entry.category ? (
          <Badge tone="neutral" className="capitalize">
            {entry.category}
          </Badge>
        ) : null}
        {entry.durationSec > 0 ? (
          <span className="text-small text-ink-600 inline-flex items-center gap-1">
            <Clock aria-hidden size={14} strokeWidth={1.8} />
            {formatDuration(entry.durationSec)}
          </span>
        ) : null}
        <Badge tone={entry.completed ? "success" : "neutral"}>
          {entry.completed ? "Terminé" : "Commencé"}
        </Badge>
      </div>
    </Card>
  );
}

function AssessmentItem({ entry }: { entry: AssessmentJournalEntry }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="bg-brand-100 text-brand-700 rounded-pill flex h-9 w-9 shrink-0 items-center justify-center">
          <ClipboardCheck aria-hidden size={18} strokeWidth={1.8} />
        </span>
        <span className="text-body text-ink-900 font-bold">
          {entry.scaleTitle}
        </span>
        <span className="ml-auto">
          <EntryDate date={entry.date} />
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={SEVERITY_BADGE[entry.severityTone]}>
          {entry.severityLabel}
        </Badge>
        <span className="text-small text-ink-600">
          Score {entry.score}/{entry.maxScore} — un repère, pas un diagnostic.
        </span>
      </div>
      {entry.flagged ? (
        <p className="text-small text-ink-600">
          Tu as répondu avec honnêteté. Ouvre le détail pour des ressources de
          soutien.
        </p>
      ) : null}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="text-small text-brand-700 self-start font-bold"
      >
        {open ? "Masquer le détail" : "Voir le détail"}
      </button>
      {open ? (
        <div id={panelId} className="pt-1">
          <AssessmentResult
            scaleKey={entry.scale}
            result={{
              score: entry.score,
              severity: {
                label: entry.severityLabel,
                tone: entry.severityTone,
              },
              flagged: entry.flagged,
            }}
          />
        </div>
      ) : null}
    </Card>
  );
}

/** Une entrée de la timeline, avec un visuel distinct selon le type. */
export function TimelineItem({ entry }: { entry: JournalEntry }) {
  switch (entry.kind) {
    case "mood":
      return <MoodItem entry={entry} />;
    case "exercise":
      return <ExerciseItem entry={entry} />;
    case "assessment":
      return <AssessmentItem entry={entry} />;
  }
}

export default TimelineItem;
