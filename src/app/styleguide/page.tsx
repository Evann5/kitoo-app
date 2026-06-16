import { notFound } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  Container,
  IconButton,
  MoodFace,
  Pill,
  Section,
  Tag,
} from "@/components/ui";
import { Illustration, Mascot } from "@/components/illustrations";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import type { MascotPose } from "@/lib/illustrations";
import { moods } from "@/lib/moods";

/**
 * Page de validation du design system (dev uniquement). Affiche les couleurs,
 * les primitives (tous variants) et les poses de la mascotte. Renvoie 404 en
 * production.
 */
export const metadata = {
  title: "Styleguide — Kitoo",
  robots: { index: false },
};

// Classes littérales (Tailwind ne détecte pas les noms construits dynamiquement).
const BRAND: { label: string; className: string }[] = [
  { label: "brand-50", className: "bg-brand-50" },
  { label: "brand-100", className: "bg-brand-100" },
  { label: "brand-200", className: "bg-brand-200" },
  { label: "brand-300", className: "bg-brand-300" },
  { label: "brand-400", className: "bg-brand-400" },
  { label: "brand-500", className: "bg-brand-500" },
  { label: "brand-600", className: "bg-brand-600" },
  { label: "brand-700", className: "bg-brand-700" },
  { label: "brand-800", className: "bg-brand-800" },
  { label: "brand-900", className: "bg-brand-900" },
];
const INK: { label: string; className: string }[] = [
  { label: "ink-50", className: "bg-ink-50" },
  { label: "ink-100", className: "bg-ink-100" },
  { label: "ink-200", className: "bg-ink-200" },
  { label: "ink-300", className: "bg-ink-300" },
  { label: "ink-400", className: "bg-ink-400" },
  { label: "ink-500", className: "bg-ink-500" },
  { label: "ink-600", className: "bg-ink-600" },
  { label: "ink-700", className: "bg-ink-700" },
  { label: "ink-800", className: "bg-ink-800" },
  { label: "ink-900", className: "bg-ink-900" },
];
const POSES: MascotPose[] = [
  "classic",
  "crying",
  "sleeping",
  "soda",
  "bubble-tea",
  "sunglasses",
  "skating",
  "heart",
];

