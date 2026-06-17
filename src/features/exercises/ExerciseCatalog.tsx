import { ExerciseCard } from "./ExerciseCard";
import type { Exercise } from "./queries";

/** Catalogue d'exercices : liste sémantique de cartes (état vide doux). */
export function ExerciseCatalog({ exercises }: { exercises: Exercise[] }) {
  if (exercises.length === 0) {
    return (
      <p className="text-body rounded-card bg-brand-50 text-ink-600 px-4 py-6 text-center">
        De nouveaux exercices arriveront bientôt.
      </p>
    );
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {exercises.map((exercise) => (
        <li key={exercise.id}>
          <ExerciseCard exercise={exercise} />
        </li>
      ))}
    </ul>
  );
}

export default ExerciseCatalog;
