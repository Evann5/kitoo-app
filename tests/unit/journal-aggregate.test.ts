import { describe, it, expect } from "vitest";
import {
  assessmentRowToEntry,
  assessmentTrends,
  exerciseRecap,
  exerciseRowToEntry,
  filterEntries,
  mergeAndSort,
  moodRowToEntry,
  paginate,
  toMoodPoints,
  type JournalEntry,
} from "@/features/journal/aggregate";

const moodRow = {
  id: "m1",
  entry_date: "2026-06-10",
  level: 4,
  comment: "Bonne journée",
  created_at: "2026-06-10T09:00:00.000Z",
  tags: ["sport", "amis"],
};

const exRow = {
  id: "e1",
  started_at: "2026-06-12T18:00:00.000Z",
  completed: true,
  duration_sec: 180,
  title: "Respiration carrée",
  category: "respiration",
};

const asRow = {
  id: "a1",
  scale: "who5",
  score: 60,
  taken_at: "2026-06-14T08:00:00.000Z",
  flagged: false,
};

describe("projections de lignes", () => {
  it("mood : libellé qualitatif, jamais le score 0–100", () => {
    const entry = moodRowToEntry(moodRow);
    expect(entry.kind).toBe("mood");
    expect(entry.moodLabel).toBe("Bien"); // niveau 4
    expect(entry.tags).toEqual(["sport", "amis"]);
    expect(entry.commentExcerpt).toBe("Bonne journée");
    // Aucune fuite de score numérique 0–100.
    expect(JSON.stringify(entry)).not.toContain("score");
    expect(Object.keys(entry)).not.toContain("score");
  });

  it("mood : tronque les commentaires longs", () => {
    const long = "a".repeat(200);
    expect(
      moodRowToEntry({ ...moodRow, comment: long }).commentExcerpt,
    ).toMatch(/…$/);
  });

  it("exercise : titre, catégorie, durée, statut", () => {
    const entry = exerciseRowToEntry(exRow);
    expect(entry).toMatchObject({
      kind: "exercise",
      title: "Respiration carrée",
      category: "respiration",
      durationSec: 180,
      completed: true,
      date: "2026-06-12",
    });
  });

  it("assessment : sévérité recalculée depuis le score officiel", () => {
    const entry = assessmentRowToEntry(asRow)!;
    expect(entry.kind).toBe("assessment");
    expect(entry.scaleTitle).toContain("WHO-5");
    expect(entry.maxScore).toBe(100);
    expect(entry.severityLabel).toBe("Plutôt bon"); // who5 score 60 > 50
    expect(entry.severityTone).toBe("ok");
  });

  it("assessment : échelle inconnue → null (ignorée)", () => {
    expect(assessmentRowToEntry({ ...asRow, scale: "bogus" })).toBeNull();
  });
});

describe("fusion et tri", () => {
  it("fusionne les 3 sources et trie du plus récent au plus ancien", () => {
    const merged = mergeAndSort(
      [moodRowToEntry(moodRow)],
      [exerciseRowToEntry(exRow)],
      [assessmentRowToEntry(asRow)!],
    );
    expect(merged.map((e) => e.id)).toEqual(["a1", "e1", "m1"]);
  });
});

describe("filtres", () => {
  const now = "2026-06-15T12:00:00.000Z";
  const entries: JournalEntry[] = mergeAndSort(
    [moodRowToEntry(moodRow)], // 2026-06-10
    [exerciseRowToEntry(exRow)], // 2026-06-12
    [assessmentRowToEntry(asRow)!], // 2026-06-14
    [
      moodRowToEntry({
        ...moodRow,
        id: "old",
        entry_date: "2026-01-01",
        created_at: "2026-01-01T09:00:00.000Z",
      }),
    ],
  );

  it("filtre par type", () => {
    const moods = filterEntries(entries, { kind: "mood", period: "all" }, now);
    expect(moods.every((e) => e.kind === "mood")).toBe(true);
    expect(moods).toHaveLength(2);
  });

  it("filtre par période (semaine)", () => {
    const week = filterEntries(entries, { kind: "all", period: "week" }, now);
    // 7 jours avant le 15 → garde 10, 12, 14 ; exclut le 1er janvier.
    expect(week.map((e) => e.id).sort()).toEqual(["a1", "e1", "m1"]);
  });

  it("état vide géré (filtre sans résultat)", () => {
    const none = filterEntries(
      entries,
      { kind: "assessment", period: "week" },
      "2027-01-01T00:00:00.000Z",
    );
    expect(none).toEqual([]);
  });
});

describe("pagination", () => {
  it("renvoie la première page et signale le surplus", () => {
    const list = Array.from({ length: 12 }, (_, i) =>
      moodRowToEntry({ ...moodRow, id: `m${i}` }),
    );
    const { items, hasMore } = paginate(list, 10);
    expect(items).toHaveLength(10);
    expect(hasMore).toBe(true);
    expect(paginate(list, 12).hasMore).toBe(false);
  });
});

describe("aperçu d'évolution", () => {
  const entries: JournalEntry[] = mergeAndSort(
    [moodRowToEntry(moodRow), exerciseRowToEntry(exRow)],
    [assessmentRowToEntry(asRow)!],
    [
      assessmentRowToEntry({
        ...asRow,
        id: "a0",
        score: 40,
        taken_at: "2026-06-01T08:00:00.000Z",
      })!,
    ],
  );

  it("toMoodPoints n'expose que date + niveau", () => {
    const pts = toMoodPoints(entries);
    expect(pts).toEqual([{ entry_date: "2026-06-10", level: 4 }]);
  });

  it("exerciseRecap compte sessions et minutes", () => {
    expect(exerciseRecap(entries)).toEqual({ count: 1, totalMinutes: 3 });
  });

  it("assessmentTrends donne la dernière passation + delta", () => {
    const trends = assessmentTrends(entries);
    expect(trends).toHaveLength(1);
    expect(trends[0].latest.id).toBe("a1"); // 14 juin (plus récent)
    expect(trends[0].delta).toBe(20); // 60 - 40
  });
});
