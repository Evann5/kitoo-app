import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), replace: vi.fn(), push: vi.fn() }),
}));
vi.mock("@/features/mood/actions", () => ({
  saveMood: vi.fn(async () => ({ ok: true })),
}));

import { MoodEntryForm } from "@/features/mood/MoodEntryForm";

describe("MoodEntryForm — molette", () => {
  it("réagit à la molette : pose + libellé changent, sans afficher de nombre", async () => {
    const user = userEvent.setup();
    const { container } = render(<MoodEntryForm tags={[]} initial={null} />);

    const mascotSrc = () =>
      container.querySelector("img")?.getAttribute("src") ?? "";

    // Au départ : invite + pose neutre.
    expect(screen.getByText("Règle ton humeur")).toBeInTheDocument();
    expect(mascotSrc()).toContain("kitoo-classic");

    const slider = screen.getByRole("slider");
    await user.tab();
    await user.keyboard("{End}"); // → Très positif
    expect(slider).toHaveAttribute("aria-valuetext", "Très bien");
    expect(mascotSrc()).toContain("kitoo-sunglasses");

    await user.keyboard("{Home}"); // → Très négatif
    expect(mascotSrc()).toContain("kitoo-crying");

    // Aucun chiffre de score dans le texte visible du formulaire.
    expect(container.textContent ?? "").not.toMatch(/\b\d{1,3}\b/);
  });

  it("neutralise la transition sous prefers-reduced-motion", () => {
    const { container } = render(<MoodEntryForm tags={[]} initial={null} />);
    expect(
      container.querySelector('[class*="motion-reduce:transition-none"]'),
    ).not.toBeNull();
  });

  it("précharge l'entrée existante (score → libellé) en mode édition", () => {
    render(
      <MoodEntryForm
        tags={[]}
        initial={{ score: 73, comment: "ça va", tagIds: [] }}
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
