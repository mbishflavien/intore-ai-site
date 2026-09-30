"use client";

/* DistortImage: MediaImage + a WebGL hover ripple with a slight RGB split.
 * Raw WebGL, one fragment shader, no dependency. The canvas only renders while
 * the effect is easing in/out; otherwise the plain <img> underneath shows.
 * Skipped on touch, under reduced motion, and while the photo is missing. */

import { useEffect, useRef } from "react";
import { getImage, midSrc, prefersReducedMotion } from "@/lib/media";
import { MediaImage } from "./media-image";

const VERT = `attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;uv.y=1.-uv.y;gl_Position=vec4(p,0.,1.);}`;
const FRAG = `precision mediump float;
varying vec2 uv;uniform sampler2D t;uniform vec2 res,img,m;uniform float s,time;
void main(){
  vec2 k=res/img;float c=max(k.x,k.y);vec2 cuv=(uv-.5)*(res/(img*c))+.5;
  vec2 d=uv-m;float dist=length(d*vec2(res.x/res.y,1.));
  float w=sin(dist*26.-time*3.2)*exp(-dist*4.5)*s;
  vec2 o=normalize(d+1e-5)*w*.02;
  gl_FragColor=vec4(texture2D(t,cuv+o*1.5).r,texture2D(t,cuv+o).g,texture2D(t,cuv+o*.5).b,1.);
}`;

function DistortLayer({ src }: { src: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    // canvas → .media-inner → MediaImage root (the hover surface)
    const host = canvas?.parentElement?.parentElement;
    if (!canvas || !host) return;
    if (prefersReducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let gl: WebGLRenderingContext | null = null;
    let u: Record<string, WebGLUniformLocation | null> = {};
    let imgSize = [1, 1];
    let raf = 0;
    let strength = 0;
    let target = 0;
    const mouse = { x: 0.5, y: 0.5 };
    const t0 = performance.now();

    const init = () => {
      gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false });
      if (!gl) return false;
      const sh = (type: number, src: string) => {
        const s = gl!.createShader(type)!;
        gl!.shaderSource(s, src);
        gl!.compileShader(s);
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
      u = Object.fromEntries(["res", "img", "m", "s", "time"].map((n) => [n, gl!.getUniformLocation(prog, n)]));
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((p) => gl!.texParameteri(gl!.TEXTURE_2D, p, gl!.CLAMP_TO_EDGE));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      const image = new Image();
      image.onload = () => {
        imgSize = [image.naturalWidth, image.naturalHeight];
        gl!.bindTexture(gl!.TEXTURE_2D, tex);
        gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGB, gl!.RGB, gl!.UNSIGNED_BYTE, image);
      };
      image.src = src;
      return true;
    };

    const frame = () => {
      strength += (target - strength) * 0.08;
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      const w = Math.round(r.width * dpr);
      const h = Math.round(r.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl!.viewport(0, 0, w, h);
      gl!.uniform2f(u.res, w, h);
      gl!.uniform2f(u.img, imgSize[0], imgSize[1]);
      gl!.uniform2f(u.m, mouse.x, mouse.y);
      gl!.uniform1f(u.s, strength);
      gl!.uniform1f(u.time, (performance.now() - t0) / 1000);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      canvas.style.opacity = strength > 0.01 ? "1" : "0";
      if (target > 0 || strength > 0.002) raf = requestAnimationFrame(frame);
      else raf = 0;
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = (e.clientY - r.top) / r.height;
    };
    const onEnter = (e: PointerEvent) => {
      if (!gl && !init()) return;
      onMove(e);
      target = 1;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onLeave = () => {
      target = 0;
    };

    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [src]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-200"
    />
  );
}

export function DistortImage(props: React.ComponentProps<typeof MediaImage>) {
  const entry = getImage(props.id);
  return (
    <MediaImage {...props}>{entry && <DistortLayer src={midSrc(props.id, entry)} />}</MediaImage>
  );
}
