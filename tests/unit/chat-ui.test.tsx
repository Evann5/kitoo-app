import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { sendMock, callbackMock, clearMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
  callbackMock: vi.fn(),
  clearMock: vi.fn(),
}));
vi.mock("@/features/chat/actions", () => ({
  sendMessage: sendMock,
  clearConversation: clearMock,
}));
vi.mock("@/features/chat/callback-actions", () => ({
  requestCallback: callbackMock,
}));

import { ChatScreen } from "@/features/chat/ChatScreen";
import { ChatBubble } from "@/features/chat/ChatBubble";
import { CallbackRequest } from "@/features/chat/CallbackRequest";

beforeEach(() => {
  sendMock.mockReset();
  callbackMock.mockReset();
  clearMock.mockReset();
});

describe("ChatScreen - étiquetage & envoi", () => {
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

  it("propose des réponses rapides opérables au clavier", async () => {
    sendMock.mockResolvedValue({
      ok: true,
      userMessage: {
        id: "u1",
        sender: "user",
        content: "Je me sens stressé·e",
        flagged: false,
      },
      proMessage: {
        id: "p1",
        sender: "pro",
        content: "On respire ensemble ?",
        flagged: false,
      },
      quickReplies: [],
      suggestion: null,
    });
    const user = userEvent.setup();
    render(<ChatScreen initialMessages={[]} />);

    const group = screen.getByRole("group", { name: /réponses rapides/i });
    const chip = within(group).getByRole("button", {
      name: "Je me sens stressé·e",
    });
    // Opérable au clavier : focus puis Entrée.
    chip.focus();
    expect(chip).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(sendMock).toHaveBeenCalledWith({ content: "Je me sens stressé·e" });
    expect(
      await screen.findByText("On respire ensemble ?"),
    ).toBeInTheDocument();
  });

  it("« Nouvelle conversation » efface le fil", async () => {
    clearMock.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(
      <ChatScreen
        initialMessages={[
          {
            id: "m1",
            sender: "user",
            content: "vieux message",
            flagged: false,
          } as never,
        ]}
      />,
    );
    expect(screen.getByText("vieux message")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /nouvelle conversation/i }),
    );
    expect(clearMock).toHaveBeenCalled();
    expect(screen.queryByText("vieux message")).toBeNull();
  });
});

describe("ChatBubble - ressources de détresse", () => {
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

describe("CallbackRequest - rappel par un·e pro", () => {
  it("enregistre une demande et confirme (mention démo)", async () => {
    callbackMock.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<CallbackRequest />);

    await user.click(
      screen.getByRole("button", { name: /demander à être rappel/i }),
    );
    await user.type(screen.getByLabelText(/téléphone/i), "0612345678");
    await user.click(
      screen.getByRole("button", { name: "Envoyer ma demande" }),
    );

    expect(callbackMock).toHaveBeenCalledWith({
      phone: "0612345678",
      note: "",
    });
    expect(await screen.findByText(/demande enregistrée/i)).toBeInTheDocument();
    // Honnêteté : démo, et orientation urgence.
    expect(screen.getByText(/aucun appel réel/i)).toBeInTheDocument();
  });

  it("affiche l'état « déjà demandé » si une demande est en attente", () => {
    render(<CallbackRequest alreadyRequested />);
    expect(screen.getByText(/demande enregistrée/i)).toBeInTheDocument();
  });
});
