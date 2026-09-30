"""Make depth maps for DepthImage (fake-3D parallax) with Depth Anything V2 Small.

  python scripts/depth-map.py hero-still closing-still

Reads assets-src/images/<id>.(jpg|png), writes assets-src/images/<id>-depth.png
(white = near, black = far, same size as the photo). Then run
`node scripts/optimize-media.mjs` so the site picks them up.
Needs: pip install onnxruntime pillow numpy  (model is fetched once, ~27 MB).
"""

import sys
import urllib.request
from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "assets-src" / "images"
MODEL = ROOT / "assets-src" / ".models" / "depth-anything-v2-small-q.onnx"
URL = "https://huggingface.co/onnx-community/depth-anything-v2-small/resolve/main/onnx/model_quantized.onnx"
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def model():
    if not MODEL.exists():
        MODEL.parent.mkdir(parents=True, exist_ok=True)
        print("downloading depth model…")
        urllib.request.urlretrieve(URL, MODEL)
    return ort.InferenceSession(str(MODEL), providers=["CPUExecutionProvider"])


def depth(sess, photo: Image.Image) -> Image.Image:
    w, h = photo.size
    # Model wants sides that are multiples of 14; keep the photo's aspect.
    ih = 518
    iw = max(14, round(ih * w / h / 14) * 14)
    x = np.asarray(photo.convert("RGB").resize((iw, ih), Image.BICUBIC), dtype=np.float32) / 255.0
    x = ((x - MEAN) / STD).transpose(2, 0, 1)[None]
    name = sess.get_inputs()[0].name
    try:
        out = sess.run(None, {name: x})[0]
    except Exception:
        # Fixed-shape export: square input, stretched back afterwards.
        sq = np.asarray(photo.convert("RGB").resize((518, 518), Image.BICUBIC), dtype=np.float32) / 255.0
        out = sess.run(None, {name: ((sq - MEAN) / STD).transpose(2, 0, 1)[None]})[0]
    d = np.squeeze(out).astype(np.float32)
    lo, hi = np.percentile(d, 1), np.percentile(d, 99)
    d = np.clip((d - lo) / max(hi - lo, 1e-6), 0, 1)  # relative inverse depth: 1 = near
    img = Image.fromarray((d * 255).astype(np.uint8), "L").resize((w, h), Image.BICUBIC)
    # Grow near objects a little (max filter) so, when the camera leans, the
    # background stretches at silhouettes instead of the subject ghosting;
    # then soften so the shader never tears along a hard depth edge.
    size = max(3, (w // 170) | 1)
    img = img.filter(ImageFilter.MaxFilter(size))
    return img.filter(ImageFilter.GaussianBlur(radius=max(3, w // 400)))


def main():
    ids = sys.argv[1:] or ["hero-still"]
    sess = model()
    for id_ in ids:
        src = next((p for p in IMAGES.glob(f"{id_}.*") if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}), None)
        if not src:
            print(f"skip {id_}: no source image")
            continue
        out = IMAGES / f"{id_}-depth.png"
        depth(sess, Image.open(src)).save(out)
        print(f"ok   {out.name}")


if __name__ == "__main__":
    main()
