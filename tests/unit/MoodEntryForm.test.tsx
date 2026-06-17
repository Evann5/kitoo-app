import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), replace: vi.fn(), push: vi.fn() }),
}));
const saveMock = vi.fn(async () => ({ ok: true }) as const);
vi.mock("@/features/mood/actions", () => ({
  saveMood: (...a: unknown[]) => saveMock(...a),
}));

import { MoodEntryForm } from "@/features/mood/MoodEntryForm";

const DIGITS = /\d/;

beforeEach(() => saveMock.mockClear());

describe("MoodEntryForm — curseur de valence, 2 étapes", () => {
  it("réagit au curseur : libellé + koala changent, sans afficher de nombre", () => {
    const { container } = render(<MoodEntryForm tags={[]} initial={null} />);
    const mascotSrc = () =>
      container.querySelector("img")?.getAttribute("src") ?? "";

    expect(screen.getByText("Règle ton humeur")).toBeInTheDocument();
    expect(mascotSrc()).toContain("kitoo-classic");

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "100" } });
    expect(slider).toHaveAttribute("aria-valuetext", "Très bien");
    expect(mascotSrc()).toContain("kitoo-sunglasses");

    fireEvent.change(slider, { target: { value: "0" } });
    expect(mascotSrc()).toContain("kitoo-crying");
    expect(slider.getAttribute("aria-valuetext")).not.toMatch(DIGITS);
  });

  it("neutralise la transition sous prefers-reduced-motion", () => {
    const { container } = render(<MoodEntryForm tags={[]} initial={null} />);
    expect(
      container.querySelector('[class*="motion-reduce:transition-none"]'),
    ).not.toBeNull();
  });

  it("exige une valence avant de passer à l'étape 2", async () => {
    const user = userEvent.setup();
    render(<MoodEntryForm tags={[]} initial={null} />);
    await user.click(screen.getByRole("button", { name: "Suivant" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/déplace le curseur/i);
  });

  it("flux étape 1 → étape 2 → enregistrement (upsert score/tags/commentaire)", async () => {
    const user = userEvent.setup();
    render(<MoodEntryForm tags={[]} initial={null} />);

    fireEvent.change(screen.getByRole("slider"), { target: { value: "80" } });
    await user.click(screen.getByRole("button", { name: "Suivant" }));

    // Étape 2 : ressentis + enregistrement.
    const comment = screen.getByLabelText(/envie d'en dire plus/i);
    await user.type(comment, "bonne journée");
    await user.click(
      screen.getByRole("button", { name: "Enregistrer mon humeur" }),
    );

    expect(saveMock).toHaveBeenCalledWith({
      score: 80,
      comment: "bonne journée",
      tagIds: [],
    });
    expect(await screen.findByRole("status")).toHaveTextContent(/noté/i);
  });

  it("précharge l'entrée existante et propose la mise à jour", async () => {
    const user = userEvent.setup();
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
    await user.click(screen.getByRole("button", { name: "Suivant" }));
    expect(screen.getByDisplayValue("ça va")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mettre à jour mon humeur" }),
    ).toBeInTheDocument();
  });
});
