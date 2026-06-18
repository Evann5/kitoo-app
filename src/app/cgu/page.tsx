import type { Metadata } from "next";
import { LegalShell } from "@/components/layout/LegalShell";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation - Kitoo",
};

export default function CguPage() {
  return (
    <LegalShell
      title="Conditions générales d'utilisation"
      updatedAt="17 juin 2026"
    >
      <p>
        En utilisant Kitoo, tu acceptes les présentes conditions. Kitoo est un{" "}
        <strong>projet étudiant</strong> proposé gratuitement, sans garantie de
        disponibilité.
      </p>

      <h2>Objet du service</h2>
      <p>
        Kitoo te permet de noter ton humeur, de visualiser des tendances et de
        consulter des ressources de bien-être à visée informative.
      </p>

      <h2>Ce que Kitoo n&apos;est pas</h2>
      <p>
        Kitoo <strong>ne fournit pas de diagnostic ni de soin</strong> et{" "}
        <strong>ne remplace pas un suivi médical professionnel</strong>. En cas
        de détresse ou d&apos;urgence, contacte un professionnel de santé ou les
        services d&apos;urgence.
      </p>

      <h2>Ton compte</h2>
      <ul>
        <li>Tu es responsable de la confidentialité de tes identifiants.</li>
        <li>
          Tu peux exporter tes données ou supprimer ton compte à tout moment
          depuis ton profil.
        </li>
      </ul>

      <h2>Responsabilité</h2>
      <p>
        Le service est fourni « en l&apos;état » dans un cadre pédagogique. La
        responsabilité de l&apos;éditeur ne saurait être engagée pour
        l&apos;usage qui est fait des contenus informatifs.
      </p>
    </LegalShell>
  );
}
