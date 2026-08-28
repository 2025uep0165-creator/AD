#!/usr/bin/env python3
"""Install everything in grom/ into assets/ and update the manifest.

    python3 tools/install-grom.py            # see what it would do
    python3 tools/install-grom.py --apply    # actually do it
    python3 tools/install-grom.py ~/Downloads --apply     # or any other folder

Drop files into a folder called grom/ at the root of the repo and run this.
grom/ is deliberately NOT git-ignored: a cloud session only ever sees what has
been committed and pushed, so the folder has to be able to travel.
It works out what each file is from its extension and its name:

  audio (.mp3 .m4a .ogg .wav .flac)
      -> assets/theme.mp3 and manifest "audio". This is the score; supplying it
         replaces the synthesised one everywhere on the page.

  video (.mp4 .webm .mov)
      -> assets/video/hero.mp4 and manifest "hero". Loops behind the title.

  an image whose name mentions a house or the watch
      -> assets/sigils/<house>.png and manifest "sigils". Emblems arrive with
         all sorts of backgrounds, so a solid or checkerboard border is keyed
         back out to transparency before it is installed.

  any other image
      -> assets/img/<moment>.jpg and manifest "scenes", where <moment> is
         matched from the filename against the fourteen moments below.

Anything it cannot place is listed rather than guessed at, so nothing lands in
the wrong slot silently.
"""

import json
import pathlib
import re
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
GROM = ROOT / "grom"
ASSETS = ROOT / "assets"

AUDIO = {".mp3", ".m4a", ".ogg", ".oga", ".wav", ".flac", ".aac"}
VIDEO = {".mp4", ".webm", ".mov", ".m4v"}
IMAGE = {".jpg", ".jpeg", ".png", ".webp", ".avif", ".bmp", ".tif", ".tiff"}

# moment id -> the words that identify it in a filename
MOMENTS = {
    "ned":        ["ned", "eddard", "baelor", "beheading", "execution"],
    "birth":      ["birth", "born", "hatch", "pyre", "mirri", "drogo funeral"],
    "blackwater": ["blackwater", "wildfire", "green fire", "bay"],
    "redwedding": ["redwedding", "red wedding", "rains", "castamere", "twins", "frey"],
    "purple":     ["purple", "joffrey", "poison"],
    "viper":      ["viper", "oberyn", "mountain", "clegane", "trial"],
    "hardhome":   ["hardhome", "nightking", "night king", "wight"],
    "hodor":      ["hodor", "hold the door", "door", "wylis"],
    "bastards":   ["bastards", "bastard", "jon charge", "cavalry", "ramsay"],
    "sept":       ["sept", "light of the seven", "baelor sept", "cersei green"],
    "loottrain":  ["loottrain", "loot train", "roseroad", "spoils", "dracarys"],
    "longnight":  ["longnight", "long night", "arya", "not today", "winterfell battle"],
    "bells":      ["bells", "kings landing", "king's landing", "burning", "drogon city"],
    "throne":     ["throne melt", "melt", "ironthrone", "iron throne", "slag"],
}

SIGILS = {
    "nights-watch": ["nightswatch", "night's watch", "nights watch", "watch", "crow"],
    "stark":        ["stark", "direwolf"],
    "lannister":    ["lannister", "lion"],
    "targaryen":    ["targaryen", "three-headed", "dragon sigil"],
    "baratheon":    ["baratheon", "stag"],
    "greyjoy":      ["greyjoy", "kraken"],
    "tyrell":       ["tyrell", "rose"],
    "martell":      ["martell", "sun and spear", "spear"],
    "arryn":        ["arryn", "falcon", "moon and falcon"],
    "tully":        ["tully", "trout"],
    "bolton":       ["bolton", "flayed"],
    "mormont":      ["mormont", "bear"],
}
# the manifest key differs from the filename for the watch
SIGIL_KEY = {"nights-watch": "watch"}


def rel_to_root(p):
    try:
        return p.relative_to(ROOT)
    except ValueError:
        return p


def norm(name):
    return re.sub(r"[^a-z0-9]+", " ", name.lower()).strip()


def match(stem, table):
    """Longest matching keyword wins, so 'iron throne' beats 'throne'."""
    n = norm(stem)
    best, best_len = None, 0
    for key, words in table.items():
        for w in words:
            w = norm(w)
            if w in n and len(w) > best_len:
                best, best_len = key, len(w)
    return best


