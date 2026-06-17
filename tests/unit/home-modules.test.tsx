import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  buildWeeklyRecap,
  isRecapEmpty,
  encouragementOfDay,
  ENCOURAGEMENTS,
  buildDailySeries,
  type MoodPoint,
} from "@/features/dashboard";
import { WeekOverview } from "@/features/dashboard/WeekOverview";
import { QuickActions } from "@/features/dashboard/QuickActions";
import { SuggestionsList } from "@/features/dashboard/SuggestionsList";
import { WeeklyRecap } from "@/features/dashboard/WeeklyRecap";

const TODAY = "2026-06-17";

describe("home helpers (purs)", () => {
  const points: MoodPoint[] = [
    { entry_date: "2026-06-17", level: 4 },
    { entry_date: "2026-06-16", level: 2 },
    { entry_date: "2026-05-01", level: 5 }, // hors semaine
  ];

  it("buildWeeklyRecap compte jours/exercices et le ressenti (7 jours)", () => {
    const recap = buildWeeklyRecap(
      points,
      ["2026-06-17T10:00:00Z", "2026-04-01T10:00:00Z"],
      TODAY,
    );
    expect(recap.daysNoted).toBe(2); // 17 + 16, pas le 1er mai
    expect(recap.exercises).toBe(1); // seule la session du 17
    expect(recap.feelingLevel).toBe(3); // round((4+2)/2)
  });

  it("isRecapEmpty pour un nouvel utilisateur", () => {
    const recap = buildWeeklyRecap([], [], TODAY);
    expect(isRecapEmpty(recap)).toBe(true);
  });

  it("encouragementOfDay est stable et borné", () => {
    expect(encouragementOfDay(0)).toBe(ENCOURAGEMENTS[0]);
    expect(ENCOURAGEMENTS).toContain(encouragementOfDay(99));
  });
});

describe("WeekOverview", () => {
  it("rend 7 jours avec libellé accessible, sans exposer de score 0–100", () => {
    const days = buildDailySeries([{ entry_date: TODAY, level: 5 }], TODAY, 7);
    render(<WeekOverview days={days} />);
    expect(
      screen.getByRole("heading", { name: /ta semaine/i }),
    ).toBeInTheDocument();
    // 7 items de liste.
    expect(screen.getAllByRole("listitem")).toHaveLength(7);
    // Le jour noté porte un libellé qualitatif (pas un score chiffré).
    expect(screen.getByText(/: Très bien$/)).toBeInTheDocument();
    expect(screen.getAllByText(/: non noté$/).length).toBeGreaterThan(0);
    // Aucun score brut 0–100 exposé.
    expect(screen.queryByText("100")).toBeNull();
    // Lien vers le suivi.
    expect(screen.getByRole("link")).toHaveAttribute("href", "/suivi");
  });

  it("état vide chaleureux quand rien n'est noté", () => {
    const days = buildDailySeries([], TODAY, 7);
    render(<WeekOverview days={days} />);
    expect(
      screen.getByText(/se remplira au fil des jours/i),
    ).toBeInTheDocument();
  });
});

describe("QuickActions", () => {
  it("pointe vers exercices, tests et respiration express", () => {
    render(<QuickActions breathingHref="/exercices/respiration-478" />);
    expect(
      screen.getByRole("link", { name: "Faire un exercice" }),
    ).toHaveAttribute("href", "/exercices");
    expect(
      screen.getByRole("link", { name: "Passer un test" }),
    ).toHaveAttribute("href", "/tests");
    expect(
      screen.getByRole("link", { name: "Respiration express" }),
    ).toHaveAttribute("href", "/exercices/respiration-478");
  });
});

describe("SuggestionsList", () => {
  it("liste les suggestions + lien Voir tout", () => {
    render(
      <SuggestionsList
        suggestions={[
          {
            key: "r-1",
            badge: "article",
            title: "Respirer",
            summary: "Court.",
            href: "/ressources/1",
          },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "Voir tout" })).toBeInTheDocument();
    expect(screen.getByText("Respirer")).toBeInTheDocument();
  });

  it("état vide chaleureux sans suggestion", () => {
    render(<SuggestionsList suggestions={[]} />);
    expect(screen.getByText(/espace\s+bien-être/i)).toBeInTheDocument();
  });
});

describe("WeeklyRecap", () => {
  it("récap doux sans score 0–100", () => {
    render(
      <WeeklyRecap
        recap={{ daysNoted: 3, exercises: 2, feelingLevel: 4 }}
        feelingLabel="Bien"
      />,
    );
    expect(screen.getByText("Bien")).toBeInTheDocument();
    expect(screen.getByText(/continue à ton rythme/i)).toBeInTheDocument();
    expect(screen.queryByText("100")).toBeNull();
  });

  it("état vide chaleureux", () => {
    render(
      <WeeklyRecap
        recap={{ daysNoted: 0, exercises: 0, feelingLevel: null }}
        feelingLabel={null}
      />,
    );
    expect(
      screen.getByText(/se remplira au fil des jours/i),
    ).toBeInTheDocument();
  });
});
