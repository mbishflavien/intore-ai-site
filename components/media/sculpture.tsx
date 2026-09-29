"use client";

/* ImigongoSculpture: a carved imigongo block in real 3D (three.js, lazy-loaded).
 * Each face carries a motif painted in code and raised with a displacement map,
 * lit by a warm raking key light. Scroll through the host section turns it to
 * show new faces; the cursor tilts it; it floats gently at rest.
 * three.js is only fetched when the block nears the viewport. */

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/motion/smooth";
import { prefersReducedMotion } from "@/lib/media";

type Motif = "zigzag" | "diamond" | "lattice" | "chevron";
type Face = { motif: Motif; base: string; ridges: [string, string, string] };

const CLAY = "#c2542b", INK = "#131b17", PAPER = "#f6f3ec", NIGHT = "#0e1512";
// Box face order: +x, -x, +y, -y, +z (front), -z
const FACES: Face[] = [
  { motif: "diamond", base: NIGHT, ridges: [CLAY, PAPER, CLAY] },
  { motif: "lattice", base: PAPER, ridges: [CLAY, INK, CLAY] },
  { motif: "chevron", base: INK, ridges: [PAPER, CLAY, PAPER] },
  { motif: "lattice", base: CLAY, ridges: [INK, PAPER, INK] },
  { motif: "zigzag", base: CLAY, ridges: [INK, PAPER, INK] },
  { motif: "diamond", base: PAPER, ridges: [INK, CLAY, INK] },
];

const SIZE = 512;
const FRAME = 34; // flat border so displaced faces meet cleanly at the edges

/** Paint a motif. height=true → white ridges on black (displacement/bump). */
function paint(face: Face, height: boolean): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = SIZE;
  const g = c.getContext("2d")!;
  g.fillStyle = height ? "#000" : face.base;
  g.fillRect(0, 0, SIZE, SIZE);
  g.save();
  g.beginPath();
  g.rect(FRAME, FRAME, SIZE - FRAME * 2, SIZE - FRAME * 2);
  g.clip();
  g.lineJoin = "miter";
  g.lineCap = "butt";
  const col = (i: number) => (height ? ["#fff", "#e0e0e0", "#fff"][i % 3] : face.ridges[i % 3]);
  const stroke = (i: number, w: number) => {
    g.strokeStyle = col(i);
    g.lineWidth = w;
    g.stroke();
  };
  if (face.motif === "zigzag" || face.motif === "chevron") {
    const amp = face.motif === "zigzag" ? 22 : 40, step = face.motif === "zigzag" ? 34 : 46, period = 64;
    for (let i = 0, y = FRAME; y < SIZE + amp; i++, y += step) {
      g.beginPath();
      for (let x = -period; x <= SIZE + period; x += period / 2) {
        const up = Math.round(x / (period / 2)) % 2 === 0;
        g.lineTo(x, y + (up ? -amp / 2 : amp / 2));
      }
      stroke(i, 16);
    }
  } else if (face.motif === "diamond") {
    const m = SIZE / 2;
    for (let i = 0, r = m - FRAME - 8; r > 8; i++, r -= 30) {
      g.beginPath();
      g.moveTo(m, m - r); g.lineTo(m + r, m); g.lineTo(m, m + r); g.lineTo(m - r, m); g.closePath();
      stroke(i, 14);
    }
  } else {
    const cell = 64;
    for (let i = 0, k = -SIZE; k < SIZE * 2; i++, k += cell) {
      g.beginPath(); g.moveTo(k, 0); g.lineTo(k + SIZE, SIZE); stroke(0, 9);
      g.beginPath(); g.moveTo(k + SIZE, 0); g.lineTo(k, SIZE); stroke(0, 9);
    }
    for (let y = cell / 2; y < SIZE; y += cell)
      for (let x = cell / 2; x < SIZE; x += cell) {
        g.beginPath();
        g.moveTo(x, y - 11); g.lineTo(x + 11, y); g.lineTo(x, y + 11); g.lineTo(x - 11, y); g.closePath();
        g.fillStyle = col(1);
        g.fill();
      }
  }
  g.restore();
  if (height) {
    // Soften so the relief reads as sculpted clay, not stamped metal.
    const soft = document.createElement("canvas");
    soft.width = soft.height = SIZE;
    const s = soft.getContext("2d")!;
    s.filter = "blur(3px)";
    s.drawImage(c, 0, 0);
    return soft;
  }
  return c;
}

