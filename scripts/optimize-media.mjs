/* Raw sources → web-ready media + lib/media-manifest.json.
 *
 *   assets-src/images/<id>.(png|jpg|jpeg|webp)  → public/media/<id>-<w>.(avif|webp)
 *   assets-src/video/<id>.mp4 (+ <id>-portrait.mp4) → public/videos/ambient/<id>.(webm|mp4|jpg)
 *
 * Components read the manifest and fall back to code-drawn imigongo panels for
 * anything not yet present, so the site ships at every stage.
 * Run: node scripts/optimize-media.mjs   (ffmpeg comes from Python's imageio-ffmpeg)
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, parse } from "node:path";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const IMG_SRC = join(ROOT, "assets-src/images");
const VID_SRC = join(ROOT, "assets-src/video");
const IMG_OUT = join(ROOT, "public/media");
const VID_OUT = join(ROOT, "public/videos/ambient");
const WIDTHS = [640, 1280, 2000];

const manifest = { images: {}, videos: {} };

async function images() {
  if (!existsSync(IMG_SRC)) return;
  mkdirSync(IMG_OUT, { recursive: true });
  for (const file of readdirSync(IMG_SRC)) {
    const { name, ext } = parse(file);
    if (!/\.(png|jpe?g|webp)$/i.test(ext) || /-v\d+$/.test(name)) continue; // -vN = unpicked drafts
    const src = join(IMG_SRC, file);
    const meta = await sharp(src).metadata();
    const widths = WIDTHS.filter((w) => w < meta.width).concat(Math.min(meta.width, 2400));
    for (const w of [...new Set(widths)]) {
      const base = sharp(src).resize({ width: w }).modulate({ saturation: 0.94 });
      await base.clone().avif({ quality: 52, effort: 6 }).toFile(join(IMG_OUT, `${name}-${w}.avif`));
      await base.clone().webp({ quality: 74 }).toFile(join(IMG_OUT, `${name}-${w}.webp`));
    }
    if (name === "og-base") {
      // Social card renderer (Satori) wants JPEG/PNG at the exact card size.
      await sharp(src).resize(1200, 630, { fit: "cover" }).jpeg({ quality: 80, mozjpeg: true })
        .toFile(join(IMG_OUT, "og-base-og.jpg"));
    }
    const blur = await sharp(src).resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
    manifest.images[name] = {
      w: meta.width,
      h: meta.height,
      widths: [...new Set(widths)],
      blur: `data:image/webp;base64,${blur.toString("base64")}`,
    };
    console.log(`img  ${name}  ${meta.width}×${meta.height}`);
  }
}

function ffmpegPath() {
  return execFileSync("python", ["-c", "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"])
    .toString()
    .trim();
}

function videos() {
  if (!existsSync(VID_SRC)) return;
  const files = readdirSync(VID_SRC).filter((f) => /\.(mp4|mov|webm)$/i.test(f));
  if (!files.length) return;
  mkdirSync(VID_OUT, { recursive: true });
  const ff = ffmpegPath();
  const run = (args) => execFileSync(ff, ["-y", "-loglevel", "error", ...args]);
  for (const file of files) {
    const { name } = parse(file);
    const src = join(VID_SRC, file);
    const portrait = name.endsWith("-portrait");
    const scale = portrait ? "scale=720:-2" : "scale=1600:-2";
    const vf = `${scale},fps=24,format=yuv420p`;
    run(["-i", src, "-an", "-vf", vf, "-c:v", "libx264", "-preset", "slow", "-crf", "26",
      "-movflags", "+faststart", "-profile:v", "high", join(VID_OUT, `${name}.mp4`)]);
    run(["-i", src, "-an", "-vf", vf, "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0",
      "-row-mt", "1", "-deadline", "good", join(VID_OUT, `${name}.webm`)]);
    run(["-ss", "0.5", "-i", src, "-frames:v", "1", "-vf", scale, "-q:v", "4", join(VID_OUT, `${name}.jpg`)]);
    const id = name.replace(/-portrait$/, "");
    manifest.videos[id] = { ...(manifest.videos[id] ?? {}), [portrait ? "portrait" : "landscape"]: true };
    console.log(`vid  ${name}`);
  }
}

await images();
videos();
writeFileSync(join(ROOT, "lib/media-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `manifest: ${Object.keys(manifest.images).length} images, ${Object.keys(manifest.videos).length} videos`,
);
