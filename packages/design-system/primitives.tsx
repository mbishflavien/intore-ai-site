"use client";

/*
 * @intoreai/design-system — primitives.tsx
 * Shared SYSTEMIC primitives (marketing + product app).
 * Rules: Tailwind classes mapping to tokens.css only. No GSAP/Lenis here.
 * No default gray/blue theme — every color comes from a token.
 */

import React, { useEffect, useRef, useState } from "react";

/* ————— Button ————— */

type ButtonVariant = "primary" | "secondary" | "ghost" | "onDark";
type ButtonSize = "sm" | "md" | "lg";

const buttonVariant: Record<ButtonVariant, string> = {
  primary:
    "bg-signal text-paper shadow-[0_10px_30px_-10px_rgba(18,128,92,0.7)] hover:bg-signal-deep",
  secondary:
    "bg-transparent text-ink border border-line hover:border-ink",
  ghost: "bg-transparent text-ink hover:bg-ink/5",
  onDark:
    "bg-paper text-ink hover:bg-signal hover:text-paper",
};

const buttonSize: Record<ButtonSize, string> = {
  sm: "min-h-[40px] px-4 text-[13px]",
  md: "min-h-[48px] px-6 text-[15px]",
  lg: "min-h-[56px] px-8 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  className = "",
  children,
  ...rest
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-pill font-sans font-semibold tracking-tight transition-all duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-px active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${buttonVariant[variant]} ${buttonSize[size]} ${className}`.trim();
  if (href) {
    const { onClick, ...anchorRest } = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a href={href} className={cls} onClick={onClick as never} {...anchorRest}>
        {children}
      </a>
    );
  }
  return (
    <button className={cls} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}

/* ————— Badge / Tag ————— */

type Tone = "signal" | "clay" | "ink" | "gold" | "line";

const toneCls: Record<Tone, string> = {
  signal: "bg-signal-tint text-signal-deep border-signal/25",
  clay: "bg-clay-tint text-clay border-clay/25",
  ink: "bg-ink text-paper border-ink",
  gold: "bg-gold/15 text-[#7a5a17] border-gold/40",
  line: "bg-transparent text-mist border-line",
};

export function Badge({
  tone = "signal",
  className = "",
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 font-sans text-[11px] font-bold uppercase tracking-[0.14em] ${toneCls[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}

export const Tag = Badge;

/* ————— Card ————— */

export function Card({
  className = "",
  children,
  onDark = false,
}: {
  className?: string;
  children: React.ReactNode;
  onDark?: boolean;
}) {
  return (
    <div
      className={`rounded-card border transition-transform duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        onDark
          ? "bg-night-soft border-white/10"
          : "bg-surface-elevated border-line shadow-[0_20px_50px_-30px_rgba(19,27,23,0.35)]"
      } ${className}`.trim()}
    >
      {children}
    </div>
  );
}

/* ————— Section kicker (editorial label) ————— */

export function Kicker({
  index,
  children,
  onDark = false,
}: {
  index: string;
  children: React.ReactNode;
  onDark?: boolean;
}) {
  return (
    <p
      className={`flex items-center gap-3 font-sans text-[12px] font-bold uppercase tracking-[0.22em] ${onDark ? "text-paper/60" : "text-mist"}`}
    >
      <span className="text-clay">{index}</span>
      <span aria-hidden="true" className={`h-px w-10 ${onDark ? "bg-paper/25" : "bg-line"}`} />
      {children}
    </p>
  );
}

/* ————— Marquee (custom, seamless, reduced-motion aware) ————— */

export function Marquee({
  children,
  speed = 28,
  reverse = false,
  className = "",
  pauseOnHover = true,
}: {
  children: React.ReactNode;
  speed?: number;
  reverse?: boolean;
  className?: string;
  pauseOnHover?: boolean;
}) {
  return (
    <div className={`overflow-hidden ${pauseOnHover ? "marquee-hover" : ""} ${className}`.trim()}>
      <div
        className="marquee-track flex w-max will-change-transform"
        style={{
          animationDuration: `${speed}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ————— CountUp (IntersectionObserver, no animation lib) ————— */

export function CountUp({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  durationMs = 1400,
  className = "",
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(to);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || done.current) return;
        done.current = true;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / durationMs);
          const eased = 1 - Math.pow(1 - p, 4);
          setVal(to * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, durationMs]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ————— Magnetic wrapper (vanilla rAF, touch-disabled) ————— */

export function Magnetic({
  strength = 18,
  children,
  className = "",
}: {
  strength?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(hover: none)").matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate(${(x / r.width) * strength}px, ${(y / r.height) * strength}px)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.transition = "transform 300ms cubic-bezier(0.16,1,0.3,1)";
      el.style.transform = "translate(0,0)";
      setTimeout(() => (el.style.transition = ""), 300);
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  return (
    <div ref={ref} className={`inline-block will-change-transform ${className}`.trim()}>
      {children}
    </div>
  );
}

/* ————— Skeleton (shared loading language) ————— */

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-card bg-ink/[0.07] ${className}`.trim()}
    />
  );
}
