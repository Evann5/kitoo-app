import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

let pathname = "/tableau-de-bord";
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

import { ChatFab } from "@/components/chat/ChatFab";

function fab() {
  return screen.queryByRole("link", { name: "Ouvrir l'échange de soutien" });
}

describe("ChatFab — affichage conditionnel", () => {
  it("est présent sur accueil, suivi, ressources, urgence", () => {
    for (const p of [
      "/tableau-de-bord",
      "/suivi",
      "/ressources",
      "/ressources/abc",
      "/urgence",
    ]) {
      pathname = p;
      const { unmount } = render(<ChatFab />);
      expect(fab(), p).not.toBeNull();
      unmount();
    }
  });

  it("est absent sur profil, exercices, tests, humeur (et sous-routes)", () => {
    for (const p of [
      "/profil",
      "/exercices",
      "/exercices/respiration-478",
      "/tests",
      "/tests/who5",
      "/humeur",
      "/chat",
      "/",
    ]) {
      pathname = p;
      const { unmount } = render(<ChatFab />);
      expect(fab(), p).toBeNull();
      unmount();
    }
  });

  it("ouvre /chat, cible accessible, animation neutralisable", () => {
    pathname = "/tableau-de-bord";
    render(<ChatFab />);
    const el = fab();
    expect(el).toHaveAttribute("href", "/chat");
    expect(el?.className).toContain("motion-safe:animate-enter");
  });
});
