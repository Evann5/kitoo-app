import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export type AuthFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  /** Message d'erreur relié au champ (rendu sous l'input). */
  error?: string;
};

/**
 * Champ de formulaire accessible : label lié, `aria-invalid` et message
 * d'erreur relié via `aria-describedby`. Corps ≥ 16px, cible tactile ≥ 44px.
 */
export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id ?? props.name;
    const errorId = error ? `${inputId}-error` : undefined;
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-small text-ink-800 font-bold">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            "rounded-control text-body text-ink-900 h-11 w-full bg-white px-4",
            "placeholder:text-ink-400 border",
            "duration-kitoo ease-kitoo transition-colors",
            error ? "border-danger" : "border-ink-300 hover:border-ink-400",
            className,
          )}
          {...props}
        />
        {error ? (
          <p id={errorId} className="text-small text-danger">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

AuthField.displayName = "AuthField";

export default AuthField;
