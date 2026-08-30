#!/usr/bin/env python3
"""Bundle the site into a single self-contained HTML file.

The multi-file version in this repo is the source of truth; this flattens it
into one file for hosting somewhere that wants a single document (a Claude
Artifact, a gist, an email attachment).

    python3 build.py            -> dist/winter-is-coming.html

Every image in assets/ is re-encoded smaller and inlined as a data URI, and
the score and any title clip ride along untouched, so the single file carries
all of its own media and needs nothing alongside it.
"""

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).parent

# order matters: data and Scenery must exist before effects.js runs
SCRIPTS = [
    "assets.js",
    "data.js",
    "scenery.js",
    "gl.js",
    "effects.js",
    "audio.js",
    "main.js",
]

FONTS = (
    "https://fonts.googleapis.com/css2?"
    "family=Cinzel:wght@400;600;800&"
    "family=Cinzel+Decorative:wght@700;900&"
    "family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap"
)


def build():
    """-> (html, note) — the note reports what went into the bundle."""
    html = (ROOT / "index.html").read_text()

    # every asset, re-encoded small and turned into a data URI
    sys.path.insert(0, str(ROOT / "tools"))
    import inline as inline_mod                      # noqa: E402
    payload, raw_bytes = inline_mod.build()
    inline_js = "window.INLINE_ASSETS=" + json.dumps(payload, separators=(",", ":")) + ";"

    # markup that names a file directly has to point at the data URI instead
    for rel, uri in payload["files"].items():
        html = html.replace(f'src="{rel}"', f'src="{uri}"')

    body = re.search(r"<body[^>]*>(.*)</body>", html, re.S)
    if not body:
        sys.exit("index.html: could not find <body>")
    body = re.sub(r'\s*<script src="[^"]+"></script>', "", body.group(1))

    css = (ROOT / "css/style.css").read_text()
    js = "\n\n".join(
        f"/* ===== {name} ===== */\n" + (ROOT / "js" / name).read_text()
        for name in SCRIPTS
    )

    note = f"{len(payload['files'])} media files, {raw_bytes/1e6:.2f} MB re-encoded"
    html_out = f"""<title>Winter Is Coming</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">

<style>
{css}
</style>

<script>{inline_js}</script>

<script>
/* The host supplies <body>, so index.html's class attribute is not carried
   over and the pre-enter lock has to be applied here. Opened straight off
   disk this script is parsed inside the head, where document.body is still
   null, so the lock goes on <html> in that case and the stylesheet honours
   either. */
(document.body || document.documentElement).classList.add('pre-enter');
</script>
{body}
<script>
{js}
</script>
"""
    return html_out, note


if __name__ == "__main__":
    out, note = build()
    dest = ROOT / "dist" / "winter-is-coming.html"
    dest.parent.mkdir(exist_ok=True)
    dest.write_text(out)
    print(f"{dest}\n  {len(out)/1e6:.2f} MB total — {note}")
    if len(out) > 15_500_000:
        print("  WARNING: close to the 16MB artifact ceiling")
