"use client";

import { useState } from "react";
import { SmoothScroll } from "@/lib/motion/smooth";
import { Cursor } from "@/lib/motion/cursor";
import { Loader } from "@/components/loader";
import { Nav } from "@/components/nav";
import { Hero } from "@/components/sections/hero";
import { Problem } from "@/components/sections/problem";
import { Pillars } from "@/components/sections/pillars";
import { Walkthrough } from "@/components/sections/walkthrough";
import { TrustBand } from "@/components/sections/band";
import { Flow } from "@/components/sections/flow";
import { Trust } from "@/components/sections/trust";
import { Metrics } from "@/components/sections/metrics";
import { Roadmap } from "@/components/sections/roadmap";
import { FinalCta, Footer } from "@/components/sections/closing";

export default function Home() {
  const [started, setStarted] = useState(false);

  return (
    <SmoothScroll>
      <Cursor />
      {!started && <Loader onDone={() => setStarted(true)} />}
      <Nav />
      <main>
        <Hero started={started} />
        <Problem />
        <Pillars />
        <Walkthrough />
        <TrustBand />
        <Flow />
        <Trust />
        <Metrics />
        <Roadmap />
        <FinalCta />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
