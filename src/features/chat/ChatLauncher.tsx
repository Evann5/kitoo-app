import Link from "next/link";
import { MessageCircleHeart } from "lucide-react";
import { Card } from "@/components/ui";

/**
 * Accès au chat de soutien depuis l'accueil. Étiquette claire : échange de
 * soutien aux réponses **simulées** (démo), pour ne pas laisser croire à un
 * clinicien réel en temps réel.
 */
export function ChatLauncher() {
  return (
    <Link
      href="/chat"
      className="rounded-card block focus-visible:outline-none"
    >
      <Card className="hover:bg-ink-50 flex items-center gap-3 transition-colors">
        <span className="bg-brand-100 text-brand-700 rounded-pill flex h-11 w-11 shrink-0 items-center justify-center">
          <MessageCircleHeart aria-hidden size={22} strokeWidth={1.8} />
        </span>
        <span className="flex flex-col">
          <span className="text-body text-ink-900 font-bold">
            Échange de soutien
          </span>
          <span className="text-small text-ink-600">
            Discute avec Kitoo - réponses simulées, sans jugement.
          </span>
        </span>
      </Card>
    </Link>
  );
}

export default ChatLauncher;
