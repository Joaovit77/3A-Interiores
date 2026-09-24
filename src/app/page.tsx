import Link from "next/link";

import { siteConfig } from "@/lib/site";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-5 py-16">
      <p className="text-sm tracking-[0.18em] text-ink-soft uppercase">
        Design de Interiores
      </p>
      <h1 className="font-display text-5xl leading-tight font-medium text-balance sm:text-6xl">
        {siteConfig.name}
      </h1>
      <p className="max-w-prose text-lg text-ink-soft">
        Portfólio em construção.
      </p>
      <p>
        <Link
          href="/briefing"
          className="text-base font-medium underline underline-offset-4"
        >
          Protótipo do briefing
        </Link>
      </p>
    </main>
  );
}
