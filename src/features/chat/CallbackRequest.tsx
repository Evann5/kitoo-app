"use client";

import { useState, useTransition } from "react";
import { PhoneCall } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { requestCallback } from "./callback-actions";

export type CallbackRequestProps = {
  /** Une demande est-elle déjà en attente ? (préchargé serveur) */
  alreadyRequested?: boolean;
};

/**
 * Demande d'**être rappelé·e par un·e professionnel·le de santé** (médecin).
 * Démo : la demande est enregistrée (RLS), aucun appel réel n'est planifié — on
 * le dit clairement et on rappelle les ressources d'urgence. Accessible
 * (formulaire labelisé, `aria-expanded`).
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

  if (done) {
    return (
      <Card soft className="flex items-start gap-3">
        <PhoneCall
          aria-hidden
          size={20}
          strokeWidth={1.8}
          className="text-brand-700 mt-0.5 shrink-0"
        />
        <p className="text-small text-ink-700">
          <strong className="text-ink-900">Demande enregistrée.</strong> Un·e
          professionnel·le pourra te recontacter. (Démo : aucun appel réel
          n&apos;est planifié.) En cas d&apos;urgence, appelle le 3114, le 15 ou
          le 112.
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="bg-brand-100 text-brand-700 rounded-pill flex h-11 w-11 shrink-0 items-center justify-center">
          <PhoneCall aria-hidden size={22} strokeWidth={1.8} />
        </span>
        <div className="flex flex-col">
          <span className="text-body text-ink-900 font-bold">
            Être rappelé·e par un·e professionnel·le
          </span>
          <span className="text-small text-ink-600">
            Laisse une demande, un·e professionnel·le de santé pourra te
            recontacter.
          </span>
        </div>
      </div>

      {!open ? (
        <Button
          type="button"
          variant="outline"
          aria-expanded={false}
          onClick={() => setOpen(true)}
        >
          Demander à être rappelé·e
        </Button>
      ) : (
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

          <div className="flex gap-2">
            <Button type="submit" loading={pending}>
              Envoyer ma demande
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Annuler
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

export default CallbackRequest;
