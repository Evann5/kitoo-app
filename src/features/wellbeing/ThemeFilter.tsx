"use client";

import { cn } from "@/lib/cn";
import { themeLabel, formatLabel } from "./filters";

export type ThemeFilterProps = {
  themes: string[];
  formats: string[];
  theme: string | null;
  format: string | null;
  onThemeChange: (theme: string | null) => void;
  onFormatChange: (format: string | null) => void;
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
 * Filtres du catalogue : **format** (à lire / écouter / regarder) et **thème**,
 * cumulables. Chips accessibles (`aria-pressed`), opérables au clavier. « Tout »
 * / « Tous les thèmes » réinitialisent le critère.
 */
export function ThemeFilter({
  themes,
  formats,
  theme,
  format,
  onThemeChange,
  onFormatChange,
}: ThemeFilterProps) {
  return (
    <div className="flex flex-col gap-3">
      <div
        role="group"
        aria-label="Filtrer par format"
        className="flex flex-wrap gap-2"
      >
        <Chip
          label="Tout"
          pressed={format === null}
          onClick={() => onFormatChange(null)}
        />
        {formats.map((f) => (
          <Chip
            key={f}
            label={formatLabel(f)}
            pressed={format === f}
            onClick={() => onFormatChange(format === f ? null : f)}
          />
        ))}
      </div>
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
    </div>
  );
}

export default ThemeFilter;
