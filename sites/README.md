# Miniature-build creator sites

Three standalone sites built on the same engine as the VFUHO legacy site
(`claude/vfuho-legacy-website-cutv18`), for three creators working in the same
niche — miniature construction — **who have no website of their own**.

Each folder is self-contained: open `index.html` or serve the folder and it
runs. Nothing is shared between them at runtime.

| Site | Creator | Channel | Subs | Views | Catalogue |
|---|---|---|---|---|---|
| `ouroborosarq/` | OUROBOROS ARQ | [@OUROBOROS-ARQ192](https://www.youtube.com/@OUROBOROS-ARQ192) | 3.06M | 633,306,192 | 277 builds |
| `mini-construction/` | Mini Construction | [@Chien-Tran](https://www.youtube.com/@Chien-Tran) | 297K | 70,312,232 | 170 projects |
| `mini-architect/` | Mini Architect | [@theminiarchitect](https://www.youtube.com/@theminiarchitect) | 124K | 27,456,641 | 29 build films |

Figures were read from each channel's own About page on 21 September 2026.

## How the three were chosen

Candidates were drawn from YouTube search across the miniature-construction
niche, then filtered on three conditions:

1. **Same work as VFUHO** — real materials and real construction sequence at
   miniature scale, not dollhouse or model-kit assembly.
2. **No website.** Confirmed against each channel's About page, which is the
   authoritative list of a creator's own links. All three list none.
   — `@fuho` (314K) was rejected: it links `fuhominihouse.blogspot.com`.
   — `@Micro_Construction` (1.6M) was rejected: the About text describes
   miniature work but the uploads are children's cartoons.
3. **Enough of an audience and archive** to carry the format, which is built
   around a body of work rather than a handful of videos.

Of the three, only Mini Architect lists any external link at all (a Facebook
page), and its site links it. The other two link YouTube only, because that is
all they publish.

## What differs from the VFUHO site

The engine (`main.js`, `scene.js`, the vendored three.js, the props model and
the stylesheet structure) is unchanged in behaviour. Per site:

- **`assets/js/site.js`** — brand, figures, the nine build chapters, disciplines,
  technique ledger, timeline, platforms and filters. All copy is written to the
  creator's actual body of work.
- **`assets/js/works.js`** — the catalogue, harvested from the live channel:
  video id, title, view count, duration and discipline.
- **`index.html`** — headings, section copy and metadata.
- **Palette** — `:root` in `style.css` plus the brick, concrete, sky, ground and
  lighting colours in `scene.js`. Graphite/blueprint-blue for OUROBOROS ARQ,
  river-green/turbine-teal for Mini Construction, near-black/brass for
  Mini Architect.
- **`assets/img/mark.svg`** — a geometric mark per creator, with `logo.png` and
  `favicon.png` rendered from it.

Three changes were made to the shared engine so it suits film-first channels,
and they are applied to all three copies:

- `CATNAME` is derived from `FILTERS` instead of being hardcoded, so category
  labels cannot drift from the filter bar.
- The craft column reads its picks from `STACK` in `site.js` rather than a
  hardcoded id list.
- The marquee and the wall take Shorts first and top up with films, and get an
  `is-wide` class when the catalogue is film-dominant so the poster bands use
  16:9 frames instead of empty 9:16 ones. VFUHO is Shorts-first; two of these
  three are not.

## Running one

```sh
cd sites/ouroborosarq && python3 -m http.server 8801
```

A server is needed rather than `file://` — the page uses ES modules and an
import map.

## Note on content

Thumbnails are loaded from YouTube at view time and the films play in YouTube's
own embed; nothing is copied into this repository. Each site states in its
footer that the thumbnails and films are the property of the creator. These are
unsolicited tribute sites — no creator has been contacted about them.
