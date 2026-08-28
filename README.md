# Winter Is Coming

An animated, three-dimensional Game of Thrones retrospective — built to be
scrolled. Fifteen sections covering the houses, the map, all eight seasons,
fourteen moments that broke television, the dragons, the Long Night, and the
throne that ends up as slag.

**Open `index.html` in a browser.** No build step, no install, no server
required (though a local server avoids the odd `file://` quirk):

```bash
python3 -m http.server 8000    # then visit http://localhost:8000
```

---

## What's in it

| Section | What it does |
| --- | --- |
| **Title** | A full-bleed still of King's Landing under the parallax, embers drifting over it, the title cut in a letter at a time |
| **The Game** | The premise in three columns, plus the production facts |
| **The Map** | A drawn SVG atlas of Westeros and western Essos — curved coastlines roughened by a fractal displacement filter, relief hatching and woodland clipped to the land, the Iron Islands and Dragonstone offshore, a compass rose, a drifting raven, and the Wall clipped to the northern coast. 26 selectable locations; drag to pan, scroll to zoom, double-click to close in |
| **The Houses** | Nine great houses as 3D-tilting cards — the real heraldic emblem over a still of the house's own seat; click one to expand its history, seat, and a fact |
| **8 Seasons** | A drag/scroll/arrow-key rail — every season, its key events, and how it closed |
| **Moments** | Fourteen full-screen panels that stack over one another as you scroll. Each sits on the still from its own scene, graded to its own palette, with matching particles — embers, ash, snow, blood — over the top |
| **Dragons** | Drogon, Rhaegal and Viserion crossing the panel — the lead one breathes fire at your cursor |
| **The Long Night** | Snowfall, the White Walkers, dragonglass and Valyrian steel |
| **The Throne** | ~200 procedural swords baked into one mesh. Scroll and it melts, in the vertex shader |
| **The Cast** | Twenty characters, their actor, their allegiance, and how they ended |
| **The List** | Arya's list — each name strikes through as it crosses the screen |
| **Words · Score · Numbers · The End** | Quotes, the music, the statistics, the sign-off |

Keyboard: `M` toggles the score, `Esc` closes an open house panel, `←`/`→`
drives the season rail when it's focused.

---

## Three things worth knowing

**Photographs where a photograph is the right answer; code everywhere else.**
Sixty-nine images ship in `assets/` — the moment backdrops, the house seats, the
season posters, the cast, the heraldic emblems — pulled from the show's own
material and re-encoded small. Around them, everything is still generated: WebGL
for the Iron Throne, canvas matte paintings as the fallback scenery, the SVG
atlas, and the particle systems for embers, snow, fire and blood. There is no
video: HBO's footage isn't something this repo can carry.

**Every drawn thing has a slot.** Backdrops, house sigils, cast portraits, the
Iron Throne and the score can each be replaced by a real file without touching
the code: put it in `assets/`, name it in `assets/manifest.json`, and it takes
over. Anything you don't supply keeps what the code draws.
**[`ASSETS.md`](ASSETS.md) is the full list** (and [`ASSET-PROMPT.md`](ASSET-PROMPT.md) is a ready-to-paste prompt for sourcing it) — every id, what shot works, and
the formats.

**The music is not the real theme.** Djawadi's main title is a copyrighted
composition, so instead `js/audio.js` synthesises an original piece live in the
browser with the Web Audio API: a cello ostinato in C minor over i–VI–III–VII,
with the instrumentation re-scored section by section as you scroll (drums come
in for the war sections, ice bells for the North, everything drops away for the
quiet ones). To use your own file instead, see [`ASSETS.md`](ASSETS.md).

---

## Layout

```
index.html            page structure — mostly empty containers
css/style.css         the whole design system
js/assets.js          the drop-in layer — reads assets/manifest.json
js/data.js            all the lore: houses, seasons, moments, cast, quotes, sigil SVG
js/scenery.js         the matte paintings — skyline, wall, godswood, hall, pyre, crowd, battlefield
js/gl.js              tiny WebGL helper — mat4 maths, shaders, procedural meshes
js/scene-throne.js    the Iron Throne, and the shader that melts it
js/effects.js         embers, snow, per-moment atmospheres, dragons, cursor sparks
js/map.js             the map geometry and its 26 locations
js/audio.js           the synthesised score
js/main.js            builds every section from the data, runs one rAF loop
assets/               the images, and manifest.json that names them
tools/                the sourcing and re-encoding scripts
build.py              flattens the whole thing into one self-contained file
```

`python3 build.py` writes `dist/winter-is-coming.html`: the markup, the CSS, all
nine scripts and every image re-encoded and inlined as a data URI — one file,
about 4.5 MB, that opens anywhere with no server and no `assets/` folder.

No dependencies. No CDN, apart from an optional Google Fonts link for Cinzel and
EB Garamond — if it's blocked, the fallback serif stack takes over and the page
is unaffected. Nothing is tracked or phoned home.

Everything animated is gated behind an IntersectionObserver so off-screen
canvases stop drawing and scenery isn't painted until it's needed, and the whole thing collapses to a static, readable
document under `prefers-reduced-motion: reduce`.

---

## Credit

A non-commercial fan tribute. *Game of Thrones* is © HBO, based on *A Song of
Ice and Fire* by George R. R. Martin. No affiliation is claimed or implied.
