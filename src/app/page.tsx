import { siteConfig } from "@/lib/site-config";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        {siteConfig.name} — application
      </h1>
      <p className="text-base text-zinc-500">en construction</p>
      {siteConfig.marketingUrl ? (
        <a
          href={siteConfig.marketingUrl}
          className="mt-2 text-sm underline underline-offset-4"
        >
          ← Retour au site
        </a>
      ) : null}
    </main>
  );
}
