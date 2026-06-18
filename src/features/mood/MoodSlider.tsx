"use client";

import { Mascot } from "@/components/illustrations";
import { scoreToOption, SCORE_MIN, SCORE_MAX } from "./mood-config";

export type MoodSliderProps = {
  /** Score courant 0–100, ou `null` si pas encore réglé. */
  value: number | null;
  onChange: (score: number) => void;
  /** Libellé qualitatif annoncé (JAMAIS le nombre) - sert d'`aria-valuetext`. */
  ariaValueText: string;
  disabled?: boolean;
};

const END_MIN_ID = "mood-end-min";
const END_MAX_ID = "mood-end-max";

/**
 * Curseur **horizontal de valence** (très désagréable → très agréable). La
 * position encode le **score 0–100 caché** (jamais affiché, ni dans
 * `aria-valuetext` qui porte le libellé). Visuel réactif : koala (pose selon la
 * zone) + halo lavande dont la teinte évolue avec la valeur, et libellé
 * qualitatif. Curseur natif `<input type="range">` (robuste, en flux normal,
 * clavier flèches/Home/End), remplissage posé en `background-image` selon la
 * valeur. Transition douce neutralisée sous `prefers-reduced-motion`.
 */
export function MoodSlider({
  value,
  onChange,
  ariaValueText,
  disabled,
}: MoodSliderProps) {
  const display = value ?? 50; // position neutre tant que non réglé
  const option = value !== null ? scoreToOption(value) : undefined;
  const pose = option?.pose ?? "classic";
  const moodColor = option?.color ?? "var(--brand-300)";

  // Halo : dégradé radial lavande → couleur d'humeur, plus chaleureux/large à
  // mesure que la valeur monte.
  const haloScale = 0.85 + (display / 100) * 0.35;
  const halo =
    value !== null
      ? `radial-gradient(circle, color-mix(in srgb, ${moodColor} 55%, white) 0%, var(--brand-100) 70%)`
      : "radial-gradient(circle, var(--brand-100) 0%, var(--brand-50) 70%)";

  // Remplissage du curseur jusqu'à la poignée (gradient posé sur le fond).
  const fill = `linear-gradient(to right, var(--brand-500) 0%, var(--brand-500) ${display}%, var(--ink-200) ${display}%, var(--ink-200) 100%)`;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Visuel réactif : halo + koala. Décoratif (le sens passe par le slider). */}
      <div
        aria-hidden="true"
        className="relative flex h-44 w-44 items-center justify-center"
      >
        <div
          className="duration-kitoo ease-kitoo absolute inset-0 rounded-full transition-all motion-reduce:transition-none"
          style={{ background: halo, transform: `scale(${haloScale})` }}
        />
        <Mascot
          pose={pose}
          animate={false}
          priority
          className="relative w-28"
        />
      </div>

      {/* Libellé qualitatif (jamais de chiffre). */}
      <p className="font-display text-title text-ink-900">{ariaValueText}</p>

      {/* Curseur de valence. */}
      <div className="flex w-full flex-col gap-2">
        <input
          type="range"
          className="mood-range"
          min={SCORE_MIN}
          max={SCORE_MAX}
          step={1}
          value={display}
          disabled={disabled}
          aria-label="Règle ton humeur"
          aria-valuetext={ariaValueText}
          aria-describedby={`${END_MIN_ID} ${END_MAX_ID}`}
          style={{ backgroundImage: fill }}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <div className="text-small text-ink-600 flex justify-between">
          <span id={END_MIN_ID}>Très désagréable</span>
          <span id={END_MAX_ID}>Très agréable</span>
        </div>
      </div>
    </div>
  );
}

export default MoodSlider;
