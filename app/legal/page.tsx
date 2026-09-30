import type { Metadata } from "next";
import { Kicker } from "@intoreai/design-system/primitives";
import { Wordmark } from "@/components/icons";
import { Imigongo } from "@/components/media/imigongo";

export const metadata: Metadata = { title: "Legal & privacy — IntoreAI" };

export default function LegalPage() {
  return (
    <main className="bg-paper text-ink">
      <Imigongo variant="lattice" tone="paper" scale={0.7} sweep={false} className="relative h-4" />
      <header className="mx-auto max-w-[900px] px-[clamp(20px,5vw,72px)] py-6">
        <a href="/" aria-label="IntoreAI home">
          <Wordmark className="text-2xl" />
        </a>
      </header>
      <article className="mx-auto max-w-[900px] px-[clamp(20px,5vw,72px)] pb-24 pt-10">
        <Kicker index="Legal">Plain-language commitments</Kicker>
        <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[1]">
          Privacy, consent & data rights.
        </h1>
        <div className="mt-8 space-y-8 font-sans text-[16px] leading-relaxed text-ink-soft">
          <section>
            <h2 className="font-display text-2xl font-bold text-ink">What we collect, and why</h2>
            <p className="mt-2">
              Application materials you submit, interview content you consent to share,
              and the minimum account data needed to run the service. Nothing else.
              Monitoring surfaces (where enabled) observe process-level signals only —
              never inferred emotion or psychological state.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-bold text-ink">Your rights</h2>
            <p className="mt-2">
              Export everything we hold about you (data portability) and request full
              deletion (right to erasure). Retention limits apply automatically after
              those windows close.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-bold text-ink">Humans decide</h2>
            <p className="mt-2">
              IntoreAI ranks, flags, and explains. It never auto-rejects, never
              auto-hires. Every consequential decision is made and signed by a person,
              with an immutable decision trail.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-bold text-ink">Frameworks we track</h2>
            <p className="mt-2">
              Rwanda Law on Protection of Personal Data, the EU GDPR, and the EU AI
              Act's high-risk classification for employment systems — each with an
              owner and a review cadence. Full Terms of Service and Data Processing
              Agreement are provided to pilot customers before onboarding.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
