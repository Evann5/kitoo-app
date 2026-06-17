import Link from "next/link";
import { Card, Container } from "@/components/ui";
import { Mascot } from "@/components/illustrations";
import type { MascotPose } from "@/lib/illustrations";

export type AuthShellProps = {
  title: string;
  subtitle: string;
  /** Pose de la mascotte d'accueil. @default "classic" */
  pose?: MascotPose;
  children: React.ReactNode;
  /** Lien vers l'autre écran d'auth (connexion ⇄ inscription). */
  footer: { prompt: string; linkLabel: string; href: string };
};

/**
 * Gabarit commun aux écrans d'auth : doux et rassurant (mascotte d'accueil,
 * carte centrée, ton tutoyé). Disclaimer médical discret en pied.
 */
export function AuthShell({
  title,
  subtitle,
  pose = "classic",
  children,
  footer,
}: AuthShellProps) {
  return (
    <Container
      width="prose"
      className="flex min-h-[100dvh] flex-col items-center justify-center py-12"
    >
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Mascot pose={pose} priority className="mb-4 w-28" />
          <h1 className="font-display text-title text-ink-900">{title}</h1>
          <p className="text-body text-ink-600 mt-1">{subtitle}</p>
        </div>

        <Card className="shadow-md">{children}</Card>

        <p className="text-body text-ink-600 mt-6 text-center">
          {footer.prompt}{" "}
          <Link
            href={footer.href}
            className="text-brand-700 rounded font-bold underline underline-offset-4"
          >
            {footer.linkLabel}
          </Link>
        </p>

        <p className="text-small text-ink-600 mt-8 text-center">
          Kitoo ne remplace pas un suivi médical professionnel.
        </p>
      </div>
    </Container>
  );
}

export default AuthShell;
