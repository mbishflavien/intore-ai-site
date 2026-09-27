"use client";

/* Sticky nav: transparent over hero → solid pass. Desktop nav, no hamburger. */

import { useEffect, useState } from "react";
import { Button } from "@intoreai/design-system/primitives";
import { Wordmark } from "@/components/icons";

const LINKS = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#flow" },
  { label: "Trust", href: "#trust" },
  { label: "Roadmap", href: "#roadmap" },
];

export function Nav() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.72);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
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
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="group relative font-sans text-sm font-semibold text-ink/80 hover:text-ink"
              >
                {l.label}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-0 bg-signal transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                />
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <a
            href="/pilot"
            className="hidden font-sans text-sm font-semibold text-ink/70 hover:text-ink sm:inline"
          >
            Sign in
          </a>
          <Button href="/pilot" size="sm">
            Book a pilot
          </Button>
        </div>
      </nav>
    </header>
  );
}
