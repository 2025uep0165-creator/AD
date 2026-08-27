#!/usr/bin/env python3
"""Bundle the site into a single self-contained HTML file.

The multi-file version in this repo is the source of truth; this flattens it
into one file for hosting somewhere that wants a single document (a Claude
Artifact, a gist, an email attachment).

    python3 build.py            -> dist/winter-is-coming.html

Note that a bundled copy cannot see assets/ — so it always plays the
synthesised score and always uses the painted scenery, regardless of what you
have dropped into assets/. Serve the multi-file version for those.
"""

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).parent

# order matters: data and Scenery must exist before effects.js runs
SCRIPTS = [
    "data.js",
    "scenery.js",
    "gl.js",
    "scene-hero.js",
    "scene-throne.js",
    "effects.js",
    "map.js",
    "audio.js",
    "main.js",
]

FONTS = (
    "https://fonts.googleapis.com/css2?"
    "family=Cinzel:wght@400;600;800&"
    "family=Cinzel+Decorative:wght@700;900&"
    "family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap"
)


def build() -> str:
    html = (ROOT / "index.html").read_text()

    body = re.search(r"<body[^>]*>(.*)</body>", html, re.S)
    if not body:
        sys.exit("index.html: could not find <body>")
    body = re.sub(r'\s*<script src="[^"]+"></script>', "", body.group(1))

    css = (ROOT / "css/style.css").read_text()
    js = "\n\n".join(
        f"/* ===== {name} ===== */\n" + (ROOT / "js" / name).read_text()
        for name in SCRIPTS
    )

    return f"""<title>Winter Is Coming</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">

<style>
{css}
</style>

<script>
/* the host supplies <body>, so the pre-enter lock is applied here */
document.body.classList.add('pre-enter');
</script>
{body}
<script>
{js}
</script>
"""


if __name__ == "__main__":
    out = build()
    dest = ROOT / "dist" / "winter-is-coming.html"
    dest.parent.mkdir(exist_ok=True)
    dest.write_text(out)
    print(f"{dest}  ({len(out):,} bytes)")
