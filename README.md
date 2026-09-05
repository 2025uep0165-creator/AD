# Secret Ink Tattoo

Marketing site for Secret Ink Tattoo — Udhay, Janipur Colony, Jammu.

Next.js (App Router) + TypeScript + Tailwind, static, deploys to Vercel with no
backend and no CMS. Every conversion path ends in one place: a WhatsApp message
to **+91 96825 16002**.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run audit        # accessibility / behaviour / performance checks (see below)
```

---

## The one file you edit

**`lib/content.ts`** holds every word, price and media slot on the site. Change
it, redeploy, done. Nothing else needs touching to update the site's content.

### Facts that are not confirmed yet

The site must never publish a guessed price, a guessed founding year or an
invented review, so unconfirmed values are wrapped in `todo()` and the type
system stops them being rendered as fact:

```ts
established: todo<number>('EST. 2014 vs "3 years experience" — which is right?'),
```

A component can only read one through `resolve()`, which returns `undefined`
until it is confirmed — so it has to handle the missing case explicitly. When
Udhay confirms it, swap `todo(...)` for `ok(...)`:

```ts
established: ok(2014),
```

…and the year appears in the hero strapline, the artist section, the footer and
the JSON-LD, all at once.

Where a value is still pending, the page degrades honestly rather than
inventing: an unconfirmed price renders **"Ask on WhatsApp"** linking to a
pre-filled message about that exact service; unconfirmed FAQ answers say to
message; the email row simply does not render; the reviews section shows the
real 4.8★ aggregate and links to Google rather than showing invented quotes.

Run `npm run dev` and a **Content TODO** panel in the bottom-left lists
everything still outstanding, read directly out of `content.ts`. It is stripped
from production builds.

### Photographs and video

Every media slot has the same shape:

```ts
{ src: null, alt: '…', plate: 'om', need: 'Original of the nape Om.' }
```

While `src` is `null` the site draws a **plate** — fine ink linework on bone, in
the real 4:5 crop (`components/Plate.tsx`). The layout is never broken and
never implies a photograph exists. To swap in a real photo, drop the file in
`/public` and set `src`:

```ts
{ src: '/work/nape-om.jpg', alt: '…', plate: 'om', need: '…' }
```

Nothing else changes — matting, crop, desaturation and lazy-loading are handled
by `components/Frame.tsx`, which normalises every photo the same way (fixed 4:5,
`saturate(0.82) contrast(1.03)`, identical bone mat and hairline). That
consistency is what makes a phone camera roll read as a gallery wall. Adjust the
normalisation once in `Frame.tsx` and it applies to all of them.

---

## Where the palette lives

**`app/globals.css`, the `:root` block.** One source of truth — Tailwind reads
the same variables through `tailwind.config.ts`, so changing a value there
changes both the utility classes and the hand-written CSS.

Colours are stored as **channel triplets**, not hex:

```css
--bone-rgb: 239 234 225; /* #EFEAE1 */
--bone: rgb(var(--bone-rgb));
```

This is not decoration. Tailwind cannot inject an alpha into a `var()` holding a
hex — it silently drops the whole utility, so `bg-ink/15`, `text-bone/60` and
every other opacity modifier compile to nothing at all. Given as channels they
compose into `rgb(… / <alpha>)` and work. If you change a colour, change the
triplet and leave the hex comment updated beside it.

### Two colours differ from the original spec, on purpose

Both were measured against WCAG AA (4.5:1) and both failed:

| Token | Spec | Measured on `--bone` | Shipped | Now |
|---|---|---|---|---|
| `--saffron` | `#A85A16` | **4.23:1** ✗ | `#A0530F` | **4.69:1** ✓ |
| `--smoke` | `#8A857C` | **3.06:1** ✗ | `#6B6659` | **4.78:1** ✓ |

