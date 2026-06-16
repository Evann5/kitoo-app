import { describe, it, expect } from "vitest";
import {
  addDays,
  computeStreak,
  computeStats,
  trailingVeryNegativeCount,
  shouldShowSupportNudge,
  buildDailySeries,
  getGreeting,
  moodCtaLabel,
  type MoodPoint,
} from "@/features/dashboard";
import { streakMessage } from "@/features/dashboard/StreakBadge";

const TODAY = "2026-06-17";
const mk = (offsets: { d: number; level: number }[]): MoodPoint[] =>
  offsets.map(({ d, level }) => ({ entry_date: addDays(TODAY, d), level }));

describe("computeStreak", () => {
  it("compte les jours consécutifs en finissant aujourd'hui", () => {
    const e = mk([
      { d: 0, level: 4 },
      { d: -1, level: 3 },
      { d: -2, level: 5 },
    ]);
    expect(computeStreak(e, TODAY)).toBe(3);
  });

  it("reste valide si rien noté aujourd'hui mais hier oui", () => {
    const e = mk([
      { d: -1, level: 3 },
      { d: -2, level: 3 },
    ]);
    expect(computeStreak(e, TODAY)).toBe(2);
  });

  it("vaut 0 si ni aujourd'hui ni hier", () => {
    expect(computeStreak(mk([{ d: -3, level: 3 }]), TODAY)).toBe(0);
  });

  it("s'interrompt au premier jour manquant", () => {
    const e = mk([
      { d: 0, level: 4 },
      { d: -1, level: 4 },
      { d: -3, level: 4 },
    ]);
    expect(computeStreak(e, TODAY)).toBe(2);
  });
});

describe("alerte 3 jours très négatif", () => {
  it("se déclenche à 3 jours niveau 1 consécutifs, pas à 2", () => {
    const two = mk([
      { d: 0, level: 1 },
      { d: -1, level: 1 },
    ]);
    expect(shouldShowSupportNudge(two, TODAY)).toBe(false);

    const three = mk([
      { d: 0, level: 1 },
      { d: -1, level: 1 },
      { d: -2, level: 1 },
    ]);
    expect(trailingVeryNegativeCount(three, TODAY)).toBe(3);
    expect(shouldShowSupportNudge(three, TODAY)).toBe(true);
  });

  it("ne se déclenche pas si la série est cassée par un autre niveau", () => {
    const e = mk([
      { d: 0, level: 1 },
      { d: -1, level: 2 },
      { d: -2, level: 1 },
      { d: -3, level: 1 },
    ]);
    expect(shouldShowSupportNudge(e, TODAY)).toBe(false);
  });
});

describe("computeStats & series", () => {
  it("calcule moyenne et nombre d'entrées", () => {
    const e = mk([
      { d: 0, level: 4 },
      { d: -1, level: 2 },
    ]);
    const s = computeStats(e, TODAY);
    expect(s.count).toBe(2);
    expect(s.average).toBe(3);
  });

  it("moyenne null si aucune entrée", () => {
    expect(computeStats([], TODAY).average).toBeNull();
  });

  it("buildDailySeries remplit les trous avec null", () => {
    const e = mk([{ d: 0, level: 5 }]);
    const series = buildDailySeries(e, TODAY, 7);
    expect(series).toHaveLength(7);
    expect(series[6]).toEqual({ date: TODAY, level: 5 });
    expect(series[0].level).toBeNull();
  });
});

describe("greeting & cta", () => {
  it("salue selon l'heure", () => {
    expect(getGreeting(9)).toBe("Bonjour");
    expect(getGreeting(14)).toBe("Bon après-midi");
    expect(getGreeting(21)).toBe("Bonsoir");
  });

  it("CTA Noter vs Modifier selon l'entrée du jour", () => {
    expect(moodCtaLabel(false)).toBe("Noter mon humeur");
    expect(moodCtaLabel(true)).toBe("Modifier mon humeur");
  });

  it("le message de série n'est jamais culpabilisant à 0", () => {
    expect(streakMessage(0)).toMatch(/quand tu veux/i);
    expect(streakMessage(7)).toMatch(/continue comme ça/i);
  });
});
