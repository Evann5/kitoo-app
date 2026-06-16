import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));

const grantMock = vi.fn(async () => ({ ok: true as const }));
const deleteMock = vi.fn(async () => ({ ok: false as const, error: "x" }));
vi.mock("@/features/gdpr/actions", () => ({
  grantConsent: () => grantMock(),
  deleteAccount: () => deleteMock(),
  revokeConsent: vi.fn(),
}));

import { ConsentGate } from "@/features/gdpr/ConsentGate";
import { DeleteAccountDialog } from "@/features/gdpr/DeleteAccountDialog";

afterEach(() => {
  grantMock.mockClear();
  deleteMock.mockClear();
});

describe("ConsentGate", () => {
  it("explique le traitement et enregistre le consentement à l'acceptation", async () => {
    const user = userEvent.setup();
    render(<ConsentGate />);
    expect(screen.getByText(/données de santé sensibles/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /politique de confidentialité/i }),
    ).toHaveAttribute("href", "/confidentialite");

    await user.click(screen.getByRole("button", { name: /j'accepte/i }));
    expect(grantMock).toHaveBeenCalled();
  });
});

describe("DeleteAccountDialog", () => {
  it("exige une confirmation explicite avant de supprimer", async () => {
    const user = userEvent.setup();
    render(<DeleteAccountDialog />);

    await user.click(
      screen.getByRole("button", { name: /supprimer mon compte/i }),
    );

    const confirmBtn = screen.getByRole("button", {
      name: /supprimer définitivement/i,
    });
    // Désactivé tant que le mot de confirmation n'est pas saisi.
    expect(confirmBtn).toBeDisabled();
    await user.click(confirmBtn);
    expect(deleteMock).not.toHaveBeenCalled();

    await user.type(
      screen.getByLabelText(/tape .* pour confirmer/i),
      "SUPPRIMER",
    );
    expect(confirmBtn).toBeEnabled();
    await user.click(confirmBtn);
    expect(deleteMock).toHaveBeenCalled();
  });
});
