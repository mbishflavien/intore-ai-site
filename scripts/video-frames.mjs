/* Video → scroll-scrub frame sequence.
 *
 *   node scripts/video-frames.mjs drone-hills --start 1.85 --fps 12 --upscale
 *
 * Reads assets-src/video/<id>.mp4, writes public/frames/<id>/<size>/NNNN.webp for
 * two sizes (1920 desktop, 960 mobile) plus public/frames/<id>/meta.json.
 * --upscale runs a 2× Real-ESRGAN pass first (scripts/upscale.mjs): our clips are soft 720p.
 * ffmpeg comes from Python's imageio-ffmpeg; sharp does the WebP encoding.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import sharp from "sharp";
import { upscale } from "./upscale.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const [id, ...rest] = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : dflt;
};
if (!id) throw new Error("usage: node scripts/video-frames.mjs <id> [--start s] [--end s] [--fps n]");
const start = opt("start", "0");
const end = opt("end", "");
const fps = opt("fps", "12");
const up = rest.includes("--upscale");

const ff = execFileSync("python", ["-c", "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"]).toString().trim();
const tmp = join(tmpdir(), `frames-${id}`);
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
execFileSync(ff, [
  "-y", "-loglevel", "error",
  "-ss", start, ...(end ? ["-to", end] : []),
  "-i", join(ROOT, "assets-src/video", `${id}.mp4`),
  "-an", "-vf", `fps=${fps}`,
  join(tmp, "%04d.png"),
]);

if (up) upscale(ROOT, tmp);
const files = readdirSync(tmp).filter((f) => f.endsWith(".png")).sort();
const out = join(ROOT, "public/frames", id);
rmSync(out, { recursive: true, force: true });
const sizes = { lg: 1920, sm: 960 };
let bytes = 0;
for (const [name, w] of Object.entries(sizes)) {
  mkdirSync(join(out, name), { recursive: true });
  for (const [i, f] of files.entries()) {
    const info = await sharp(join(tmp, f))
      .resize({ width: w })
      .webp({ quality: name === "lg" ? 80 : 74, smartSubsample: true, effort: 5 })
      .toFile(join(out, name, `${String(i + 1).padStart(4, "0")}.webp`));
    bytes += info.size;
  }
}
const first = await sharp(join(tmp, files[0])).metadata();
writeFileSync(
  join(out, "meta.json"),
  JSON.stringify({ count: files.length, fps: Number(fps), aspect: first.width / first.height }, null, 2) + "\n",
);
rmSync(tmp, { recursive: true, force: true });
console.log(`${id}: ${files.length} frames, ${(bytes / 1024 / 1024).toFixed(1)} MB across sizes`);
