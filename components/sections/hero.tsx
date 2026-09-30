"use client";

/* Hero: kinetic headline beside a 3D window onto a Kigali office (the photo
 * rebuilt as depth geometry). Scrolling pins the hero: the window expands to
 * full-bleed, the camera dollies into the room, the headline recedes and the
 * promise lands. Everything reverses on scroll-up. */

import { useEffect, useRef } from "react";
import { Button, Magnetic, Badge } from "@intoreai/design-system/primitives";
import { gsap } from "@/lib/motion/smooth";
import { splitWords } from "@/lib/motion/reveal";
import { prefersReducedMotion } from "@/lib/media";
import { IconArrow } from "@/components/icons";
import { SignalCanvas } from "@/components/media/signal-canvas";
import { DepthScene, type SceneDrive } from "@/components/media/depth-scene";

const STATS = [
  ["Screen", "Every CV scored, explained"],
  ["Interview", "Structured, in-platform"],
  ["Integrity", "Flags, never verdicts"],
  ["Prep Hub", "Candidates arrive ready"],
];

const INTRO =
  "IntoreAI screens every application, runs structured interviews, and flags integrity risks, then hands you an explainable recommendation. The decision is always yours.";

// The window's resting frame before scroll expands it. Keep in sync with the
// clip-path classes on .hero-media, which set it before any JS runs.
const FRAME_DESKTOP = "inset(14% 4.5% 9% 55% round 28px)";
const FRAME_MOBILE = "inset(58% 5% 4% 5% round 24px)";

function Words({ text, accent = false }: { text: string; accent?: boolean }) {
  return (
    <>
      {text.split(" ").map((w, i, all) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
          <span className={`hero-word inline-block will-change-transform ${accent ? "text-signal" : ""}`}>{w}</span>
          {i < all.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

export function Hero({ started }: { started: boolean }) {
  const root = useRef<HTMLElement>(null);
  const drive = useRef<SceneDrive>({ progress: 0 });

  // Intro: headline words rise, supporting copy and the 3D window fade in.
  useEffect(() => {
    if (!started) return;
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".word-inner", { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.05, delay: 0.15 });
      gsap.fromTo(".hero-fade", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.12, delay: 0.6 });
      gsap.fromTo(".hero-scene", { scale: 1.12, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6, ease: "expo.out", delay: 0.25 });
    }, el);
    return () => ctx.revert();
  }, [started]);

  // Scroll: pin, expand the window, dolly the camera, land the promise.
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const desktop = () => window.matchMedia("(min-width: 1024px)").matches;
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "+=160%",
            pin: true,
            scrub: 0.7,
            invalidateOnRefresh: true,
            onUpdate: (self) => (drive.current.progress = self.progress),
          },
        })
        .fromTo(
          ".hero-media",
          { clipPath: () => (desktop() ? FRAME_DESKTOP : FRAME_MOBILE) },
          { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "power2.inOut", duration: 0.55 },
          0,
        )
        // Phones: the window sits low, so the scene starts shifted down to put her
        // face in it, and settles as the window opens up.
        .fromTo(".hero-scene", { yPercent: () => (desktop() ? 0 : 26) }, { yPercent: 0, ease: "power2.inOut", duration: 0.55 }, 0)
        .to(".hero-copy", { yPercent: -14, opacity: 0, ease: "power2.in", duration: 0.22 }, 0)
        .fromTo(".hero-shade", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.3)
        .fromTo(".hero-signal", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.45)
        .fromTo(".hero-word", { yPercent: 115 }, { yPercent: 0, stagger: 0.04, duration: 0.25, ease: "power3.out" }, 0.58)
        .fromTo(".hero-note", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.2 }, 0.82);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section ref={root} id="top" className="relative h-[100svh] min-h-[620px] overflow-hidden bg-paper">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <SignalCanvas />
        </div>

        {/* The 3D window */}
        <div className="hero-media absolute inset-0 overflow-hidden bg-night [clip-path:inset(58%_5%_4%_5%_round_24px)] lg:[clip-path:inset(14%_4.5%_9%_55%_round_28px)]">
          <DepthScene
            id="hero-still"
            alt="A recruiter in Kigali reviews a ranked shortlist at dawn (illustrative)"
            drive={drive}
            startPan={-0.2}
            className="hero-scene absolute inset-0"
          />
          <div className="hero-shade pointer-events-none absolute inset-0 bg-gradient-to-t from-night/90 via-night/30 to-night/5 opacity-0" />
          <div className="hero-signal pointer-events-none absolute inset-0 opacity-0 mix-blend-screen">
            <SignalCanvas onDark />
          </div>
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-[clamp(20px,5vw,72px)] pb-[clamp(32px,8vh,96px)] text-paper motion-reduce:hidden">
            <p className="font-display font-black leading-[0.98] tracking-tight text-[clamp(2.25rem,6.5vw,6rem)]">
              <Words text="Every application read." />
              <br />
              <Words text="Every decision yours." accent />
            </p>
            <p className="hero-note mt-6 max-w-md font-sans text-[15px] leading-relaxed text-paper/75 opacity-0">
              The AI does the reading, scoring and flagging. The judgement, and the hire, stay with your team.
            </p>
          </div>
        </div>

        <div className="hero-copy relative mx-auto flex h-full max-w-[1400px] flex-col px-[clamp(20px,5vw,72px)] pt-24 lg:justify-center lg:pr-[48%] lg:pt-10">
          <p className="hero-fade mb-5">
            <Badge tone="signal">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-signal" />
              Pilot-stage · Kigali & remote teams
            </Badge>
          </p>
          <h1 className="font-display font-black leading-[0.95] tracking-tight text-ink text-[clamp(2.5rem,5.6vw,6rem)]">
            {splitWords("AI ranks the shortlist.")}
            <br />
            <span className="text-signal">{splitWords("Humans make the hire.")}</span>
          </h1>
          <p className="hero-fade mt-6 hidden max-w-xl font-sans text-lg leading-relaxed text-ink-soft sm:block">{INTRO}</p>
          <div className="hero-fade mt-7 flex flex-wrap items-center gap-3 sm:gap-4">
            <Magnetic>
              <Button href="/pilot" size="lg" data-cursor="Go">
                Book a pilot <IconArrow className="h-5 w-5" />
              </Button>
            </Magnetic>
            <Button href="#product" size="lg" variant="secondary">
              See how it works
            </Button>
          </div>
        </div>
      </section>

      {/* On phones the intro paragraph moves here, below the window. */}
      <div className="mx-auto max-w-[1400px] px-[clamp(20px,5vw,72px)] pt-10">
        <p className="mb-6 font-sans text-lg leading-relaxed text-ink-soft sm:hidden">{INTRO}</p>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-4">
          {STATS.map(([t, d]) => (
            <div key={t} className="bg-paper px-6 py-5">
              <dt className="font-display text-2xl font-bold">{t}</dt>
              <dd className="mt-1 font-sans text-sm text-mist">{d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}
