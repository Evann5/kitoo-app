/**
 * Table d'**intentions** du chatbot de soutien (moteur à règles, sans IA).
 * Données pures : chaque intention associe des **motifs** (mots-clés/racines,
 * écrits sans accents) à un **pool de réponses variées** (voix Kitoo, contenu
 * original), avec d'éventuelles **réponses rapides** (quick replies) et une
 * **suggestion** d'orientation (exercice, ressources, urgence).
 *
 * Ajouter une intention : pousser un objet dans `INTENTS`. Ajouter une réponse :
 * compléter le tableau `replies` de l'intention (l'anti-répétition s'en charge).
 * Les motifs sont comparés en minuscules et sans accents (cf. `engine.ts`).
 */

export type Suggestion = {
  /** Libellé du bouton d'orientation. */
  label: string;
  /** Lien interne (ex. `/exercices`, `/ressources`, `/urgence`). */
  href: string;
};

export type Intent = {
  id: string;
  /** Racines/expressions sans accents. Un mot du message « commençant par »
   * une racine, ou contenant une expression à espaces, compte un point. */
  patterns: string[];
  /** Réponses possibles (tirées sans répétition). */
  replies: string[];
  /** Réponses rapides proposées sous le fil (cliquables). */
  quickReplies?: string[];
  /** Orientation douce (exercice / ressources / humain). */
  suggestion?: Suggestion;
};

/** Réponses rapides par défaut (accueil, fallback) pour amorcer l'échange. */
export const DEFAULT_QUICK_REPLIES = [
  "Je me sens stressé·e",
  "J'ai du mal à dormir",
  "Je me sens seul·e",
  "J'aimerais des ressources",
];

/**
 * Intentions, de la plus spécifique à la plus générale. En cas d'égalité de
 * score, la première l'emporte (cf. `engine.ts`).
 */
