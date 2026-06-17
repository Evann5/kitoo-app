import { describe, it, expect } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MoodDial } from "@/features/mood/MoodDial";
import { scoreToOption } from "@/features/mood";

function Harness({ initial = null }: { initial?: number | null }) {
  const [value, setValue] = useState<number | null>(initial);
  const label =
    value !== null ? scoreToOption(value).label : "Règle ton humeur";
  return <MoodDial value={value} onChange={setValue} ariaValueText={label} />;
}

const DIGITS = /\d/;

describe("MoodDial — score caché & accessibilité", () => {
  it("est un slider nommé, sans exposer de nombre dans aria-valuetext", () => {
    render(<Harness />);
    const slider = screen.getByRole("slider", { name: "Règle ton humeur" });
    expect(slider).toHaveAttribute("aria-valuetext", "Règle ton humeur");
    expect(slider.getAttribute("aria-valuetext")).not.toMatch(DIGITS);
  });

  it("s'ajuste au clavier et reflète le libellé d'humeur (pas le nombre)", () => {
    render(<Harness />);
    const slider = screen.getByRole("slider");

    fireEvent.keyDown(slider, { key: "End" }); // score max → « Très bien »
    expect(slider).toHaveAttribute("aria-valuetext", "Très bien");
    expect(slider.getAttribute("aria-valuetext")).not.toMatch(DIGITS);

    fireEvent.keyDown(slider, { key: "Home" }); // score min → « Difficile »
    expect(slider).toHaveAttribute("aria-valuetext", "Difficile");

    fireEvent.keyDown(slider, { key: "ArrowUp" }); // remonte un cran
    expect(slider.getAttribute("aria-valuetext")).not.toMatch(DIGITS);
  });

  it("activer une icône d'humeur place la poignée sur sa zone", () => {
    render(<Harness />);
    const slider = screen.getByRole("slider");

    fireEvent.click(screen.getByRole("button", { name: "Très bien" }));
    expect(slider).toHaveAttribute("aria-valuetext", "Très bien");

    fireEvent.click(screen.getByRole("button", { name: "Difficile" }));
    expect(slider).toHaveAttribute("aria-valuetext", "Difficile");
    expect(slider.getAttribute("aria-valuetext")).not.toMatch(DIGITS);
  });

  it("le libellé central reflète le score préchargé, sans chiffre", () => {
    render(<Harness initial={73} />); // niveau 4 → « Bien »
    const label = screen.getByText("Bien");
    expect(label).toBeInTheDocument();
    expect(label.textContent).not.toMatch(DIGITS);
  });
});
