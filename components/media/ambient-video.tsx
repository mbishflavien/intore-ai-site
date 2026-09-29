"use client";

/* AmbientVideo: muted background loop that only plays while on screen.
 * Degrades in order: video → poster photo → code-drawn imigongo.
 * Reduced motion shows the poster only. Generalised from walkthrough's ModuleVideo. */

import { useEffect, useRef, useState } from "react";
import { getVideo, getImage, prefersReducedMotion } from "@/lib/media";
import { MediaImage } from "./media-image";
import { Imigongo } from "./imigongo";

export function AmbientVideo({
  id,
  posterId,
  alt,
  className = "",
  eager = false,
  fallback = { variant: "zigzag", tone: "night" } as React.ComponentProps<typeof Imigongo>,
}: {
  id: string;
  /** Photo from the media manifest shown before/instead of the video. */
  posterId?: string;
  alt: string;
  className?: string;
  eager?: boolean;
  fallback?: React.ComponentProps<typeof Imigongo>;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const video = getVideo(id);
  const [reduced, setReduced] = useState(false);

  useEffect(() => setReduced(prefersReducedMotion()), []);

  useEffect(() => {
    const v = ref.current;
    if (!v || reduced) return;
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()),
      { rootMargin: "120px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduced, video]);

  const poster = video ? `/videos/ambient/${id}.jpg` : undefined;

  if (!video || reduced) {
    if (posterId && getImage(posterId)) {
      return <MediaImage id={posterId} alt={alt} className={className} reveal={false} parallax={false} priority={eager} />;
    }
    if (video) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={poster} alt={alt} className={`object-cover ${className}`} />;
    }
    return (
      <div className={`relative ${className}`} role="img" aria-label={alt}>
        <Imigongo {...fallback} className="absolute inset-0" />
      </div>
    );
  }

  return (
    <video
      ref={ref}
      className={`object-cover ${className}`}
      muted
      playsInline
      loop
      preload={eager ? "auto" : "none"}
      poster={poster}
      aria-label={alt}
    >
      {video.portrait && (
        <>
          <source media="(max-width: 767px)" src={`/videos/ambient/${id}-portrait.webm`} type="video/webm" />
          <source media="(max-width: 767px)" src={`/videos/ambient/${id}-portrait.mp4`} type="video/mp4" />
        </>
      )}
      <source src={`/videos/ambient/${id}.webm`} type="video/webm" />
      <source src={`/videos/ambient/${id}.mp4`} type="video/mp4" />
    </video>
  );
}
