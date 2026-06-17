"use client";

import { useRef } from "react";
import { Mascot } from "@/components/illustrations";
import { MoodFace } from "@/components/ui";
import {
  MOOD_OPTIONS,
  scoreToLevel,
  scoreToOption,
  poseForScore,
  SCORE_MIN,
  SCORE_MAX,
} from "./mood-config";

export type MoodDialProps = {
  /** Score courant 0–100, ou `null` si pas encore réglé. */
  value: number | null;
  onChange: (score: number) => void;
  /**
   * Texte annoncé par le lecteur d'écran (libellé d'humeur, JAMAIS le nombre).
   * Sert aussi de libellé qualitatif affiché au centre.
   */
  ariaValueText: string;
  /** Contenu central (override de la mascotte + libellé internes). */
  children?: React.ReactNode;
  disabled?: boolean;
};

/*
 * Disposition « arc » :
 * - Les 5 icônes d'humeur sont posées le long de l'arc **haut** (θ de 180° à
 *   360°, gauche → haut → droite), de « Difficile » (gauche) à « Très bien »
 *   (droite) pour s'aligner sur la jauge.
 * - La jauge est l'arc **bas** (demi-cercle θ de 180° à 0° en passant par 90°) ;
 *   la poignée encode le score 0–100 CACHÉ : gauche = 0, droite = 100.
 * Les deux arcs partagent le même cercle (rayon R) et se rejoignent aux
 * extrémités gauche/droite, formant un anneau ; le koala est au centre.
 */
const SIZE = 300;
const C = SIZE / 2;
const R = 124;
const ICON = 46; // diamètre des icônes (cible tactile ≥ 44px)
const STEP = 4;

/** Centre de zone (score) de chaque humeur — clic icône = pose la poignée ici. */
const ZONE_MID = [10, 30, 50, 70, 90];

function polar(angleDeg: number, radius = R) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: C + radius * Math.cos(a), y: C + radius * Math.sin(a) };
}

/** Angle (haut) d'une icône d'humeur, i = 0 (gauche) … 4 (droite). */
function iconAngle(i: number) {
  return 180 + (i / 4) * 180;
}

/** Angle (bas) de la jauge pour un score : 0 → 180° (gauche), 100 → 0° (droite). */
function gaugeAngle(v: number) {
  return 180 - (v / 100) * 180;
}

/** Tracé d'arc bas (demi-cercle inférieur), de `aStart` à `aEnd`. */
function bottomArc(aStart: number, aEnd: number) {
  const s = polar(aStart);
  const e = polar(aEnd);
  return `M ${s.x} ${s.y} A ${R} ${R} 0 0 0 ${e.x} ${e.y}`;
}

const pct = (px: number) => `${(px / SIZE) * 100}%`;

function clampScore(v: number) {
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, Math.round(v)));
}

/**
 * Saisie d'humeur en **arc**. Produit un **score continu 0–100 caché** (jamais
 * affiché ni annoncé). Accessible : la jauge est un `role="slider"` opérable au
 * clavier (flèches, Home/End, PageUp/Down) et au pointeur/tactile (drag sur
 * l'arc bas) ; les 5 icônes sont des boutons labellisés qui posent la poignée
 * sur leur zone. Le lecteur d'écran annonce `aria-valuetext` = libellé d'humeur.
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
  const angle = gaugeAngle(display);
  const handle = polar(angle);
  const color = value !== null ? scoreToOption(value).color : "var(--ink-300)";
  const activeLevel = value !== null ? scoreToLevel(value) : null;

  function pointerToScore(clientX: number, clientY: number): number {
    const el = ref.current;
    if (!el) return display;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const ang = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
    // Moitié haute (ang ≤ 0) : accroche à l'extrémité la plus proche.
    if (ang <= 0) return clientX < cx ? SCORE_MIN : SCORE_MAX;
    return clampScore(((180 - ang) / 180) * 100);
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
      className="relative mx-auto select-none"
      style={{ width: "min(300px, 86vw)", aspectRatio: "1" }}
    >
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-full w-full"
        aria-hidden="true"
      >
        {/* Anneau de cohésion (faible). */}
        <circle
          cx={C}
          cy={C}
          r={R}
          fill="none"
          stroke="var(--ink-100)"
          strokeWidth={2}
        />
        {/* Track de la jauge (arc bas). */}
        <path
          d={bottomArc(180, 0)}
          fill="none"
          stroke="var(--ink-200)"
          strokeWidth={14}
          strokeLinecap="round"
        />
        {/* Remplissage coloré jusqu'à la poignée. */}
        {value !== null ? (
          <path
            d={bottomArc(180, angle)}
            fill="none"
            stroke={color}
            strokeWidth={14}
            strokeLinecap="round"
            className="duration-kitoo ease-kitoo transition-all motion-reduce:transition-none"
          />
        ) : null}
        {/* Poignée. */}
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

      {/* Jauge interactive : 1er élément focusable (slider). Transparente. */}
      <div
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
        className="rounded-card absolute inset-0 touch-none"
      />

      {/* Icônes d'humeur le long de l'arc haut (boutons labellisés). */}
      {MOOD_OPTIONS.map((opt, i) => {
        const p = polar(iconAngle(i));
        const active = activeLevel === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            aria-label={opt.label}
            aria-pressed={active}
            onClick={() => onChange(ZONE_MID[i])}
            className="rounded-pill duration-kitoo ease-kitoo absolute z-10 grid -translate-x-1/2 -translate-y-1/2 place-items-center transition-transform motion-reduce:transition-none"
            style={{
              left: pct(p.x),
              top: pct(p.y),
              width: ICON,
              height: ICON,
              transform: `translate(-50%, -50%) scale(${active ? 1.18 : 1})`,
              boxShadow: active ? `0 0 0 3px ${opt.color}` : undefined,
              borderRadius: 999,
              opacity: activeLevel === null || active ? 1 : 0.55,
            }}
          >
            <MoodFace level={opt.level} size={ICON} />
          </button>
        );
      })}

      {/* Centre : koala + libellé (décoratif ; le sens passe par le slider). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 px-16 text-center"
      >
        {children ?? (
          <>
            <Mascot
              pose={value !== null ? poseForScore(value) : "classic"}
              animate={false}
              priority
              className="w-20"
            />
            <span className="font-display text-title text-ink-900">
              {ariaValueText}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default MoodDial;
