export type GreetingProps = {
  greeting: string;
  /** Prénom de l'utilisateur, ou null (salutation sans prénom). */
  name: string | null;
  dateLabel: string;
};

/**
 * Salutation contextuelle + date du jour. Le `greeting` et `dateLabel` sont
 * calculés côté serveur (évite tout décalage d'hydratation).
 */
export function Greeting({ greeting, name, dateLabel }: GreetingProps) {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="font-display text-title text-ink-900">
        {greeting}
        {name ? `, ${name}` : ""}
      </h1>
      <p className="text-small text-ink-500 capitalize">{dateLabel}</p>
    </header>
  );
}

export default Greeting;
