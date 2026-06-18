import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const recordMock = vi.fn();
vi.mock("@/features/assessments/actions", () => ({
  recordAssessment: (...a: unknown[]) => recordMock(...a),
}));

import { AssessmentRunner } from "@/features/assessments/AssessmentRunner";
import { AssessmentResult } from "@/features/assessments/AssessmentResult";
import { SCALES } from "@/features/assessments/scales";

beforeEach(() => recordMock.mockReset());

describe("AssessmentRunner - accessibilité & soumission", () => {
  it("rend un fieldset/legend + radios par question", () => {
    render(<AssessmentRunner scaleKey="who5" />);
    expect(screen.getAllByRole("group")).toHaveLength(SCALES.who5.items.length);
    // 5 items × 6 options.
    expect(screen.getAllByRole("radio")).toHaveLength(5 * 6);
    expect(
      screen.getByText(/ne remplace pas un suivi médical/i),
    ).toBeInTheDocument();
  });

  it("exige toutes les réponses avant de soumettre", async () => {
    const user = userEvent.setup();
    render(<AssessmentRunner scaleKey="gad7" />);
    await user.click(screen.getByRole("button", { name: "Voir mon résultat" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      /toutes les questions/i,
    );
    expect(recordMock).not.toHaveBeenCalled();
  });

  it("affiche le résultat renvoyé par le serveur", async () => {
    recordMock.mockResolvedValue({
      ok: true,
      result: {
        score: 60,
        severity: { label: "Plutôt bon", tone: "ok" },
        flagged: false,
      },
    });
    const user = userEvent.setup();
    render(<AssessmentRunner scaleKey="who5" />);
    // Répond à chaque question (1re option de chaque groupe).
    for (const group of screen.getAllByRole("group")) {
      await user.click(within(group).getAllByRole("radio")[0]);
    }
    await user.click(screen.getByRole("button", { name: "Voir mon résultat" }));
    expect(recordMock).toHaveBeenCalledWith({
      scale: "who5",
      answers: expect.any(Array),
    });
    expect(await screen.findByText("60")).toBeInTheDocument();
  });
});

describe("AssessmentResult - orientation & soutien", () => {
  it("formule en orientation avec disclaimer, sans diagnostic", () => {
    render(
      <AssessmentResult
        scaleKey="gad7"
        result={{
          score: 8,
          severity: { label: "Léger", tone: "mild" },
          flagged: false,
        }}
      />,
    );
    expect(screen.getByText(/pas un diagnostic/i)).toBeInTheDocument();
    expect(
      screen.getByText(/ne remplace pas un suivi médical/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("3114")).toBeNull();
  });

  it("affiche le message de soutien (3114) si flagged", () => {
    render(
      <AssessmentResult
        scaleKey="phq9"
        result={{
          score: 6,
          severity: { label: "Léger", tone: "mild" },
          flagged: true,
        }}
      />,
    );
    expect(
      screen.getByRole("region", { name: /soutien/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/3114/).length).toBeGreaterThan(0);
  });
});
