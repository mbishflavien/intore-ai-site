/* 2× AI upscale of a folder of PNG frames, in place, with Real-ESRGAN
 * (realesr-animevideov3: the fast video model; ~9 s a frame on an Intel iGPU).
 * The ncnn-vulkan build lives in assets-src/.models/realesrgan, from
 * github.com/xinntao/Real-ESRGAN/releases (realesrgan-ncnn-vulkan-*-windows.zip).
 *
 * Resumable: finished frames collect in `<dir>-up` and survive an interrupted
 * run, so running the same command again only does the frames that are left.
 * (The extraction is deterministic, so frame names line up between runs.) */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";

export function upscale(root, dir) {
  const bin = join(root, "assets-src/.models/realesrgan/realesrgan-ncnn-vulkan.exe");
  if (!existsSync(bin)) throw new Error(`Real-ESRGAN not found at ${bin}`);
  const out = `${dir}-up`;
  mkdirSync(out, { recursive: true });
  const done = new Set(readdirSync(out));
  const todo = join(dir, "todo");
  mkdirSync(todo, { recursive: true });
  const frames = readdirSync(dir).filter((f) => f.endsWith(".png"));
  for (const f of frames) if (!done.has(f)) renameSync(join(dir, f), join(todo, f));
  const left = readdirSync(todo).length;
  console.log(`upscaling ${left} of ${frames.length} frames (${frames.length - left} already done)…`);
  // One frame at a time, so every finished frame is kept even if the run is stopped.
  for (const [i, f] of readdirSync(todo).sort().entries()) {
    execFileSync(bin, ["-i", join(todo, f), "-o", join(out, f), "-n", "realesr-animevideov3", "-s", "2"], { stdio: "ignore" });
    if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${left}`);
  }
  rmSync(dir, { recursive: true, force: true });
  renameSync(out, dir);
}
