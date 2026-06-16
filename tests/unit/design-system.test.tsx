import { describe, it, expect, vi } from "vitest";
import { render, renderHook, screen } from "@testing-library/react";
import { Button } from "@/components/ui/Button";
import { Mascot } from "@/components/illustrations/Mascot";
import { Illustration } from "@/components/illustrations/Illustration";
import { resolveVariants, neutralVariants } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import tailwindConfig from "../../tailwind.config";

describe("Button — styles Kitoo", () => {
  it("rend une action principale pervenche au rayon de contrôle (16px)", () => {
    render(<Button>Noter mon humeur</Button>);
    const btn = screen.getByRole("button", { name: "Noter mon humeur" });
    // Pervenche (brand-700) + rayon de contrôle (16px via rounded-control).
    expect(btn.className).toContain("bg-brand-700");
    expect(btn.className).toContain("rounded-control");
  });
});

describe("Illustration / Mascot — résolution + fallback", () => {
  it("résout une pose réelle de la mascotte (asset présent)", () => {
    render(<Mascot pose="classic" />);
    const img = screen.getByRole("img", { name: /koala Kitoo/i });
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("kitoo-classic");
  });

  it("retombe sur un placeholder quand l'asset est absent", () => {
    const { container } = render(<Illustration name="blob-soft" />);
    // blob-soft.svg n'est pas déposé → aucun <img>, un SVG placeholder à la place.
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });
});

describe("Accessibilité — tokens", () => {
  it("le corps de texte est défini à 16px (jamais sous le seuil WCAG)", () => {
    const body = tailwindConfig.theme?.extend?.fontSize?.body as [
      string,
      unknown,
    ];
    expect(body[0]).toBe("16px");
  });

  it("expose un anneau de focus pervenche", () => {
    const focus = tailwindConfig.theme?.extend?.boxShadow?.focus as string;
    expect(focus).toContain("rgba(155,157,240,0.40)");
  });
});

describe("prefers-reduced-motion", () => {
  it("neutralise les variants d'entrée (état final immédiat)", () => {
    expect(resolveVariants("fadeInUp", true)).toBe(neutralVariants);
    // L'état « hidden » neutralisé est déjà pleinement visible (aucun fondu).
    expect((neutralVariants.hidden as { opacity: number }).opacity).toBe(1);
  });

  it("useReducedMotion détecte la préférence réduite", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
      })),
    );
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
    vi.unstubAllGlobals();
  });
});
