"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import { MoodFace } from "@/components/ui";
import { MOOD_OPTIONS, type MoodValue } from "./mood-config";

export type MoodPickerProps = {
  value: MoodValue | null;
  onChange: (value: MoodValue) => void;
  disabled?: boolean;
};

/**
 * Sélecteur d'humeur accessible : `radiogroup` de 5 niveaux. Chaque option
 * combine un visage dessiné (`MoodFace`, décoratif) ET un libellé textuel — la
 * couleur n'est jamais la seule information. Navigation clavier (flèches,
 * Home/End) avec roving tabindex, `aria-checked`, focus visible pervenche.
 */
export function MoodPicker({ value, onChange, disabled }: MoodPickerProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // Index focusable par défaut (roving tabindex) : l'option choisie, sinon la 1re.
  const selectedIndex = MOOD_OPTIONS.findIndex((o) => o.value === value);
  const tabbableIndex = selectedIndex >= 0 ? selectedIndex : 0;

  function move(to: number) {
    const next = (to + MOOD_OPTIONS.length) % MOOD_OPTIONS.length;
    const option = MOOD_OPTIONS[next];
    onChange(option.value);
    refs.current[next]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        move(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        move(index - 1);
        break;
      case "Home":
        event.preventDefault();
        move(0);
        break;
      case "End":
        event.preventDefault();
        move(MOOD_OPTIONS.length - 1);
        break;
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Comment tu te sens aujourd'hui ?"
      className="flex flex-wrap justify-center gap-2 sm:gap-3"
    >
      {MOOD_OPTIONS.map((option, index) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={option.label}
            tabIndex={index === tabbableIndex ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              "rounded-card flex w-[4.5rem] flex-col items-center gap-1.5 p-2 sm:w-20 sm:p-3",
              "duration-kitoo ease-kitoo transition-[transform,background-color,box-shadow]",
              "disabled:opacity-50 motion-safe:active:scale-[0.97]",
              checked
                ? "bg-brand-100 ring-brand-500 shadow-sm ring-2"
                : "hover:bg-ink-100",
            )}
          >
            <MoodFace level={option.level} size={44} />
            <span
              className={cn(
                "text-small text-center font-bold",
                checked ? "text-brand-800" : "text-ink-700",
              )}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default MoodPicker;
