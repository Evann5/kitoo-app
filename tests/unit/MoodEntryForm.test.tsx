import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), replace: vi.fn(), push: vi.fn() }),
}));
vi.mock("@/features/mood/actions", () => ({
  saveMood: vi.fn(async () => ({ ok: true })),
}));

import { MoodEntryForm } from "@/features/mood/MoodEntryForm";

describe("MoodEntryForm — réaction compagnon", () => {
  it("change la pose de la mascotte selon l'humeur choisie", async () => {
    const user = userEvent.setup();
    render(<MoodEntryForm tags={[]} initial={null} />);

    // Par défaut (aucune humeur) : pose classic.
    expect(screen.getByRole("img").getAttribute("src")).toContain(
      "kitoo-classic",
    );

    await user.click(screen.getByRole("radio", { name: "Très bien" }));
    expect(screen.getByRole("img").getAttribute("src")).toContain(
      "kitoo-sunglasses",
    );

    await user.click(screen.getByRole("radio", { name: "Difficile" }));
    expect(screen.getByRole("img").getAttribute("src")).toContain(
      "kitoo-crying",
    );
  });

  it("neutralise la transition sous prefers-reduced-motion (classe motion-reduce)", () => {
    const { container } = render(<MoodEntryForm tags={[]} initial={null} />);
    expect(
      container.querySelector('[class*="motion-reduce:transition-none"]'),
    ).not.toBeNull();
  });

  it("précharge l'entrée existante (édition)", () => {
    render(
      <MoodEntryForm
        tags={[]}
        initial={{ level: 4, comment: "ça va", tagIds: [] }}
      />,
    );
    expect(screen.getByRole("radio", { name: "Bien" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByDisplayValue("ça va")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mettre à jour mon humeur" }),
    ).toBeInTheDocument();
  });
});
