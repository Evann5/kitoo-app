import type { Metadata } from "next";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { Mascot } from "@/components/illustrations";
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";
import { signOut } from "@/features/auth";
import {
  AccessibilityToggle,
  getAccessibilityPrefs,
} from "@/features/accessibility";
import {
  DeleteAccountDialog,
  getActiveConsent,
  grantConsent,
  revokeConsent,
} from "@/features/gdpr";

export const metadata: Metadata = { title: "Mon profil — Kitoo" };
export const dynamic = "force-dynamic";

const consentFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-title text-ink-900">{children}</h2>;
}

export default async function ProfilPage() {
  const user = await requireUser("/profil");
  const [prefs, consent] = await Promise.all([
    getAccessibilityPrefs(),
    getActiveConsent(),
  ]);

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col items-center text-center">
          <Mascot pose="sunglasses" className="mb-4 w-28" />
          <h1 className="font-display text-title text-ink-900">Mon profil</h1>
          <p className="text-body text-ink-600 mt-1">Content de te voir ici.</p>
        </header>

        {/* Compte */}
        <Card className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-small text-ink-600 font-bold">
              Adresse email
            </span>
            <span className="text-body text-ink-900">{user.email}</span>
          </div>
        </Card>

        {/* Accessibilité */}
        <section className="flex flex-col gap-3">
          <SectionTitle>Accessibilité</SectionTitle>
          <Card>
            <AccessibilityToggle initial={prefs} />
          </Card>
        </section>

        {/* Confidentialité (RGPD) */}
        <section className="flex flex-col gap-3">
          <SectionTitle>Confidentialité</SectionTitle>
          <Card className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-small text-ink-600 font-bold">
                Consentement au traitement des données de santé
              </span>
              {consent ? (
                <span className="text-body text-ink-900">
                  Accordé le {consentFmt.format(new Date(consent.granted_at))}.
                </span>
              ) : (
                <span className="text-body text-ink-900">
                  Non accordé pour le moment.
                </span>
              )}
            </div>
            {consent ? (
              <form
                action={async () => {
                  "use server";
                  await revokeConsent();
                }}
              >
                <Button type="submit" variant="outline" fullWidth>
                  Retirer mon consentement
                </Button>
              </form>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await grantConsent();
                }}
              >
                <Button type="submit" fullWidth>
                  Donner mon consentement
                </Button>
              </form>
            )}

            <div className="border-ink-200 flex flex-col gap-2 border-t pt-4">
              <span className="text-small text-ink-600 font-bold">
                Exporter mes données
              </span>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button as="a" href="/api/export" variant="outline" fullWidth>
                  Télécharger (JSON)
                </Button>
                <Button
                  as="a"
                  href="/api/export?format=csv"
                  variant="outline"
                  fullWidth
                >
                  Télécharger (CSV)
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Suppression de compte */}
        <section className="flex flex-col gap-3">
          <SectionTitle>Supprimer mon compte</SectionTitle>
          <Card>
            <DeleteAccountDialog />
          </Card>
        </section>

        {/* Liens légaux */}
        <nav
          aria-label="Liens légaux"
          className="flex flex-wrap justify-center gap-x-4 gap-y-1"
        >
          <Link
            href="/confidentialite"
            className="text-small text-ink-600 rounded font-bold underline underline-offset-4"
          >
            Confidentialité
          </Link>
          <Link
            href="/mentions-legales"
            className="text-small text-ink-600 rounded font-bold underline underline-offset-4"
          >
            Mentions légales
          </Link>
          <Link
            href="/cgu"
            className="text-small text-ink-600 rounded font-bold underline underline-offset-4"
          >
            CGU
          </Link>
        </nav>

        <form action={signOut}>
          <Button type="submit" variant="outline" fullWidth>
            Me déconnecter
          </Button>
        </form>

        <p className="text-small text-ink-600 text-center">
          Kitoo ne remplace pas un suivi médical professionnel.
        </p>
      </div>
    </AppShell>
  );
}
