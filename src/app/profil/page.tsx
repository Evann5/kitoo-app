import type { Metadata } from "next";
import { Button, Card } from "@/components/ui";
import { Mascot } from "@/components/illustrations";
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";
import { signOut } from "@/features/auth";

export const metadata: Metadata = {
  title: "Mon profil — Kitoo",
};

export default async function ProfilPage() {
  // Seconde barrière après le middleware : redirige si non connecté.
  const user = await requireUser("/profil");

  return (
    <AppShell>
      <div className="mb-8 flex flex-col items-center text-center">
        <Mascot pose="sunglasses" className="mb-4 w-28" />
        <h1 className="font-display text-title text-ink-900">Mon profil</h1>
        <p className="text-body text-ink-600 mt-1">Content de te voir ici.</p>
      </div>

      <Card className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-small text-ink-500 font-bold">
            Adresse email
          </span>
          <span className="text-body text-ink-900">{user.email}</span>
        </div>

        <Button as="a" href="/humeur" fullWidth>
          Noter mon humeur
        </Button>

        <form action={signOut}>
          <Button type="submit" variant="outline" fullWidth>
            Me déconnecter
          </Button>
        </form>
      </Card>

      <p className="text-small text-ink-500 mt-8 text-center">
        Kitoo ne remplace pas un suivi médical professionnel.
      </p>
    </AppShell>
  );
}
