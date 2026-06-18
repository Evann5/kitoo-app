// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Utilisateur renvoyé par le client mocké (null = non connecté).
let mockUser: { id: string } | null = null;
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: mockUser } }) },
  }),
}));

import { updateSession } from "@/lib/supabase/middleware";

beforeEach(() => {
  mockUser = null;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
});

function request(path: string) {
  return new NextRequest(new URL(`http://localhost${path}`));
}

describe("middleware - protection des routes", () => {
  it("redirige un visiteur non connecté de /profil vers /connexion", async () => {
    const res = await updateSession(request("/profil"));
    expect(res.status).toBe(307);
    const location = res.headers.get("location")!;
    expect(location).toContain("/connexion");
    expect(location).toContain("redirect=%2Fprofil");
  });

  it("laisse passer un visiteur non connecté sur une route publique", async () => {
    const res = await updateSession(request("/connexion"));
    expect(res.headers.get("location")).toBeNull();
  });

  it("redirige un utilisateur connecté hors de /connexion vers le tableau de bord", async () => {
    mockUser = { id: "user-1" };
    const res = await updateSession(request("/connexion"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/tableau-de-bord");
  });
});
