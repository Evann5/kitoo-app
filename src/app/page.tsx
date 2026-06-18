import Image from "next/image";
import { Button, Container } from "@/components/ui";
import { Blob } from "@/components/illustrations";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/lib/site-config";

export default function Home() {
  return (
    <>
      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
        <Blob className="pointer-events-none absolute -top-16 -right-24 -z-10 w-[460px] opacity-70" />
        <Blob className="pointer-events-none absolute -bottom-24 -left-24 -z-10 w-[420px] opacity-60" />

        {/* Logo seul, agrandi, avec un arrondi « squircle » façon icône iOS. */}
        <Image
          src="/kitoo-logo.png"
          alt=""
          aria-hidden
          width={160}
          height={160}
          priority
          className="mb-8 h-36 w-36 rounded-[32px] shadow-[0_12px_30px_rgba(22,22,29,0.18)] sm:h-40 sm:w-40"
        />

        <h1 className="font-display text-display text-ink-900">
          {siteConfig.name}
        </h1>
        <p className="text-body text-ink-600 mt-3 max-w-prose">
          Ton compagnon bien-être, pour suivre ton humeur en douceur.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Button as="a" href="/inscription" size="lg">
            Commencer
          </Button>
          <a
            href="/connexion"
            className="text-body text-brand-700 rounded font-bold underline underline-offset-4"
          >
            J&apos;ai déjà un compte
          </a>
        </div>
      </main>
      <Container width="prose" className="pb-8">
        <Footer />
      </Container>
    </>
  );
}
