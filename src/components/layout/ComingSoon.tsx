import { Mascot } from "@/components/illustrations";
import type { MascotPose } from "@/lib/illustrations";

export type ComingSoonProps = {
  title: string;
  message: string;
  pose?: MascotPose;
};

/**
 * État « Bientôt » pour les écrans pas encore construits (placeholder propre,
 * ton chaleureux). Hiérarchie de titre correcte, mascotte apaisante.
 */
export function ComingSoon({
  title,
  message,
  pose = "sleeping",
}: ComingSoonProps) {
  return (
    <section className="flex flex-col items-center gap-4 py-10 text-center">
      <Mascot pose={pose} className="w-32" />
      <h1 className="font-display text-title text-ink-900">{title}</h1>
      <p className="text-body text-ink-600 max-w-prose">{message}</p>
      <span className="rounded-pill bg-brand-100 text-small text-brand-700 px-3 py-1 font-bold">
        Bientôt
      </span>
    </section>
  );
}

export default ComingSoon;
