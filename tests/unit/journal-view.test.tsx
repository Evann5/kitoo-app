import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JournalView } from "@/features/journal/JournalView";
import {
  assessmentRowToEntry,
  exerciseRowToEntry,
  mergeAndSort,
  moodRowToEntry,
  type JournalEntry,
} from "@/features/journal/aggregate";

const NOW = "2026-06-15T12:00:00.000Z";

function sample(): JournalEntry[] {
  return mergeAndSort(
    [
      moodRowToEntry({
        id: "m1",
        entry_date: "2026-06-14",
        level: 5, // "Très bien", score caché = 100
        comment: "Super",
        created_at: "2026-06-14T09:00:00.000Z",
        tags: ["sport"],
      }),
    ],
    [
      exerciseRowToEntry({
        id: "e1",
        started_at: "2026-06-13T18:00:00.000Z",
        completed: true,
        duration_sec: 120,
        title: "Respiration carrée",
        category: "respiration",
      }),
    ],
    [
      assessmentRowToEntry({
        id: "a1",
        scale: "who5",
        score: 60,
        // Hors fenêtre "semaine" depuis le 15/06 (pour le test de filtre vide).
        taken_at: "2026-06-01T08:00:00.000Z",
        flagged: false,
      })!,
    ],
  );
}

describe("JournalView", () => {
  it("état vide global chaleureux quand aucune donnée", () => {
    render(<JournalView entries={[]} nowIso={NOW} />);
    expect(
      screen.getByText(/se remplira au fil du temps/i),
    ).toBeInTheDocument();
  });

  it("n'expose jamais le score d'humeur 0–100 (libellé seul)", () => {
    render(<JournalView entries={sample()} nowIso={NOW} />);
    expect(screen.getAllByText("Très bien").length).toBeGreaterThan(0);
    // Le score caché (100, niveau 5) ne doit pas apparaître comme "100".
    expect(screen.queryByText("100")).toBeNull();
  });

  it("filtre par type : ne garde que les exercices", async () => {
    const user = userEvent.setup();
    render(<JournalView entries={sample()} nowIso={NOW} />);
    // Avant filtre : l'humeur et l'exercice sont visibles.
    expect(screen.getByText("Respiration carrée")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Exercice" }));
    expect(screen.getByText("Respiration carrée")).toBeInTheDocument();
    // L'item d'humeur n'est plus dans la timeline.
    expect(screen.queryByText("Super")).toBeNull();
  });

  it("affiche un état vide chaleureux pour un filtre sans résultat", async () => {
    const user = userEvent.setup();
    render(<JournalView entries={sample()} nowIso={NOW} />);
    // Filtre "Semaine" depuis le 15/06 exclut le test du 12 → mais garde 13/14.
    // On combine type Test + période Semaine pour vider.
    await user.click(screen.getByRole("button", { name: "Test" }));
    // "Semaine" existe aussi dans le graphe : on cible le groupe de filtres.
    const periodGroup = screen.getByRole("group", {
      name: "Filtrer par période",
    });
    await user.click(
      within(periodGroup).getByRole("button", { name: "Semaine" }),
    );
    expect(
      screen.getByText(/Rien à afficher pour ce filtre/i),
    ).toBeInTheDocument();
  });

  it("ouvre le détail orienté d'un test (réutilise la vue A13)", async () => {
    const user = userEvent.setup();
    render(<JournalView entries={sample()} nowIso={NOW} />);
    await user.click(screen.getByRole("button", { name: "Voir le détail" }));
    // Le disclaimer de la vue A13 apparaît (présent aussi dans l'aperçu).
    expect(
      screen.getAllByText(/ne remplace pas un suivi médical/i).length,
    ).toBeGreaterThan(1);
  });
});
