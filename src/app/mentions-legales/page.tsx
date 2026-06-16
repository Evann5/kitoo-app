import type { Metadata } from "next";
import { LegalShell } from "@/components/layout/LegalShell";

export const metadata: Metadata = { title: "Mentions légales — Kitoo" };

export default function MentionsLegalesPage() {
  return (
    <LegalShell title="Mentions légales" updatedAt="17 juin 2026">
      <h2>Éditeur</h2>
      <p>
        Kitoo est un <strong>projet étudiant</strong> à but non commercial,
        réalisé par Evan Elbaz. Contact :{" "}
        <a href="mailto:evanelbaz.2005@gmail.com">evanelbaz.2005@gmail.com</a>.
      </p>

      <h2>Hébergement</h2>
      <ul>
        <li>Application : Vercel Inc. (déploiement et diffusion).</li>
        <li>
          Base de données et authentification : Supabase, région européenne.
        </li>
      </ul>

      <h2>Propriété intellectuelle</h2>
      <p>
        La mascotte, les illustrations et le nom « Kitoo » sont utilisés dans le
        cadre de ce projet étudiant. Les contenus bien-être sont fournis à titre
        informatif.
      </p>

      <p>Kitoo ne remplace pas un suivi médical professionnel.</p>
    </LegalShell>
  );
}
