import { Card } from "@/components/ui";
import { Mascot } from "@/components/illustrations";
import type { MascotPose } from "@/lib/illustrations";

export type CompanionCardProps = {
  pose: MascotPose;
  /** Message de la bulle (ton chaleureux, encourageant). */
  message: string;
};

/**
 * Carte « compagnon » : le koala Kitoo avec une bulle de message. La pose
 * reflète l'humeur du jour (ou `classic` par défaut).
 */
export function CompanionCard({ pose, message }: CompanionCardProps) {
  return (
    <Card className="flex items-center gap-4">
      <Mascot pose={pose} priority className="w-24 shrink-0 max-[360px]:w-20" />
      <div className="relative flex-1">
        {/* Bulle de dialogue. */}
        <div className="rounded-card bg-brand-100 text-body text-ink-800 relative px-4 py-3">
          {message}
          {/* Pointe de la bulle vers la mascotte. */}
          <span
            aria-hidden
            className="bg-brand-100 absolute top-1/2 -left-1.5 h-3 w-3 -translate-y-1/2 rotate-45"
          />
        </div>
      </div>
    </Card>
  );
}

export default CompanionCard;
