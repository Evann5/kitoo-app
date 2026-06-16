import Image from "next/image";
import { Button } from "@/components/ui";
import { Mascot, Blob } from "@/components/illustrations";
import { siteConfig } from "@/lib/site-config";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      <Blob className="pointer-events-none absolute -top-16 -right-24 -z-10 w-[460px] opacity-70" />
      <Blob className="pointer-events-none absolute -bottom-24 -left-24 -z-10 w-[420px] opacity-60" />

      <Image
        src="/kitoo-logo.png"
        alt=""
        aria-hidden
        width={64}
        height={64}
        priority
        className="mb-6 h-16 w-16"
      />

      <Mascot pose="classic" priority className="mb-8 w-56 max-w-[60vw]" />

      <h1 className="font-display text-display text-ink-900">
        {siteConfig.name}
      </h1>
      <p className="text-body text-ink-600 mt-3 max-w-prose">
        Ton compagnon bien-être, pour suivre ton humeur en douceur.
      </p>

      <div className="mt-8">
        <Button size="lg">Commencer</Button>
      </div>
    </main>
  );
}
