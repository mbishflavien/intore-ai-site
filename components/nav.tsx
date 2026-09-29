"use client";

/* Sticky nav: transparent over hero → solid pass. Desktop links inline;
 * below md a full-screen night menu with staggered links and an imigongo trim.
 * Menu: focus moves in and is trapped, Esc closes, page scroll is frozen. */

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@intoreai/design-system/primitives";
import { Wordmark } from "@/components/icons";
import { gsap, setScrollLocked } from "@/lib/motion/smooth";
import { Imigongo } from "@/components/media/imigongo";

const LINKS = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#flow" },
  { label: "Trust", href: "#trust" },
  { label: "Roadmap", href: "#roadmap" },
];

/** The product app, once there's a public URL for it. Until then no "Sign in". */
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setScrollLocked(open);
    if (open) {
      el.hidden = false;
      el.querySelector<HTMLElement>("a")?.focus();
      if (!reduced) {
        gsap
          .timeline()
          .fromTo(el, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "expo.inOut" })
          .fromTo(".menu-link", { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: "expo.out", stagger: 0.06 }, 0.35)
          .fromTo(".menu-fade", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.6);
      }
    } else if (!el.hidden) {
      if (reduced) el.hidden = true;
      else
        gsap.to(el, {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 0.45,
          ease: "expo.in",
          onComplete: () => void (el.hidden = true),
        });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab" || !root.current) return;
      const f = root.current.querySelectorAll<HTMLElement>("a, button");
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      ref={root}
      id="mobile-menu"
      hidden
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-[150] flex flex-col bg-night text-paper md:hidden"
    >
      <div className="flex items-center justify-between px-[clamp(20px,5vw,72px)] py-4">
        <Wordmark onDark className="text-2xl" />
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-full border border-paper/25 px-5 font-sans text-sm font-semibold"
        >
          Close
        </button>
      </div>
      <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center px-[clamp(20px,5vw,72px)]">
        <ul className="space-y-2">
          {LINKS.map((l, i) => (
            <li key={l.href} className="overflow-hidden">
              <a
                href={l.href}
                onClick={() => {
                  // Unlock before the browser performs the anchor jump.
                  setScrollLocked(false);
                  onClose();
                }}
                className="menu-link flex items-baseline gap-4 py-1 font-display text-[clamp(2.5rem,11vw,4rem)] font-black leading-[1.05]"
              >
                <span className="font-sans text-sm font-bold text-signal">0{i + 1}</span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="menu-fade mt-10 flex flex-wrap items-center gap-4">
          <Button href="/pilot" size="lg" variant="onDark">
            Book a pilot
          </Button>
          {APP_URL && (
            <a href={APP_URL} className="font-sans text-sm font-semibold text-paper/70">
              Sign in
            </a>
          )}
        </div>
        <p className="menu-fade mt-8 font-sans text-sm text-paper/50">pilots@intore.ai</p>
      </nav>
      <Imigongo variant="zigzag" tone="night" scale={0.8} className="menu-fade relative h-10 shrink-0" />
    </div>
  );
}

export function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  const progressRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      // Goes solid as soon as content starts sliding under the bar.
      setSolid(window.scrollY > 48);
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progressRef.current?.style.setProperty("transform", `scaleX(${max > 0 ? window.scrollY / max : 0})`);
        // Highlight the section whose area holds the middle of the screen.
        const mid = window.innerHeight / 2;
        let current: string | null = null;
        for (const l of LINKS) {
          const r = document.querySelector(l.href)?.getBoundingClientRect();
          if (r && r.top <= mid && r.bottom >= mid) current = l.href;
        }
        setActive(current);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[100] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          solid
            ? "border-b border-line bg-paper/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-[1400px] items-center justify-between px-[clamp(20px,5vw,72px)] py-4"
        >
          <a href="#top" aria-label="IntoreAI home">
            <Wordmark className="text-2xl" />
          </a>
          <ul className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => {
              const on = active === l.href;
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    aria-current={on ? "location" : undefined}
                    className={`group relative block font-sans text-sm font-semibold transition-colors duration-200 ${
                      on ? "text-ink" : "text-ink/70 hover:text-ink"
                    }`}
                  >
                    {/* Text roll: the label slides up and a copy rises in its place. */}
                    <span className="relative block overflow-hidden">
                      <span className="block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
                        {l.label}
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 translate-y-full text-signal transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0"
                      >
                        {l.label}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-signal transition-transform duration-200 ${
                        on ? "scale-100" : "scale-0"
                      }`}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-3">
            {APP_URL && (
              <a
                href={APP_URL}
                className="hidden font-sans text-sm font-semibold text-ink/70 hover:text-ink md:inline"
              >
                Sign in
              </a>
            )}
            {/* On phones the CTA lives in the menu, so the bar never overflows. */}
            <span className="hidden sm:block">
              <Button href="/pilot" size="sm">
                Book a pilot
              </Button>
            </span>
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 bg-paper/70 backdrop-blur md:hidden"
            >
              <span className="sr-only">Open menu</span>
              <span aria-hidden="true" className="flex w-5 flex-col gap-[5px]">
                <span className="h-[2px] w-full rounded bg-ink" />
                <span className="h-[2px] w-3/5 rounded bg-ink" />
              </span>
            </button>
          </div>
        </nav>
        {/* Reading progress along the bottom edge of the bar. */}
        <span
          ref={progressRef}
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-px h-[2px] origin-left scale-x-0 bg-signal"
        />
      </header>
      <MobileMenu open={open} onClose={close} />
    </>
  );
}
