import type { Json } from "@/lib/supabase/types";

/** Préférences d'accessibilité persistées (profil + localStorage). */
export type AccessibilityPrefs = {
  /** Police Atkinson Hyperlegible (mode dyslexie). */
  dyslexia: boolean;
  /** Palette daltonisme (échelle d'humeur Okabe-Ito). */
  colorblind: boolean;
};

export const DEFAULT_PREFS: AccessibilityPrefs = {
  dyslexia: false,
  colorblind: false,
};

/** Clé de stockage local (repli + anti-flash). */
export const A11Y_STORAGE_KEY = "kitoo-a11y";

/** Parse un `accessibility_prefs` (Json) en préférences sûres. */
export function parsePrefs(value: Json | null | undefined): AccessibilityPrefs {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return DEFAULT_PREFS;
  }
  const obj = value as Record<string, unknown>;
  return {
    dyslexia: obj.dyslexia === true,
    colorblind: obj.colorblind === true,
  };
}

/**
 * Applique les préférences au document : attributs lus par `globals.css`
 * (`[data-font="dyslexia"]`, `[data-contrast="colorblind"]`).
 * No-op côté serveur.
 */
export function applyPrefsToDocument(prefs: AccessibilityPrefs): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (prefs.dyslexia) root.dataset.font = "dyslexia";
  else delete root.dataset.font;
  if (prefs.colorblind) root.dataset.contrast = "colorblind";
  else delete root.dataset.contrast;
}

/**
 * Script anti-flash (string) injecté dans `<head>` : applique les préférences
 * depuis localStorage avant le premier rendu pour éviter un flash de style.
 */
export const ANTI_FLASH_SCRIPT = `
try {
  var p = JSON.parse(localStorage.getItem('${A11Y_STORAGE_KEY}') || '{}');
  var r = document.documentElement;
  if (p.dyslexia) r.dataset.font = 'dyslexia';
  if (p.colorblind) r.dataset.contrast = 'colorblind';
} catch (e) {}
`.trim();
