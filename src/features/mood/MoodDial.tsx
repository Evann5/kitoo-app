"use client";

import { useRef } from "react";
import { Mascot } from "@/components/illustrations";
import { moodByLevel, type MoodLevel } from "@/lib/moods";
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
  disabled?: boolean;
};

/*
 * Tout le cadran vit dans UN SEUL <svg> responsive (viewBox fixe + width:100%,
 * height:auto, preserveAspectRatio) : arc, graduations, remplissage, poignée,
 * 5 icônes et koala+libellé partagent le même système de coordonnées →
 * alignement garanti à toutes les tailles (pas d'overlay HTML en px).
 *
 * Géométrie « bol » (∪) : le centre O du cercle est AU-DESSUS, l'arc est la
 * moitié BASSE du cercle (concave vers le haut). Gauche (θ=180°) = score 0 (très
 * négatif), bas (θ=90°) = ~50 (neutre), droite (θ=0°) = score 100 (très positif).
 *   θ(score) = 180 − 1,8·score   ·   point(θ) = (Ox + R·cosθ, Oy + R·sinθ)
 */
const W = 360;
const H = 300;
const OX = 180; // centre du cercle (au-dessus de l'arc)
const OY = 118;
const RG = 145; // rayon de la jauge
const R_GRAD = RG + 12; // graduations pointillées, légèrement plus bas
const STEP = 4;

/** Centre de zone (score) de chaque humeur — activer une icône pose la poignée ici. */
const ZONE_MID = [10, 30, 50, 70, 90];

/** Positions des 5 icônes en éventail au-dessus de l'arc (coordonnées SVG). */
const ICON_X = [44, 112, 180, 248, 316];
const iconY = (i: number) => 42 + 7 * (i - 2) ** 2; // léger éventail (∩)

const MOUTHS: Record<MoodLevel, string> = {
  "very-positive": "M32 58 Q50 84 68 58",
  positive: "M35 60 Q50 76 65 60",
  neutral: "M37 66 H63",
  negative: "M35 71 Q50 60 65 71",
  "very-negative": "M34 73 Q50 57 66 73",
};

function rad(angleDeg: number) {
  return (angleDeg * Math.PI) / 180;
}

function point(angleDeg: number, radius: number) {
  return {
    x: OX + radius * Math.cos(rad(angleDeg)),
    y: OY + radius * Math.sin(rad(angleDeg)),
  };
}

function scoreToAngle(v: number) {
  return 180 - (v / 100) * 180;
}

/** Tracé de l'arc bas (∪), de `aStart` à `aEnd`, sur le cercle de rayon `r`. */
function bowlArc(aStart: number, aEnd: number, r: number) {
  const s = point(aStart, r);
  const e = point(aEnd, r);
  return `M ${s.x} ${s.y} A ${r} ${r} 0 0 0 ${e.x} ${e.y}`;
}

function clampScore(v: number) {
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, Math.round(v)));
}

