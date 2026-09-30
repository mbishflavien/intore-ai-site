"use client";

/* DepthScene: a photo rebuilt as real 3D geometry. A dense plane is pushed
 * toward the camera by the photo's depth map (near = white), and a perspective
 * camera moves through it, so the desk, the recruiter and the hills separate
 * with true parallax instead of a flat 2D shift.
 *
 * Driven from outside via `drive` (mutable, no re-renders):
 *   progress 0 → 1  scroll: camera pans from `startPan` to centre and dollies in
 *   lookX/lookY     cursor: the camera orbits a little toward the pointer
 * three.js is imported lazily; without WebGL / depth / motion it's a still photo. */

import { useEffect, useRef } from "react";
import { focusOf, getImage, prefersReducedMotion } from "@/lib/media";
import { MediaImage } from "./media-image";

export type SceneDrive = { progress: number };

const VERT = /* glsl */ `
  uniform sampler2D dep;
  uniform float strength;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += texture2D(dep, uv).r * strength;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`;
const FRAG = /* glsl */ `
  uniform sampler2D map;
  uniform float fade;
  varying vec2 vUv;
  void main() {
    vec3 c = texture2D(map, vUv).rgb;
    gl_FragColor = vec4(c * fade, 1.0);
  }`;

export function DepthScene({
  id,
  alt,
  drive,
  className = "",
  /** Horizontal pan at progress 0, as a fraction of the visible width (+ = look right). */
  startPan = 0,
  strength = 0.24,
}: {
  id: string;
  alt: string;
  drive: React.MutableRefObject<SceneDrive>;
  className?: string;
  startPan?: number;
  strength?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const entry = getImage(id);
  const depth = getImage(`${id}-depth`);

  useEffect(() => {
    const el = host.current;
    if (!el || !entry || !depth || prefersReducedMotion()) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      } catch {
        return; // no WebGL: the still photo underneath stays
      }
      // Pass colours straight through: the photo is already display-ready sRGB.
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      const canvas = renderer.domElement;
      canvas.className = "absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700";
      canvas.setAttribute("aria-hidden", "true");
      el.appendChild(canvas);

      const loader = new THREE.TextureLoader();
      const load = (src: string) =>
        new Promise<InstanceType<typeof THREE.Texture>>((res, rej) => loader.load(src, res, undefined, rej));
      const big = entry.widths[entry.widths.length - 1];
      const dmid = depth.widths.find((w) => w >= 1280) ?? depth.widths[depth.widths.length - 1];
      const [map, dep] = await Promise.all([load(`/media/${id}-${big}.webp`), load(`/media/${id}-depth-${dmid}.webp`)]);
      if (disposed) return;
      map.colorSpace = THREE.NoColorSpace;
      map.anisotropy = renderer.capabilities.getMaxAnisotropy();
      [map, dep].forEach((t) => {
        t.minFilter = THREE.LinearFilter;
        t.generateMipmaps = false;
      });

      const aspect = entry.w / entry.h;
      const segX = window.innerWidth < 768 ? 180 : 320;
      const geo = new THREE.PlaneGeometry(aspect, 1, segX, Math.round(segX / aspect));
      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: { map: { value: map }, dep: { value: dep }, strength: { value: strength }, fade: { value: 1 } },
      });
      const mesh = new THREE.Mesh(geo, mat);
      const scene = new THREE.Scene();
      scene.add(mesh);

      const fov = 32;
      const camera = new THREE.PerspectiveCamera(fov, 1, 0.01, 20);
      const tanHalf = Math.tan(THREE.MathUtils.degToRad(fov / 2));
      const [fx, fy] = focusOf(id).split(" ").map((v) => parseFloat(v) / 100 - 0.5);

      let viewAspect = 1;
      const resize = () => {
        const r = el.getBoundingClientRect();
        viewAspect = r.width / Math.max(1, r.height);
        renderer.setSize(r.width, r.height, false);
        camera.aspect = viewAspect;
        camera.updateProjectionMatrix();
      };
      resize();
      window.addEventListener("resize", resize);

      const look = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMove = (e: PointerEvent) => {
        look.tx = (e.clientX / window.innerWidth) * 2 - 1;
        look.ty = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      let p = drive.current.progress;
      let raf = 0;
      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(el);
      const t0 = performance.now();

      const frame = () => {
        raf = requestAnimationFrame(frame);
        if (!visible) return;
        const t = (performance.now() - t0) / 1000;
        p += (drive.current.progress - p) * 0.09;
        look.x += (look.tx - look.x) * 0.05;
        look.y += (look.ty - look.y) * 0.05;

        // Distance at which the plane exactly covers the view, with 18% slack
        // so the camera can pan and orbit without ever showing an edge.
        const cover = Math.min(1, aspect / viewAspect) / (2 * tanHalf);
        const dist = cover * 0.82 * (1 - 0.3 * p); // dolly in as you scroll
        const visW = 2 * dist * tanHalf * viewAspect;
        const slackX = Math.max(0, (aspect - visW) / 2);
        const slackY = Math.max(0, (1 - visW / viewAspect) / 2);
        const pan = startPan * (1 - p) * visW;
        const cx = THREE.MathUtils.clamp(fx * aspect * 0.5 + pan, -slackX, slackX);
        const cy = THREE.MathUtils.clamp(-fy * 0.5, -slackY, slackY);
        // Orbit: camera slides toward the pointer while looking back at the subject.
        const ox = look.x * 0.045 + Math.sin(t * 0.23) * 0.008;
        const oy = -look.y * 0.03 + Math.cos(t * 0.19) * 0.006 + (p - 0.5) * 0.03;
        // dist is measured to the background plane (z = 0), where the photo's edges are.
        camera.position.set(cx + ox, cy + oy, dist);
        camera.lookAt(cx - ox * 0.35, cy - oy * 0.35, 0);
        renderer.render(scene, camera);
        if (canvas.style.opacity !== "1") canvas.style.opacity = "1";
      };
      raf = requestAnimationFrame(frame);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onMove);
        geo.dispose();
        mat.dispose();
        map.dispose();
        dep.dispose();
        renderer.dispose();
        canvas.remove();
      };
    })().catch(() => {});

    return () => {
      disposed = true;
      cleanup();
    };
  }, [id, entry, depth, drive, startPan, strength]);

  return (
    <div ref={host} className={`${/\b(absolute|fixed)\b/.test(className) ? "" : "relative"} overflow-hidden ${className}`}>
      {/* Paints instantly; stays as the experience without WebGL or with reduced motion. */}
      <MediaImage id={id} alt={alt} reveal={false} parallax={false} priority className="absolute inset-0" />
    </div>
  );
}