export const INTENTS: Intent[] = [
  {
    id: "greeting",
    patterns: ["bonjour", "salut", "coucou", "hello", "hey", "bonsoir", "yo"],
    replies: [
      "Bonjour, je suis content·e de te lire. Comment te sens-tu en ce moment ?",
      "Coucou. Je suis là pour t'écouter, à ton rythme. Qu'est-ce qui t'amène aujourd'hui ?",
      "Salut. Prends une seconde pour toi, puis raconte-moi ce qui se passe pour toi.",
    ],
    quickReplies: DEFAULT_QUICK_REPLIES,
  },
  {
    id: "thanks",
    patterns: ["merci", "thanks", "gentil", "ca aide", "ca fait du bien"],
    replies: [
      "Ça me touche de te lire. Je suis là quand tu en as besoin.",
      "Avec plaisir. Tu peux revenir me parler quand tu veux, sans pression.",
      "Je t'en prie. Prends soin de toi, un pas après l'autre.",
    ],
  },
  {
    id: "crisis_handoff",
    patterns: [
      "parler a quelqu un",
      "parler a un humain",
      "un vrai",
      "une vraie personne",
      "un professionnel",
      "une professionnelle",
      "un psy",
      "psychologue",
      "psychiatre",
      "medecin",
      "etre rappele",
      "appeler quelqu un",
    ],
    replies: [
      "C'est une très bonne idée d'en parler à une personne formée. Tu peux contacter une ligne d'écoute, ou demander à être rappelé·e depuis cet écran.",
      "Parler à un·e professionnel·le peut vraiment aider. Je peux t'orienter vers des ressources d'écoute disponibles tout de suite.",
    ],
    quickReplies: ["Voir les ressources d'écoute", "Je me sens en danger"],
    suggestion: { label: "Ressources et lignes d'écoute", href: "/urgence" },
  },
  {
    id: "stress",
    patterns: [
      "stress",
      "stresse",
      "debord",
      "pression",
      "trop a faire",
      "surmene",
      "surcharge",
      "sous l eau",
    ],
    replies: [
      "Ça a l'air chargé en ce moment. Et si on s'accordait une vraie pause ? Quelques respirations lentes peuvent relâcher un peu la tension.",
      "Quand tout s'accumule, le corps se crispe. Tu n'as pas besoin de tout régler d'un coup, un petit pas suffit.",
      "Je t'entends. La pression peut être épuisante. On peut essayer un court exercice pour faire redescendre la tension, si tu veux.",
    ],
    quickReplies: ["Essayer un exercice", "Qu'est-ce que je peux faire ?"],
    suggestion: {
      label: "Essayer un exercice de respiration",
      href: "/exercices",
    },
  },
  {
    id: "anxiety",
    patterns: [
      "anxieu",
      "anxiete",
      "angoiss",
      "panique",
      "peur",
      "inquiet",
      "inquietude",
      "boule au ventre",
    ],
    replies: [
      "Merci de me confier ça. L'anxiété peut être épuisante. Poser tes pieds au sol et respirer lentement, ici et maintenant, peut apaiser la vague.",
      "L'anxiété anticipe un danger qui n'est pas toujours là. Une montée monte, culmine, puis redescend toujours. Tu peux la traverser.",
      "Je suis là avec toi. Essaie de nommer ce que tu vois et entends autour de toi, ça aide souvent à revenir au présent.",
    ],
    quickReplies: ["Essayer un exercice", "J'aimerais des ressources"],
    suggestion: { label: "Un exercice pour s'apaiser", href: "/exercices" },
  },
  {
    id: "sadness",
    patterns: [
      "triste",
      "deprim",
      "pleur",
      "vide",
      "cafard",
      "down",
      "malheureu",
      "mal etre",
      "le moral",
      "pas le moral",
    ],
    replies: [
      "Je suis là, et ce que tu ressens compte. Les jours sombres sont durs à traverser, sois doux·ce avec toi, un petit pas à la fois.",
      "Merci de partager ça. Tu n'as pas à forcer le sourire. Laisser de la place à ce qui pèse, c'est déjà prendre soin de toi.",
      "Ce que tu vis est lourd, et tu n'as pas à le porter seul·e. Parler, écrire, ou juste respirer un moment, tout cela compte.",
    ],
    quickReplies: ["J'aimerais des ressources", "J'aimerais en parler"],
    suggestion: { label: "Des ressources douces", href: "/ressources" },
  },
  {
    id: "sleep",
    patterns: [
      "dormir",
      "dors",
      "sommeil",
      "insomnie",
      "nuit",
      "reveil",
      "endormir",
      "je dors mal",
      "nuits difficiles",
    ],
    replies: [
      "Mal dormir, ça use. La régularité aide beaucoup : se lever à des heures proches stabilise l'horloge interne, en douceur.",
      "Le repos n'est pas du temps perdu. Une routine calme avant le coucher et moins d'écrans peuvent préparer la nuit.",
      "Quand les pensées tournent la nuit, les poser sur un carnet peut alléger. Une nuit moins bonne n'efface pas tout.",
    ],
    quickReplies: ["Voir les ressources sommeil", "Essayer un exercice"],
    suggestion: { label: "Ressources pour mieux dormir", href: "/ressources" },
  },
  {
    id: "loneliness",
    patterns: [
      "seul",
      "solitude",
      "isole",
      "abandonn",
      "personne pour",
      "personne ne",
      "delaisse",
    ],
    replies: [
      "Te sentir seul·e fait mal. Je suis là pour t'écouter, et parler à un·e proche ou un·e professionnel·le peut aussi alléger un peu.",
      "La solitude pèse lourd. Tu as fait un pas en venant écrire ici, et ça compte. Tu n'es pas aussi seul·e que ça en a l'air.",
      "Merci de me le dire. Un petit lien, un message à quelqu'un de confiance, peut parfois rouvrir une porte.",
    ],
    quickReplies: ["Parler à quelqu'un", "J'aimerais des ressources"],
    suggestion: { label: "Lignes d'écoute", href: "/urgence" },
  },
  {
    id: "anger",
    patterns: [
      "colere",
      "enerve",
      "rage",
      "furieux",
      "furax",
      "agace",
      "j en ai marre",
      "ras le bol",
      "injuste",
    ],
    replies: [
      "La colère a souvent quelque chose d'important à dire. Tu as le droit de la ressentir. Respirer un peu peut aider à ne pas être débordé·e par elle.",
      "Je t'entends. Quand ça bouillonne, bouger un peu ou poser les mots sur ce qui t'a blessé·e peut faire baisser la pression.",
      "C'est ok d'être en colère. Essayons de comprendre ce qui se cache dessous, sans te juger.",
    ],
    quickReplies: ["Essayer un exercice", "J'aimerais en parler"],
    suggestion: { label: "Un exercice pour relâcher", href: "/exercices" },
  },
  {
    id: "tired",
    patterns: [
      "fatigue",
      "epuise",
      "creve",
      "lessive",
      "plus d energie",
      "vide d energie",
      "burn",
      "a bout",
    ],
    replies: [
      "Le repos n'est pas un luxe. Ton corps te demande peut-être de ralentir, et tu as le droit de t'écouter.",
      "L'épuisement se respecte. Une vraie pause, même courte, vaut mieux que de forcer. Qu'est-ce qui pourrait t'alléger là, maintenant ?",
      "Merci de me le dire. Quand l'énergie manque, vise « suffisant » plutôt que « parfait », juste pour aujourd'hui.",
    ],
    quickReplies: ["Voir les ressources", "Essayer un exercice"],
    suggestion: { label: "Des ressources pour souffler", href: "/ressources" },
  },
  {
    id: "motivation",
    patterns: [
      "motivation",
      "demotive",
      "envie de rien",
      "abandonner",
      "decourage",
      "ca sert a rien",
      "sens a rien",
      "j y arrive pas",
      "procrastin",
    ],
    replies: [
      "Quand l'élan manque, le plus petit pas compte double. Choisis une seule micro-action, même imparfaite, et félicite-toi de l'avoir faite.",
      "Tu n'es pas paresseux·se : l'énergie va et vient. Découper en toutes petites étapes rend les choses à nouveau possibles.",
      "Avancer à ton rythme reste avancer. Une chose à la fois, et tu n'as pas à tout réussir aujourd'hui.",
    ],
    quickReplies: ["Essayer un exercice", "J'aimerais des ressources"],
    suggestion: { label: "Des ressources pour avancer", href: "/ressources" },
  },
  {
    id: "resources",
    patterns: [
      "ressource",
      "ressources",
      "article",
      "conseil",
      "lire",
      "ecouter",
      "exercice",
      "podcast",
      "video",
      "de l aide",
      "besoin d aide",
      "quoi faire",
    ],
    replies: [
      "Bonne idée. L'espace ressources réunit des articles à lire, des contenus à écouter ou regarder, et des liens utiles, à ton rythme.",
      "Je peux t'orienter : tu trouveras des ressources douces, validées par des professionnels, dans l'espace dédié.",
    ],
    quickReplies: ["Voir les ressources", "Essayer un exercice"],
    suggestion: { label: "Ouvrir l'espace ressources", href: "/ressources" },
  },
];

/**
 * Réponses de **repli** (aucune intention reconnue) : questions ouvertes,
 * variées, jamais identiques d'une fois sur l'autre (anti-répétition).
 */
export const FALLBACK_REPLIES = [
  "Merci de partager ça avec moi. Raconte-moi un peu plus : qu'est-ce qui pèse le plus en ce moment ?",
  "Je t'écoute. Si tu devais mettre un mot sur ce que tu ressens là, lequel choisirais-tu ?",
  "Je suis là pour toi. Qu'est-ce qui t'aiderait le plus maintenant : en parler, te poser, ou trouver une ressource ?",
  "D'accord. Et si tu me disais ce qui s'est passé aujourd'hui, ou ce qui t'a traversé l'esprit ?",
  "Je note ce que tu me dis. Veux-tu qu'on explore ce que tu ressens, ou que je te propose une piste douce ?",
];
