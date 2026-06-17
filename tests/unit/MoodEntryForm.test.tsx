import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), replace: vi.fn(), push: vi.fn() }),
}));
vi.mock("@/features/mood/actions", () => ({
  saveMood: vi.fn(async () => ({ ok: true })),
}));

import { MoodEntryForm } from "@/features/mood/MoodEntryForm";

const TODAY = "2026-06-17";
const DIGITS = /\d/;

describe("MoodEntryForm — molette", () => {
  it("réagit à la molette : pose + libellé changent, sans afficher de nombre", () => {
    const { container } = render(
      <MoodEntryForm tags={[]} initial={null} today={TODAY} />,
    );

    const mascotSrc = () =>
      container.querySelector("img")?.getAttribute("src") ?? "";

    // Au départ : invite + pose neutre.
    expect(screen.getByText("Règle ton humeur")).toBeInTheDocument();
    expect(mascotSrc()).toContain("kitoo-classic");

    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "End" }); // → Très positif
    expect(slider).toHaveAttribute("aria-valuetext", "Très bien");
    expect(mascotSrc()).toContain("kitoo-sunglasses");

    fireEvent.keyDown(slider, { key: "Home" }); // → Très négatif
    expect(mascotSrc()).toContain("kitoo-crying");

    // Le score 0–100 n'est jamais exposé : ni dans aria-valuetext, ni dans le
    // libellé d'humeur affiché au centre (le bandeau de dates, lui, a des
    // numéros de jour — c'est attendu).
    expect(slider.getAttribute("aria-valuetext")).not.toMatch(DIGITS);
    expect(screen.getByText("Difficile").textContent).not.toMatch(DIGITS);
  });

  it("neutralise la transition sous prefers-reduced-motion", () => {
    const { container } = render(
      <MoodEntryForm tags={[]} initial={null} today={TODAY} />,
    );
    expect(
      container.querySelector('[class*="motion-reduce:transition-none"]'),
    ).not.toBeNull();
  });

  it("précharge l'entrée existante (score → libellé) en mode édition", () => {
    render(
      <MoodEntryForm
        tags={[]}
        initial={{ score: 73, comment: "ça va", tagIds: [] }}
        today={TODAY}
      />,
    );
    // score 73 → niveau 4 → « Bien ».
    expect(screen.getByRole("slider")).toHaveAttribute(
      "aria-valuetext",
      "Bien",
    );
    expect(screen.getByDisplayValue("ça va")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mettre à jour mon humeur" }),
    ).toBeInTheDocument();
  });
});
