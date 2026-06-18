import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";
import {
  ChatScreen,
  CallbackRequest,
  getConversation,
  hasPendingCallback,
} from "@/features/chat";

export const metadata: Metadata = { title: "Soutien — Kitoo" };
export const dynamic = "force-dynamic";

export default async function ChatPage() {
  await requireUser("/chat");
  const [conversation, pendingCallback] = await Promise.all([
    getConversation(),
    hasPendingCallback(),
  ]);

  return (
    <AppShell width="prose">
      {/* Pleine hauteur d'écran : seul le fil défile (input épinglé en bas). */}
      <div className="flex h-[calc(100dvh-8.5rem)] min-h-0 flex-col gap-3">
        <header className="flex shrink-0 flex-col gap-0.5">
          <h1 className="font-display text-title text-ink-900">
            Échange de soutien
          </h1>
          <p className="text-small text-ink-600">
            Un espace doux pour déposer ce que tu ressens.
          </p>
        </header>
        <div className="min-h-0 flex-1">
          <ChatScreen initialMessages={conversation?.messages ?? []} />
        </div>
      </div>
      {/* Bouton flottant : demander à être rappelé·e par un·e pro. */}
      <CallbackRequest alreadyRequested={pendingCallback} />
    </AppShell>
  );
}
