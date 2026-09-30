"use client";

import { SmoothScroll } from "@/lib/motion/smooth";
import { Nav } from "@/components/nav";
import { HeroFilm } from "@/components/sections/hero-film";
import { Shortlist } from "@/components/sections/shortlist";

export function LabHero() {
  return (
    <SmoothScroll>
      <Nav />
      <main>
        <HeroFilm />
        <Shortlist />
      </main>
    </SmoothScroll>
  );
}
