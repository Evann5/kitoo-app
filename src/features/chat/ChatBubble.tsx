import { Mascot } from "@/components/illustrations";

export type ChatBubbleProps = {
  sender: "user" | "pro";
  content: string;
  /** Réponse de détresse → afficher les ressources d'aide. */
  flagged?: boolean;
};

/**
 * Bulle de message accessible. `pro` à gauche (avec le koala de soutien), `user`
 * à droite. Une bulle `flagged` (détresse) ajoute des ressources d'aide
 * concrètes (3114). Le sens passe par le texte.
 */
export function ChatBubble({ sender, content, flagged }: ChatBubbleProps) {
  const isPro = sender === "pro";
  return (
    <div className={`flex items-end gap-2 ${isPro ? "" : "flex-row-reverse"}`}>
      {isPro ? (
        <Mascot
          pose="heart"
          animate={false}
          className="w-9 shrink-0"
          decorative
        />
      ) : null}
      <div
        className={
          isPro
            ? "text-ink-800 max-w-[80%] rounded-3xl rounded-bl-md bg-white px-4 py-3 shadow-sm"
            : "bg-brand-700 max-w-[80%] rounded-3xl rounded-br-md px-4 py-3 text-white"
        }
      >
        <p className="text-body whitespace-pre-line">{content}</p>
        {flagged ? (
          <a
            href="tel:3114"
            className="rounded-control bg-brand-700 text-small shadow-btn hover:bg-brand-800 mt-3 inline-flex h-11 items-center justify-center px-4 font-bold text-white"
          >
            Appeler le 3114 (24h/24, gratuit)
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default ChatBubble;
