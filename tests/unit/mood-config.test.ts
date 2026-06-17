import { describe, it, expect } from "vitest";
import {
  scoreToLevel,
  scoreToOption,
  poseForScore,
  poseForMood,
  isValidScore,
} from "@/features/mood";

describe("mapping score → niveau", () => {
  it("respecte les seuils de bucket", () => {
    expect(scoreToLevel(0)).toBe(1);
    expect(scoreToLevel(19)).toBe(1);
    expect(scoreToLevel(20)).toBe(2);
    expect(scoreToLevel(40)).toBe(3);
    expect(scoreToLevel(59)).toBe(3);
    expect(scoreToLevel(73)).toBe(4); // Positif
    expect(scoreToLevel(80)).toBe(5);
    expect(scoreToLevel(100)).toBe(5);
  });

  it("borne les valeurs hors plage", () => {
    expect(scoreToLevel(-10)).toBe(1);
    expect(scoreToLevel(150)).toBe(5);
  });

  it("scoreToOption renvoie le libellé qualitatif (jamais le nombre)", () => {
    expect(scoreToOption(73).label).toBe("Bien");
    expect(scoreToOption(10).label).toBe("Difficile");
    expect(scoreToOption(90).label).toBe("Très bien");
  });
});

describe("mapping humeur → pose mascotte", () => {
  it("pose selon le score", () => {
    expect(poseForScore(90)).toBe("sunglasses");
    expect(poseForScore(70)).toBe("soda");
    expect(poseForScore(50)).toBe("classic");
    expect(poseForScore(30)).toBe("classic");
    expect(poseForScore(10)).toBe("crying");
  });

  it("pose selon le niveau (dashboard/graphes)", () => {
    expect(poseForMood(5)).toBe("sunglasses");
    expect(poseForMood(1)).toBe("crying");
  });
});

describe("isValidScore", () => {
  it("accepte 0–100 entiers, rejette le reste", () => {
    expect(isValidScore(0)).toBe(true);
    expect(isValidScore(100)).toBe(true);
    expect(isValidScore(73)).toBe(true);
    expect(isValidScore(-1)).toBe(false);
    expect(isValidScore(101)).toBe(false);
    expect(isValidScore(50.5)).toBe(false);
    expect(isValidScore("50")).toBe(false);
  });
});
