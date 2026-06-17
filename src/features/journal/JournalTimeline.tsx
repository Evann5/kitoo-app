"use client";

import { Stagger } from "@/components/motion";
import { TimelineItem } from "./TimelineItem";
import type { JournalEntry } from "./aggregate";

/** Timeline en liste sémantique (`<ol>`), du plus récent au plus ancien. */
export function JournalTimeline({ entries }: { entries: JournalEntry[] }) {
  return (
    <Stagger as="ol" className="flex flex-col gap-3">
      {entries.map((entry) => (
        <Stagger.Item as="li" key={`${entry.kind}-${entry.id}`}>
          <TimelineItem entry={entry} />
        </Stagger.Item>
      ))}
    </Stagger>
  );
}

export default JournalTimeline;
