"use client";

/* Product walkthrough: sticky 01–05 rail + real product screen recordings.
 * Each module's capture plays only while its row is active (public/videos/modules). */

import { useEffect, useRef, useState } from "react";
import { Kicker, Badge } from "@intoreai/design-system/primitives";
import { gsap, ScrollTrigger } from "@/lib/motion/smooth";

const MODULES = [
  {
    n: "01",
    name: "Screening Engine",
    video: "screening",
    desc: "Five-dimension scoring with written reasoning per candidate. Fraud-risk heuristics flagged, never hidden.",
    foot: "real capture · ranked shortlist, live scores",
  },
  {
    n: "02",
    name: "Interview Platform",
    video: "interview",
    desc: "Shared question banks, timed cognitive tasks, structured panels — one comparable record per candidate.",
    foot: "real capture · interview scheduling, live app",
  },
  {
    n: "03",
    name: "Integrity Monitoring",
    video: "integrity",
    desc: "Behavior-pattern flags routed to a human reviewer. Never auto-disqualifying, never inferred emotion.",
    foot: "real capture · evidence review pane",
  },
  {
    n: "04",
    name: "AI Recommendation",
    video: "recommendation",
    desc: "Ranked shortlist with strengths, gaps, and a written recommendation — the decision stays with HR.",
    foot: "real capture · written recommendation + decision",
  },
  {
    n: "05",
    name: "Prep Hub",
    video: "prep",
    desc: "Candidates practice against role-shaped question banks and arrive ready. Better inputs, better hires.",
    foot: "real capture · skill-gap recommendations, live app",
  },
];

function ModuleVideo({ name, active, label }: { name: string; active: boolean; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  // Read after mount: reading it during render made SSR and client disagree.
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (reduced) {
      v.pause();
      return;
    }
    if (active) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [active, reduced]);

  useEffect(() => {
    // Keep ScrollTrigger positions honest once media dimensions land.
    const v = ref.current;
    if (!v) return;
    const refresh = () => ScrollTrigger.refresh();
    v.addEventListener("loadedmetadata", refresh);
    return () => v.removeEventListener("loadedmetadata", refresh);
  }, []);

  return (
    <div className="overflow-hidden rounded-card border border-paper/12 bg-night-soft" data-cursor="Play">
      <video
        ref={ref}
        className="aspect-[8/5] w-full object-cover object-top"
        muted
        playsInline
        loop
        preload="metadata"
        poster={`/videos/modules/${name}.jpg`}
        aria-label={`${label} — screen recording of the real IntoreAI product`}
      >
        <source src={`/videos/modules/${name}.webm`} type="video/webm" />
        <source src={`/videos/modules/${name}.mp4`} type="video/mp4" />
      </video>
      <p className="border-t border-paper/10 px-5 py-3 font-mono text-xs text-paper/50">{label}</p>
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
        // Entrance reverses on scroll-up (no once:true anywhere on this page).
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
              start: "top 78%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
        // Rail highlight tracks BOTH scroll directions via isActive toggle.
        ScrollTrigger.create({
          trigger: item,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            if (self.isActive) setActive(i);
          },
        });
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
                <ModuleVideo name={m.video} active={active === i} label={m.foot} />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
