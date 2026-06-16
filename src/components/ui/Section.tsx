import { cn } from "@/lib/cn";

export type SectionProps = React.HTMLAttributes<HTMLElement> & {
  /** Ancre de navigation (ex. `fonctionnalites`) : rend un `id` ciblable. */
  id?: string;
};

/**
 * Section : rythme vertical généreux (les sections respirent), rendue en
 * `<section>` avec une ancre `id` optionnelle pour la navigation one-page.
 */
export function Section({ id, className, children, ...props }: SectionProps) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 py-16 sm:py-24", className)}
      {...props}
    >
      {children}
    </section>
  );
}

export default Section;
