/**
 * Inspiration du jour - **phrases originales** dans la voix de Kitoo (douces,
 * tutoyées, sans pression ni promesse de résultat médical) et un petit set de
 * **fonds dégradés générés** (œuvre propre, aucune licence tierce). La sélection
 * est **déterministe par date** : identique toute la journée, différente chaque
 * jour. Helper pur et testable.
 */

/** ~30 phrases originales (aucune citation d'auteur ni texte protégé). */
export const INSPIRATIONS: readonly string[] = [
  "Aujourd'hui, un petit pas compte autant qu'un grand.",
  "Tu as le droit d'avancer à ton rythme.",
  "Respire : ce moment t'appartient.",
  "Prendre soin de toi n'est pas un luxe, c'est essentiel.",
  "Tes émotions sont les bienvenues, toutes autant qu'elles sont.",
  "Sois aussi doux·ce avec toi qu'avec un ami.",
  "Un jour à la fois, c'est déjà beaucoup.",
  "Ce que tu ressens est valable, même sans mots pour le dire.",
  "Tu n'as rien à prouver aujourd'hui.",
  "Les jours gris font partie du paysage, ils passent aussi.",
  "Ta présence ici, c'est déjà prendre soin de toi.",
  "Il n'y a pas de mauvaise façon de se sentir.",
  "Accueille ce qui est, sans te juger.",
  "Un peu de repos n'est jamais du temps perdu.",
  "Tu fais de ton mieux, et c'est suffisant.",
  "Chaque respiration est une nouvelle chance de te poser.",
  "Avance avec curiosité, pas avec exigence.",
  "Tu mérites de la douceur, surtout les jours difficiles.",
  "Ralentir, c'est aussi prendre soin de soi.",
  "Tu n'es pas seul·e, même quand ça en a l'air.",
  "Les petites victoires méritent d'être célébrées.",
  "Écoute ce dont tu as besoin aujourd'hui.",
  "Ton chemin t'appartient, pas de comparaison.",
  "Se reposer, c'est aussi avancer.",
  "Tu as déjà traversé des jours difficiles, tu sais faire.",
  "Offre-toi un instant rien que pour toi.",
  "La bienveillance commence par celle que tu t'offres.",
  "Pas besoin d'être parfait·e pour aller bien.",
  "Chaque émotion a quelque chose à te dire, en douceur.",
  "Tu es exactement là où tu en es, et c'est ok.",
];

/** Fonds dégradés générés (décoratifs), stockés dans `public/inspiration/`. */
export const INSPIRATION_IMAGES: readonly string[] = [
  "/inspiration/calm-1.svg",
  "/inspiration/calm-2.svg",
  "/inspiration/calm-3.svg",
  "/inspiration/calm-4.svg",
];

export type DailyInspiration = { phrase: string; image: string };

/**
 * Sélection **déterministe par date** (année/mois/jour) : même phrase + même
 * fond toute la journée, qui changent le lendemain. Pur (aucune horloge interne).
 */
export function getDailyInspiration(date: Date): DailyInspiration {
  const key =
    date.getFullYear() * 372 + (date.getMonth() + 1) * 31 + date.getDate();
  return {
    phrase: INSPIRATIONS[key % INSPIRATIONS.length],
    image: INSPIRATION_IMAGES[key % INSPIRATION_IMAGES.length],
  };
}
