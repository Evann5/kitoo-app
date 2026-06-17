import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));
vi.mock("@/features/chat/actions", () => ({ sendMessage: sendMock }));

import { ChatScreen } from "@/features/chat/ChatScreen";
import { ChatBubble } from "@/features/chat/ChatBubble";

beforeEach(() => sendMock.mockReset());

describe("ChatScreen — étiquetage & envoi", () => {
  it("affiche l'étiquetage simulé + disclaimer et un fil annoncé", () => {
    render(<ChatScreen initialMessages={[]} />);
    expect(screen.getAllByText(/simul/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/ne remplace pas un suivi médical/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/15 ou le 112/)).toBeInTheDocument();
    // Fil avec aria-live.
    expect(screen.getByLabelText("Conversation")).toHaveAttribute(
      "aria-live",
      "polite",
    );
    // Champ labelisé.
    expect(screen.getByLabelText(/écris ton message/i)).toBeInTheDocument();
  });

  it("envoie un message et affiche la réponse simulée", async () => {
    sendMock.mockResolvedValue({
      ok: true,
      userMessage: {
        id: "u1",
        sender: "user",
        content: "bonjour",
        flagged: false,
      },
      proMessage: {
        id: "p1",
        sender: "pro",
        content: "Je t'écoute, raconte-moi.",
        flagged: false,
      },
    });
    const user = userEvent.setup();
    render(<ChatScreen initialMessages={[]} />);
    await user.type(screen.getByLabelText(/écris ton message/i), "bonjour");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(sendMock).toHaveBeenCalledWith({ content: "bonjour" });
    expect(await screen.findByText("bonjour")).toBeInTheDocument();
    expect(screen.getByText("Je t'écoute, raconte-moi.")).toBeInTheDocument();
  });
});

describe("ChatBubble — ressources de détresse", () => {
  it("ajoute le 3114 sur une bulle flagged", () => {
    render(<ChatBubble sender="pro" content="Je suis là pour toi." flagged />);
    expect(screen.getByRole("link", { name: /3114/ })).toHaveAttribute(
      "href",
      "tel:3114",
    );
  });

  it("n'affiche pas de ressource sur une bulle normale", () => {
    render(<ChatBubble sender="pro" content="Coucou" />);
    expect(screen.queryByRole("link", { name: /3114/ })).toBeNull();
  });
});