function Swatch({ label, className }: { label: string; className: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className={`rounded-card h-14 w-full shadow-sm ${className}`} />
      <span className="text-small text-ink-600">{label}</span>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <Container className="py-12">
      <header className="mb-12">
        <Pill>design system</Pill>
        <h1 className="font-display text-display text-ink-900 mt-3">
          Styleguide Kitoo
        </h1>
        <p className="text-body text-ink-600 mt-2 max-w-prose">
          Validation visuelle des tokens, primitives et illustrations. Cette
          page n&apos;est pas exposée en production.
        </p>
      </header>

      {/* Couleurs */}
      <Section className="!py-8">
        <h2 className="font-display text-title text-ink-900 mb-4">Couleurs</h2>
        <p className="text-small text-ink-700 mb-2 font-bold">
          Pervenche (brand)
        </p>
        <div className="mb-6 grid grid-cols-5 gap-3 sm:grid-cols-10">
          {BRAND.map((s) => (
            <Swatch key={s.label} label={s.label} className={s.className} />
          ))}
        </div>
        <p className="text-small text-ink-700 mb-2 font-bold">Encre (ink)</p>
        <div className="mb-6 grid grid-cols-5 gap-3 sm:grid-cols-10">
          {INK.map((s) => (
            <Swatch key={s.label} label={s.label} className={s.className} />
          ))}
        </div>
        <p className="text-small text-ink-700 mb-2 font-bold">
          Humeur & sémantique
        </p>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          <Swatch label="mood++" className="bg-mood-very-positive" />
          <Swatch label="mood+" className="bg-mood-positive" />
          <Swatch label="mood=" className="bg-mood-neutral" />
          <Swatch label="mood-" className="bg-mood-negative" />
          <Swatch label="mood--" className="bg-mood-very-negative" />
          <Swatch label="success" className="bg-success" />
          <Swatch label="warning" className="bg-warning" />
          <Swatch label="danger" className="bg-danger" />
        </div>
      </Section>

      {/* Typographie */}
      <Section className="!py-8">
        <h2 className="font-display text-title text-ink-900 mb-4">
          Typographie
        </h2>
        <div className="space-y-2">
          <p className="font-display text-display text-ink-900">
            Display — Goodly
          </p>
          <p className="font-display text-title text-ink-900">Titre 24px</p>
          <p className="text-heading text-ink-900">Heading 16/700</p>
          <p className="text-body text-ink-900">
            Corps 16px (Nunito) — jamais sous 16px (WCAG). Le quotidien de
            Kitoo.
          </p>
          <p className="text-small text-ink-600">Small 13px — libellés</p>
          <p className="font-dyslexia text-body text-ink-900">
            Mode dyslexie (Atkinson Hyperlegible)
          </p>
        </div>
      </Section>

      {/* Boutons */}
      <Section className="!py-8">
        <h2 className="font-display text-title text-ink-900 mb-4">Boutons</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button loading>Chargement</Button>
          <Button disabled>Désactivé</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <IconButton aria-label="Ajouter" variant="solid">
            <PlusIcon />
          </IconButton>
          <IconButton aria-label="Ajouter" variant="outline">
            <PlusIcon />
          </IconButton>
          <IconButton aria-label="Ajouter" variant="ghost">
            <PlusIcon />
          </IconButton>
        </div>
      </Section>

      {/* Tags, badges, pills */}
      <Section className="!py-8">
        <h2 className="font-display text-title text-ink-900 mb-4">
          Tags · Badges · Pills
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Tag>Filtre</Tag>
          <Tag selected>Sélectionné</Tag>
          <Badge tone="brand">brand</Badge>
          <Badge tone="neutral">neutral</Badge>
          <Badge tone="success">success</Badge>
          <Badge tone="warning">warning</Badge>
          <Badge tone="danger">danger</Badge>
          <Pill>pill lavande</Pill>
        </div>
      </Section>

      {/* Cartes */}
      <Section className="!py-8">
        <h2 className="font-display text-title text-ink-900 mb-4">Cartes</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h3 className="text-heading text-ink-900">Carte blanche</h3>
            <p className="text-body text-ink-600 mt-1">
              Rayon 22px, ombre douce teintée lavande.
            </p>
          </Card>
          <Card soft>
            <h3 className="text-heading text-ink-900">Carte douce</h3>
            <p className="text-body text-ink-600 mt-1">
              Surface brume lavande pour le contenu apaisant.
            </p>
          </Card>
        </div>
      </Section>

      {/* Humeurs */}
      <Section className="!py-8">
        <h2 className="font-display text-title text-ink-900 mb-4">
          Visages d&apos;humeur
        </h2>
        <div className="flex flex-wrap items-end gap-6">
          {moods.map((m) => (
            <div key={m.level} className="flex flex-col items-center gap-2">
              <MoodFace level={m.level} size={56} />
              <span className="text-small text-ink-600">{m.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Mascotte */}
      <Section className="!py-8">
        <h2 className="font-display text-title text-ink-900 mb-4">
          Mascotte — poses
        </h2>
        <Stagger
          as="ul"
          className="grid grid-cols-2 gap-6 sm:grid-cols-4"
          margin="0px"
        >
          {POSES.map((pose) => (
            <StaggerItem as="li" key={pose}>
              <Card className="flex flex-col items-center gap-2">
                <Mascot pose={pose} animate={false} className="w-28" />
                <span className="text-small text-ink-600">{pose}</span>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* Illustrations / fallback */}
      <Section className="!py-8">
        <h2 className="font-display text-title text-ink-900 mb-4">
          Illustrations · fallback placeholder
        </h2>
        <Reveal className="grid max-w-md gap-6 sm:grid-cols-2">
          <div>
            <Illustration name="kitoo-heart" className="w-40" />
            <p className="text-small text-ink-600 mt-2">
              asset réel (kitoo-heart)
            </p>
          </div>
          <div>
            <Illustration name="blob-soft" className="w-40" />
            <p className="text-small text-ink-600 mt-2">
              fallback placeholder (blob-soft absent)
            </p>
          </div>
        </Reveal>
      </Section>
    </Container>
  );
}
