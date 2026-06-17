import { describe, it, expect } from "vitest";
import { SCALES, computeResult } from "@/features/assessments/scales";

describe("scoring PHQ-9", () => {
  it("somme les 9 items (0–27) et donne la sévérité", () => {
    const r = computeResult("phq9", [2, 2, 2, 2, 2, 2, 2, 1, 0]); // 15
    expect(r.score).toBe(15);
    expect(r.severity.label).toBe("Modérément marqué");
    expect(r.flagged).toBe(false);
  });

  it("flag l'item 9 (idées noires) dès qu'il est > 0", () => {
    const none = computeResult("phq9", [0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(none.flagged).toBe(false);
    const flagged = computeResult("phq9", [0, 0, 0, 0, 0, 0, 0, 0, 1]);
    expect(flagged.flagged).toBe(true);
    expect(flagged.score).toBe(1);
  });
});

describe("scoring GAD-7", () => {
  it("somme 0–21 et borne la sévérité", () => {
    expect(computeResult("gad7", [3, 3, 3, 3, 3, 3, 3]).score).toBe(21);
    expect(computeResult("gad7", [3, 3, 3, 3, 3, 3, 3]).severity.label).toBe(
      "Marqué",
    );
    expect(computeResult("gad7", [0, 0, 0, 0, 0, 0, 0]).severity.tone).toBe(
      "ok",
    );
  });
});

describe("scoring PSS-10 (items inversés 4,5,7,8)", () => {
  it("inverse les items 4,5,7,8", () => {
    // Tout à 0 : les 4 items inversés valent 4 → score 16.
    expect(computeResult("pss10", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]).score).toBe(
      16,
    );
    // Tout à 4 : les 4 inversés valent 0, les 6 autres 4 → 24.
    expect(computeResult("pss10", [4, 4, 4, 4, 4, 4, 4, 4, 4, 4]).score).toBe(
      24,
    );
  });
  it("respecte les indices inversés déclarés", () => {
    expect(SCALES.pss10.reverseItems).toEqual([3, 4, 6, 7]);
  });
});

describe("scoring WHO-5 (×4, présenté positivement)", () => {
  it("multiplie le score brut par 4 (0–100)", () => {
    expect(computeResult("who5", [5, 5, 5, 5, 5]).score).toBe(100);
    expect(computeResult("who5", [0, 0, 0, 0, 0]).score).toBe(0);
    expect(computeResult("who5", [3, 3, 3, 3, 3]).score).toBe(60);
  });
  it("score bas = vigilance (ton positif)", () => {
    expect(computeResult("who5", [5, 5, 5, 5, 5]).severity.tone).toBe("ok");
    expect(computeResult("who5", [1, 1, 1, 0, 0]).severity.tone).toBe("high");
    expect(SCALES.who5.positive).toBe(true);
  });
});
