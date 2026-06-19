/**
 * Répertoire des numéros d'**aide d'urgence** (France) - données **statiques
 * typées**, consultables sans réseau. Appel/SMS en un geste via `tel:`/`sms:`.
 *
 * ⚠️ À VÉRIFIER / MAINTENIR À JOUR : ce sont des numéros officiels français.
 * Avant toute mise en ligne, revérifier validité, disponibilité et libellés.
 * Ne jamais inventer de numéro.
 */

export type EmergencyKind = "tel" | "sms";

export type EmergencyContact = {
  /** Nom du service. */
  name: string;
  /** Numéro composé (chiffres uniquement pour `tel:`/`sms:`). */
  number: string;
  /** Numéro affiché (mise en forme lisible). */
  display: string;
  /** Appel (`tel:`) ou message (`sms:`). */
  kind: EmergencyKind;
  /** À quoi sert ce numéro, en une phrase claire. */
  description: string;
  /** Disponibilité (ex. « 24h/24, 7j/7 »). */
  availability: string;
  /** Mis en avant (urgence vitale / prévention). */
  highlight?: boolean;
};

/** Numéros officiels FR (vérifiés au 2026-06 - à recontrôler régulièrement). */
export const EMERGENCY_CONTACTS: readonly EmergencyContact[] = [
  {
    name: "Urgences (numéro européen)",
    number: "112",
    display: "112",
    kind: "tel",
    description: "Toutes urgences, partout en Europe.",
    availability: "24h/24, 7j/7",
    highlight: true,
  },
  {
    name: "SAMU",
    number: "15",
    display: "15",
    kind: "tel",
    description: "Urgence médicale.",
    availability: "24h/24, 7j/7",
    highlight: true,
  },
  {
    name: "3114 - Prévention du suicide",
    number: "3114",
    display: "3114",
    kind: "tel",
    description:
      "Numéro national de prévention du suicide : une écoute professionnelle, gratuite et confidentielle.",
    availability: "24h/24, 7j/7 - gratuit",
    highlight: true,
  },
  {
    name: "Pompiers",
    number: "18",
    display: "18",
    kind: "tel",
    description: "Secours, incendie, accident.",
    availability: "24h/24, 7j/7",
  },
  {
    name: "Police / Gendarmerie",
    number: "17",
    display: "17",
    kind: "tel",
    description: "Police secours.",
    availability: "24h/24, 7j/7",
  },
  {
    name: "Urgences par SMS (114)",
    number: "114",
    display: "114",
    kind: "sms",
    description:
      "Pour les personnes sourdes ou malentendantes, ou si tu ne peux pas parler : contacte les urgences par SMS.",
    availability: "24h/24, 7j/7",
  },
  {
    name: "Fil Santé Jeunes",
    number: "0800235236",
    display: "0 800 235 236",
    kind: "tel",
    description:
      "Écoute, information et orientation pour les jeunes (santé, mal-être). Anonyme et gratuit.",
    availability: "tous les jours, 9h-23h - gratuit",
  },
];
