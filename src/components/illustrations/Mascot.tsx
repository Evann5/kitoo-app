import { cn } from "@/lib/cn";
import type { MascotPose } from "@/lib/illustrations";
import { Illustration } from "./Illustration";

export type MascotProps = {
  /** Pose de la mascotte (résolue en clé `kitoo-<pose>`). @default "classic" */
  pose?: MascotPose;
  className?: string;
  /** Chargement prioritaire (hero). @default false */
  priority?: boolean;
  /**
   * Animation idle de flottement doux. Désactivable explicitement ; de toute
   * façon neutralisée sous `prefers-reduced-motion`. @default true
   */
  animate?: boolean;
  /** Rendu décoratif (`aria-hidden`) : sinon `alt` issu du registre. */
  decorative?: boolean;
};

/**
 * Mascotte koala de Kitoo, mise en scène par `pose`. Flottement idle doux
 * (CSS `motion-safe:animate-float`) : neutralisé sous `prefers-reduced-motion`
 * (gating `motion-safe:` + bloc reduced-motion global). L'illustration réelle
 * remplace automatiquement le placeholder une fois déposée.
 *
 * @example
 * <Mascot pose="classic" priority className="w-64" />
 */
export function Mascot({
  pose = "classic",
  className,
  priority = false,
  animate = true,
  decorative = false,
}: MascotProps) {
  return (
    <div
      className={cn(
        "will-change-transform",
        animate && "motion-safe:animate-float",
        className,
      )}
    >
      <Illustration
        name={`kitoo-${pose}`}
        priority={priority}
        decorative={decorative}
      />
    </div>
  );
}

export default Mascot;
