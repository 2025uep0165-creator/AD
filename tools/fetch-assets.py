#!/usr/bin/env python3
"""Download the asset set from a collection page and wire up the manifest.

Usage:
    python3 tools/fetch-assets.py collection.html

Give it the HTML page an AI handed you — the one with a heading per filename
and an image beside it. It pulls every image, files it in the right folder,
writes assets/manifest.json, and prints a report of anything that looks too
small to use full-bleed.

Run it from the repository root. Needs only the standard library.
"""

import hashlib
import html
import json
import pathlib
import re
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"

BACKDROPS = {
    "ned", "birth", "blackwater", "redwedding", "purple", "viper", "hardhome",
    "hodor", "bastards", "sept", "loottrain", "longnight", "bells", "throne",
    "dragons", "thewall",
}

# filename stem -> the sigil key the site uses
SIGILS = {
    "stark": "stark", "lannister": "lannister", "targaryen": "targaryen",
    "baratheon": "baratheon", "greyjoy": "greyjoy", "tyrell": "tyrell",
    "martell": "martell", "arryn": "arryn", "tully": "tully",
    "bolton": "bolton", "mormont": "mormont",
    "nights-watch": "watch", "night-watch": "watch", "watch": "watch",
}

# filename stem -> the character name in js/data.js, which must match exactly
CAST = {
    "jon-snow": "Jon Snow",
    "daenerys-targaryen": "Daenerys Targaryen", "daenerys": "Daenerys Targaryen",
    "tyrion-lannister": "Tyrion Lannister", "tyrion": "Tyrion Lannister",
    "arya-stark": "Arya Stark", "arya": "Arya Stark",
    "cersei-lannister": "Cersei Lannister", "cersei": "Cersei Lannister",
    "ned-stark": "Eddard Stark", "eddard-stark": "Eddard Stark", "ned": "Eddard Stark",
    "sansa-stark": "Sansa Stark", "sansa": "Sansa Stark",
    "jaime-lannister": "Jaime Lannister", "jaime": "Jaime Lannister",
    "tywin-lannister": "Tywin Lannister", "tywin": "Tywin Lannister",
    "brienne-of-tarth": "Brienne of Tarth", "brienne": "Brienne of Tarth",
    "sandor-clegane": "The Hound", "the-hound": "The Hound",
    "bran-stark": "Bran Stark", "bran": "Bran Stark",
    "melisandre": "Melisandre",
    "ygritte": "Ygritte",
    "joffrey-baratheon": "Joffrey Baratheon", "joffrey": "Joffrey Baratheon",
    "olenna-tyrell": "Olenna Tyrell", "olenna": "Olenna Tyrell",
    "oberyn-martell": "Oberyn Martell", "oberyn": "Oberyn Martell",
    "theon-greyjoy": "Theon Greyjoy", "theon": "Theon Greyjoy",
    "samwell-tarly": "Samwell Tarly", "samwell": "Samwell Tarly", "sam": "Samwell Tarly",
    "night-king": "The Night King", "the-night-king": "The Night King",
}

UA = {"User-Agent": "Mozilla/5.0 (compatible; asset-fetch/1.0)"}
# jpg, png, gif, webp
MAGIC = (b"\xff\xd8\xff", b"\x89PNG", b"GIF8", b"RIFF")


def parse(page: str):
    """Yield (filename, url) in document order."""
    pattern = re.compile(
        r"<h2[^>]*>(?P<name>[^<]+)</h2>.*?<img[^>]+src=[\"'](?P<url>[^\"']+)",
        re.S | re.I,
    )
    for m in pattern.finditer(page):
        yield html.unescape(m.group("name")).strip(), html.unescape(m.group("url")).strip()


def destination(stem: str):
    """-> (folder, manifest group, manifest key) or None if unrecognised."""
    if stem == "iron-throne":
        return "img", "throne", None
    if stem in BACKDROPS:
        return "img", "scenes", stem
    if stem in SIGILS:
        return "sigils", "sigils", SIGILS[stem]
    if stem in CAST:
        return "cast", "cast", CAST[stem]
    return None


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    page = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8", errors="replace")
    items = list(parse(page))
    if not items:
        sys.exit("No <h2>filename</h2> + <img src> pairs found in that file.")

    print(f"Found {len(items)} entries.\n")
    manifest = {"scenes": {}, "sigils": {}, "cast": {}}
    by_hash, small, failed, skipped, dupes = {}, [], [], [], []

    for name, url in items:
        stem = pathlib.Path(name).stem.lower()
        dest = destination(stem)
        if not dest:
            skipped.append(name)
            continue
        folder, group, key = dest

        out_dir = ASSETS / folder
        out_dir.mkdir(parents=True, exist_ok=True)

        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=60) as r:
                blob = r.read()
        except Exception as exc:                      # noqa: BLE001
            failed.append((name, str(exc)[:70]))
            print(f"  FAIL  {name:26} {str(exc)[:50]}")
            continue

        if not blob.startswith(MAGIC):
            failed.append((name, "not an image"))
            print(f"  FAIL  {name:26} server returned something that isn't an image")
            continue

        # keep the extension the server actually gave us
        ext = ".png" if blob.startswith(b"\x89PNG") else ".jpg"
        if blob.startswith(b"GIF8"):
            ext = ".gif"
        elif blob.startswith(b"RIFF"):
            ext = ".webp"
        filename = stem + ext

        (out_dir / filename).write_bytes(blob)
        kb = len(blob) // 1024

        # Compare content, not URLs — the same picture is often served from
        # several different URLs, and a search tool reusing one image for two
        # different assets is the failure worth catching.
        digest = hashlib.sha256(blob).hexdigest()
        note = ""
        if digest in by_hash:
            dupes.append((name, by_hash[digest]))
            note = f"  <- identical to {by_hash[digest]}"
        else:
            by_hash[digest] = name

        if group == "throne":
            manifest["throne"] = f"img/{filename}"
        else:
            manifest[group][key] = f"{folder}/{filename}"

        # a full-bleed backdrop under ~120KB is almost certainly a thumbnail
        if group == "scenes" and kb < 120:
            small.append((name, kb))
        print(f"  ok    {name:26} {kb:>5} KB  -> assets/{folder}/{filename}{note}")

    manifest = {k: v for k, v in manifest.items() if v}
    if (ASSETS / "theme.mp3").exists():
        manifest["audio"] = "theme.mp3"

    (ASSETS / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")

    print(f"\nWrote assets/manifest.json")
    print(f"  backdrops {len(manifest.get('scenes', {}))}"
          f"  sigils {len(manifest.get('sigils', {}))}"
          f"  cast {len(manifest.get('cast', {}))}"
          f"  throne {'yes' if manifest.get('throne') else 'no'}")

    if small:
        print(f"\n{len(small)} backdrop(s) look like thumbnails and will be soft "
              f"behind full-screen text:")
        for n, kb in small:
            print(f"  {n}  ({kb} KB)")
    if dupes:
        print(f"\n{len(dupes)} duplicate(s) — the same picture used twice, so one "
              f"of each pair is wrong:")
        for a, b in dupes:
            print(f"  {a}  is the same image as  {b}")
    if failed:
        print(f"\n{len(failed)} failed:")
        for n, why in failed:
            print(f"  {n}  {why}")
    if skipped:
        print(f"\n{len(skipped)} unrecognised filename(s), left alone: "
              f"{', '.join(skipped[:8])}{' …' if len(skipped) > 8 else ''}")

    print("\nNow:  python3 -m http.server 8000   and open http://localhost:8000")


if __name__ == "__main__":
    main()
