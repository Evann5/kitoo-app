import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  parsePrefs,
  applyPrefsToDocument,
  DEFAULT_PREFS,
  ANTI_FLASH_SCRIPT,
} from "@/features/accessibility/prefs";

const saveMock = vi.fn(async () => ({ ok: true as const }));
vi.mock("@/features/accessibility/actions", () => ({
  saveAccessibilityPrefs: (...args: unknown[]) => saveMock(...args),
}));

import { AccessibilityToggle } from "@/features/accessibility/AccessibilityToggle";

afterEach(() => {
  saveMock.mockClear();
  delete document.documentElement.dataset.font;
  delete document.documentElement.dataset.contrast;
});

describe("prefs", () => {
  it("parsePrefs : défauts sûrs et lecture des booléens", () => {
    expect(parsePrefs(null)).toEqual(DEFAULT_PREFS);
    expect(parsePrefs({ dyslexia: true })).toEqual({
      dyslexia: true,
      colorblind: false,
    });
    expect(parsePrefs({ dyslexia: true, colorblind: true })).toEqual({
      dyslexia: true,
      colorblind: true,
    });
  });

  it("applyPrefsToDocument : pose et retire les attributs", () => {
    applyPrefsToDocument({ dyslexia: true, colorblind: true });
    expect(document.documentElement.dataset.font).toBe("dyslexia");
    expect(document.documentElement.dataset.contrast).toBe("colorblind");
    applyPrefsToDocument({ dyslexia: false, colorblind: false });
    expect(document.documentElement.dataset.font).toBeUndefined();
    expect(document.documentElement.dataset.contrast).toBeUndefined();
  });

  it("le script anti-flash référence les deux préférences", () => {
    expect(ANTI_FLASH_SCRIPT).toMatch(/dyslexia/);
    expect(ANTI_FLASH_SCRIPT).toMatch(/colorblind/);
  });
});

describe("AccessibilityToggle", () => {
  it("active le mode dyslexie : applique l'attribut et persiste", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityToggle initial={{ dyslexia: false, colorblind: false }} />,
    );
    const sw = screen.getByRole("switch", { name: "Mode dyslexie" });
    expect(sw).toHaveAttribute("aria-checked", "false");

    await user.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement.dataset.font).toBe("dyslexia");
    expect(saveMock).toHaveBeenCalledWith({
      dyslexia: true,
      colorblind: false,
    });
  });
});
