"use client";

/* DepthImage: a still photo that moves like film. A per-pixel depth map
 * (assets-src/images/<id>-depth.png, made by scripts/depth-map.py) displaces
 * the photo in a fragment shader, so near things shift more than far things:
 *  - scroll through the host section → slow dolly/crane drift
 *  - cursor → the camera leans toward the pointer
 *  - idle → a gentle breathing sway, so it never looks frozen
 * Falls back to the plain photo without WebGL, a depth map, or motion. */

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/motion/smooth";
import { focusOf, getImage, midSrc, prefersReducedMotion } from "@/lib/media";
import { MediaImage } from "./media-image";

const VERT = `attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;uv.y=1.-uv.y;gl_Position=vec4(p,0.,1.);}`;
const FRAG = `precision highp float;
varying vec2 uv;
uniform sampler2D img,dep;uniform vec2 res,size,focus,look;uniform float scroll,time,amp;
void main(){
  vec2 k=res/size;float c=max(k.x,k.y);
  vec2 span=res/(size*c)*.94;                    // visible fraction of the photo, 6% bleed for travel
  vec2 cuv=clamp(focus,span*.5,1.-span*.5)+(uv-.5)*span; // cover-fit centred on the focal point
  vec2 cam=look*vec2(.011,.007)+vec2(sin(time*.21)*.003,cos(time*.17)*.002)+vec2(0.,(scroll-.5)*-.014);
  float d=texture2D(dep,cuv).r;
  // Two refinement steps keep edges from smearing where depth changes fast.
  vec2 o=cam*(d-.35)*amp;
  d=texture2D(dep,cuv+o).r;o=cam*(d-.35)*amp;
  d=texture2D(dep,cuv+o).r;o=cam*(d-.35)*amp;
  gl_FragColor=vec4(texture2D(img,cuv+o).rgb,1.);
}`;

/** "45% 50%" → [0.45, 0.5] */
function focusVec(id: string): [number, number] {
  const [x, y] = focusOf(id).split(" ").map((v) => parseFloat(v) / 100);
  return [x, y];
}

export function DepthImage({
  id,
  alt,
  className = "",
  amp = 1,
  priority = false,
}: {
  id: string;
  alt: string;
  className?: string;
  /** Strength of the parallax. 1 = tuned for full-bleed heroes. */
  amp?: number;
  priority?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const entry = getImage(id);
  const depth = getImage(`${id}-depth`);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !entry || !depth || prefersReducedMotion()) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = Object.fromEntries(
      ["img", "dep", "res", "size", "focus", "look", "scroll", "time", "amp"].map((n) => [n, gl.getUniformLocation(prog, n)]),
    );
    gl.uniform1i(u.img, 0);
    gl.uniform1i(u.dep, 1);
    gl.uniform2f(u.size, entry.w, entry.h);
    const [fx, fy] = focusVec(id);
    gl.uniform2f(u.focus, fx, fy);
    gl.uniform1f(u.amp, amp);

    let loaded = 0;
    const load = (unit: number, src: string) => {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((p) => gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      const im = new Image();
      im.onload = () => {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
        loaded++;
      };
      im.src = src;
    };
    // Largest rendition for the photo (it's full-bleed); depth can be soft.
    load(0, `/media/${id}-${entry.widths[entry.widths.length - 1]}.webp`);
    load(1, midSrc(`${id}-depth`, depth));

    const look = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      look.tx = (e.clientX / window.innerWidth) * 2 - 1;
      look.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // Scroll progress across the host section (0 → 1), smoothed.
    let scroll = 0;
    let scrollT = 0;
    const st = ScrollTrigger.create({
      trigger: canvas.closest("section") ?? canvas,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => (scrollT = self.progress),
    });

    let raf = 0;
    let visible = true;
    const t0 = performance.now();
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible || loaded < 2) return;
      look.x += (look.tx - look.x) * 0.05;
      look.y += (look.ty - look.y) * 0.05;
      scroll += (scrollT - scroll) * 0.08;
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      const w = Math.round(r.width * dpr);
      const h = Math.round(r.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(u.res, w, h);
      gl.uniform2f(u.look, look.x, look.y);
      gl.uniform1f(u.scroll, scroll);
      gl.uniform1f(u.time, (performance.now() - t0) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      // Reveal only after a real frame: an unpainted opaque canvas shows black.
      if (canvas.style.opacity !== "1") canvas.style.opacity = "1";
    };
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      st.kill();
      window.removeEventListener("pointermove", onMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [id, entry, depth, amp]);

  return (
    <div className={`${/\b(absolute|fixed)\b/.test(className) ? "" : "relative"} overflow-hidden ${className}`}>
      {/* The photo paints first (and is what reduced-motion / no-WebGL users see). */}
      <MediaImage id={id} alt={alt} reveal={false} parallax={false} priority={priority} className="absolute inset-0" />
      {depth && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700"
        />
      )}
    </div>
  );
}
