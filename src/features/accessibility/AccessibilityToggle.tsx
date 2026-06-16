"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import {
  applyPrefsToDocument,
  A11Y_STORAGE_KEY,
  type AccessibilityPrefs,
} from "./prefs";
import { saveAccessibilityPrefs } from "./actions";

function Switch({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex flex-col">
        <span className="text-body text-ink-900 font-bold">{label}</span>
        <span className="text-small text-ink-600">{description}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "rounded-pill duration-kitoo ease-kitoo relative h-7 w-12 shrink-0 transition-colors",
          checked ? "bg-brand-700" : "bg-ink-300",
        )}
      >
        <span
          className={cn(
            "rounded-pill duration-kitoo ease-kitoo absolute top-0.5 h-6 w-6 bg-white shadow-sm transition-[left]",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

/**
 * Réglages d'accessibilité (mode dyslexie + daltonisme). À chaque changement :
 * application immédiate au document, persistance `localStorage` (repli) et
 * enregistrement dans le profil (synchronisation inter-appareils).
 */
export function AccessibilityToggle({
  initial,
}: {
  initial: AccessibilityPrefs;
}) {
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(initial);
  const [pending, startTransition] = useTransition();

  function update(next: AccessibilityPrefs) {
    setPrefs(next);
    applyPrefsToDocument(next);
    try {
      localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    startTransition(() => {
      void saveAccessibilityPrefs(next);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <Switch
        label="Mode dyslexie"
        description="Police plus lisible (Atkinson Hyperlegible)."
        checked={prefs.dyslexia}
        disabled={pending}
        onChange={(v) => update({ ...prefs, dyslexia: v })}
      />
      <Switch
        label="Mode daltonisme"
        description="Palette d'humeur adaptée (distinguable sans la couleur)."
        checked={prefs.colorblind}
        disabled={pending}
        onChange={(v) => update({ ...prefs, colorblind: v })}
      />
    </div>
  );
}

export default AccessibilityToggle;
