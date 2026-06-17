import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), replace: vi.fn(), push: vi.fn() }),
}));
const { setNameMock } = vi.hoisted(() => ({
  setNameMock: vi.fn(async (n?: string) => ({
    ok: true as const,
    name: (n ?? "").trim() || "Kitoo",
  })),
}));
vi.mock("@/features/dashboard/actions", () => ({
  setCompanionName: setNameMock,
}));

import { CompanionCard } from "@/features/dashboard/CompanionCard";
import { PrimaryMoodCta } from "@/features/dashboard/PrimaryMoodCta";

beforeEach(() => setNameMock.mockClear());

describe("CompanionCard", () => {
  it("rend la bulle, le koala et 2 indicateurs positifs (sans score 0–100)", () => {
    const { container } = render(
      <CompanionCard
        name="Kitoo"
        message="Salut ! Tu n'as pas encore noté ton humeur aujourd'hui."
        pose="classic"
        streak={7}
        weekLabel="Bien"
      />,
    );
    expect(screen.getByText(/pas encore noté ton humeur/i)).toBeInTheDocument();
    expect(container.querySelector("img")).not.toBeNull(); // koala
    // Indicateurs positifs.
    expect(screen.getByText("Série")).toBeInTheDocument();
    expect(screen.getByText("7 jours")).toBeInTheDocument();
    expect(screen.getByText("Cette semaine")).toBeInTheDocument();
    expect(screen.getByText("Bien")).toBeInTheDocument();
    // Jamais le score caché 0–100.
    expect(screen.queryByText("100")).toBeNull();
  });

  it("permet de renommer le compagnon", async () => {
    const user = userEvent.setup();
    render(
      <CompanionCard
        name="Kitoo"
        message="Coucou"
        pose="classic"
        streak={1}
        weekLabel={null}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: "Renommer le compagnon" }),
    );
    const input = screen.getByLabelText("Nom du compagnon");
    await user.clear(input);
    await user.type(input, "Doudou");
    await user.click(screen.getByRole("button", { name: "Valider le nom" }));
    expect(setNameMock).toHaveBeenCalledWith("Doudou");
    expect(await screen.findByText("Doudou")).toBeInTheDocument();
  });

  it("affiche un repli chaleureux pour la semaine sans données", () => {
    render(
      <CompanionCard
        name="Kitoo"
        message="Coucou"
        pose="classic"
        streak={0}
        weekLabel={null}
      />,
    );
    expect(screen.getByText("0 jour")).toBeInTheDocument();
    expect(screen.getByText("À découvrir")).toBeInTheDocument();
  });
});

describe("PrimaryMoodCta", () => {
  it("affiche « Noter » quand rien aujourd'hui, « Modifier » sinon", () => {
    const { rerender } = render(<PrimaryMoodCta hasToday={false} />);
    expect(
      screen.getByRole("link", { name: "Noter mon humeur" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/pas de pression/i)).toBeInTheDocument();

    rerender(<PrimaryMoodCta hasToday={true} />);
    expect(
      screen.getByRole("link", { name: "Modifier mon humeur" }),
    ).toBeInTheDocument();
  });
});
