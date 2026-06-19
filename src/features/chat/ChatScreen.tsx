"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Info, RotateCcw, Send } from "lucide-react";
import { Card } from "@/components/ui";
import { ChatBubble } from "./ChatBubble";
import { sendMessage, clearConversation } from "./actions";
import { DEFAULT_QUICK_REPLIES } from "./intents";
import type { Suggestion } from "./engine";
import type { Message } from "./queries";

export type ChatScreenProps = {
  initialMessages: Message[];
};

/**
 * Écran de chat de soutien **simulé** (moteur à règles, sans IA). Étiquetage
 * clair et permanent (réponses automatiques, pas un clinicien réel ni un service
 * d'urgence) + disclaimer. Fil annoncé via `aria-live`, champ labelisé, et
 * **réponses rapides** cliquables (opérables au clavier) pour guider l'échange.
 */
export function ChatScreen({ initialMessages }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[]>(
    DEFAULT_QUICK_REPLIES,
  );
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Suit le dernier message à l'arrivée d'un nouveau (sans recharger la page).
  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [messages.length, pending]);

  /** Envoie un message (saisie libre ou réponse rapide). */
  function send(content: string) {
    if (!content || pending) return;
    setError(null);
    setDraft("");
    startTransition(async () => {
      const res = await sendMessage({ content });
      if (res.ok) {
        setMessages((prev) => [...prev, res.userMessage, res.proMessage]);
        setQuickReplies(res.quickReplies ?? []);
        setSuggestion(res.suggestion ?? null);
      } else {
        setError(res.error);
        setDraft(content);
      }
      inputRef.current?.focus();
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    send(draft.trim());
  }

  function reset() {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const res = await clearConversation();
      if (res.ok) {
        setMessages([]);
        setQuickReplies(DEFAULT_QUICK_REPLIES);
        setSuggestion(null);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* Action : repartir d'une conversation vierge. */}
      {messages.length > 0 ? (
        <div className="flex shrink-0 justify-end">
          <button
            type="button"
            onClick={reset}
            disabled={pending}
            className="text-small text-ink-600 hover:text-ink-900 inline-flex items-center gap-1.5 font-bold disabled:opacity-50"
          >
            <RotateCcw aria-hidden size={15} strokeWidth={2} />
            Nouvelle conversation
          </button>
        </div>
      ) : null}

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
          Les réponses sont <strong>automatiques et simulées</strong> : ce
          n&apos;est pas un·e clinicien·ne réel·le ni un service d&apos;urgence.
          Kitoo ne remplace pas un suivi médical professionnel. En cas de danger
          immédiat, appelle le 15 ou le 112.
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
            content="Bonjour, je suis là pour t'écouter. Mes réponses sont automatiques (démo), mais je ferai de mon mieux pour t'accompagner. Comment te sens-tu aujourd'hui ?"
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

      {/* Orientation douce (exercice / ressources / urgence). */}
      {suggestion && !pending ? (
        <Link
          href={suggestion.href}
          className="rounded-control border-brand-200 bg-brand-50 text-small text-brand-800 hover:bg-brand-100 inline-flex shrink-0 items-center justify-between gap-2 border px-4 py-2.5 font-bold"
        >
          {suggestion.label}
          <ArrowRight aria-hidden size={16} strokeWidth={2} />
        </Link>
      ) : null}

      {/* Réponses rapides (cliquables, opérables au clavier). */}
      {quickReplies.length > 0 && !pending ? (
        <div
          role="group"
          aria-label="Réponses rapides"
          className="flex shrink-0 flex-wrap gap-2"
        >
          {quickReplies.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => send(label)}
              className="rounded-pill border-ink-300 text-small text-ink-700 hover:bg-brand-100 hover:border-brand-300 min-h-[40px] border bg-white px-3.5 py-1.5 font-bold transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
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
