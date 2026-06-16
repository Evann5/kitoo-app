import { cn } from "@/lib/cn";

export type PillProps = React.HTMLAttributes<HTMLSpanElement>;

/**
 * Pill : étiquette arrondie (rayon 999px), surface lavande douce.
 * Usage : libellés courts non interactifs (« Pill / tag » du DS).
 */
export function Pill({ className, ...props }: PillProps) {
  return (
    <span
      className={cn(
        "rounded-pill bg-brand-100 text-small text-brand-700 inline-flex items-center px-3 py-1 font-bold",
        className,
      )}
      {...props}
    />
  );
}

export default Pill;
