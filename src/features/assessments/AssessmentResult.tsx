import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { SupportMessage } from "./SupportMessage";
import { SCALES, type ScaleKey, type ScaleResult } from "./scales";

export type AssessmentResultProps = {
  scaleKey: ScaleKey;
  result: ScaleResult;
};

/**
 * Écran de résultat **orienté** (jamais un diagnostic). Si l'item sensible est
 * signalé (`flagged`), le message de soutien s'affiche en priorité. Disclaimer
 * présent dans tous les cas.
 */
export function AssessmentResult({ scaleKey, result }: AssessmentResultProps) {
  const def = SCALES[scaleKey];
  return (
    <div className="flex flex-col gap-5">
      {result.flagged ? <SupportMessage /> : null}

      <Card className="flex flex-col items-center gap-2 text-center">
        <span className="text-small text-ink-600 font-bold">
          {def.shortTitle}
        </span>
        <span className="font-display text-display text-ink-900">
          {result.score}
          <span className="text-title text-ink-500">/{def.maxScore}</span>
        </span>
        <span className="rounded-pill bg-brand-100 text-small text-brand-700 px-3 py-1 font-bold">
          {result.severity.label}
        </span>
      </Card>

      <Card soft className="flex flex-col gap-2">
        <p className="text-body text-ink-800">
          {def.positive
            ? "Ces réponses donnent un aperçu de ton bien-être du moment."
            : "Ces réponses donnent une orientation, pas un diagnostic."}{" "}
          Si tu en ressens le besoin, en parler à un·e professionnel·le de santé
          peut t&apos;aider à y voir plus clair.
        </p>
        <p className="text-small text-ink-600">
          Kitoo ne remplace pas un suivi médical professionnel.
        </p>
      </Card>

      <section
        aria-labelledby="suggestions-title"
        className="flex flex-col gap-2"
      >
        <h2 id="suggestions-title" className="text-heading text-ink-900">
          Pour prendre soin de toi
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button as="a" href="/exercices" variant="outline" fullWidth>
            Faire un exercice
          </Button>
          <Button as="a" href="/ressources" variant="outline" fullWidth>
            Lire une ressource
          </Button>
        </div>
      </section>

      <Link
        href="/tests"
        className="text-small text-brand-700 text-center font-bold"
      >
        Revenir aux tests
      </Link>
    </div>
  );
}

export default AssessmentResult;
