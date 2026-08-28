#!/usr/bin/env python3
"""Re-encode assets/ small enough to inline, and emit them as data URIs.

The published artifact is one HTML file with a hard 16MB ceiling, and base64
adds about a third on top. So the bundle gets its own, smaller encode of every
asset rather than shipping the repo copies.
"""
import base64, io, json, pathlib

ROOT = pathlib.Path(__file__).parent.parent
ASSETS = ROOT / "assets"

# folder -> (max width, jpeg quality)
BUDGET = {
    "img":     (1400, 66),
    "houses":  (900, 66),
    "seasons": (460, 68),
    "cast":    (320, 68),
    "sigils":  (300, 0),      # png, kept with alpha
}
BIG = {"hero.jpg": (1800, 70), "throne-room.jpg": (1500, 66)}


def encode(path: pathlib.Path, folder: str):
    from PIL import Image
    im = Image.open(path)
    maxw, q = BUDGET.get(folder, (1200, 66))
    if path.name in BIG:
        maxw, q = BIG[path.name]
    if im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    if im.mode in ("RGBA", "LA", "P") and folder == "sigils":
        im = im.convert("RGBA").quantize(colors=192, method=Image.FASTOCTREE)
        im.save(buf, "PNG", optimize=True)
        mime = "image/png"
    else:
        im.convert("RGB").save(buf, "JPEG", quality=q, optimize=True, progressive=True)
        mime = "image/jpeg"
    return mime, buf.getvalue()


def build():
    files, raw = {}, 0
    for folder in ("img", "houses", "seasons", "cast", "sigils"):
        d = ASSETS / folder
        if not d.is_dir():
            continue
        for p in sorted(d.iterdir()):
            if p.name.startswith(".") or p.suffix.lower() not in (".jpg", ".jpeg", ".png"):
                continue
            mime, blob = encode(p, folder)
            raw += len(blob)
            key = f"assets/{folder}/{p.name}"
            files[key] = f"data:{mime};base64," + base64.b64encode(blob).decode()

    manifest = {}
    mf = ASSETS / "manifest.json"
    if mf.exists():
        manifest = json.loads(mf.read_text())
    return {"files": files, "manifest": manifest}, raw


if __name__ == "__main__":
    payload, raw = build()
    js = "window.INLINE_ASSETS=" + json.dumps(payload, separators=(",", ":")) + ";"
    (ROOT / "dist").mkdir(exist_ok=True)
    (ROOT / "dist" / "inline-assets.js").write_text(js)
    print(f"{len(payload['files'])} files  raw {raw/1e6:.2f} MB  "
          f"as data URIs {len(js)/1e6:.2f} MB")
