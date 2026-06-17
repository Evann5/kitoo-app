import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen, fireEvent } from "@testing-library/react";
import {
  parseSteps,
  flattenPhases,
  formatDuration,
  scaleForLabel,
} from "@/features/exercises/steps";
import type { Exercise } from "@/features/exercises/queries";

const recordMock = vi.fn(async () => ({ ok: true as const }));
vi.mock("@/features/exercises/actions", () => ({
  recordExerciseSession: (...a: unknown[]) => recordMock(...a),
}));
let reduce = false;
vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => reduce,
}));

import { ExercisePlayer } from "@/features/exercises/ExercisePlayer";

const exercise: Exercise = {
  id: "ex-1",
  slug: "court",
  title: "Court",
  category: "respiration",
  description: "test",
  duration_sec: 2,
  steps: {
    cycles: 1,
    phases: [
      { label: "Inspire", seconds: 1 },
      { label: "Expire", seconds: 1 },
    ],
  },
  theme: "stress",
  mood_levels: [1],
  created_at: "2026-06-17T00:00:00Z",
};

describe("steps (pur)", () => {
  it("parseSteps tolère et nettoie", () => {
    expect(parseSteps(null)).toEqual({ cycles: 1, phases: [] });
    expect(
      parseSteps({ cycles: 2, phases: [{ label: "A", seconds: 3 }] }),
    ).toEqual({ cycles: 2, phases: [{ label: "A", seconds: 3 }] });
  });
  it("flattenPhases répète les cycles", () => {
    const flat = flattenPhases({
      cycles: 2,
      phases: [{ label: "A", seconds: 1 }],
    });
    expect(flat).toHaveLength(2);
  });
  it("formatDuration et scaleForLabel", () => {
    expect(formatDuration(45)).toBe("45 s");
    expect(formatDuration(76)).toBe("1 min");
    expect(scaleForLabel("Inspire")).toBeGreaterThan(scaleForLabel("Expire"));
  });
});

describe("ExercisePlayer", () => {
  beforeEach(() => {
    recordMock.mockClear();
    reduce = false;
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("enchaîne les phases et enregistre une session complétée", () => {
    render(<ExercisePlayer exercise={exercise} />);
    fireEvent.click(screen.getByRole("button", { name: "Commencer" }));
    expect(screen.getAllByText("Inspire").length).toBeGreaterThan(0);

    act(() => void vi.advanceTimersByTime(1000)); // Inspire → Expire
    expect(screen.getAllByText("Expire").length).toBeGreaterThan(0);
    act(() => void vi.advanceTimersByTime(1000)); // → terminé

    expect(screen.getByText(/bien joué/i)).toBeInTheDocument();
    expect(recordMock).toHaveBeenCalledWith({
      exerciseId: "ex-1",
      durationSec: 2,
      completed: true,
    });
  });

  it("enregistre completed=false en cas d'abandon", () => {
    render(<ExercisePlayer exercise={exercise} />);
    fireEvent.click(screen.getByRole("button", { name: "Commencer" }));
    act(() => void vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByRole("button", { name: "Arrêter" }));

    expect(recordMock).toHaveBeenCalledWith({
      exerciseId: "ex-1",
      durationSec: 1,
      completed: false,
    });
    // Retour à l'état initial.
    expect(
      screen.getByRole("button", { name: "Commencer" }),
    ).toBeInTheDocument();
  });

  it("désactive l'animation sous prefers-reduced-motion", () => {
    reduce = true;
    const { container } = render(<ExercisePlayer exercise={exercise} />);
    const circle = container.querySelector(
      '[class*="bg-brand-200"]',
    ) as HTMLElement;
    expect(circle.style.transition).toBe("none");
  });
});
