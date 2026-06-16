"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { deleteAccount } from "./actions";

const CONFIRM_WORD = "SUPPRIMER";

/**
 * Suppression de compte (droit à l'effacement) avec **confirmation explicite** :
 * l'utilisateur doit saisir un mot de confirmation. Action irréversible, ton
 * soutenant. Au succès, `deleteAccount` purge tout et redirige (déconnexion).
 */
export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canDelete = confirm.trim().toUpperCase() === CONFIRM_WORD;

  function handleDelete() {
    if (!canDelete) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteAccount();
      // En cas de succès, l'action redirige ; on ne reçoit un retour qu'en échec.
      if (result && !result.ok) setError(result.error);
    });
  }

  if (!open) {
    return (
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className="text-danger"
      >
        Supprimer mon compte
      </Button>
    );
  }

  return (
    <div className="border-danger/30 rounded-card bg-danger/5 flex flex-col gap-3 border p-4">
      <p className="text-body text-ink-900 font-bold">
        Supprimer définitivement ton compte ?
      </p>
      <p className="text-small text-ink-700">
        Toutes tes données (humeurs, profil, consentements) seront effacées.
        Cette action est <strong>irréversible</strong>. Si tu as juste besoin
        d&apos;une pause, tu peux simplement te déconnecter.
      </p>
      <label
        htmlFor="confirm-delete"
        className="text-small text-ink-800 font-bold"
      >
        Tape <span className="font-mono">{CONFIRM_WORD}</span> pour confirmer
      </label>
      <input
        id="confirm-delete"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        autoComplete="off"
        className="rounded-control text-body border-ink-300 text-ink-900 h-11 w-full border bg-white px-4"
      />

      {error ? (
        <p role="alert" className="text-small text-danger">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          fullWidth
          onClick={() => {
            setOpen(false);
            setConfirm("");
            setError(null);
          }}
          disabled={pending}
        >
          Annuler
        </Button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={!canDelete || pending}
          className="rounded-control bg-danger text-body inline-flex h-11 w-full items-center justify-center px-5 font-bold text-white disabled:opacity-50"
        >
          {pending ? "Suppression…" : "Supprimer définitivement"}
        </button>
      </div>
    </div>
  );
}

export default DeleteAccountDialog;
