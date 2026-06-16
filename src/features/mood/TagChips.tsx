"use client";

import { Tag } from "@/components/ui";
import type { MoodTag } from "./queries";

export type TagChipsProps = {
  tags: MoodTag[];
  /** Ids des tags sélectionnés. */
  selected: string[];
  onToggle: (tagId: string) => void;
  disabled?: boolean;
};

/**
 * Chips de tags émotionnels (multi-sélection). Chaque chip est un `Tag`
 * (bouton `aria-pressed`), regroupés dans un `group` labelisé.
 */
export function TagChips({
  tags,
  selected,
  onToggle,
  disabled,
}: TagChipsProps) {
  if (tags.length === 0) return null;
  return (
    <div
      role="group"
      aria-label="Qu'est-ce qui a marqué ta journée ?"
      className="flex flex-wrap gap-2"
    >
      {tags.map((tag) => (
        <Tag
          key={tag.id}
          selected={selected.includes(tag.id)}
          disabled={disabled}
          onClick={() => onToggle(tag.id)}
        >
          {tag.label}
        </Tag>
      ))}
    </div>
  );
}

export default TagChips;
