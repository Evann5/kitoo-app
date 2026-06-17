import { describe, it, expect } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MoodDial } from "@/features/mood/MoodDial";
import { scoreToOption } from "@/features/mood";

function Harness() {
  const [value, setValue] = useState<number | null>(null);
  const label =
    value !== null ? scoreToOption(value).label : "Règle ton humeur";
  return (
    <MoodDial value={value} onChange={setValue} ariaValueText={label}>
      <span data-testid="label">{label}</span>
    </MoodDial>
  );
}

const DIGITS = /\d/;

describe("MoodDial — accessibilité & score caché", () => {
  it("est un slider nommé, sans exposer de nombre dans aria-valuetext", async () => {
    render(<Harness />);
    const slider = screen.getByRole("slider", { name: "Règle ton humeur" });
    expect(slider).toHaveAttribute("aria-valuetext", "Règle ton humeur");
    // aria-valuetext ne contient jamais de chiffre (= libellé, pas le score).
    expect(slider.getAttribute("aria-valuetext")).not.toMatch(DIGITS);
    // Le texte visible n'expose pas non plus de nombre.
    expect(screen.getByTestId("label").textContent).not.toMatch(DIGITS);
  });

  it("s'ajuste au clavier et reflète le libellé d'humeur (pas le nombre)", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const slider = screen.getByRole("slider");

    await user.tab();
    expect(slider).toHaveFocus();

    await user.keyboard("{End}"); // score max → « Très bien »
    expect(slider).toHaveAttribute("aria-valuetext", "Très bien");
    expect(slider.getAttribute("aria-valuetext")).not.toMatch(DIGITS);

    await user.keyboard("{Home}"); // score min → « Difficile »
    expect(slider).toHaveAttribute("aria-valuetext", "Difficile");

    await user.keyboard("{ArrowUp}"); // remonte un cran depuis 0
    // Toujours un libellé, jamais un nombre.
    expect(slider.getAttribute("aria-valuetext")).not.toMatch(DIGITS);
  });

  it("cliquer une icône d'humeur place la poignée sur sa zone", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const slider = screen.getByRole("slider");

    await user.click(screen.getByRole("button", { name: "Très bien" }));
    expect(slider).toHaveAttribute("aria-valuetext", "Très bien");

    await user.click(screen.getByRole("button", { name: "Difficile" }));
    expect(slider).toHaveAttribute("aria-valuetext", "Difficile");
    expect(slider.getAttribute("aria-valuetext")).not.toMatch(DIGITS);
  });
});
