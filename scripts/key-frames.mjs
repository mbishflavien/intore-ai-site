/* Green-screen video → transparent WebP frames.
 *
 *   node scripts/key-frames.mjs paper-tumble --fps 3 --atlas 256
 *   node scripts/key-frames.mjs drone-foliage --fps 10 --width 1920 --lo 18 --hi 50 --upscale
 *
 * Reads assets-src/video/<id>.mp4. The key works on "green dominance"
 * (g − max(r, b)): at or below --lo a pixel is solid, at or above --hi it's gone,
 * in between it fades, and the remaining green spill is pulled out of the edges.
 *
 *   --atlas <px>  crop every frame to the subject, fit it into a <px> square and
 *                 pack all of them into one atlas: public/frames/<id>/atlas.webp
 *                 (one request; good for a small sprite that tumbles around)
 *   otherwise     full frames at --width to public/frames/<id>/lg/NNNN.webp,
 *                 and half-width to sm/
 *   --upscale     2× Real-ESRGAN pass before keying (scripts/upscale.mjs)
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
if (!id) throw new Error("usage: node scripts/key-frames.mjs <id> [--fps n] [--start s] [--end s] [--lo n] [--hi n] [--atlas px | --width px]");
const fps = opt("fps", "12");
const start = opt("start", "0");
const end = opt("end", "");
const lo = Number(opt("lo", "30"));
const hi = Number(opt("hi", "90"));
const atlas = Number(opt("atlas", "0"));
const width = Number(opt("width", "1920"));
const up = rest.includes("--upscale");

const ff = execFileSync("python", ["-c", "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"]).toString().trim();
const tmp = join(tmpdir(), `key-${id}`);
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

/** Key one frame: RGBA buffer + the bounding box of what's left. */
async function key(file) {
  const { data, info } = await sharp(join(tmp, file)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const out = Buffer.alloc(w * h * 4);
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let p = 0, q = 0; p < data.length; p += 3, q += 4) {
    const r = data[p], g = data[p + 1], b = data[p + 2];
    const d = g - Math.max(r, b);
    const a = d <= lo ? 1 : d >= hi ? 0 : 1 - (d - lo) / (hi - lo);
    // Spill: never let green exceed the brighter of red/blue by more than it did inside the subject.
    out[q] = r;
    out[q + 1] = Math.min(g, Math.max(r, b) + Math.max(0, lo * 0.5));
    out[q + 2] = b;
    out[q + 3] = Math.round(a * 255);
    if (a > 0.5) {
      const i = q / 4, x = i % w, y = (i / w) | 0;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return { buf: out, w, h, box: [x0, y0, x1, y1] };
}

const out = join(ROOT, "public/frames", id);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

if (atlas) {
  // Every frame cropped to a square around the subject, then packed in a grid.
  const cols = Math.ceil(Math.sqrt(files.length));
  const rows = Math.ceil(files.length / cols);
  const tiles = [];
  for (const [i, f] of files.entries()) {
    const { buf, w, h, box } = await key(f);
    const [x0, y0, x1, y1] = box;
    const side = Math.min(Math.max(x1 - x0, y1 - y0) * 1.08 + 8, Math.min(w, h));
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const left = Math.round(Math.min(Math.max(cx - side / 2, 0), w - side));
    const top = Math.round(Math.min(Math.max(cy - side / 2, 0), h - side));
    const tile = await sharp(buf, { raw: { width: w, height: h, channels: 4 } })
      .extract({ left, top, width: Math.round(side), height: Math.round(side) })
      .resize(atlas, atlas)
      .png()
      .toBuffer();
    tiles.push({ input: tile, left: (i % cols) * atlas, top: Math.floor(i / cols) * atlas });
  }
  const info = await sharp({ create: { width: cols * atlas, height: rows * atlas, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(tiles)
    .webp({ quality: 80, alphaQuality: 90 })
    .toFile(join(out, "atlas.webp"));
  writeFileSync(join(out, "meta.json"), JSON.stringify({ count: files.length, cols, rows, tile: atlas }, null, 2) + "\n");
  console.log(`${id}: ${files.length} tiles in a ${cols}×${rows} atlas, ${(info.size / 1024).toFixed(0)} KB`);
} else {
  const sizes = { lg: width, sm: Math.round(width / 2) };
  let bytes = 0;
  for (const name of Object.keys(sizes)) mkdirSync(join(out, name), { recursive: true });
  let aspect = 16 / 9;
  for (const [i, f] of files.entries()) {
    const { buf, w, h } = await key(f);
    aspect = w / h;
    for (const [name, sw] of Object.entries(sizes)) {
      const info = await sharp(buf, { raw: { width: w, height: h, channels: 4 } })
        .resize({ width: sw })
        .webp({ quality: name === "lg" ? 80 : 74, alphaQuality: 80, smartSubsample: true, effort: 5 })
        .toFile(join(out, name, `${String(i + 1).padStart(4, "0")}.webp`));
      bytes += info.size;
    }
  }
  writeFileSync(join(out, "meta.json"), JSON.stringify({ count: files.length, fps: Number(fps), aspect }, null, 2) + "\n");
  console.log(`${id}: ${files.length} keyed frames, ${(bytes / 1024 / 1024).toFixed(1)} MB across sizes`);
}
rmSync(tmp, { recursive: true, force: true });
