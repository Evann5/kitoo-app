"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { type RevealVariant, resolveVariants } from "@/lib/motion";

/** Éléments HTML supportés par `Reveal` (versions animées de Framer Motion). */
const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  li: motion.li,
  span: motion.span,
} as const;

export type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Preset d'entrée. @default "fadeInUp" */
  variant?: RevealVariant;
  /** Élément rendu. @default "div" */
  as?: keyof typeof MOTION_TAGS;
  /**
   * Marge d'intersection : déclenche l'animation un peu avant que l'élément
   * soit entièrement visible. @default "-80px"
   */
  margin?: string;
};

/**
 * Anime ses enfants à leur entrée dans le viewport (fondu + légère montée),
 * une seule fois. Si `prefers-reduced-motion: reduce` est actif, les enfants
 * sont rendus immédiatement à leur état final (aucun déplacement).
 *
 * Les enfants sont toujours présents dans le DOM (SSR-friendly), seul leur état
 * visuel d'entrée est animé.
 *
 * @example
 * <Reveal>
 *   <h2>Ton humeur cette semaine</h2>
 * </Reveal>
 */
export function Reveal({
  children,
  className,
  variant = "fadeInUp",
  as = "div",
  margin = "-80px",
}: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = MOTION_TAGS[as];

  return (
    <MotionTag
      className={className}
      variants={resolveVariants(variant, reduce)}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: margin as never }}
    >
      {children}
    </MotionTag>
  );
}

export default Reveal;
