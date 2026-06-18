import { Card } from "@/components/ui";
import { Mascot } from "@/components/illustrations";

/**
 * Message de soutien affiché en priorité lorsque l'item sensible du PHQ-9
 * (idées noires) est positif. Ton chaleureux, **jamais alarmant ni
 * culpabilisant**, sans diagnostic. Propose des ressources d'aide à jour.
 *
 * ⚠️ Ressources d'aide (France) - à vérifier/maintenir à jour :
 * - 3114 : Ligne nationale de prévention du suicide (gratuit, 24h/24, 7j/7).
 * - 15 (SAMU) / 112 (urgences) en cas de danger immédiat.
 */
export function SupportMessage() {
  return (
    <Card
      soft
      role="region"
      aria-label="Message de soutien"
      className="flex flex-col items-center gap-3 text-center"
    >
      <Mascot pose="heart" className="w-24" />
      <p className="text-body text-ink-900 font-bold">
        Merci d&apos;avoir répondu avec honnêteté.
      </p>
      <p className="text-body text-ink-700">
        Certaines de tes réponses montrent que c&apos;est une période difficile.
        Tu n&apos;es pas seul·e, et en parler peut vraiment aider - à un·e
        proche, à ton médecin, ou à une ligne d&apos;écoute dédiée.
      </p>
      <div className="flex w-full flex-col gap-2">
        <a
          href="tel:3114"
          className="rounded-control bg-brand-700 text-body shadow-btn hover:bg-brand-800 inline-flex h-12 items-center justify-center px-5 font-bold text-white"
        >
          Appeler le 3114 (24h/24, gratuit)
        </a>
        <p className="text-small text-ink-600">
          3114 - Ligne nationale de prévention du suicide. En cas de danger
          immédiat, appelle le 15 ou le 112.
        </p>
      </div>
      <p className="text-small text-ink-600">
        Kitoo ne remplace pas un suivi médical professionnel.
      </p>
    </Card>
  );
}

export default SupportMessage;
