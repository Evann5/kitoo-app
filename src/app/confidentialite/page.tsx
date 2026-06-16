import type { Metadata } from "next";
import { LegalShell } from "@/components/layout/LegalShell";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Kitoo",
};

export default function ConfidentialitePage() {
  return (
    <LegalShell title="Politique de confidentialité" updatedAt="17 juin 2026">
      <p>
        Kitoo est une application de suivi du bien-être développée dans un cadre
        <strong> étudiant</strong>. Cette politique explique, en toute
        transparence, quelles données sont traitées et comment exercer tes
        droits.
      </p>

      <h2>Quelles données ?</h2>
      <ul>
        <li>
          <strong>Compte</strong> : adresse email (authentification) et prénom
          (facultatif).
        </li>
        <li>
          <strong>Humeurs</strong> : niveau quotidien, commentaire et tags. Ce
          sont des <strong>données de santé sensibles</strong>.
        </li>
        <li>
          <strong>Préférences</strong> : accessibilité (dyslexie, daltonisme).
        </li>
      </ul>

      <h2>Sur quelle base ?</h2>
      <p>
        Le traitement de tes humeurs repose sur ton{" "}
        <strong>consentement explicite</strong>, recueilli avant toute saisie et
        révocable à tout moment depuis ton profil.
      </p>

      <h2>Où et combien de temps ?</h2>
      <p>
        Les données sont hébergées par Supabase dans l&apos;Union européenne
        (région <span className="font-mono">eu-west-3</span>). Elles sont
        conservées tant que ton compte existe ; leur accès est cloisonné par
        utilisateur (Row-Level Security).
      </p>

      <h2>Tes droits</h2>
      <ul>
        <li>
          <strong>Accès et portabilité</strong> : exporte tes données (JSON/CSV)
          depuis ton profil.
        </li>
        <li>
          <strong>Effacement</strong> : supprime ton compte et toutes tes
          données depuis ton profil (action irréversible).
        </li>
        <li>
          <strong>Retrait du consentement</strong> : à tout moment, depuis ton
          profil.
        </li>
      </ul>

      <h2>Contact</h2>
      <p>
        Pour toute question, écris à{" "}
        <a href="mailto:evanelbaz.2005@gmail.com">evanelbaz.2005@gmail.com</a>.
      </p>

      <p>
        Kitoo ne remplace pas un suivi médical professionnel. En cas de
        détresse, parle à un professionnel de santé.
      </p>
    </LegalShell>
  );
}
