"use client";

/* Roadmap: five rollout phases as a scrubbed timeline. */

import { useEffect, useRef } from "react";
import { Kicker, Badge } from "@intoreai/design-system/primitives";
import { gsap } from "@/lib/motion/smooth";

const PHASES = [
  ["Phase 1", "Screening that explains itself", "Weighted scoring, fraud heuristics, recruiter dashboards.", true],
  ["Phase 2", "In-platform interviews", "Question banks, cognitive tasks, panel comparison.", false],
  ["Phase 3", "Integrity + real ranking", "Sandboxed execution, telemetry flags, immutable audit trail.", false],
  ["Phase 4", "Prep Hub goes public", "Consented content, moderation, mock interviews.", false],
  ["Phase 5", "Expanded signals", "Multi-market compliance, multi-seat orgs, data rights.", false],
] as const;

export function Roadmap() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".phase-card").forEach((card) => {
        gsap.fromTo(
          card,
          { x: 60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.7,
            ease: "expo.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="roadmap" ref={root} className="bg-night py-24 text-paper md:py-32">
      <div className="mx-auto max-w-[1400px] px-[clamp(20px,5vw,72px)]">
        <Kicker index="07" onDark>
          Roadmap & traction
        </Kicker>
        <h2 className="mt-6 max-w-3xl font-display text-[clamp(2rem,4.5vw,3.75rem)] font-black leading-[1.02]">
          Shipped, then <span className="text-signal">earned.</span>
        </h2>

        <ol className="mt-12 space-y-4">
          {PHASES.map(([phase, title, desc, live]) => (
            <li
              key={phase}
              className="phase-card grid gap-3 rounded-card border border-paper/12 bg-night-soft p-7 md:grid-cols-[160px_1fr_auto] md:items-center md:p-8"
            >
              <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-paper/50">
                {phase}
              </p>
              <div>
                <h3 className="font-display text-2xl font-bold md:text-3xl">{title}</h3>
                <p className="mt-1 font-sans text-[15px] text-paper/60">{desc}</p>
              </div>
              <Badge tone={live ? "signal" : "line"}>{live ? "Live now" : "Next"}</Badge>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
