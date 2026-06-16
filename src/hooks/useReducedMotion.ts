"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

/** Snapshot serveur : pas d'animation supposée réduite côté SSR. */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Indique si l'utilisateur a demandé une réduction des animations
 * (`prefers-reduced-motion: reduce`). SSR-safe et réactif aux changements de
 * préférence, sans `setState` dans un effet.
 *
 * Les composants de motion (`Reveal`, `Stagger`) s'en servent pour rendre
 * directement l'état final, sans animation.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default useReducedMotion;
