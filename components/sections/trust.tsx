"use client";

/* Trust & compliance: same visual weight as features. Assurance cards. */

import { Kicker, Badge } from "@intoreai/design-system/primitives";
import { Reveal } from "@/lib/motion/reveal";
import { Button } from "@intoreai/design-system/primitives";
import { IconArrow, IconShield, IconEye, IconCheck, IconCompass } from "@/components/icons";
import { Imigongo } from "@/components/media/imigongo";
import { Parallax } from "@/lib/motion/parallax";
import { TrustCube } from "./trust-cube";

const CARDS = [
  {
    t: "Consent, captured",
    d: "Every monitored surface starts with explicit consent. Candidates know what is observed, why, and can withdraw — no dark patterns.",
    tag: "Data minimization",
    icon: IconEye,
  },
  {
    t: "Mapped, not promised",
    d: "Rwanda DPL, GDPR, and the EU AI Act's high-risk employment classification — tracked per market with an owner and a review cadence.",
    tag: "Rwanda DPL · GDPR · EU AI Act",
    icon: IconCompass,
  },
  {
    t: "Humans review everything",
    d: "Integrity flags are behavior-pattern signals routed to a person. Nothing auto-disqualifies. No inferred emotion, ever.",
    tag: "Human-in-the-loop",
    icon: IconShield,
  },
  {
    t: "Audited for fairness",
    d: "Outcome-parity metrics compare shortlist and hire rates across groups — surfaced to recruiters as a dashboard, not a slide.",
    tag: "Bias audits",
    icon: IconCheck,
  },
];

export function Trust() {
  return (
    <section id="trust" className="relative overflow-hidden bg-parchment py-24 md:py-32">
      <Parallax amount={24} className="pointer-events-none absolute -inset-y-[15%] right-0 w-[min(46vw,640px)] opacity-70 [mask-image:linear-gradient(to_left,black_30%,transparent)]">
        <Imigongo variant="lattice" tone="paper" scale={1.4} className="absolute inset-0" />
      </Parallax>
      <div className="relative mx-auto max-w-[1400px] px-[clamp(20px,5vw,72px)]">
        <Kicker index="05">Trust & compliance — the moat</Kicker>
        <div className="mt-6 grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <h2 className="max-w-3xl font-display text-[clamp(2rem,4.5vw,3.75rem)] font-black leading-[1.02]">
              You can defend this platform <span className="text-clay">to an auditor.</span>
            </h2>
            <p className="mt-5 max-w-lg font-sans text-lg leading-relaxed text-ink-soft">
              Built the way imigongo is: patterned, deliberate, and made to last. Six promises hold
              it together. Turn the cube to read them.
            </p>
            {/* Solid backing so the outline button stays legible over the lattice. */}
            <Reveal delay={0.1} className="mt-8 w-fit rounded-pill bg-surface-elevated shadow-[0_12px_30px_-18px_rgba(19,27,23,0.5)]">
              <Button href="/legal" variant="secondary">
                Read our commitments <IconArrow className="h-4 w-4" />
              </Button>
            </Reveal>
          </div>
          <TrustCube />
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {CARDS.map((c, i) => (
            <Reveal key={c.t} delay={(i % 2) * 0.08} as="div">
              <article className="h-full rounded-card border border-line bg-surface-elevated p-8 transition-transform duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 md:p-10">
                <div className="flex items-center justify-between">
                  <Badge tone="clay">{c.tag}</Badge>
                  <c.icon className="h-7 w-7 text-signal" />
                </div>
                <h3 className="mt-4 font-display text-3xl font-bold">{c.t}</h3>
                <p className="mt-3 font-sans text-[16px] leading-relaxed text-ink-soft">{c.d}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
