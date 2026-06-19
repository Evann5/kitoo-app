/**
 * Détection de **détresse / crise** et message de soutien associé. Logique PURE
 * et testable, sans appel externe. Réutilise et centralise les expressions de
 * détresse historiques (A21) et reste alignée avec l'orientation d'urgence
 * (A13 tests standardisés, A22 page `/urgence`).
 *
 * Règle d'or : la crise est **toujours prioritaire** sur toute autre intention.
 * On ne pose aucun diagnostic ; on oriente avec douceur vers des ressources
 * humaines disponibles immédiatement.
 *
 * ⚠️ Ressources (France) à vérifier / maintenir à jour (voir aussi
 * `src/lib/emergency.ts` et la page `/urgence`) :
 * - 3114 : ligne nationale de prévention du suicide (gratuit, 24h/24, 7j/7).
 * - 15 (SAMU) / 112 (urgences) en cas de danger immédiat.
 */

/** Normalise un texte : minuscules, sans accents (pour comparer les mots-clés). */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/** Expressions de détresse (prioritaires), écrites sans accents. */
export const DISTRESS_PATTERNS = [
  "suicide",
  "suicidaire",
  "me tuer",
  "me suicider",
  "en finir",
  "envie de mourir",
  "envie de disparaitre",
  "plus envie de vivre",
  "me faire du mal",
  "me blesser",
  "automutil",
  "je veux mourir",
  "mettre fin a mes jours",
  "plus la force de vivre",
  "tout arreter",
  "en danger",
] as const;

/**
 * Message de soutien affiché en cas de détresse. Contenu **original** (voix
 * Kitoo), non clinique, avec ressources humaines immédiates.
 */
export const CRISIS_REPLY =
  "Je lis beaucoup de souffrance dans tes mots, et je veux que tu saches que tu comptes. " +
  "Je ne suis pas un service d'urgence, mais des personnes formées peuvent t'écouter tout de suite : " +
  "le 3114, la ligne nationale de prévention du suicide (gratuit, 24h/24). " +
  "En cas de danger immédiat, appelle le 15 ou le 112. En parler maintenant, c'est déjà un geste courageux, et tu n'as pas à rester seul·e avec ça.";

/** Vrai si le message évoque une détresse (idées noires, se faire du mal…). */
export function isCrisis(message: string): boolean {
  const n = normalize(message);
  return DISTRESS_PATTERNS.some((kw) => n.includes(kw));
}
