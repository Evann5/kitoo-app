import Link from "next/link";
import { Card } from "@/components/ui";
import { Mascot } from "@/components/illustrations";

/**
 * Invitation **douce et soutenante** à parler à un professionnel, affichée
 * après plusieurs jours « très négatif » consécutifs (cf.
 * `shouldShowSupportNudge`). Ton chaleureux, jamais alarmant ni clinique, aucun
 * langage de diagnostic. Inclut le disclaimer médical.
 *
 * Le chat n'existant pas dans ce MVP, le CTA pointe vers l'espace bien-être /
 * ressources d'aide.
 */
export function SupportNudge() {
  return (
    <Card
      soft
      role="region"
      aria-label="Message de soutien"
      className="flex flex-col items-center gap-3 text-center"
    >
      <Mascot pose="heart" className="w-24" />
      <p className="text-body text-ink-900 font-bold">
        Ces derniers jours semblent difficiles.
      </p>
      <p className="text-body text-ink-700">
        Tu n&apos;as pas à traverser ça seul·e. En parler à une personne de
        confiance ou à un professionnel peut vraiment aider, et c&apos;est un
        geste de courage.
      </p>
      <Link
        href="/bien-etre"
        className="rounded-control bg-brand-700 text-body shadow-btn hover:bg-brand-800 inline-flex h-11 items-center justify-center px-5 font-bold text-white"
      >
        Trouver du soutien
      </Link>
      <p className="text-small text-ink-500">
        Kitoo ne remplace pas un suivi médical professionnel.
      </p>
    </Card>
  );
}

export default SupportNudge;
