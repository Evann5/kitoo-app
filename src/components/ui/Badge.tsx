import { cn } from "@/lib/cn";

/** Tons sémantiques d'un badge. */
export type BadgeTone = "brand" | "neutral" | "success" | "warning" | "danger";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  /** @default "brand" */
  tone?: BadgeTone;
};

const tones: Record<BadgeTone, string> = {
  brand: "bg-brand-100 text-brand-700",
  neutral: "bg-ink-100 text-ink-700",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
};

/**
 * Badge : petite pastille arrondie (pill 999px) pour un statut ou un compteur.
 * Casse phrase, fond teinté doux accordé au ton.
 */
export function Badge({ tone = "brand", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "rounded-pill text-small inline-flex items-center px-2.5 py-0.5 font-bold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export default Badge;
