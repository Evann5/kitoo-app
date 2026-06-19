import type { Metadata } from "next";
import { Phone, MessageSquare } from "lucide-react";
import { Container, Card } from "@/components/ui";
import { Mascot } from "@/components/illustrations";
import { Footer } from "@/components/layout/Footer";
import { EMERGENCY_CONTACTS } from "@/lib/emergency";

export const metadata: Metadata = { title: "Aide d'urgence - Kitoo" };

/**
 * Répertoire d'aide d'urgence : numéros officiels (appel/SMS en un geste).
 * Page claire, soutenante, utilisable en situation de stress. Accessible sans
 * authentification ; données statiques typées (`emergency.ts`).
 */
export default function UrgencePage() {
  return (
    <>
      <Container width="prose" className="flex flex-col gap-6 pt-8 pb-28">
        <header className="flex flex-col items-center gap-3 text-center">
          <Mascot pose="heart" className="w-20" decorative />
          <h1 className="font-display text-title text-ink-900">
            Tu n&apos;es pas seul·e
          </h1>
          <p className="text-body text-ink-700">
            Si ça ne va pas, des personnes sont là pour t&apos;écouter, tout de
            suite. Tu peux appeler en un geste.
          </p>
          <p
            role="note"
            className="rounded-control bg-brand-100 text-small text-ink-800 px-4 py-3 font-bold"
          >
            En cas de danger immédiat, appelle le 112 ou le 15.
          </p>
        </header>

        <ul className="flex flex-col gap-3">
          {EMERGENCY_CONTACTS.map((c) => {
            const href =
              c.kind === "sms" ? `sms:${c.number}` : `tel:${c.number}`;
            const Icon = c.kind === "sms" ? MessageSquare : Phone;
            const action =
              c.kind === "sms" ? "Envoyer un SMS au" : "Appeler le";
            return (
              <li key={c.number}>
                <Card
                  className={
                    c.highlight ? "border-brand-300 border" : undefined
                  }
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-heading text-ink-900">{c.name}</h2>
                      <p className="text-body text-ink-600">{c.description}</p>
                      <p className="text-small text-ink-500">
                        {c.availability}
                      </p>
                    </div>
                    <a
                      href={href}
                      aria-label={`${action} ${c.display} - ${c.name}`}
                      className="bg-brand-700 shadow-btn hover:bg-brand-800 rounded-control inline-flex h-12 items-center justify-center gap-2 px-5 font-bold text-white"
                    >
                      <Icon aria-hidden size={20} strokeWidth={2} />
                      {c.kind === "sms" ? "Envoyer un SMS" : "Appeler"}{" "}
                      {c.display}
                    </a>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>

        <p className="text-small text-ink-600 text-center">
          Kitoo ne remplace pas un suivi médical professionnel.
        </p>

        <Footer />
      </Container>
    </>
  );
}
