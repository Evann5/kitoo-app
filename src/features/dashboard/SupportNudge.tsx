import Link from "next/link";
import { Card } from "@/components/ui";
import { Mascot } from "@/components/illustrations";

/**
 * Invitation **douce et soutenante** à parler à un professionnel, affichée
 * après plusieurs jours « très négatif » consécutifs (cf.
 * `shouldShowSupportNudge`). Ton chaleureux, jamais alarmant ni clinique, aucun
 * langage de diagnostic. Inclut le disclaimer médical et un accès direct aux
 * numéros d'aide d'urgence (`/urgence`).
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
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href="/urgence"
          className="rounded-control bg-brand-700 text-body shadow-btn hover:bg-brand-800 inline-flex h-11 items-center justify-center px-5 font-bold text-white"
        >
          Voir les numéros d&apos;aide
        </Link>
        <Link
          href="/ressources"
          className="rounded-control border-ink-300 text-body text-ink-900 hover:bg-ink-100 inline-flex h-11 items-center justify-center border px-5 font-bold"
        >
          Trouver du soutien
        </Link>
      </div>
      <p className="text-small text-ink-600">
        Kitoo ne remplace pas un suivi médical professionnel.
      </p>
    </Card>
  );
}

export default SupportNudge;
