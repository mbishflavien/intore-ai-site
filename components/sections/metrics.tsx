"use client";

/* Metrics as targets we optimize for — never fabricated results. */

import { Kicker, CountUp } from "@intoreai/design-system/primitives";
import { Reveal } from "@/lib/motion/reveal";

const METRICS: [string, number, string, string][] = [
  ["Time-to-hire reduction", 40, "%", "target we design screening speed around"],
  ["HR agreement rate", 85, "%", "recruiters concurring with AI ranking"],
  ["Interviewer–AI correlation", 0.8, "", "structured panels vs model signal"],
  ["Candidate satisfaction", 4.6, "/5", "applicants who felt fairly assessed"],
  ["Prep Hub engagement", 70, "%", "candidates completing role drills"],
  ["Outcome parity", 95, "%", "shortlist-rate fairness across groups"],
];

export function Metrics() {
  return (
    <section className="border-y border-line bg-paper py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-[clamp(20px,5vw,72px)]">
        <Kicker index="06">What success looks like</Kicker>
        <h2 className="mt-6 max-w-3xl font-display text-[clamp(2rem,4.5vw,3.75rem)] font-black leading-[1.02]">
          Pilot-stage and honest: <span className="text-signal">these are the targets</span> we hold
          ourselves to.
        </h2>

        <div className="mt-12 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {METRICS.map(([label, to, suffix, note], i) => (
            <Reveal key={label} delay={(i % 3) * 0.07}>
              <div className="h-full bg-paper p-8">
                <p className="font-display text-6xl font-black tabular-nums tracking-tight">
                  <CountUp
                    to={to}
                    suffix={suffix}
                    decimals={Number.isInteger(to) ? 0 : 1}
                  />
                </p>
                <p className="mt-3 font-sans text-[15px] font-bold">{label}</p>
                <p className="mt-1 font-sans text-sm text-mist">{note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
