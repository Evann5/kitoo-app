"use client";

import { useEffect } from "react";
import {
  applyPrefsToDocument,
  A11Y_STORAGE_KEY,
  type AccessibilityPrefs,
} from "./prefs";

/**
 * Applique les préférences d'accessibilité (issues du profil = source de vérité
 * inter-appareils) au document et les recopie en `localStorage` (repli +
 * anti-flash). Aucun rendu.
 */
export function AccessibilitySync({ prefs }: { prefs: AccessibilityPrefs }) {
  useEffect(() => {
    applyPrefsToDocument(prefs);
    try {
      localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // localStorage indisponible (mode privé) : on ignore.
    }
  }, [prefs]);
  return null;
}

export default AccessibilitySync;
