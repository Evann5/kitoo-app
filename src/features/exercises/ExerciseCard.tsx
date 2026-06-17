import Link from "next/link";
import { Wind, Anchor, Sparkles, Clock, type LucideIcon } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import type { Exercise } from "./queries";
import { formatDuration } from "./steps";

const CATEGORY_ICON: Record<string, LucideIcon> = {
  respiration: Wind,
  ancrage: Anchor,
  relaxation: Sparkles,
};

export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const Icon = CATEGORY_ICON[exercise.category] ?? Sparkles;
  return (
    <Link
      href={`/exercices/${exercise.slug}`}
      className="rounded-card block focus-visible:outline-none"
    >
      <Card className="hover:bg-ink-50 flex h-full flex-col gap-2 transition-colors">
        <div className="flex items-center gap-2">
          <span className="bg-brand-100 text-brand-700 rounded-pill flex h-9 w-9 shrink-0 items-center justify-center">
            <Icon aria-hidden size={18} strokeWidth={1.8} />
          </span>
          <Badge tone="neutral" className="capitalize">
            {exercise.category}
          </Badge>
          <span className="text-small text-ink-600 ml-auto inline-flex items-center gap-1">
            <Clock aria-hidden size={14} strokeWidth={1.8} />
            {formatDuration(exercise.duration_sec)}
          </span>
        </div>
        <h3 className="text-heading text-ink-900">{exercise.title}</h3>
        <p className="text-body text-ink-600">{exercise.description}</p>
        <span className="text-small text-brand-700 mt-auto font-bold">
          Commencer →
        </span>
      </Card>
    </Link>
  );
}

export default ExerciseCard;
