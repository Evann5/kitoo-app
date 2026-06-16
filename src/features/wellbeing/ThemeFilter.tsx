"use client";

import { cn } from "@/lib/cn";
import { themeLabel, typeLabel } from "./filters";

export type ThemeFilterProps = {
  themes: string[];
  types: string[];
  theme: string | null;
  type: string | null;
  onThemeChange: (theme: string | null) => void;
  onTypeChange: (type: string | null) => void;
};

function Chip({
  label,
  pressed,
  onClick,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "rounded-pill text-small min-h-[36px] px-3 py-1 font-bold",
        "duration-kitoo ease-kitoo transition-colors",
        pressed
          ? "bg-brand-700 text-white"
          : "border-ink-300 text-ink-700 hover:bg-brand-100 border",
      )}
    >
      {label}
    </button>
  );
}

/**
 * Filtres du catalogue : thème et type (cumulables). Chips accessibles
 * (`aria-pressed`), opérables au clavier. « Tous » réinitialise le critère.
 */
export function ThemeFilter({
  themes,
  types,
  theme,
  type,
  onThemeChange,
  onTypeChange,
}: ThemeFilterProps) {
  return (
    <div className="flex flex-col gap-3">
      <div
        role="group"
        aria-label="Filtrer par thème"
        className="flex flex-wrap gap-2"
      >
        <Chip
          label="Tous les thèmes"
          pressed={theme === null}
          onClick={() => onThemeChange(null)}
        />
        {themes.map((t) => (
          <Chip
            key={t}
            label={themeLabel(t)}
            pressed={theme === t}
            onClick={() => onThemeChange(theme === t ? null : t)}
          />
        ))}
      </div>
      <div
        role="group"
        aria-label="Filtrer par type"
        className="flex flex-wrap gap-2"
      >
        <Chip
          label="Tous les types"
          pressed={type === null}
          onClick={() => onTypeChange(null)}
        />
        {types.map((t) => (
          <Chip
            key={t}
            label={typeLabel(t)}
            pressed={type === t}
            onClick={() => onTypeChange(type === t ? null : t)}
          />
        ))}
      </div>
    </div>
  );
}

export default ThemeFilter;
