import { describe, it, expect } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MoodSlider } from "@/features/mood/MoodSlider";
import { scoreToOption } from "@/features/mood";

function Harness({ initial = null }: { initial?: number | null }) {
  const [value, setValue] = useState<number | null>(initial);
  const label =
    value !== null ? scoreToOption(value).label : "Règle ton humeur";
  return <MoodSlider value={value} onChange={setValue} ariaValueText={label} />;
}

const DIGITS = /\d/;

describe("MoodSlider - valence, score caché & réactivité", () => {
  it("est un slider nommé, aria-valuetext = libellé sans chiffre", () => {
    render(<Harness />);
    const slider = screen.getByRole("slider", { name: "Règle ton humeur" });
    expect(slider).toHaveAttribute("aria-valuetext", "Règle ton humeur");
    expect(slider.getAttribute("aria-valuetext")).not.toMatch(DIGITS);
    // Libellés d'extrémités présents et liés.
    expect(screen.getByText("Très désagréable")).toBeInTheDocument();
    expect(screen.getByText("Très agréable")).toBeInTheDocument();
  });

  it("déplacer le curseur met à jour libellé + koala, sans exposer de nombre", () => {
    const { container } = render(<Harness />);
    const slider = screen.getByRole("slider");
    const mascotSrc = () =>
      container.querySelector("img")?.getAttribute("src") ?? "";

    expect(mascotSrc()).toContain("kitoo-classic");

    fireEvent.change(slider, { target: { value: "100" } });
    expect(slider).toHaveAttribute("aria-valuetext", "Très bien");
    expect(mascotSrc()).toContain("kitoo-sunglasses");

    fireEvent.change(slider, { target: { value: "0" } });
    expect(slider).toHaveAttribute("aria-valuetext", "Difficile");
    expect(mascotSrc()).toContain("kitoo-crying");

    expect(slider.getAttribute("aria-valuetext")).not.toMatch(DIGITS);
  });

  it("reflète le score préchargé via le libellé (pas de chiffre)", () => {
    render(<Harness initial={73} />); // niveau 4 → « Bien »
    expect(screen.getByText("Bien")).toBeInTheDocument();
    expect(screen.getByRole("slider")).toHaveAttribute(
      "aria-valuetext",
      "Bien",
    );
  });
});
