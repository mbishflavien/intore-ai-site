"""Generate site imagery from assets-src/shots.json via Gemini image models.

Usage:
  python scripts/gen-image.py                 # all shots, skip existing
  python scripts/gen-image.py hero-still      # only these ids
  python scripts/gen-image.py --fast --force  # draft model, overwrite

Outputs raw PNGs to assets-src/images/<id>-v<N>.png. Optimise with
`node scripts/optimize-media.mjs` before they ship.
"""

import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from google import genai
from google.genai import types

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src"
OUT = SRC / "images"
PRO = "gemini-3-pro-image-preview"
FAST = "gemini-2.5-flash-image"


def generate(client, model, shot, style, i, force):
    dest = OUT / f"{shot['id']}-v{i}.png"
    if dest.exists() and not force:
        return f"skip {dest.name}"
    prompt = f"{shot['prompt']}\n\n{style[shot['kind']]}"
    try:
        res = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
                image_config=types.ImageConfig(aspect_ratio=shot["aspect"]),
            ),
        )
        for part in res.candidates[0].content.parts:
            if part.inline_data and part.inline_data.mime_type.startswith("image/"):
                dest.write_bytes(part.inline_data.data)
                return f"ok   {dest.name}"
        return f"FAIL {dest.name}: no image in response"
    except Exception as e:  # keep the batch going
        return f"FAIL {dest.name}: {e}"


def main():
    args = sys.argv[1:]
    force = "--force" in args
    model = FAST if "--fast" in args else PRO
    ids = [a for a in args if not a.startswith("--")]

    cfg = json.loads((SRC / "shots.json").read_text(encoding="utf-8"))
    shots = [s for s in cfg["shots"] if not ids or s["id"] in ids]
    OUT.mkdir(parents=True, exist_ok=True)

    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    jobs = [(s, i) for s in shots for i in range(1, s.get("n", 1) + 1)]
    print(f"{len(jobs)} images with {model}")
    with ThreadPoolExecutor(max_workers=4) as pool:
        for line in pool.map(lambda j: generate(client, model, j[0], cfg["style"], j[1], force), jobs):
            print(line, flush=True)


if __name__ == "__main__":
    main()
