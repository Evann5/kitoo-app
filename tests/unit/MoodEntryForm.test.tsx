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

const TODAY = "2026-06-17";
const DIGITS = /\d/;

beforeEach(() => saveMock.mockClear());

describe("MoodEntryForm - curseur de valence (écran unique)", () => {
  it("réagit au curseur : libellé + koala changent, sans afficher de nombre", () => {
    const { container } = render(
      <MoodEntryForm tags={[]} initial={null} today={TODAY} />,
    );
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
    const { container } = render(
      <MoodEntryForm tags={[]} initial={null} today={TODAY} />,
    );
    expect(
      container.querySelector('[class*="motion-reduce:transition-none"]'),
    ).not.toBeNull();
  });

  it("exige une valence avant d'enregistrer", async () => {
    const user = userEvent.setup();
    render(<MoodEntryForm tags={[]} initial={null} today={TODAY} />);
    await user.click(
      screen.getByRole("button", { name: "Enregistrer mon humeur" }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/déplace le curseur/i);
    expect(saveMock).not.toHaveBeenCalled();
  });

  it("détails facultatifs repliables : tags + commentaire → enregistrement", async () => {
    const user = userEvent.setup();
    render(<MoodEntryForm tags={[]} initial={null} today={TODAY} />);

    fireEvent.change(screen.getByRole("slider"), { target: { value: "80" } });

    // Section détails fermée par défaut, on l'ouvre.
    await user.click(
      screen.getByRole("button", { name: /ajouter des détails/i }),
    );
    await user.type(
      screen.getByLabelText(/envie d'en dire plus/i),
      "bonne journée",
    );
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

  it("précharge l'entrée existante (détails ouverts) et propose la mise à jour", () => {
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