The spec anticipated the first ("verify `--saffron` on `--bone` hits 4.5:1 and
darken it if it doesn't"). The second is the same problem: `#8A857C` is fine as
a hairline but unreadable as text, so the original value is kept as
`--smoke-soft` for rules and borders only, and `--smoke` is the text-safe
version.

Two further tokens exist because `--saffron` is only 3.52:1 on `--ink`:
`--saffron-lift` (`#E08A3C`, 7.42:1) for accents on the dark section, and
`--brass` (`#C9A227`, 8.18:1) for the crest — which is why the crest only ever
appears on the inverted section and in the footer, never on bone.

---

## Structure

```
app/
  layout.tsx            fonts + metadata
  page.tsx              section order, JSON-LD
  globals.css           palette, type primitives, reveal, reduced motion
  opengraph-image.png   the WhatsApp share card
  robots.ts sitemap.ts
components/             one file per section, plus Plate / Frame / Crest
lib/
  content.ts            ALL copy and media
  jsonld.ts             LocalBusiness + TattooParlor + FAQPage
  todos.ts              walks content.ts to list what is outstanding
scripts/
  make-og.mjs           regenerates the share card
  audit.mjs             a11y / behaviour / performance checks
  shots.mjs             screenshots at device sizes
  preview.sh            build + serve on :3100
```

### Why things are built the way they are

- **Framer Motion is loaded as `LazyMotion` + `domAnimation` with `m.*`**, not
  the full `motion` export. The full bundle carries layout projection and 3D
  this site never uses; the difference is most of the mobile JS budget.
- **GSAP + ScrollTrigger are dynamically imported** and used for exactly one
  thing — the lettering feature drawing on letter by letter. They are never fetched under
  `prefers-reduced-motion`, and a 2s watchdog un-hides the text if the chunk
  never arrives, so a failed load can never leave the section blank.
- **Lenis is off on touch.** It runs only on `pointer: fine`, with
  `syncTouch: false`. Hijacking momentum on a mid-range Android is the fastest
  way to make a site feel broken.
- **Scroll reveals are CSS, driven by one page-wide IntersectionObserver**
  (`lib/useReveal.ts`) — no per-element animation loop. Its `threshold` must
  stay `0`: the hidden state is a `clip-path` that shrinks the element's visible
  rect to nothing, so `intersectionRatio` is always 0 and any non-zero threshold
  deadlocks — the element can never trigger its own reveal.
- **The load transition mounts after hydration**, so the hero paints first and
  LCP is measured against the hero, not the overlay. First visit only
  (`sessionStorage`), hard-capped at 900ms, skipped entirely under reduced
  motion.
- **The booking form has no backend and is not a dead form.** It composes a
  pre-filled `wa.me` message from the answers and opens the chat, so the enquiry
  lands in the one inbox he reads. `wa.me` cannot carry an attachment, so the
  reference photo is a checkbox that adds a line saying one is coming — better
  than a file input that silently drops the file.

---

## The share card

`app/opengraph-image.png` is what renders when the link is pasted into WhatsApp,
which for this audience matters more than anything else on the page. It leads
with the Devanagari.

Regenerate it with `npm run og` after editing `scripts/make-og.mjs`.

It is a pre-rendered PNG rather than a `next/og` route on purpose: Satori, which
powers `ImageResponse`, cannot shape Devanagari — it fails to parse Tiro's GSUB
table, and even if it parsed it the matras would land in the wrong places. A
share card that misspells a shloka would undercut the exact claim the site
makes. The script renders through a real browser text engine instead.

**When Udhay sends a photograph of his best Devanagari piece,** replace it:
save the image as `app/opengraph-image.jpg` (1200×630) and delete the PNG.

---

## Checks

```bash
npm run build && ./scripts/preview.sh   # build + serve on :3100
npm run audit
```

Currently 24/24, on a Pixel 7 profile unless noted:

- axe-core clean (WCAG 2.1 A/AA + best practice) on mobile **and** desktop
- every touch target at least 44×44px
- lightbox: modal semantics, focus trap, scroll lock, Escape, arrow keys
- gallery filters, FAQ accordion semantics, sticky bar show/hide behaviour
- booking form composes a correct `wa.me` URL carrying the answers
- `prefers-reduced-motion`: no intro, no GSAP fetched, nothing left hidden
- **LCP 1.9s** and **CLS 0.000** on throttled Slow 4G with a 4× CPU penalty

First-load JS is **153KB gzipped** (the `polyfills` chunk is `noModule`, so
modern Android Chrome never fetches it; GSAP and Lenis are deferred chunks).

---

## Still needed from Udhay

`npm run dev` shows this list live. In priority order:

**Blocking — a factual contradiction**

1. **EST. 2014 vs "3 years experience".** Both cannot be true. Until this is
   settled the site makes **no experience claim anywhere** and the hero
   strapline omits the year. This is deliberate — see `studio.established`.

**Facts (15 outstanding)**

2. Starting prices for Devanagari/shloka, palm-size fine line, and piercing
3. Ink brand
4. Deposit policy, and whether walk-ins are accepted
5. Google Business Profile review link
6. Whether a monitored email inbox exists (if not, nothing changes — it stays hidden)
7. Four real Google reviews, pasted verbatim with the names as they appear
8. One true, specific detail for the artist bio
9. **Confirm the "600+ tattoos" figure**, or delete that row from `hero.proof`.
   It came from the brief and is the one number on the page nobody has verified.

**Media**

Three real assets were recovered from the old site and are now in use:
`/public/images/hand-mandala.jpg` (hero backdrop + a gallery piece),
`/public/images/udhay.jpg` (artist portrait) and `/public/images/crest.png`
(the real gold crest). Everything below is still outstanding — the old site
had no portfolio photographs at all, its gallery was empty placeholder cards.

10. 15–20 originals of his best work, not Instagram-compressed, weighted to
    lettering and Devanagari
11. A hero clip — 6–8s, muted, under 2MB
12. 5–6 vertical 9:16 process clips for the reels row
13. One before/after cover-up pair, shot at the same angle and distance
14. A real photo of him **working** — hands, machine, focus. The posed outdoor
    portrait from the old site is in place for now, but the brief's original
    objection to it still stands
15. ~~The original gold crest~~ — **done.** Pulled from the old site and
    installed at `/public/images/crest.png` (re-cut and quantised, 251KB → 30KB)

**Note on the map:** it is tinted blue by CSS filter in
`components/Contact.tsx`. That blue is the one colour on the site outside the
bone / ink / saffron palette — it was an explicit request.

**Still open — devotional content elsewhere on the page.** The inverted
section's shloka was removed on request. The gallery, however, still carries a
**Devotional** filter and five pieces (ॐ, त्रिशूल, हर हर महादेव, a shloka band,
and the mandala), and the FAQ, pricing table, booking form and SEO keywords all
still offer Devanagari/Sanskrit lettering as a service. Those describe work he
actually does, so they were left alone rather than deleted on inference — say
the word and they come out too.

**Also confirm:** the site says **11:00 AM – 8:30 PM, daily**, matching Google.
The old site said Mon–Sat 11–8. The site and the Google Business Profile must
say the same thing — the JSON-LD asserts the daily hours, and a mismatch hurts
local ranking as well as confusing people standing outside a closed shop.

---

## Deploy

Push to a Vercel project; the defaults are correct (`next build`, no env vars,
no backend). Set the real domain in `seo.siteUrl` in `lib/content.ts` before
launch — the canonical URL, sitemap, robots and OG URLs all derive from it.
