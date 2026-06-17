/**
 * Tests standardisés — définitions et **scoring officiel** de chaque échelle.
 * Module PUR (aucun accès DB) : importable côté client comme serveur.
 *
 * Principe : ces tests **orientent**, ils ne **diagnostiquent pas**.
 *
 * Sources des versions françaises (instruments libres d'usage) :
 * - PHQ-9 & GAD-7 : Spitzer, Kroenke, Williams — Pfizer (phqscreeners.com),
 *   domaine public. Réponses sur 2 semaines, 0–3.
 * - PSS-10 : Cohen S. (1983), Perceived Stress Scale ; items inversés 4,5,7,8.
 * - WHO-5 : Index de bien-être de l'OMS (WHO-5, 1998), score brut 0–25 ×4 = 0–100.
 */

export type ScaleKey = "phq9" | "gad7" | "pss10" | "who5";

export type SeverityTone = "ok" | "mild" | "moderate" | "high";
export type Severity = { label: string; tone: SeverityTone };

export type ResponseOption = { label: string; value: number };

export type ScaleDefinition = {
  key: ScaleKey;
  title: string;
  shortTitle: string;
  /** À quoi sert l'échelle, en une phrase douce et tutoyée. */
  summary: string;
  /** Consigne / question commune aux items. */
  instruction: string;
  source: string;
  options: ResponseOption[];
  items: string[];
  /** Indices (0-based) des items inversés (PSS-10). */
  reverseItems?: number[];
  /** Indice (0-based) de l'item sensible (PHQ-9 → 8). */
  flaggedIndex?: number;
  /** Score plus bas = vigilance (WHO-5), présenté positivement. */
  positive?: boolean;
  maxScore: number;
  scoreOf: (answers: number[]) => number;
  severityOf: (score: number) => Severity;
};

// Échelle de fréquence PHQ-9 / GAD-7 (2 dernières semaines).
const FREQ_0_3: ResponseOption[] = [
  { label: "Jamais", value: 0 },
  { label: "Plusieurs jours", value: 1 },
  { label: "Plus de la moitié des jours", value: 2 },
  { label: "Presque tous les jours", value: 3 },
];

const sum = (a: number[]) => a.reduce((s, v) => s + (Number(v) || 0), 0);

const phq9: ScaleDefinition = {
  key: "phq9",
  title: "Humeur (PHQ-9)",
  shortTitle: "PHQ-9",
  summary: "Un point sur ton moral ces deux dernières semaines.",
  instruction:
    "Au cours des 2 dernières semaines, à quelle fréquence as-tu été gêné·e par :",
  source: "PHQ-9 — Spitzer/Kroenke/Williams, Pfizer (domaine public)",
  options: FREQ_0_3,
  items: [
    "Peu d'intérêt ou de plaisir à faire les choses",
    "Te sentir triste, déprimé·e ou désespéré·e",
    "Difficultés à t'endormir, à rester endormi·e, ou trop dormir",
    "Te sentir fatigué·e ou avoir peu d'énergie",
    "Avoir peu d'appétit ou manger trop",
    "Avoir une mauvaise opinion de toi-même — sentiment d'être nul·le ou d'avoir déçu tes proches",
    "Avoir du mal à te concentrer (lecture, télévision…)",
    "Bouger ou parler si lentement que les autres l'ont remarqué — ou au contraire être agité·e au point de bouger beaucoup plus que d'habitude",
    "Penser qu'il vaudrait mieux être mort·e, ou penser à te faire du mal d'une manière ou d'une autre",
  ],
  flaggedIndex: 8,
  maxScore: 27,
  scoreOf: sum,
  severityOf: (s) =>
    s <= 4
      ? { label: "Minimal", tone: "ok" }
      : s <= 9
        ? { label: "Léger", tone: "mild" }
        : s <= 14
          ? { label: "Modéré", tone: "moderate" }
          : s <= 19
            ? { label: "Modérément marqué", tone: "high" }
            : { label: "Marqué", tone: "high" },
};

const gad7: ScaleDefinition = {
  key: "gad7",
  title: "Anxiété (GAD-7)",
  shortTitle: "GAD-7",
  summary: "Un point sur ton anxiété ces deux dernières semaines.",
  instruction:
    "Au cours des 2 dernières semaines, à quelle fréquence as-tu été gêné·e par :",
  source: "GAD-7 — Spitzer/Kroenke/Williams/Löwe, Pfizer (domaine public)",
  options: FREQ_0_3,
  items: [
    "Te sentir nerveux·se, anxieux·se ou tendu·e",
    "Ne pas pouvoir arrêter de t'inquiéter ou contrôler tes inquiétudes",
    "T'inquiéter trop à propos de différentes choses",
    "Avoir du mal à te détendre",
    "Être si agité·e qu'il est difficile de rester en place",
    "Devenir facilement contrarié·e ou irritable",
    "Avoir peur que quelque chose d'horrible puisse arriver",
  ],
  maxScore: 21,
  scoreOf: sum,
  severityOf: (s) =>
    s <= 4
      ? { label: "Minimal", tone: "ok" }
      : s <= 9
        ? { label: "Léger", tone: "mild" }
        : s <= 14
          ? { label: "Modéré", tone: "moderate" }
          : { label: "Marqué", tone: "high" },
};

