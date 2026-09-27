"use client";

/* Three pillars: vertical scroll drives horizontal travel (one hijack). */

import { useEffect, useRef } from "react";
import { Kicker, Badge } from "@intoreai/design-system/primitives";
import { gsap } from "@/lib/motion/smooth";
import { IconScreen, IconInterview, IconCompass } from "@/components/icons";

const PILLARS = [
  {
    n: "I",
    icon: IconScreen,
    title: "Screen",
    line: "Every application scored on five dimensions — skills, experience, education, relevance, verified proof — with the reasoning written out, not hidden.",
  },
  {
    n: "II",
    icon: IconInterview,
    title: "Interview",
    line: "Technical and cognitive interviews run inside the platform: shared question banks, structured panels, one comparable record per candidate.",
  },
  {
    n: "III",
    icon: IconCompass,
    title: "Decide & Prepare",
    line: "Explainable recommendations for the hiring team — and a Prep Hub that helps candidates arrive ready. Both sides get better.",
  },
];

export function Pillars() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const track = el.querySelector(".pillar-track");
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const getX = () => -(track.scrollWidth - window.innerWidth);
      gsap.to(track, {
        x: getX,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${track.scrollWidth - window.innerWidth}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden bg-paper">
      <div className="pillar-track flex min-h-screen w-max items-center gap-8 px-[clamp(20px,5vw,72px)]">
        <div className="w-[82vw] shrink-0 md:w-[38vw]">
          <Kicker index="02">The solution</Kicker>
          <h2 className="mt-6 font-display text-[clamp(2rem,4.5vw,3.75rem)] font-black leading-[1.02]">
            Three pillars.
            <br />
            One loop.
          </h2>
          <p className="mt-5 max-w-md font-sans text-lg leading-relaxed text-ink-soft">
            Scroll on — the pillars travel past. Each one earns its place before
            the next arrives.
          </p>
          <p className="mt-6">
            <Badge tone="clay">The AI ranks, flags & explains — humans decide</Badge>
          </p>
        </div>
        {PILLARS.map((p) => (
          <article
            key={p.n}
            className="flex h-[62vh] w-[82vw] shrink-0 flex-col justify-between rounded-card border border-line bg-surface-elevated p-8 shadow-[0_30px_60px_-40px_rgba(19,27,23,0.4)] md:w-[44vw] md:p-12"
          >
            <div className="flex items-start justify-between">
              <p.icon className="h-12 w-12 text-signal" />
              <span className="font-display text-7xl font-black text-ink/10">{p.n}</span>
            </div>
            <div>
              <h3 className="font-display text-5xl font-black md:text-6xl">{p.title}</h3>
              <p className="mt-4 max-w-lg font-sans text-lg leading-relaxed text-ink-soft">
                {p.line}
              </p>
            </div>
          </article>
        ))}
        <div className="w-[82vw] shrink-0 md:w-[30vw]">
          <p className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-black leading-tight">
            “The AI ranks, flags, and explains.{" "}
            <span className="text-signal">HR and interviewers always make the final call.</span>”
          </p>
        </div>
      </div>
    </section>
  );
}
