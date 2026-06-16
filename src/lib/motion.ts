import type { Transition, Variants } from "framer-motion";

/**
 * Presets de mouvement centralisés : alignés sur les tokens du design system
 * Kitoo : entrées douces et rassurantes (ease-out, fondus + légères montées),
 * jamais de rebond ni d'overshoot élastique.
 *
 * Toute animation du site doit réutiliser ces presets pour rester cohérente.
 * Les composants `Reveal` et `Stagger` s'appuient dessus.
 *
 * @example
 * import { motion } from "framer-motion";
 * import { variants, transitions } from "@/lib/motion";
 * <motion.div variants={variants.fadeInUp} initial="hidden" animate="show" />;
 */

/** Courbe d'accélération de marque (ease-out doux). */
export const ease = [0.22, 0.61, 0.36, 1] as const;

/** Transitions réutilisables (durées 120–320 ms du DS). */
export const transitions = {
  /** ~240 ms : transition par défaut, douce. */
  soft: { duration: 0.24, ease } satisfies Transition,
  /** ~160 ms : micro-interactions plus vives. */
  quick: { duration: 0.16, ease } satisfies Transition,
} as const;

/** Décalage vertical d'entrée (px) pour les fondus + montée. */
const RISE = 12;

/** Variants d'animation réutilisables. */
export const variants = {
  /** Fondu + légère montée : le preset le plus courant. */
  fadeInUp: {
    hidden: { opacity: 0, y: RISE },
    show: { opacity: 1, y: 0, transition: transitions.soft },
  },
  /** Simple fondu, sans déplacement. */
  fadeIn: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: transitions.soft },
  },
  /** Apparition par léger zoom (jamais agressif). */
  scaleIn: {
    hidden: { opacity: 0, scale: 0.96 },
    show: { opacity: 1, scale: 1, transition: transitions.soft },
  },
  /** Conteneur : orchestre l'apparition décalée de ses enfants. */
  staggerContainer: {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08, delayChildren: 0.04 },
    },
  },
} satisfies Record<string, Variants>;

/** Noms de variants d'entrée utilisables par `Reveal`. */
export type RevealVariant = "fadeInUp" | "fadeIn" | "scaleIn";

/**
 * Variants neutralisés : état final immédiat, aucun déplacement ni fondu.
 * Utilisés lorsque `prefers-reduced-motion: reduce` est actif.
 */
export const neutralVariants: Variants = {
  hidden: { opacity: 1, y: 0, scale: 1 },
  show: { opacity: 1, y: 0, scale: 1 },
};

/**
 * Renvoie les variants à appliquer selon la préférence de mouvement.
 * Si `reduce` est vrai, les éléments apparaissent directement (accessibilité).
 */
export function resolveVariants(
  name: RevealVariant,
  reduce: boolean,
): Variants {
  return reduce ? neutralVariants : variants[name];
}
