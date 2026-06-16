"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  neutralVariants,
  type RevealVariant,
  resolveVariants,
  variants,
} from "@/lib/motion";

export type StaggerProps = {
  children: React.ReactNode;
  className?: string;
  /** Élément conteneur rendu. @default "div" */
  as?: "div" | "ul" | "ol";
  /** Marge d'intersection. @default "-80px" */
  margin?: string;
};

const CONTAINER_TAGS = {
  div: motion.div,
  ul: motion.ul,
  ol: motion.ol,
} as const;

const ITEM_TAGS = {
  div: motion.div,
  li: motion.li,
} as const;

/**
 * Conteneur qui orchestre l'apparition **décalée** de ses enfants à l'entrée
 * dans le viewport. Chaque enfant doit être un `<Stagger.Item>` pour hériter de
 * la cascade. Désactivé (apparition immédiate) sous `prefers-reduced-motion`.
 *
 * @example
 * <Stagger as="ul" className="grid gap-6">
 *   {items.map((it) => (
 *     <Stagger.Item as="li" key={it.id}>{it.label}</Stagger.Item>
 *   ))}
 * </Stagger>
 */
export function Stagger({
  children,
  className,
  as = "div",
  margin = "-80px",
}: StaggerProps) {
  const reduce = useReducedMotion();
  const Container = CONTAINER_TAGS[as];

  return (
    <Container
      className={className}
      variants={reduce ? neutralVariants : variants.staggerContainer}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: margin as never }}
    >
      {children}
    </Container>
  );
}

export type StaggerItemProps = {
  children: React.ReactNode;
  className?: string;
  /** @default "div" */
  as?: keyof typeof ITEM_TAGS;
  /** Preset d'entrée de l'élément. @default "fadeInUp" */
  variant?: RevealVariant;
};

/**
 * Élément d'une cascade `Stagger`. Hérite de l'orchestration du conteneur
 * (ne définit pas son propre `initial`/`whileInView`).
 */
function StaggerItem({
  children,
  className,
  as = "div",
  variant = "fadeInUp",
}: StaggerItemProps) {
  const reduce = useReducedMotion();
  const Item = ITEM_TAGS[as];

  return (
    <Item className={className} variants={resolveVariants(variant, reduce)}>
      {children}
    </Item>
  );
}

Stagger.Item = StaggerItem;

export { StaggerItem };
export default Stagger;
