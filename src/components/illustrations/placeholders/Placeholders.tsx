/**
 * Placeholders SVG doux : cohérents avec le design system Kitoo (formes
 * arrondies, palette lavande/pervenche). Affichés tant que la vraie illustration
 * n'est pas déposée dans `public/illustrations/`. En dev, une légende discrète
 * rappelle la clé et les dimensions attendues.
 */

const IS_DEV = process.env.NODE_ENV !== "production";

type PlaceholderProps = {
  /** Clé d'illustration (légende dev). */
  label?: string;
  className?: string;
  width: number;
  height: number;
};

/** Légende dev (clé + dimensions) : masquée en production. */
function DevCaption({
  label,
  x,
  y,
  size = 18,
}: {
  label?: string;
  x: number;
  y: number;
  size?: number;
}) {
  if (!IS_DEV || !label) return null;
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontFamily="monospace"
      fontSize={size}
      fill="#7C7D90"
    >
      {label}
    </text>
  );
}

/** Koala simplifié et bienveillant (toutes poses). */
export function KoalaPlaceholder({
  label,
  className,
  width,
  height,
}: PlaceholderProps) {
  return (
    <svg
      viewBox="0 0 400 400"
      width={width}
      height={height}
      className={className}
      role="presentation"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="16" y="16" width="368" height="368" rx="64" fill="#E9EAFA" />
      {/* oreilles */}
      <circle cx="118" cy="138" r="54" fill="#BFC0F4" />
      <circle cx="282" cy="138" r="54" fill="#BFC0F4" />
      <circle cx="118" cy="138" r="28" fill="#E9EAFA" />
      <circle cx="282" cy="138" r="28" fill="#E9EAFA" />
      {/* tête */}
      <circle cx="200" cy="212" r="112" fill="#D7D8F6" />
      {/* joues */}
      <circle cx="138" cy="244" r="18" fill="#ABACF2" opacity="0.55" />
      <circle cx="262" cy="244" r="18" fill="#ABACF2" opacity="0.55" />
      {/* yeux */}
      <circle cx="164" cy="198" r="13" fill="#16161D" />
      <circle cx="236" cy="198" r="13" fill="#16161D" />
      {/* nez */}
      <ellipse cx="200" cy="244" rx="34" ry="26" fill="#6466CF" />
      {/* sourire */}
      <path
        d="M170 286 Q200 306 230 286"
        stroke="#6466CF"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <DevCaption label={label} x={200} y={364} />
    </svg>
  );
}

/** Décor « blob » organique doux. */
export function BlobPlaceholder({
  label,
  className,
  width,
  height,
}: PlaceholderProps) {
  return (
    <svg
      viewBox="0 0 600 600"
      width={width}
      height={height}
      className={className}
      role="presentation"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#E9EAFA"
        d="M300 70c70 0 150 30 180 100s10 170-40 230-150 90-230 60-150-110-140-200S150 110 220 84c26-9 53-14 80-14z"
      />
      <path
        fill="#D7D8F6"
        opacity="0.7"
        d="M310 150c50 0 110 22 130 74s4 122-32 164-110 64-166 42-106-80-98-144 56-118 110-130c18-4 37-6 56-6z"
      />
      <DevCaption label={label} x={300} y={320} size={26} />
    </svg>
  );
}

/** Séparateur de section ondulé doux. */
export function WaveDividerPlaceholder({
  label,
  className,
  width,
  height,
}: PlaceholderProps) {
  return (
    <svg
      viewBox="0 0 1440 120"
      width={width}
      height={height}
      className={className}
      role="presentation"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#E9EAFA"
        d="M0 60 C 240 110 480 110 720 60 S 1200 10 1440 60 L1440 120 L0 120 Z"
      />
      <DevCaption label={label} x={720} y={40} size={20} />
    </svg>
  );
}
