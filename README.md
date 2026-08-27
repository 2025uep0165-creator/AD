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
| **Title** | A WebGL clockwork orrery — sun, gears, armillary rings and seven castles riding the outer band — that orbits under the cursor and dollies away as you scroll |
| **The Game** | The premise in three columns, plus the production facts |
| **The Map** | Hand-plotted SVG map of Westeros and western Essos. 26 selectable locations, a drifting raven, the Wall across the top |
| **The Houses** | Nine great houses as 3D-tilting cards with hand-drawn heraldic sigils; click one to expand its history, seat, and a fact |
| **8 Seasons** | A drag/scroll/arrow-key rail — every season, its key events, and how it closed |
| **Moments** | Fourteen full-screen panels that stack over one another as you scroll. Each sits in a painted scene — a burning King's Landing, the Wall, a godswood, a hall of columns — graded to its own palette, with matching particles over the top |
| **Dragons** | Drogon, Rhaegal and Viserion crossing the panel — the lead one breathes fire at your cursor |
| **The Long Night** | Snowfall, the White Walkers, dragonglass and Valyrian steel |
| **The Throne** | ~200 procedural swords baked into one mesh. Scroll and it melts, in the vertex shader |
| **The Cast** | Twenty characters, their actor, their allegiance, and how they ended |
| **The List** | Arya's list — each name strikes through as it crosses the screen |
| **Words · Score · Numbers · The End** | Quotes, the music, the statistics, the sign-off |

Keyboard: `M` toggles the score, `Esc` closes an open house panel, `←`/`→`
drives the season rail when it's focused.

---

## Two things worth knowing

**There are no photographs — but there's a slot for them.** Every visual is
generated in code: WebGL for the orrery and the throne, canvas matte paintings
for the scenery behind each moment, hand-authored SVG for the sigils and the
map, particle systems for embers, snow, fire and blood. Official stills belong
to HBO, so none ship here.

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
js/scene-hero.js      the clockwork orrery
js/scene-throne.js    the Iron Throne, and the shader that melts it
js/effects.js         embers, snow, per-moment atmospheres, dragons, cursor sparks
js/map.js             the map geometry and its 26 locations
js/audio.js           the synthesised score
js/main.js            builds every section from the data, runs one rAF loop
```

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
