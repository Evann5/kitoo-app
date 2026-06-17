import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

let pathname = "/tableau-de-bord";
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

import { TabBar } from "@/components/layout/TabBar";

describe("TabBar", () => {
  it("rend les 4 onglets + le « + » et marque l'onglet actif", () => {
    pathname = "/tableau-de-bord";
    render(<TabBar userInitial="E" />);

    expect(screen.getByRole("link", { name: "Accueil" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Suivi" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ressources" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Profil" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Actions rapides" }),
    ).toBeInTheDocument();

    // Onglet actif = Accueil.
    expect(screen.getByRole("link", { name: "Accueil" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Suivi" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("le « + » ouvre la feuille (aria-expanded) avec 3 actions", async () => {
    const user = userEvent.setup();
    render(<TabBar userInitial="E" />);
    const fab = screen.getByRole("button", { name: "Actions rapides" });
    expect(fab).toHaveAttribute("aria-expanded", "false");

    await user.click(fab);
    expect(fab).toHaveAttribute("aria-expanded", "true");

    const dialog = screen.getByRole("dialog", { name: "Actions rapides" });
    expect(dialog).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /noter mon humeur/i }),
    ).toHaveAttribute("href", "/humeur");
    expect(
      screen.getByRole("link", { name: /passer un test/i }),
    ).toHaveAttribute("href", "/tests");
    expect(
      screen.getByRole("link", { name: /faire un exercice/i }),
    ).toHaveAttribute("href", "/exercices");

    // Animation gardée derrière motion-safe (neutralisée en reduced-motion).
    expect(dialog.className).toContain("motion-safe:animate-enter");
  });

  it("se ferme avec Échap et rend le focus au « + »", async () => {
    const user = userEvent.setup();
    render(<TabBar userInitial="E" />);
    const fab = screen.getByRole("button", { name: "Actions rapides" });
    await user.click(fab);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(fab).toHaveAttribute("aria-expanded", "false");
    expect(fab).toHaveFocus();
  });

  it("se ferme au clic extérieur", async () => {
    const user = userEvent.setup();
    render(<TabBar userInitial="E" />);
    await user.click(screen.getByRole("button", { name: "Actions rapides" }));
    const dialog = screen.getByRole("dialog");
    // Le voile (parent du dialog) ferme au clic.
    await user.click(dialog.parentElement as HTMLElement);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
