import { Button } from "@/components/ui";
import { moodCtaLabel } from "./stats";

export type PrimaryMoodCtaProps = {
  /** Une entrée existe-t-elle déjà aujourd'hui ? (Noter vs Modifier) */
  hasToday: boolean;
};

/**
 * CTA principal dominant vers la saisie d'humeur. Le libellé est **conditionnel**
 * (« Noter » si rien aujourd'hui, « Modifier » sinon) et le sous-titre rassure
 * (« pas de pression »).
 */
export function PrimaryMoodCta({ hasToday }: PrimaryMoodCtaProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <Button as="a" href="/humeur" size="lg" fullWidth>
        {moodCtaLabel(hasToday)}
      </Button>
      <p className="text-small text-ink-600">30 secondes · pas de pression</p>
    </div>
  );
}

export default PrimaryMoodCta;
