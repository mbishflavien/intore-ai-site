"use client";

/* How it works: SVG path draws with scroll progress, nodes reveal in turn. */

import { useEffect, useRef } from "react";
import { Kicker } from "@intoreai/design-system/primitives";
import { gsap } from "@/lib/motion/smooth";

const STEPS = ["Apply", "Screen", "Shortlist", "Interview", "Recommend", "Decide"];

export function Flow() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    const path = el?.querySelector(".flow-path") as SVGPathElement | null;
    if (!el || !path) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    const ctx = gsap.context(() => {
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 70%", end: "bottom 60%", scrub: 0.6 },
      });
      gsap.utils.toArray<HTMLElement>(".flow-node").forEach((node, i) => {
        gsap.fromTo(
          node,
          { scale: 0.7, opacity: 0.25 },
          {
            scale: 1,
            opacity: 1,
            ease: "expo.out",
            duration: 0.5,
            scrollTrigger: { trigger: el, start: "top 70%", end: "bottom 60%", scrub: 0.6 },
          },
        );
        void i;
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="flow" ref={root} className="bg-paper py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-[clamp(20px,5vw,72px)]">
        <Kicker index="04">How it works</Kicker>
        <h2 className="mt-6 max-w-3xl font-display text-[clamp(2rem,4.5vw,3.75rem)] font-black leading-[1.02]">
          Six steps. <span className="text-signal">One accountable human</span> at the end.
        </h2>

        <div className="relative mt-14">
          <svg
            viewBox="0 0 1200 120"
            className="hidden w-full md:block"
            aria-hidden="true"
            preserveAspectRatio="none"
          >
            <line x1="40" y1="60" x2="1160" y2="60" stroke="var(--color-line)" strokeWidth="2" />
            <line
              className="flow-path"
              x1="40"
              y1="60"
              x2="1160"
              y2="60"
              stroke="var(--color-signal)"
              strokeWidth="3"
            />
          </svg>
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
            {STEPS.map((s, i) => (
              <li key={s} className="flow-node">
                <span
                  aria-hidden="true"
                  className={`flex h-12 w-12 items-center justify-center rounded-full font-display text-lg font-black ${
                    i === STEPS.length - 1 ? "bg-ink text-paper" : "bg-signal-tint text-signal-deep"
                  }`}
                >
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-2xl font-bold">{s}</h3>
                <p className="mt-1 font-sans text-sm leading-relaxed text-mist">
                  {i === STEPS.length - 1
                    ? "A person signs the decision. The trail is immutable."
                    : i === 0
                      ? "Profile, resume, and consent captured."
                      : i === 4
                        ? "Ranked, explained — advisory only."
                        : "AI assists; evidence accumulates."}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
