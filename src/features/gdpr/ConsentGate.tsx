"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { Mascot } from "@/components/illustrations";
import { grantConsent } from "./actions";

/**
 * Écran de consentement explicite (RGPD) affiché tant que l'utilisateur n'a pas
 * accepté le traitement de ses données de santé. Bloque l'accès à l'app.
 */
export function ConsentGate() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function accept() {
    setError(null);
    startTransition(async () => {
      const result = await grantConsent();
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }

  return (
    <Card className="flex flex-col items-center gap-4 text-center">
      <Mascot pose="heart" className="w-24" />
      <h2 className="font-display text-title text-ink-900">
        Avant de commencer
      </h2>
      <p className="text-body text-ink-700">
        Kitoo enregistre tes humeurs, qui sont des{" "}
        <strong>données de santé sensibles</strong>. Pour continuer, on a besoin
        de ton accord explicite pour les traiter, uniquement afin de te proposer
        ton suivi et des ressources adaptées.
      </p>
      <p className="text-small text-ink-600">
        Tu peux retirer ton consentement à tout moment depuis ton profil.
        Détails dans la{" "}
        <Link
          href="/confidentialite"
          className="text-brand-700 font-bold underline underline-offset-4"
        >
          politique de confidentialité
        </Link>
        .
      </p>

      {error ? (
        <p role="alert" className="text-small text-danger">
          {error}
        </p>
      ) : null}

      <Button onClick={accept} loading={pending} size="lg" fullWidth>
        J&apos;accepte et je continue
      </Button>
      <p className="text-small text-ink-500">
        Kitoo ne remplace pas un suivi médical professionnel.
      </p>
    </Card>
  );
}

export default ConsentGate;
