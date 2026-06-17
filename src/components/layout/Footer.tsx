import Link from "next/link";

const LINKS = [
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgu", label: "CGU" },
];

/** Pied de page : liens légaux + disclaimer. */
export function Footer() {
  return (
    <footer className="border-ink-200 mt-8 border-t pt-6 text-center">
      <nav
        aria-label="Liens légaux"
        className="flex flex-wrap justify-center gap-x-4 gap-y-1"
      >
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-small text-ink-600 rounded font-bold underline underline-offset-4"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <p className="text-small text-ink-600 mt-3">
        Kitoo ne remplace pas un suivi médical professionnel.
      </p>
    </footer>
  );
}

export default Footer;
