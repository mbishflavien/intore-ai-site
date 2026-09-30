"use client";

/* Prep Hub: the candidate side of the loop. Framed film/photo against an
 * imigongo relief offset behind it; copy reveals alongside. */

import { Kicker, Badge } from "@intoreai/design-system/primitives";
import { Reveal } from "@/lib/motion/reveal";
import { Parallax } from "@/lib/motion/parallax";
import { AmbientVideo } from "@/components/media/ambient-video";
import { Imigongo } from "@/components/media/imigongo";
import { IconCheck } from "@/components/icons";

const POINTS = [
  ["Role-shaped practice", "Question banks shaped by the role you're applying for, not generic advice."],
  ["Skill-gap guidance", "Clear recommendations on what to strengthen next, and why."],
  ["Arrive ready", "Walk into a structured interview knowing the format instead of guessing it."],
];

export function Prep() {
  return (
    <section className="overflow-hidden bg-paper py-24 md:py-32">
      <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-[clamp(20px,5vw,72px)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
        <div className="relative mx-auto w-full max-w-[520px]">
          <Parallax amount={14} className="absolute -right-6 -bottom-6 left-10 top-10 overflow-hidden rounded-card md:-right-10 md:-bottom-10">
            <Imigongo variant="diamond" tone="clay" scale={0.9} className="absolute inset-0" />
          </Parallax>
          <Reveal className="relative aspect-[4/5] overflow-hidden rounded-card shadow-[0_40px_80px_-40px_rgba(19,27,23,0.55)]">
            <AmbientVideo
              id="prep-loop"
              posterId="prep-candidate"
              alt="A candidate practises interview answers at home (illustrative)"
              className="absolute inset-0 h-full w-full"
              fallback={{ variant: "lattice", tone: "night", scale: 1.4 }}
            />
          </Reveal>
        </div>

        <div>
          <Kicker index="07">For candidates — Prep Hub</Kicker>
          <h2 className="mt-6 max-w-2xl font-display text-[clamp(2rem,4.5vw,3.75rem)] font-black leading-[1.02]">
            Candidates arrive ready. <span className="text-clay">Better inputs, better hires.</span>
          </h2>
          <p className="mt-6 max-w-xl font-sans text-lg leading-relaxed text-ink-soft">
            Hiring only gets fairer when both sides of the table are prepared. The Prep Hub is built to
            give job seekers the same clarity the hiring team gets.
          </p>
          <ul className="mt-10 space-y-6">
            {POINTS.map(([t, d], i) => (
              <Reveal key={t} as="li" delay={i * 0.08} className="flex gap-4 border-t border-line pt-6">
                <IconCheck className="mt-1 h-6 w-6 shrink-0 text-signal" />
                <div>
                  <h3 className="font-display text-2xl font-bold">{t}</h3>
                  <p className="mt-1 font-sans text-[16px] leading-relaxed text-ink-soft">{d}</p>
                </div>
              </Reveal>
            ))}
          </ul>
          <p className="mt-10">
            <Badge tone="gold">Opens to the public in Phase 4</Badge>
          </p>
        </div>
      </div>
    </section>
  );
}
