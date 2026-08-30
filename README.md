# Winter Is Coming

An animated, three-dimensional Game of Thrones retrospective — built to be
scrolled. Fourteen sections covering the nine great houses and their
bannermen, all eight seasons, fourteen moments that broke television, the
dragons, the Long Night, and the throne that ends up as slag.

**Open `index.html` in a browser.** No build step, no install, no server
required (though a local server avoids the odd `file://` quirk):

```bash
python3 -m http.server 8000    # then visit http://localhost:8000
```

---

## What's in it

| Section | What it does |
| --- | --- |
| **Title** | Five plates on a rotation — King's Landing from the air, Drogon in flight, dragonfire on the field, Winterfell under fog, the Wall. Each holds the frame for about five seconds while it drifts in or out, then crossfades into the next. Driven from `js/main.js` rather than a chain of CSS delays, so a plate cannot silently drop out of the rotation. Drop a clip in and it plays that instead |
| **The Game** | The premise in three columns, plus the production facts |
| **The Houses** | Nine great houses on an even three-by-three, as 3D-tilting cards — the real heraldic emblem over a still of the house's own seat. Click one to open its history, seat, notable names and the houses sworn to it; click it again to close |
| **8 Seasons** | The heading scrolls in normally, then the deck pins and scrolling down walks it across — the track is exactly as tall as the distance the cards have to travel, and when the last one lands the page carries on down. The cards keep their designed size; on a frame too short for them the whole deck scales rather than the type being squeezed |
| **Moments** | Fourteen full-screen panels, one screen each, in ordinary flow — no sticky stack and no scroll-snap, so the page moves the distance you asked it to and a moment holds the whole screen while it is there. Its copy settles as it takes the frame and lifts away as it leaves. Each sits on the still from its own scene, graded to its own palette, with matching particles — embers, ash, snow, blood — over the top |
| **Dragons** | Drogon, Rhaegal and Viserion in their own section — what they were, what they cost, and how each of them died |
| **The Long Night** | Snowfall, the White Walkers, dragonglass and Valyrian steel |
| **The Throne** | Three plates for three beats — Tommen enthroned, Jaime on it after killing the king he served, and the chair inside Drogon's fire — pushed into as the section runs, with the heat coming up under the last |
| **The Cast** | Twenty characters, their actor, their allegiance, and how they ended |
| **The List** | Arya's list — each name strikes through as it crosses the screen |
| **Words · Score · Numbers · The End** | Quotes, the music, the statistics, the sign-off |

Keyboard: `M` toggles the score, `Esc` closes an open house panel, `←`/`→`
drives the season rail when it's focused.

---

## Three things worth knowing

**Photographs where a photograph is the right answer; code everywhere else.**
Seventy-odd images ship in `assets/` — the moment backdrops, the house seats,
the season posters, the cast, the heraldic emblems — pulled from the show's own
material and re-encoded small. Around them, everything is still generated:
embers, snow, fire and blood are particle systems, and the grading, the
parallax and the type are all code. There is no video: HBO's footage isn't
something this repo can carry.

**Every drawn thing has a slot.** Backdrops, house sigils, cast portraits, the
Iron Throne and the score can each be replaced by a real file without touching
the code: put it in `assets/`, name it in `assets/manifest.json`, and it takes
over. Anything you don't supply keeps what the code draws.
**[`ASSETS.md`](ASSETS.md) is the full list** (and [`ASSET-PROMPT.md`](ASSET-PROMPT.md) is a ready-to-paste prompt for sourcing it) — every id, what shot works, and
the formats.

**Bring your own media.** Put files in a folder called `grom/` at the root and
run `python3 tools/install-grom.py --apply` (it takes a path too, if the files
live somewhere else: `python3 tools/install-grom.py ~/Downloads --apply`).
`grom/` is deliberately not git-ignored — a cloud session only ever sees what
has been committed and pushed, so the folder has to be able to travel. It
works out what each file is from its name and extension, files it into
`assets/`, keys the background out of any emblem, and updates the manifest. Audio lands as the score. Video loops behind
the title. Images matched to one of the fourteen moments replace that backdrop.
Anything it can't place is listed rather than guessed at.

With no audio file present, `js/audio.js` falls back to a piece synthesised
live in the browser — a cello ostinato in C minor over i–VI–III–VII, re-scored
section by section as you scroll.

---

## Layout

```
index.html            page structure — mostly empty containers
css/style.css         the whole design system
js/assets.js          the drop-in layer — reads assets/manifest.json
js/data.js            all the lore: houses, seasons, moments, cast, quotes, sigil SVG
js/scenery.js         the matte paintings — skyline, wall, godswood, hall, pyre, crowd, battlefield
js/gl.js              tiny WebGL helper — mat4 maths, shaders, procedural meshes
js/effects.js         embers, snow, per-moment atmospheres, cursor sparks
js/audio.js           the synthesised score
js/main.js            builds every section from the data, runs one rAF loop
assets/               the images, and manifest.json that names them
tools/                the sourcing, re-encoding and drop-in scripts
build.py              flattens the whole thing into one self-contained file
```

`python3 build.py` writes `dist/winter-is-coming.html`: the markup, the CSS,
every script, every image re-encoded and inlined as a data URI, and the score
carried along untouched — one file that opens anywhere with no server and no
`assets/` folder beside it.

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
