"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Info, Send } from "lucide-react";
import { Card } from "@/components/ui";
import { ChatBubble } from "./ChatBubble";
import { sendMessage } from "./actions";
import type { Message } from "./queries";

export type ChatScreenProps = {
  initialMessages: Message[];
};

/**
 * Écran de chat de soutien **simulé**. Étiquetage clair et permanent (réponses
 * de démonstration, pas un clinicien réel ni un service d'urgence) + disclaimer.
 * Fil annoncé via `aria-live`, champ de saisie labelisé, opérable au clavier.
 */
export function ChatScreen({ initialMessages }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Suit le dernier message à l'arrivée d'un nouveau (sans recharger la page).
  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [messages.length, pending]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || pending) return;
    setError(null);
    setDraft("");
    startTransition(async () => {
      const res = await sendMessage({ content });
      if (res.ok) {
        setMessages((prev) => [...prev, res.userMessage, res.proMessage]);
      } else {
        setError(res.error);
        setDraft(content);
      }
      inputRef.current?.focus();
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* Étiquetage permanent : nature simulée + disclaimer. */}
      <Card
        soft
        role="note"
        className="text-small text-ink-700 flex shrink-0 items-start gap-2"
      >
        <Info
          aria-hidden
          size={18}
          strokeWidth={2}
          className="mt-0.5 shrink-0"
        />
        <span>
          <strong className="text-ink-900">Échange de soutien - démo.</strong>{" "}
          Les réponses sont <strong>simulées</strong> : ce n&apos;est pas un·e
          clinicien·ne réel·le ni un service d&apos;urgence. Kitoo ne remplace
          pas un suivi médical professionnel. En cas de danger immédiat, appelle
          le 15 ou le 112.
        </span>
      </Card>

      {/* Fil de messages (annoncé aux lecteurs d'écran). */}
      <div
        aria-live="polite"
        aria-label="Conversation"
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1"
      >
        {messages.length === 0 ? (
          <ChatBubble
            sender="pro"
            content="Bonjour, je suis là pour t'écouter. Souviens-toi : mes réponses sont simulées (démo). Comment te sens-tu aujourd'hui ?"
          />
        ) : (
          messages.map((m) => (
            <ChatBubble
              key={m.id}
              sender={m.sender === "pro" ? "pro" : "user"}
              content={m.content}
              flagged={m.flagged}
            />
          ))
        )}
        {pending ? (
          <p className="text-small text-ink-500 pl-11">Kitoo répond…</p>
        ) : null}
        <div ref={endRef} />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-control bg-danger/10 text-small text-danger px-4 py-3"
        >
          {error}
        </p>
      ) : null}

      {/* Saisie (épinglée en bas). */}
      <form onSubmit={submit} className="flex shrink-0 items-end gap-2">
        <label htmlFor="chat-input" className="sr-only">
          Écris ton message
        </label>
        <input
          id="chat-input"
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={2000}
          disabled={pending}
          placeholder="Écris ce que tu ressens…"
          className="rounded-control text-body border-ink-300 hover:border-ink-400 focus-visible:border-brand-400 text-ink-900 placeholder:text-ink-400 h-12 min-h-[44px] flex-1 border bg-white px-4"
        />
        <button
          type="submit"
          aria-label="Envoyer"
          disabled={pending || draft.trim().length === 0}
          className="bg-brand-700 shadow-btn hover:bg-brand-800 grid h-12 w-12 shrink-0 place-items-center rounded-full text-white disabled:opacity-50"
        >
          <Send aria-hidden size={20} strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}

export default ChatScreen;
