import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SupportNudge } from "@/features/dashboard/SupportNudge";
import { MoodTrendChart } from "@/features/dashboard/MoodTrendChart";
import { buildDailySeries, type MoodPoint } from "@/features/dashboard";

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    })),
  );
}

describe("SupportNudge", () => {
  it("a un ton soutenant et inclut le disclaimer (non clinique)", () => {
    render(<SupportNudge />);
    expect(screen.getByText(/pas à traverser ça seul/i)).toBeInTheDocument();
    expect(
      screen.getByText(/ne remplace pas un suivi médical/i),
    ).toBeInTheDocument();
    // Pas de langage de diagnostic.
    expect(screen.queryByText(/dépression|trouble|diagnostic/i)).toBeNull();
    expect(
      screen.getByRole("link", { name: /trouver du soutien/i }),
    ).toBeInTheDocument();
  });
});

const TODAY = "2026-06-17";
const points: MoodPoint[] = [
  { entry_date: TODAY, level: 4 },
  { entry_date: "2026-06-16", level: 2 },
];
const weekly = buildDailySeries(points, TODAY, 7);
const monthly = buildDailySeries(points, TODAY, 30);

describe("MoodTrendChart - accessibilité", () => {
  it("expose une alternative textuelle (résumé + table de données)", () => {
    stubReducedMotion(false);
    render(<MoodTrendChart weekly={weekly} monthly={monthly} />);
    // Table de données accessible avec une ligne par jour.
    const table = screen.getByRole("table", { hidden: true });
    expect(table).toBeInTheDocument();
    expect(screen.getAllByRole("row", { hidden: true }).length).toBeGreaterThan(
      7,
    );
    // Le libellé d'humeur (texte, pas seulement la couleur) est présent.
    expect(screen.getAllByText(/Bien|Non noté/i).length).toBeGreaterThan(0);
  });

  it("rend une alternative même sous prefers-reduced-motion", () => {
    stubReducedMotion(true);
    render(<MoodTrendChart weekly={weekly} monthly={monthly} />);
    expect(screen.getByRole("table", { hidden: true })).toBeInTheDocument();
  });

  it("affiche un état vide quand aucune humeur n'est notée", () => {
    stubReducedMotion(false);
    const empty = buildDailySeries([], TODAY, 7);
    render(<MoodTrendChart weekly={empty} monthly={empty} />);
    expect(
      screen.getByText(/note ton humeur pour voir tes tendances/i),
    ).toBeInTheDocument();
  });
});
