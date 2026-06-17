import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  getDailyInspiration,
  INSPIRATIONS,
  INSPIRATION_IMAGES,
} from "@/lib/daily-inspiration";
import { DailyInspiration } from "@/features/dashboard/DailyInspiration";

describe("getDailyInspiration", () => {
  it("est déterministe : même date → même phrase et image", () => {
    const a = getDailyInspiration(new Date(2026, 5, 17));
    const b = getDailyInspiration(new Date(2026, 5, 17));
    expect(a).toEqual(b);
    expect(INSPIRATIONS).toContain(a.phrase);
    expect(INSPIRATION_IMAGES).toContain(a.image);
  });

  it("varie d'un jour à l'autre", () => {
    const d1 = getDailyInspiration(new Date(2026, 5, 17));
    const d2 = getDailyInspiration(new Date(2026, 5, 18));
    expect(d1.phrase).not.toBe(d2.phrase);
  });

  it("propose ~30 phrases originales", () => {
    expect(INSPIRATIONS.length).toBeGreaterThanOrEqual(28);
    expect(new Set(INSPIRATIONS).size).toBe(INSPIRATIONS.length); // pas de doublon
  });
});

describe("DailyInspiration", () => {
  it("rend la phrase et un fond décoratif (aria-hidden) avec voile", () => {
    render(
      <DailyInspiration
        phrase="Respire : ce moment t'appartient."
        image="/inspiration/calm-1.svg"
      />,
    );
    expect(
      screen.getByText("Respire : ce moment t'appartient."),
    ).toBeInTheDocument();
    const bg = screen.getByTestId("inspiration-bg");
    expect(bg).toHaveAttribute("aria-hidden");
    // Le voile (gradient sombre) est présent pour le contraste.
    expect(bg.style.backgroundImage).toMatch(/rgba\(22,\s*22,\s*29/);
    expect(bg.style.backgroundImage).toContain("calm-1.svg");
  });
});
