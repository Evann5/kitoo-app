import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui";
import { Footer } from "./Footer";

export type LegalShellProps = {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
};

/**
 * Gabarit des pages légales : largeur de prose, hiérarchie de titres claire,
 * lien de retour, pied de page. Contenu de base (projet étudiant).
 */
export function LegalShell({ title, updatedAt, children }: LegalShellProps) {
  return (
    <Container
      width="prose"
      className="pt-[calc(env(safe-area-inset-top)+2.5rem)] pb-10"
    >
      <Link
        href="/"
        className="text-small text-brand-700 mb-6 inline-flex w-fit items-center gap-1 font-bold"
      >
        <ArrowLeft aria-hidden size={16} strokeWidth={1.8} />
        Retour à l&apos;accueil
      </Link>
      <article className="flex flex-col gap-4">
        <h1 className="font-display text-display text-ink-900">{title}</h1>
        <p className="text-small text-ink-600">
          Dernière mise à jour : {updatedAt}
        </p>
        <div className="text-body text-ink-800 [&_h2]:font-display [&_h2]:text-title [&_h2]:text-ink-900 [&_a]:text-brand-700 flex flex-col gap-4 leading-relaxed [&_a]:font-bold [&_a]:underline [&_h2]:mt-4 [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </article>
      <Footer />
    </Container>
  );
}

export default LegalShell;