/** Visage d'humeur dessiné dans le repère SVG, centré en (cx,cy), demi-taille r. */
function Face({
  level,
  cx,
  cy,
  r,
}: {
  level: MoodLevel;
  cx: number;
  cy: number;
  r: number;
}) {
  const color = moodByLevel(level).color;
  return (
    <g transform={`translate(${cx - r} ${cy - r}) scale(${(2 * r) / 100})`}>
      <circle cx={50} cy={50} r={48} fill={color} />
      <circle cx={36} cy={42} r={5} fill="#16161D" />
      <circle cx={64} cy={42} r={5} fill="#16161D" />
      <path
        d={MOUTHS[level]}
        stroke="#16161D"
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

/**
 * Cadran d'humeur « bol » — un SVG responsive unique. Produit un **score
 * continu 0–100 caché** (jamais affiché, ni dans `aria-valuetext`). La jauge est
 * un `role="slider"` opérable au clavier (flèches, Home/End) et au pointeur
 * (drag) ; les 5 icônes sont des boutons activables qui posent la poignée sur
 * leur zone. Le lecteur d'écran annonce le libellé d'humeur.
 */
export function MoodDial({
  value,
  onChange,
  ariaValueText,
  disabled,
}: MoodDialProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const display = value ?? 50; // position neutre tant que non réglé
  const angle = scoreToAngle(display);
  const handle = point(angle, RG);
  const color = value !== null ? scoreToOption(value).color : "var(--ink-300)";
  const activeLevel = value !== null ? scoreToLevel(value) : null;

  function pointerToScore(clientX: number, clientY: number): number {
    const el = svgRef.current;
    if (!el) return display;
    const rect = el.getBoundingClientRect();
    // O en coordonnées écran (mise à l'échelle uniforme du viewBox).
    const ox = rect.left + (OX / W) * rect.width;
    const oy = rect.top + (OY / H) * rect.height;
    const ang = (Math.atan2(clientY - oy, clientX - ox) * 180) / Math.PI;
    // Moitié haute (ang ≤ 0) : accroche à l'extrémité la plus proche.
    if (ang <= 0) return clientX < ox ? SCORE_MIN : SCORE_MAX;
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

  function handleIconKey(e: React.KeyboardEvent, i: number) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange(ZONE_MID[i]);
    }
  }

  const pose = value !== null ? poseForScore(value) : "classic";

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-auto w-full touch-none select-none"
      onPointerDown={handlePointer}
      onPointerMove={handlePointerMove}
    >
      {/* Graduations pointillées sur un arc concentrique légèrement plus bas. */}
      <path
        d={bowlArc(180, 0, R_GRAD)}
        fill="none"
        stroke="var(--ink-300)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="1 13"
        aria-hidden="true"
      />

      {/* Jauge : track + remplissage + poignée, dans le groupe role="slider". */}
      <g
        role="slider"
        aria-label="Règle ton humeur"
        aria-valuemin={SCORE_MIN}
        aria-valuemax={SCORE_MAX}
        aria-valuenow={display}
        aria-valuetext={ariaValueText}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
      >
        <path
          d={bowlArc(180, 0, RG)}
          fill="none"
          stroke="var(--ink-200)"
          strokeWidth={14}
          strokeLinecap="round"
        />
        {value !== null ? (
          <path
            d={bowlArc(180, angle, RG)}
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
      </g>

      {/* Icônes d'humeur en éventail au-dessus de l'arc (boutons activables). */}
      {MOOD_OPTIONS.map((opt, i) => {
        const cx = ICON_X[i];
        const cy = iconY(i);
        const active = activeLevel === opt.value;
        const r = active ? 24 : 19;
        return (
          <g
            key={opt.value}
            role="button"
            aria-label={opt.label}
            aria-pressed={active}
            aria-disabled={disabled || undefined}
            tabIndex={disabled ? -1 : 0}
            onClick={() => !disabled && onChange(ZONE_MID[i])}
            onKeyDown={(e) => handleIconKey(e, i)}
            onPointerDown={(e) => e.stopPropagation()}
            className="duration-kitoo ease-kitoo cursor-pointer transition-all motion-reduce:transition-none"
            style={{ opacity: activeLevel === null || active ? 1 : 0.5 }}
          >
            {active ? (
              <circle
                cx={cx}
                cy={cy}
                r={r + 4}
                fill="none"
                stroke={opt.color}
                strokeWidth={3}
              />
            ) : null}
            <Face level={opt.level} cx={cx} cy={cy} r={r} />
            {/* Cible tactile élargie, invisible. */}
            <circle cx={cx} cy={cy} r={26} fill="transparent" />
          </g>
        );
      })}

      {/* Koala + libellé centrés dans l'ouverture du bol (décoratifs). */}
      <foreignObject
        x={OX - 56}
        y={120}
        width={112}
        height={104}
        aria-hidden="true"
      >
        <div className="flex h-full w-full items-center justify-center">
          <Mascot pose={pose} animate={false} priority className="w-[88px]" />
        </div>
      </foreignObject>
      <text
        x={OX}
        y={250}
        textAnchor="middle"
        className="font-display"
        style={{ fontSize: 26, fill: "var(--ink-900)" }}
        aria-hidden="true"
      >
        {ariaValueText}
      </text>
    </svg>
  );
}

export default MoodDial;
