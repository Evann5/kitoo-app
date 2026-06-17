import { describe, it, expect } from "vitest";
import { safeRedirect } from "@/features/auth";

describe("safeRedirect — anti open-redirect", () => {
  it("accepte un chemin interne", () => {
    expect(safeRedirect("/humeur")).toBe("/humeur");
    expect(safeRedirect("/ressources/abc")).toBe("/ressources/abc");
  });

  it("rejette les destinations externes vers le fallback", () => {
    expect(safeRedirect("//evil.com")).toBe("/tableau-de-bord");
    expect(safeRedirect("https://evil.com")).toBe("/tableau-de-bord");
    expect(safeRedirect("/\\evil.com")).toBe("/tableau-de-bord");
    expect(safeRedirect("evil")).toBe("/tableau-de-bord");
  });

  it("rejette les caractères de contrôle (CRLF)", () => {
    expect(safeRedirect("/a\nb")).toBe("/tableau-de-bord");
  });

  it("utilise le fallback quand la valeur est absente", () => {
    expect(safeRedirect(undefined)).toBe("/tableau-de-bord");
    expect(safeRedirect("", "/profil")).toBe("/profil");
  });
});