// PSS-10 : fréquence sur le dernier mois (0–4).
const FREQ_0_4: ResponseOption[] = [
  { label: "Jamais", value: 0 },
  { label: "Presque jamais", value: 1 },
  { label: "Parfois", value: 2 },
  { label: "Assez souvent", value: 3 },
  { label: "Très souvent", value: 4 },
];

const pss10: ScaleDefinition = {
  key: "pss10",
  title: "Stress perçu (PSS-10)",
  shortTitle: "PSS-10",
  summary: "Comment tu as vécu le stress au cours du dernier mois.",
  instruction:
    "Au cours du dernier mois, à quelle fréquence t'es-tu senti·e ou as-tu :",
  source: "PSS-10 — Cohen, S. (1983), Perceived Stress Scale",
  options: FREQ_0_4,
  items: [
    "été bouleversé·e par un événement inattendu",
    "senti que tu ne pouvais pas contrôler les choses importantes de ta vie",
    "senti nerveux·se ou stressé·e",
    "senti confiant·e dans ta capacité à gérer tes problèmes personnels",
    "senti que les choses allaient comme tu le voulais",
    "trouvé que tu ne pouvais pas faire face à tout ce que tu devais faire",
    "réussi à maîtriser ton irritabilité",
    "senti que tu maîtrisais la situation",
    "été irrité·e par des choses hors de ton contrôle",
    "senti les difficultés s'accumuler au point de ne pas pouvoir les surmonter",
  ],
  reverseItems: [3, 4, 6, 7], // items 4,5,7,8 (1-based)
  maxScore: 40,
  scoreOf: (a) =>
    a.reduce((s, v, i) => {
      const val = Number(v) || 0;
      return s + ([3, 4, 6, 7].includes(i) ? 4 - val : val);
    }, 0),
  severityOf: (s) =>
    s <= 13
      ? { label: "Faible", tone: "ok" }
      : s <= 26
        ? { label: "Modéré", tone: "moderate" }
        : { label: "Élevé", tone: "high" },
};

// WHO-5 : bien-être sur 2 semaines (0–5), score brut ×4.
const WELLBEING_0_5: ResponseOption[] = [
  { label: "Tout le temps", value: 5 },
  { label: "La plupart du temps", value: 4 },
  { label: "Plus de la moitié du temps", value: 3 },
  { label: "Moins de la moitié du temps", value: 2 },
  { label: "De temps en temps", value: 1 },
  { label: "Jamais", value: 0 },
];

const who5: ScaleDefinition = {
  key: "who5",
  title: "Bien-être (WHO-5)",
  shortTitle: "WHO-5",
  summary:
    "Un regard positif sur ton bien-être de ces deux dernières semaines.",
  instruction: "Au cours des 2 dernières semaines :",
  source: "WHO-5 — Index de bien-être de l'OMS (1998)",
  options: WELLBEING_0_5,
  items: [
    "Je me suis senti·e bien et de bonne humeur",
    "Je me suis senti·e calme et détendu·e",
    "Je me suis senti·e actif·ve et plein·e d'énergie",
    "Je me suis réveillé·e en me sentant frais·che et reposé·e",
    "Ma vie quotidienne a été remplie de choses qui m'intéressent",
  ],
  positive: true,
  maxScore: 100,
  scoreOf: (a) => sum(a) * 4, // brut 0–25 → 0–100
  severityOf: (s) =>
    s > 50
      ? { label: "Plutôt bon", tone: "ok" }
      : s > 28
        ? { label: "À surveiller en douceur", tone: "moderate" }
        : { label: "Prends soin de toi", tone: "high" },
};

export const SCALES: Record<ScaleKey, ScaleDefinition> = {
  phq9,
  gad7,
  pss10,
  who5,
};

export const SCALE_ORDER: ScaleKey[] = ["who5", "phq9", "gad7", "pss10"];

export function isScaleKey(value: string): value is ScaleKey {
  return (
    value === "phq9" ||
    value === "gad7" ||
    value === "pss10" ||
    value === "who5"
  );
}

/** Résultat calculé d'une passation. */
export type ScaleResult = {
  score: number;
  severity: Severity;
  flagged: boolean;
};

/**
 * Calcule le résultat d'une échelle : score officiel, sévérité, et `flagged`
 * (item sensible du PHQ-9 strictement positif). Valide la forme des réponses.
 */
export function computeResult(key: ScaleKey, answers: number[]): ScaleResult {
  const def = SCALES[key];
  const max = Math.max(...def.options.map((o) => o.value));
  const clean = def.items.map((_, i) => {
    const v = Number(answers[i]);
    return Number.isFinite(v) ? Math.max(0, Math.min(max, Math.round(v))) : 0;
  });
  const score = def.scoreOf(clean);
  const flagged =
    def.flaggedIndex !== undefined ? (clean[def.flaggedIndex] ?? 0) > 0 : false;
  return { score, severity: def.severityOf(score), flagged };
}
