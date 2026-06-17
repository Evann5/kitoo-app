"use client";

import { useRef } from "react";
import { scoreToOption, SCORE_MIN, SCORE_MAX } from "./mood-config";

export type MoodDialProps = {
  /** Score courant 0–100, ou `null` si pas encore réglé. */
  value: number | null;
  onChange: (score: number) => void;
  /**
   * Texte annoncé par le lecteur d'écran (libellé d'humeur, JAMAIS le nombre).
   */
  ariaValueText: string;
  /** Contenu central (mascotte + libellé). */
  children?: React.ReactNode;
  disabled?: boolean;
};

const SIZE = 264;
const R = SIZE / 2 - 26;
const C = SIZE / 2;
const START = 135; // angle de départ (bas-gauche), balaye 270° par le haut
const SWEEP = 270;
const STEP = 4;

function polar(angleDeg: number, radius = R) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: C + radius * Math.cos(a), y: C + radius * Math.sin(a) };
}

function valueToAngle(v: number) {
  return START + (v / 100) * SWEEP;
}

function arcPath(startA: number, endA: number) {
  const s = polar(startA);
  const e = polar(endA);
  const large = endA - startA > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y}`;
}

function clampScore(v: number) {
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, Math.round(v)));
}

/**
 * Molette rotative de saisie d'humeur. Produit un **score continu 0–100 caché**
 * (jamais affiché ni annoncé). Accessible : `role="slider"`, opérable au clavier
 * (flèches, Home/End, PageUp/Down) ET au pointeur/tactile (drag sur l'arc).
 * Le lecteur d'écran annonce `aria-valuetext` = libellé d'humeur.
 */
export function MoodDial({
  value,
  onChange,
  ariaValueText,
  children,
  disabled,
}: MoodDialProps) {
  const ref = useRef<HTMLDivElement>(null);
  const display = value ?? 50; // position neutre tant que non réglé
  const angle = valueToAngle(display);
  const handle = polar(angle);
  const color = value !== null ? scoreToOption(value).color : "var(--ink-300)";

  function pointerToScore(clientX: number, clientY: number): number {
    const el = ref.current;
    if (!el) return display;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let ang = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI; // -180..180
    if (ang < 0) ang += 360; // 0..360
    if (ang < START) ang += 360; // ramène sur [135, 495)
    if (ang > START + SWEEP) {
      // Zone morte en bas : on accroche à l'extrémité la plus proche.
      return ang < START + SWEEP + (360 - SWEEP) / 2 ? SCORE_MAX : SCORE_MIN;
    }
    return clampScore(((ang - START) / SWEEP) * 100);
  }

  function handlePointer(e: React.PointerEvent) {
    if (disabled) return;
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    onChange(pointerToScore(e.clientX, e.clientY));
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (disabled || e.buttons === 0) return;
    onChange(pointerToScore(e.clientX, e.clientY));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    let next: number | null = null;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = display + STEP;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        next = display - STEP;
        break;
      case "PageUp":
        next = display + 20;
        break;
      case "PageDown":
        next = display - 20;
        break;
      case "Home":
        next = SCORE_MIN;
        break;
      case "End":
        next = SCORE_MAX;
        break;
      default:
        return;
    }
    e.preventDefault();
    onChange(clampScore(next));
  }

  return (
    <div
      ref={ref}
      role="slider"
      aria-label="Règle ton humeur"
      aria-valuemin={SCORE_MIN}
      aria-valuemax={SCORE_MAX}
      aria-valuenow={display}
      aria-valuetext={ariaValueText}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointer}
      onPointerMove={handlePointerMove}
      className="rounded-pill relative mx-auto touch-none select-none"
      style={{ width: SIZE, height: SIZE, maxWidth: "90vw" }}
    >
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-full w-full"
        aria-hidden="true"
      >
        <path
          d={arcPath(START, START + SWEEP)}
          fill="none"
          stroke="var(--ink-200)"
          strokeWidth={14}
          strokeLinecap="round"
        />
        {value !== null ? (
          <path
            d={arcPath(START, angle)}
            fill="none"
            stroke={color}
            strokeWidth={14}
            strokeLinecap="round"
            className="duration-kitoo ease-kitoo transition-all motion-reduce:transition-none"
          />
        ) : null}
        <circle
          cx={handle.x}
          cy={handle.y}
          r={16}
          fill="#fff"
          stroke={color}
          strokeWidth={5}
          className="duration-kitoo ease-kitoo transition-all motion-reduce:transition-none"
        />
      </svg>

      {/* Centre : mascotte + libellé (décoratif ; le sens passe par le slider). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-12 text-center"
      >
        {children}
      </div>
    </div>
  );
}

export default MoodDial;
