"use client";

/* Page transitions: a clay curtain with an imigongo leading edge wipes up over
 * the page on internal navigation, then lifts off the next one. Only
 * same-origin links to another path are intercepted: hash links, new tabs,
 * modifier-clicks and downloads behave normally. Off under reduced motion. */

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "@/lib/motion/smooth";
import { Imigongo } from "@/components/media/imigongo";
import { Wordmark } from "@/components/icons";

// Survives the template remount between routes (client navigation only).
let arriving = false;

export default function Template({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const curtain = useRef<HTMLDivElement>(null);
  const [covered] = useState(() => arriving);

  useEffect(() => {
    if (!covered || !curtain.current) return;
    arriving = false;
    gsap.to(curtain.current, { yPercent: -100, duration: 0.9, delay: 0.15, ease: "expo.inOut" });
  }, [covered]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a");
      if (!a || a.target || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === pathname) return;
      e.preventDefault();
      gsap.fromTo(
        curtain.current,
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: 0.7,
          ease: "expo.inOut",
          onComplete: () => {
            arriving = true;
            router.push(url.pathname + url.search + url.hash);
          },
        },
      );
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname, router]);

  return (
    <>
      {children}
      <div
        ref={curtain}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[400] flex items-center justify-center bg-clay"
        style={{ transform: covered ? "translateY(0%)" : "translateY(100%)" }}
      >
        <Imigongo variant="zigzag" tone="night" scale={0.9} sweep={false} className="absolute inset-x-0 top-0 h-12" />
        <Wordmark onDark className="text-4xl" />
      </div>
    </>
  );
}
