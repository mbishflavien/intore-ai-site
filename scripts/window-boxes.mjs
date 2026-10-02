/* Find the keyed-out window in each frame of a keyed sequence.
 *
 *   node scripts/window-boxes.mjs drone-building
 *
 * After key-frames.mjs, both the sky and the green-screen window are transparent.
 * The sky touches the frame edge; the window is a hole enclosed by the building.
 * So: flood-fill the transparency from the edges; the sizeable holes left over
 * are the window's panes. Writes the box around them per frame (0..1 of the frame)
 * to public/frames/<id>/windows.json, for the canvas to show a scene through it.
 */

import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const id = process.argv[2];
if (!id) throw new Error("usage: node scripts/window-boxes.mjs <id>");
const dir = join(ROOT, "public/frames", id, "lg");
const W = 480; // analysis width; plenty for a box

const boxes = [];
for (const f of readdirSync(dir).filter((f) => f.endsWith(".webp")).sort()) {
  const { data, info } = await sharp(join(dir, f)).resize({ width: W }).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const clear = (i) => data[i] < 128;
  const seen = new Uint8Array(w * h);
  const fill = (start) => {
    const stack = [start];
    seen[start] = 1;
    const box = [w, h, 0, 0];
    let n = 0;
    while (stack.length) {
      const i = stack.pop(), x = i % w, y = (i / w) | 0;
      n++;
      if (x < box[0]) box[0] = x;
      if (y < box[1]) box[1] = y;
      if (x > box[2]) box[2] = x;
      if (y > box[3]) box[3] = y;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1])
        if (j >= 0 && !seen[j] && clear(j)) (seen[j] = 1), stack.push(j);
    }
    return { n, box };
  };
  // The sky: everything transparent that reaches an edge.
  for (let x = 0; x < w; x++) for (const i of [x, (h - 1) * w + x]) if (!seen[i] && clear(i)) fill(i);
  for (let y = 0; y < h; y++) for (const i of [y * w, y * w + w - 1]) if (!seen[i] && clear(i)) fill(i);
  // The window: the enclosed holes. Mullions split it into panes, so take every
  // hole of a real size (not keying specks) and join their boxes.
  const holes = [];
  for (let i = 0; i < w * h; i++) if (!seen[i] && clear(i)) holes.push(fill(i));
  const big = Math.max(0, ...holes.map((r) => r.n));
  const panes = holes.filter((r) => r.n > big * 0.15);
  const b = panes.length
    ? panes.reduce((a, { box: c }) => [Math.min(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[2], c[2]), Math.max(a[3], c[3])], [w, h, 0, 0])
    : null;
  boxes.push(b ? [b[0] / w, b[1] / h, (b[2] + 1) / w, (b[3] + 1) / h].map((v) => +v.toFixed(4)) : null);
}
// A frame where the hole wasn't found borrows its neighbour's box.
for (let i = 0; i < boxes.length; i++) boxes[i] ??= boxes[i - 1] ?? boxes.find(Boolean);
writeFileSync(join(ROOT, "public/frames", id, "windows.json"), JSON.stringify(boxes) + "\n");
console.log(`${id}: ${boxes.length} window boxes, first ${JSON.stringify(boxes[0])}, last ${JSON.stringify(boxes.at(-1))}`);
