import { describe, it, expect } from "vitest";
import { cn } from "@/lib/cn";

describe("cn — fusion des classes", () => {
  it("conserve la couleur ET la taille de police custom (pas de conflit)", () => {
    // Régression : `text-body` (taille DS) ne doit PAS écraser `text-white`.
    const out = cn("bg-brand-700 text-white", "text-body");
    expect(out).toContain("text-white");
    expect(out).toContain("text-body");
  });

  it("résout bien les vrais conflits standards (dernier l'emporte)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("dédoublonne deux couleurs de texte (dernière gagne)", () => {
    expect(cn("text-ink-900", "text-white")).toBe("text-white");
  });
});
