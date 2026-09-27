"use client";

/* Product walkthrough: sticky 01–05 rail + animated token-built mockups.
 * Mockups use ONLY shared tokens/primitives — the Section 3A consistency proof
 * starts here, not later. No video files: choreographed CSS mockups, IO-gated. */

import { useEffect, useRef, useState } from "react";
import { Kicker, Badge, CountUp } from "@intoreai/design-system/primitives";
import { gsap } from "@/lib/motion/smooth";

const MODULES = [
  {
    n: "01",
    name: "Screening Engine",
    desc: "Five-dimension scoring with written reasoning per candidate. Fraud-risk heuristics flagged, never hidden.",
    bars: [["Aline M.", 92], ["Jean C.", 78], ["Divine U.", 64]],
    foot: "reasoning: strong verified proof · relevance 88",
  },
  {
    n: "02",
    name: "Interview Platform",
    desc: "Shared question banks, timed cognitive tasks, structured panels — one comparable record per candidate.",
    bars: [["Technical", 86], ["Cognitive", 74], ["Panel fit", 81]],
    foot: "2 interviewers · blind-reviewed",
  },
  {
    n: "03",
    name: "Integrity Monitoring",
    desc: "Behavior-pattern flags routed to a human reviewer. Never auto-disqualifying, never inferred emotion.",
    bars: [["Focus signal", 95], ["Originality", 88], ["Consistency", 91]],
    foot: "flag: none · reviewed by J. Recruiter",
  },
  {
    n: "04",
    name: "AI Recommendation",
    desc: "Ranked shortlist with strengths, gaps, and a written recommendation — the decision stays with HR.",
    bars: [["Hire signal", 89], ["Risk", 22], ["Culture add", 76]],
    foot: "recommendation: advance to offer",
  },
  {
    n: "05",
    name: "Prep Hub",
    desc: "Candidates practice against role-shaped question banks and arrive ready. Better inputs, better hires.",
    bars: [["Role readiness", 83], ["Drills done", 17], ["Streak", 6]],
    foot: "13 tracks · instant feedback",
  },
];

function Mockup({ bars, foot, active }: { bars: [string, number][]; foot: string; active: boolean }) {
  return (
    <div className="rounded-card border border-paper/12 bg-night-soft p-6 md:p-8" data-cursor="View">
      <div className="flex items-center gap-2" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-paper/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-paper/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-signal" />
      </div>
      <div className="mt-6 space-y-5">
        {bars.map(([label, v], i) => (
          <div key={label}>
            <div className="mb-1.5 flex justify-between font-sans text-sm">
              <span className="font-semibold text-paper/85">{label}</span>
              <span className="font-bold tabular-nums text-signal">
                {active ? <CountUp to={v} durationMs={1000 + i * 150} /> : 0}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-paper/10">
              <div
                className="h-full rounded-full bg-signal transition-[width] duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ width: active ? `${Math.min(100, v)}%` : "0%" }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 border-t border-paper/10 pt-4 font-mono text-xs text-paper/50">{foot}</p>
    </div>
  );
}

export function Walkthrough() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll(".mod-item"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      items.forEach((item, i) => {
        gsap.fromTo(
          item,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "expo.out",
            scrollTrigger: {
              trigger: item,
              start: "top 75%",
              once: true,
              onEnter: () => setActive(i),
            },
          },
        );
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="product" ref={root} className="bg-night py-24 text-paper md:py-32">
      <div className="mx-auto max-w-[1400px] px-[clamp(20px,5vw,72px)]">
        <Kicker index="03" onDark>
          Product in motion
        </Kicker>
        <h2 className="mt-6 max-w-3xl font-display text-[clamp(2rem,4.5vw,3.75rem)] font-black leading-[1.02]">
          Five modules. <span className="text-signal">One hiring loop.</span>
        </h2>

        <div className="mt-14 grid gap-10 lg:grid-cols-[220px_1fr]">
          <ol className="hidden lg:block" aria-label="Modules">
            <div className="sticky top-32 space-y-2">
              {MODULES.map((m, i) => (
                <li key={m.n}>
                  <span
                    className={`block rounded-xl px-4 py-3 font-sans text-sm font-bold transition-all duration-200 ${
                      active === i ? "bg-paper text-ink" : "text-paper/40"
                    }`}
                  >
                    <span className={active === i ? "text-signal" : ""}>{m.n}</span>
                    <span className="ml-3">{m.name}</span>
                  </span>
                </li>
              ))}
            </div>
          </ol>

          <div className="space-y-16">
            {MODULES.map((m, i) => (
              <article key={m.n} className="mod-item grid items-center gap-8 md:grid-cols-2">
                <div>
                  <p className="font-display text-6xl font-black text-paper/15">{m.n}</p>
                  <h3 className="mt-2 font-display text-3xl font-bold md:text-4xl">{m.name}</h3>
                  <p className="mt-3 font-sans text-[17px] leading-relaxed text-paper/65">{m.desc}</p>
                  <p className="mt-4">
                    <Badge tone={i === 2 ? "gold" : "signal"}>
                      {i === 2 ? "Human review required" : "Explainable by design"}
                    </Badge>
                  </p>
                </div>
                <Mockup bars={m.bars as [string, number][]} foot={m.foot} active={active === i} />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
