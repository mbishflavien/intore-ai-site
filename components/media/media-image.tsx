"use client";

/* MediaImage: responsive AVIF/WebP from the media manifest, with an optional
 * clip-path reveal and scroll parallax. Falls back to a code-drawn imigongo
 * panel while the photo hasn't been generated yet, so layout never breaks. */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/smooth";
import { focusOf, getImage, prefersReducedMotion, srcSet } from "@/lib/media";
import { Imigongo } from "./imigongo";

type Fallback = React.ComponentProps<typeof Imigongo>;

export function MediaImage({
  id,
  alt,
  sizes = "100vw",
  className = "",
  imgClassName = "",
  reveal = true,
  parallax = true,
  priority = false,
  fallback = { variant: "diamond", tone: "night" },
  children,
}: {
  id: string;
  alt: string;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  reveal?: boolean;
  parallax?: boolean;
  priority?: boolean;
  fallback?: Fallback;
  /** Overlay rendered inside the parallax layer (moves with the image). */
  children?: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const entry = getImage(id);
  // Callers often place it absolutely; only default to relative when they don't.
  const position = /\b(absolute|fixed|sticky)\b/.test(className) ? "" : "relative";

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const inner = el.querySelector<HTMLElement>(".media-inner");
    const ctx = gsap.context(() => {
      if (reveal) {
        gsap.fromTo(
          el,
          { clipPath: "inset(18% 12% 18% 12% round 20px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 20px)",
            duration: 1.2,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play reverse play reverse" },
          },
        );
      }
      if (parallax && inner) {
        gsap.fromTo(
          inner,
          { scale: 1.18, yPercent: -4 },
          {
            scale: 1.04,
            yPercent: 4,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      }
    }, el);
    return () => ctx.revert();
  }, [reveal, parallax]);

  return (
    <div ref={root} className={`${position} overflow-hidden ${className}`}>
      <div className="media-inner absolute inset-0 will-change-transform">
        {entry ? (
          <picture>
            <source type="image/avif" srcSet={srcSet(id, entry, "avif")} sizes={sizes} />
            <source type="image/webp" srcSet={srcSet(id, entry, "webp")} sizes={sizes} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/media/${id}-${entry.widths[0]}.webp`}
              alt={alt}
              width={entry.w}
              height={entry.h}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              decoding="async"
              className={`h-full w-full object-cover ${imgClassName}`}
              style={{
                objectPosition: focusOf(id),
                backgroundImage: `url(${entry.blur})`,
                backgroundSize: "cover",
                backgroundPosition: focusOf(id),
              }}
            />
          </picture>
        ) : (
          <Imigongo {...fallback} className="absolute inset-0" />
        )}
        {entry && children}
      </div>
    </div>
  );
}
