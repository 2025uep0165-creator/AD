# VFUHO — A Legacy Built Brick by Brick

A preview website built for **VFUHO**, the miniature-architecture channel that builds real
houses at miniature scale out of mini bricks.

It is not a portfolio. It is a legacy piece: a monument to six years, 131 finished houses
and 2.2 billion views, with an interactive 3D brick house at its centre that assembles
itself as you scroll.

**Live preview:** open `index.html` — no build step, no install.

---

## What's in it

| Section | What it does |
|---|---|
| **The Build** | A full-screen WebGL stage. A two-storey miniature brick villa assembles itself on page load, then strips back to bare ground and rebuilds across nine scroll-driven chapters — site, foundation, steel, columns, walls, floors, upper storey, roof, life. Drag to orbit. |
| **Legacy** | Animated counters for the headline figures. |
| **Marquee** | A continuous ribbon of real build thumbnails. |
| **The Craft** | The manifesto, set against a stack of real stills. |
| **Disciplines** | Six bodies of work as an editorial index — hovering a name swaps the plate beside it; clicking filters the archive. |
| **In motion** | Three of the most-watched builds playing on loop, held inside the fold. |
| **The Work** | All 131 builds, filterable, with a cinematic lightbox that plays the real film. |
| **Hall of Record** | The eight most-watched builds, ranked, with a rule under each showing its share of the top spot. |
| **Journey** | 2020 → 2026, year by year. |
| **The Ledger** | Sixteen signature techniques, each opening a build that demonstrates it. |
| **Reach** | YouTube, Instagram, TikTok and Facebook with live figures. |
| **The Legacy** | Closing statement. |

## The 3D stage

`assets/js/scene.js` builds the house from scratch in code — roughly 1,800 individual
bricks laid in running bond with real openings, plus hand-placed rebar cages, cast
slabs, an external stair that climbs to the balcony, a cantilevered upper storey,
and lamps that switch on at the end.

The things that read badly as stacked boxes — the trees, the pool and the site
wheelbarrow — are **modelled in Blender** and delivered as one 143 KB glTF
(`assets/models/vfuho-props.glb`, ~720 triangles). The trees have tapered trunks,
real limbs and faceted canopy clusters; the pool has a tiled shell, coping, a
waterline band, entry steps and a ladder, with its water as a separate object the
site fills on scroll; the wheelbarrow is the one from the VFuho logo. They load
asynchronously and join the same 0→1 build timeline as the brickwork — if the model
fails to load, the brick house simply builds without them.

Everything is drawn with three `InstancedMesh`es (bricks/concrete, steel rods, glazing),
so the whole scene is three draw calls. Each element carries its own start time on a
0→1 timeline, so scroll position scrubs the construction directly.

**It is a progressive enhancement.** If WebGL is unavailable, or the engine fails to load,
the page catches it, drops a `.no-gl` class and renders the opening as a full-bleed still
with the chapters laid out as a grid. Nothing else on the site depends on it.

## Brand

The official VFuho logo is in `assets/img/`. `vfuho-logo.png` is the supplied
original; `vfuho-mark.png` (the wheelbarrow) and `vfuho-wordmark.png` are cut from
it with the black field keyed out, so they sit on any background. The mark and
wordmark carry the nav, the loading screen and the footer, and `favicon.png` is the
browser tab.

## Content

Every figure, title, view count and thumbnail comes from VFUHO's own public channels
(captured September 2026):

- **YouTube** [@vfuhoo](https://youtube.com/@vfuhoo) — 3.73M subscribers, 2,203,584,885 views, 131 uploads, joined 6 October 2020
- **Instagram** [@vfuho_](https://www.instagram.com/vfuho_) — 2.0M followers, 143 posts
- **TikTok** [@vfuho_](https://www.tiktok.com/@vfuho_) — 1.3M followers, 16.3M likes
- **Facebook** [/vfuho](https://www.facebook.com/vfuho)

The archive lives in `assets/js/works.js` — 131 entries with YouTube id, title, view
count and discipline. Thumbnails are served straight from `i.ytimg.com` (vertical
`oar2.jpg` posters for Shorts, `maxresdefault.jpg` for long-form) and films play through
`youtube-nocookie.com`, so nothing is re-hosted and the creator keeps their view counts.

### Keeping it current

Edit `assets/js/works.js` to refresh the archive and `assets/js/site.js` for the
headline figures, chapters, disciplines, timeline, techniques and platform cards.
All copy and data lives in those two files — no markup changes needed.

## Files

```
index.html                    structure + import map
assets/css/style.css          the whole design system
assets/js/site.js             all copy, figures, chapters, timeline
assets/js/works.js            the 131-build archive
assets/js/scene.js            the WebGL construction sequence
assets/js/main.js             rendering, scroll, gallery, lightbox
assets/vendor/three.module.min.js   three.js r169 (MIT), vendored
```

## Running and deploying

It is a static site with no build step and no runtime dependencies beyond the
vendored three.js.

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

Deploy by dropping the folder on any static host — Vercel, Netlify, GitHub Pages,
Cloudflare Pages. It must be served over HTTP rather than opened as a `file://` URL,
because the page uses ES modules.

## Browser support

Modern evergreen browsers. Desktop-first by design, fully responsive down to 360px.
Honours `prefers-reduced-motion`: the intro plays instantly, reveals and counters
resolve immediately, and the build follows scroll without easing. Shadows, pixel
ratio and particle count step down automatically on mobile and low-core devices.

## Credit

Site design and build: preview concept.
All films, thumbnails and the work itself are the property of VFUHO.
three.js is MIT licensed, © 2010–2024 three.js authors.
