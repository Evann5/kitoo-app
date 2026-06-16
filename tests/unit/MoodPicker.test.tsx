import { describe, it, expect } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MoodPicker } from "@/features/mood/MoodPicker";
import { poseForMood, MOOD_OPTIONS, type MoodValue } from "@/features/mood";

function Harness() {
  const [value, setValue] = useState<MoodValue | null>(null);
  return <MoodPicker value={value} onChange={setValue} />;
}

describe("MoodPicker — accessibilité", () => {
  it("rend un radiogroup avec les 5 niveaux libellés", () => {
    render(<Harness />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(5);
    for (const option of MOOD_OPTIONS) {
      expect(
        screen.getByRole("radio", { name: option.label }),
      ).toBeInTheDocument();
    }
  });

  it("sélectionne au clic et reflète aria-checked", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const bien = screen.getByRole("radio", { name: "Bien" });
    expect(bien).toHaveAttribute("aria-checked", "false");
    await user.click(bien);
    expect(bien).toHaveAttribute("aria-checked", "true");
  });

  it("se navigue au clavier (flèches) avec roving tabindex", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    // Premier radio focusable (roving tabindex).
    await user.tab();
    const first = screen.getByRole("radio", { name: MOOD_OPTIONS[0].label });
    expect(first).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    const second = screen.getByRole("radio", { name: MOOD_OPTIONS[1].label });
    expect(second).toHaveAttribute("aria-checked", "true");
    expect(second).toHaveFocus();
  });
});

describe("mapping humeur → mascotte", () => {
  it("associe chaque niveau à la bonne pose", () => {
    expect(poseForMood(5)).toBe("sunglasses");
    expect(poseForMood(4)).toBe("soda");
    expect(poseForMood(3)).toBe("classic");
    expect(poseForMood(2)).toBe("classic");
    expect(poseForMood(1)).toBe("crying");
  });
});
