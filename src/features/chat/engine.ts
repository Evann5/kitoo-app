/**
 * Moteur de réponse du chatbot de soutien **à règles** (aucune IA, aucun appel
 * externe). Fonction PURE et déterministe `getReply(message, state)`.
 *
 * Pipeline :
 *  1. **Crise prioritaire** : si le message évoque une détresse (`crisis.ts`),
 *     on renvoie immédiatement le message de soutien + ressources d'urgence,
 *     avant toute autre intention.
 *  2. **Normalisation** : minuscules, sans accents, tokenisation.
 *  3. **Score d'intention** : chaque intention marque un point par motif présent
 *     (racine de mot ou expression). La meilleure l'emporte (égalité → ordre de
 *     `INTENTS`).
 *  4. **Anti-répétition** : on tire dans le pool de réponses une phrase **non
 *     présente** dans l'historique récent (rotation déterministe sinon).
 *  5. **Réponse réflexive** : pour le repli, on peut reprendre un fragment du
 *     message (effet « je t'ai entendu·e »).
 *  6. **Fallback varié** : si aucune intention, question ouverte + quick replies,
 *     jamais deux fois la même phrase d'affilée.
 *
 * Déterministe ⇒ entièrement testable (pas de hasard ; la variété vient de
 * l'historique passé en `state`).
 */

import { isCrisis, CRISIS_REPLY, normalize } from "./crisis";
import {
  INTENTS,
  FALLBACK_REPLIES,
  DEFAULT_QUICK_REPLIES,
  type Suggestion,
} from "./intents";

export type { Suggestion } from "./intents";

export type ChatState = {
  /** Contenus des dernières réponses du bot (anti-répétition). */
  recentReplies?: string[];
};

export type ChatReply = {
  reply: string;
  quickReplies: string[];
  suggestion: Suggestion | null;
  /** Détresse détectée → la bulle affiche les ressources d'aide. */
  flagged: boolean;
  /** Id de l'intention retenue (`crisis`, `fallback`, ou un id d'`INTENTS`). */
  intent: string;
};

/** Réponses rapides proposées en situation de crise (orientation douce). */
const CRISIS_QUICK_REPLIES = [
  "Je veux juste parler",
  "J'aimerais des ressources",
];

/** Découpe une chaîne normalisée en mots (tokens alphanumériques). */
function tokenize(norm: string): string[] {
  return norm.split(/[^a-z0-9]+/).filter(Boolean);
}

/** Score d'une intention : +1 par motif présent (expression ou racine de mot). */
function scoreIntent(
  norm: string,
  tokens: string[],
  patterns: string[],
): number {
  let score = 0;
  for (const p of patterns) {
    if (p.includes(" ")) {
      if (norm.includes(p)) score += 1;
    } else if (tokens.some((t) => t === p || t.startsWith(p))) {
      score += 1;
    }
  }
  return score;
}

/**
 * Tire une réponse du pool en évitant les `recent`. `prefix` (optionnel) permet
 * d'ajouter une amorce réflexive sans casser l'anti-répétition.
 */
function pickVaried(pool: string[], recent: string[], prefix = ""): string {
  const make = (base: string) => (prefix ? `${prefix} ${base}` : base);
  for (const base of pool) {
    const candidate = make(base);
    if (!recent.includes(candidate)) return candidate;
  }
  // Tout le pool a servi récemment : rotation déterministe.
  return make(pool[recent.length % pool.length]);
}

/**
 * Amorce réflexive : reprend un court fragment du message pour montrer qu'il a
 * été entendu. Vide pour les messages trop courts ou trop longs (évite le
 * perroquet maladroit).
 */
export function reflect(message: string): string {
  const cleaned = message.trim().replace(/\s+/g, " ");
  const words = cleaned.split(" ");
  if (words.length < 3 || cleaned.length > 140) return "";
  const fragment = words.slice(0, 8).join(" ");
  return `Tu me dis : « ${fragment}… ».`;
}

/**
 * Calcule la réponse du bot pour un message utilisateur, en fonction de l'état
 * récent (anti-répétition). Voir le pipeline en tête de fichier.
 */
export function getReply(message: string, state: ChatState = {}): ChatReply {
  const recent = state.recentReplies ?? [];

  // 1. Crise : toujours prioritaire.
  if (isCrisis(message)) {
    return {
      reply: CRISIS_REPLY,
      quickReplies: CRISIS_QUICK_REPLIES,
      suggestion: { label: "Ressources et lignes d'écoute", href: "/urgence" },
      flagged: true,
      intent: "crisis",
    };
  }

  // 2–3. Normalisation + meilleure intention.
  const norm = normalize(message);
  const tokens = tokenize(norm);
  let best: (typeof INTENTS)[number] | null = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    const score = scoreIntent(norm, tokens, intent.patterns);
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  // 4. Intention reconnue → réponse variée + orientation.
  if (best) {
    return {
      reply: pickVaried(best.replies, recent),
      quickReplies: best.quickReplies ?? DEFAULT_QUICK_REPLIES,
      suggestion: best.suggestion ?? null,
      flagged: false,
      intent: best.id,
    };
  }

  // 5–6. Fallback réflexif et varié.
  return {
    reply: pickVaried(FALLBACK_REPLIES, recent, reflect(message)),
    quickReplies: DEFAULT_QUICK_REPLIES,
    suggestion: null,
    flagged: false,
    intent: "fallback",
  };
}