export function ImigongoSculpture({ className = "" }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    const start = async () => {
      const THREE = await import("three");
      if (disposed) return;
      const reduced = prefersReducedMotion();

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      el.appendChild(renderer.domElement);
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.className = "h-full w-full";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
      camera.position.set(0, 0, 6.2);

      scene.add(new THREE.HemisphereLight(0xfff4e6, 0x0e1512, 0.9));
      const key = new THREE.DirectionalLight(0xffdcb8, 3.2); // warm raking key
      key.position.set(-3.5, 2.6, 2.2);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x2fbf8c, 1.1); // the one emerald accent
      rim.position.set(3, -1.5, -2.5);
      scene.add(rim);

      const materials = FACES.map((f) => {
        const map = new THREE.CanvasTexture(paint(f, false));
        map.colorSpace = THREE.SRGBColorSpace;
        map.anisotropy = 4;
        const h = new THREE.CanvasTexture(paint(f, true));
        return new THREE.MeshStandardMaterial({
          map,
          displacementMap: h,
          displacementScale: 0.07,
          bumpMap: h,
          bumpScale: 2.2,
          roughness: 0.88,
          metalness: 0,
        });
      });
      const seg = window.innerWidth < 768 ? 96 : 160;
      const block = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.7, 1.7, seg, seg, seg), materials);
      const group = new THREE.Group();
      group.add(block);
      scene.add(group);

      const resize = () => {
        const r = el.getBoundingClientRect();
        renderer.setSize(r.width, r.height, false);
        camera.aspect = r.width / Math.max(1, r.height);
        camera.updateProjectionMatrix();
      };
      resize();
      window.addEventListener("resize", resize);

      let turn = 0, turnT = 0;
      const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
      const st = ScrollTrigger.create({
        trigger: el.closest("section") ?? el,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => (turnT = self.progress),
      });
      const onMove = (e: PointerEvent) => {
        tilt.tx = (e.clientY / window.innerHeight - 0.5) * 0.35;
        tilt.ty = (e.clientX / window.innerWidth - 0.5) * 0.5;
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      const pose = (t: number) => {
        // Scroll turns roughly 1.5 revolutions' worth of faces into view.
        group.rotation.y = -0.75 + turn * Math.PI * 1.5 + tilt.y;
        group.rotation.x = 0.42 - turn * 0.7 + tilt.x;
        group.rotation.z = -0.08 + Math.sin(t * 0.00035) * 0.03;
        group.position.y = Math.sin(t * 0.0009) * 0.06;
      };

      let raf = 0, visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(el);
      const loop = (t: number) => {
        raf = requestAnimationFrame(loop);
        if (!visible) return;
        turn += (turnT - turn) * 0.06;
        tilt.x += (tilt.tx - tilt.x) * 0.05;
        tilt.y += (tilt.ty - tilt.y) * 0.05;
        pose(t);
        renderer.render(scene, camera);
      };
      if (reduced) {
        turn = 0.18;
        pose(0);
        renderer.render(scene, camera);
      } else raf = requestAnimationFrame(loop);
      el.style.opacity = "1";

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        st.kill();
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onMove);
        block.geometry.dispose();
        materials.forEach((m) => {
          m.map?.dispose();
          m.displacementMap?.dispose();
          m.dispose();
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    // Fetch three.js only when the block is about to be seen.
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        near.disconnect();
        start();
      },
      { rootMargin: "600px" },
    );
    near.observe(el);
    return () => {
      disposed = true;
      near.disconnect();
      cleanup();
    };
  }, []);

  return (
    <div
      ref={host}
      role="img"
      aria-label="A carved imigongo block, Rwandan geometric relief art, turning in 3D"
      className={`opacity-0 transition-opacity duration-700 ${className}`}
    />
  );
}
