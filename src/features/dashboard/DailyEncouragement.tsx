import { Card } from "@/components/ui";
import { Mascot } from "@/components/illustrations";

export type DailyEncouragementProps = {
  /** Phrase du jour (sélectionnée côté serveur pour éviter tout décalage). */
  message: string;
};

/**
 * « Mot du jour de Kitoo » : une courte phrase bienveillante avec le koala en
 * petit. Purement encourageant, jamais culpabilisant.
 */
export function DailyEncouragement({ message }: DailyEncouragementProps) {
  return (
    <section aria-labelledby="word-title" className="flex flex-col gap-3">
      <h2 id="word-title" className="font-display text-title text-ink-900">
        Le mot du jour de Kitoo
      </h2>
      <Card className="flex items-center gap-4">
        <Mascot pose="heart" animate={false} className="w-16 shrink-0" />
        <p className="text-body text-ink-800">{message}</p>
      </Card>
    </section>
  );
}

export default DailyEncouragement;
