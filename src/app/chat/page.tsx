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
      <div className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h1 className="font-display text-title text-ink-900">
            Échange de soutien
          </h1>
          <p className="text-body text-ink-700">
            Un espace doux pour déposer ce que tu ressens.
          </p>
        </header>
        <CallbackRequest alreadyRequested={pendingCallback} />
        <ChatScreen initialMessages={conversation?.messages ?? []} />
      </div>
    </AppShell>
  );
}
