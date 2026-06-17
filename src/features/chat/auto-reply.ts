/**
 * Réponse **simulée** du « pro » — logique PURE et testable (aucun appel
 * externe). Ce ne sont **pas** les mots d'un clinicien réel : réponses
 * scénarisées, bienveillantes, sans diagnostic.
 *
 * Garde-fou prioritaire : si le message évoque une **détresse** (idées noires,
 * envie d'en finir, se faire du mal…), on renvoie un message de soutien doux
 * avec des **ressources d'aide à jour** et on marque `flagged`.
 */

export type AutoReply = {
  content: string;
  /** Détresse détectée → afficher les ressources d'aide. */
  flagged: boolean;
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, ""); // retire les accents
}

/** Expressions de détresse (prioritaires), sans accents. */
const DISTRESS = [
  "suicide",
  "suicidaire",
  "me tuer",
  "me suicider",
  "en finir",
  "envie de mourir",
  "envie de disparaitre",
  "plus envie de vivre",
  "me faire du mal",
  "me blesser",
  "automutil",
  "je veux mourir",
  "mettre fin a mes jours",
];

/**
 * Message de soutien + ressources d'aide affiché en cas de détresse.
 * ⚠️ Ressources (France) à vérifier/maintenir à jour :
 * - 3114 : ligne nationale de prévention du suicide (gratuit, 24h/24, 7j/7).
 * - 15 (SAMU) / 112 (urgences) en cas de danger immédiat.
 */
export const DISTRESS_REPLY =
  "Je lis de la souffrance dans tes mots, et je veux que tu saches que tu n'es pas seul·e. " +
  "Je ne suis pas un service d'urgence, mais des personnes formées peuvent t'écouter tout de suite : " +
  "le 3114 (ligne nationale de prévention du suicide, gratuit, 24h/24). " +
  "En cas de danger immédiat, appelle le 15 ou le 112. En parler, c'est déjà un pas courageux.";

type Rule = { match: string[]; reply: string };

/** Règles douces par thème (reformulation + orientation), mots sans accents. */
const RULES: Rule[] = [
  {
    match: ["stress", "debord", "pression", "trop a faire"],
    reply:
      "Ça a l'air chargé en ce moment. Et si on s'accordait une vraie pause ? Un exercice de respiration peut aider à relâcher un peu la tension.",
  },
  {
    match: ["anxieu", "angoiss", "panique", "peur", "inquiet"],
    reply:
      "Merci de me confier ça. L'anxiété peut être épuisante. Poser tes pieds au sol et respirer lentement, ici et maintenant, peut apaiser la vague.",
  },
  {
    match: ["triste", "deprim", "pleur", "vide", "down", "cafard"],
    reply:
      "Je suis là, et ce que tu ressens compte. Les jours sombres sont difficiles à traverser — sois doux·ce avec toi, un petit pas à la fois.",
  },
  {
    match: ["fatigue", "epuise", "dormir", "sommeil", "creve"],
    reply:
      "Le repos n'est pas du temps perdu. Ton corps te demande peut-être de ralentir. Tu as le droit de t'écouter.",
  },
  {
    match: ["seul", "solitude", "personne", "isole"],
    reply:
      "Te sentir seul·e fait mal. Je suis là pour t'écouter, et parler à un·e proche ou un·e professionnel·le peut aussi alléger un peu.",
  },
  {
    match: ["merci", "mieux", "content", "heureux", "gratitude"],
    reply:
      "Ça me touche de te lire. Savoure ce moment, tu le mérites. Je suis là quand tu veux.",
  },
];

const DEFAULT_REPLY =
  "Merci de partager ça avec moi. Je t'écoute — raconte-moi ce qui pèse, ou ce qui t'a fait du bien aujourd'hui. Tu peux aussi essayer un exercice si tu en ressens l'envie.";

/** Vrai si le message évoque une détresse (idées noires, etc.). */
export function isDistress(message: string): boolean {
  const n = normalize(message);
  return DISTRESS.some((kw) => n.includes(kw));
}

/**
 * Calcule la réponse simulée du « pro » pour un message utilisateur. La
 * détresse est prioritaire (ressources d'aide). Sinon, règles douces par thème,
 * puis repli encourageant.
 */
export function autoReply(message: string): AutoReply {
  if (isDistress(message)) {
    return { content: DISTRESS_REPLY, flagged: true };
  }
  const n = normalize(message);
  const rule = RULES.find((r) => r.match.some((kw) => n.includes(kw)));
  return { content: rule?.reply ?? DEFAULT_REPLY, flagged: false };
}
