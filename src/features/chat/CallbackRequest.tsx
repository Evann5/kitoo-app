"use client";

import { useState, useTransition } from "react";
import { Check, PhoneCall, X } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { requestCallback } from "./callback-actions";

export type CallbackRequestProps = {
  /** Une demande est-elle déjà en attente ? (préchargé serveur) */
  alreadyRequested?: boolean;
};

/**
 * Demande d'**être rappelé·e par un·e professionnel·le de santé** (médecin),
 * présentée comme un **bouton flottant** (coin bas-gauche) qui ouvre un petit
 * panneau. Démo : la demande est enregistrée (RLS), aucun appel réel n'est
 * planifié — on le dit clairement et on rappelle les ressources d'urgence.
 */
export function CallbackRequest({ alreadyRequested }: CallbackRequestProps) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(alreadyRequested ?? false);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await requestCallback({ phone, note });
      if (res.ok) {
        setDone(true);
        setOpen(false);
      } else {
        setError(res.error);
      }
    });
  }

  // Confirmation persistante (chip flottant) une fois la demande envoyée.
  if (done) {
    return (
      <Card
        soft
        role="status"
        className="text-small text-ink-700 fixed bottom-24 left-4 z-40 flex w-[min(22rem,calc(100vw-2rem))] items-start gap-2 shadow-lg"
      >
        <Check
          aria-hidden
          size={18}
          strokeWidth={2.4}
          className="text-brand-700 mt-0.5 shrink-0"
        />
        <span>
          <strong className="text-ink-900">Demande enregistrée.</strong> Un·e
          professionnel·le pourra te recontacter. (Démo : aucun appel réel
          n&apos;est planifié.) En cas d&apos;urgence, appelle le 3114, le 15 ou
          le 112.
        </span>
      </Card>
    );
  }

  return (
    <>
      {open ? (
        <Card
          role="dialog"
          aria-label="Être rappelé·e par un·e professionnel·le"
          className="fixed bottom-40 left-4 z-40 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-3 shadow-lg"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-body text-ink-900 font-bold">
              Être rappelé·e par un·e pro
            </span>
            <button
              type="button"
              aria-label="Fermer"
              onClick={() => setOpen(false)}
              className="text-ink-500 hover:text-ink-800 grid h-9 w-9 place-items-center rounded-full"
            >
              <X aria-hidden size={18} strokeWidth={2.4} />
            </button>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="cb-phone"
                className="text-small text-ink-800 font-bold"
              >
                Téléphone{" "}
                <span className="text-ink-600 font-normal">(facultatif)</span>
              </label>
              <input
                id="cb-phone"
                type="tel"
                inputMode="tel"
                value={phone}
                maxLength={30}
                disabled={pending}
                autoFocus
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 12 34 56 78"
                className="rounded-control text-body border-ink-300 focus-visible:border-brand-400 text-ink-900 placeholder:text-ink-400 h-12 w-full border bg-white px-4"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="cb-note"
                className="text-small text-ink-800 font-bold"
              >
                Un mot (facultatif)
              </label>
              <textarea
                id="cb-note"
                value={note}
                rows={2}
                maxLength={500}
                disabled={pending}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ce dont tu aimerais parler…"
                className="rounded-control text-body border-ink-300 focus-visible:border-brand-400 text-ink-900 placeholder:text-ink-400 min-h-[64px] w-full resize-y border bg-white px-4 py-3"
              />
            </div>

            <p className="text-small text-ink-600">
              Démo : ta demande est enregistrée mais aucun appel réel n&apos;est
              planifié. En cas d&apos;urgence, appelle le 3114, le 15 ou le 112.
            </p>

            {error ? (
              <p
                role="alert"
                className="rounded-control bg-danger/10 text-small text-danger px-4 py-2"
              >
                {error}
              </p>
            ) : null}

            <Button type="submit" fullWidth loading={pending}>
              Envoyer ma demande
            </Button>
          </form>
        </Card>
      ) : null}

      {/* Bouton flottant dans le coin. */}
      <button
        type="button"
        aria-label="Demander à être rappelé·e par un·e professionnel·le"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
        className="bg-brand-700 shadow-btn hover:bg-brand-800 fixed bottom-24 left-4 z-40 inline-flex h-14 items-center gap-2 rounded-full px-4 font-bold text-white"
      >
        <PhoneCall aria-hidden size={20} strokeWidth={2} />
        <span className="text-small">Être rappelé·e</span>
      </button>
    </>
  );
}

export default CallbackRequest;
