"use client";

import { SmoothScroll } from "@/lib/motion/smooth";
import { Nav } from "@/components/nav";
import { HeroFilmTake } from "@/components/sections/hero-film-take";
import { Shortlist } from "@/components/sections/shortlist";

export function LabHeroTake() {
  return (
    <SmoothScroll>
      <Nav />
      <main>
        <HeroFilmTake />
        <Shortlist />
      </main>
    </SmoothScroll>
  );
}