def key_background(src, dest):
    """Emblems arrive on white, black or a transparency checkerboard. Flood the
    border-connected background out to alpha, then, if what is left is nearly
    black, lift it to parchment so it reads on a dark card."""
    from PIL import Image
    from collections import deque

    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()

    def near(a, b, tol=42):
        return all(abs(a[i] - b[i]) <= tol for i in range(3))

    seeds = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    seen = set()
    q = deque()
    for s in seeds:
        if px[s][3] > 0:
            q.append(s)
            seen.add(s)
    base = [px[s][:3] for s in seeds]

    while q:
        x, y = q.popleft()
        px[x, y] = (0, 0, 0, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in seen:
                c = px[nx, ny]
                if c[3] > 0 and any(near(c[:3], b) for b in base):
                    seen.add((nx, ny))
                    q.append((nx, ny))

    # if the art itself is near-black it would vanish on the page: use its
    # darkness as coverage and paint it in parchment instead
    vis = [px[x, y] for y in range(0, h, 4) for x in range(0, w, 4) if px[x, y][3] > 40]
    if vis and sum(sum(c[:3]) / 3 for c in vis) / len(vis) < 46:
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if a > 0:
                    cover = 1 - (r + g + b) / 765
                    px[x, y] = (226, 214, 186, int(a * cover))

    im.thumbnail((512, 512))
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "PNG", optimize=True)


def install_image(src, dest, max_w=1800, quality=82):
    from PIL import Image
    im = Image.open(src).convert("RGB")
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "JPEG", quality=quality, optimize=True, progressive=True)


def main():
    argv = sys.argv[1:]
    apply = "--apply" in argv
    paths = [a for a in argv if not a.startswith("-")]
    src_dir = pathlib.Path(paths[0]).expanduser() if paths else GROM
    if not src_dir.is_dir():
        sys.exit(f"no {src_dir} — create it and drop the files in, then run this again")

    manifest_path = ASSETS / "manifest.json"
    man = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    man.setdefault("scenes", {})
    man.setdefault("sigils", {})

    plan, unplaced, audio_from_video = [], [], []

    for f in sorted(src_dir.rglob("*")):
        if not f.is_file() or f.name.startswith("."):
            continue
        ext = f.suffix.lower()
        stem = f.stem

        if ext in AUDIO:
            plan.append(("audio", f, ASSETS / "theme.mp3", None))
        elif ext in VIDEO:
            if any(w in norm(stem) for w in
                   ("theme", "music", "soundtrack", "song", "score", "credits")):
                audio_from_video.append(f)
            plan.append(("video", f, ASSETS / "video" / "hero.mp4", None))
        elif ext in IMAGE:
            sig = match(stem, SIGILS)
            mom = match(stem, MOMENTS)
            # a filename that names a house is an emblem; anything else is a scene
            if sig and (not mom or len(norm(sig)) >= len(norm(mom))):
                plan.append(("sigil", f, ASSETS / "sigils" / f"{sig}.png", sig))
            elif mom:
                plan.append(("scene", f, ASSETS / "img" / f"{mom}.jpg", mom))
            else:
                unplaced.append(f)
        else:
            unplaced.append(f)

    for kind, src, dest, key in plan:
        rel = dest.relative_to(ASSETS).as_posix()
        print(f"  {kind:6s} {rel_to_root(src)}  ->  assets/{rel}")
        if not apply:
            continue
        if kind == "audio":
            shutil.copy2(src, dest)
            man["audio"] = rel
        elif kind == "video":
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dest)
            man["hero"] = rel
        elif kind == "sigil":
            key_background(src, dest)
            man["sigils"][SIGIL_KEY.get(key, key)] = rel
        else:
            install_image(src, dest)
            man["scenes"][key] = rel

    if audio_from_video:
        print("\n  note: these are video files, so they go to the title slot, not the"
              "\n  score. If you meant them as music, export the audio track first"
              "\n  (any converter will do) and drop the .mp3 in instead:")
        for f in audio_from_video:
            print(f"    {rel_to_root(f)}")

    if unplaced:
        print("\n  could not place — rename these after what they show and re-run:")
        for f in unplaced:
            print(f"    {rel_to_root(f)}")
        print("    moments: " + ", ".join(sorted(MOMENTS)))
        print("    sigils:  " + ", ".join(sorted(SIGILS)))

    if apply:
        manifest_path.write_text(json.dumps(man, indent=2, sort_keys=True) + "\n")
        print(f"\n  wrote {manifest_path.relative_to(ROOT)}")
        print("  now run: python3 build.py")
    elif plan:
        print("\n  dry run — pass --apply to install")


if __name__ == "__main__":
    main()
