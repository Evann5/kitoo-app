import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// --- Mocks ---
const replace = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh, push: vi.fn() }),
}));

const signInWithPassword = vi.fn();
const signUp = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { signInWithPassword, signUp } }),
}));

import { AuthForm } from "@/features/auth/AuthForm";

beforeEach(() => {
  replace.mockReset();
  refresh.mockReset();
  signInWithPassword.mockReset();
  signUp.mockReset();
});

describe("AuthForm — inscription : validation", () => {
  it("affiche des erreurs reliées aux champs et n'appelle pas Supabase", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);

    await user.type(screen.getByLabelText("Adresse email"), "pas-un-email");
    await user.type(screen.getByLabelText("Mot de passe"), "court");
    await user.type(
      screen.getByLabelText("Confirme ton mot de passe"),
      "court",
    );
    await user.click(screen.getByRole("button", { name: "Créer mon compte" }));

    const emailInput = screen.getByLabelText("Adresse email");
    const passwordInput = screen.getByLabelText("Mot de passe");

    // aria-invalid posé + message relié via aria-describedby.
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    const emailErrorId = emailInput.getAttribute("aria-describedby")!;
    expect(document.getElementById(emailErrorId)).toHaveTextContent(
      /email n'est pas valide/i,
    );

    expect(passwordInput).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText(/au moins 8 caractères/i)).toBeInTheDocument();

    expect(signUp).not.toHaveBeenCalled();
  });
});

describe("AuthForm — connexion", () => {
  it("appelle le client Supabase et affiche une erreur générique d'identifiants", async () => {
    signInWithPassword.mockResolvedValue({
      data: {},
      error: { message: "Invalid login credentials" },
    });
    const user = userEvent.setup();
    render(<AuthForm mode="signin" />);

    await user.type(screen.getByLabelText("Adresse email"), "toi@exemple.fr");
    await user.type(screen.getByLabelText("Mot de passe"), "motdepasse1");
    await user.click(screen.getByRole("button", { name: "Me connecter" }));

    await waitFor(() =>
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: "toi@exemple.fr",
        password: "motdepasse1",
      }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email ou mot de passe incorrect.",
    );
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirige après une connexion réussie", async () => {
    signInWithPassword.mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();
    render(<AuthForm mode="signin" redirectTo="/profil" />);

    await user.type(screen.getByLabelText("Adresse email"), "toi@exemple.fr");
    await user.type(screen.getByLabelText("Mot de passe"), "motdepasse1");
    await user.click(screen.getByRole("button", { name: "Me connecter" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/profil"));
    expect(refresh).toHaveBeenCalled();
  });
});
