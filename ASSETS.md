# What to send

Everything on this page is drawn in code and works with no files at all. But
every drawn thing has a slot. Put a file in `assets/`, name it in
`assets/manifest.json`, and it takes over — no code changes.

Work down the tiers. **Tier 1 alone changes the feel of the whole page.**
Anything you skip keeps what the code draws, so a partial manifest is fine.

---

## Tier 1 — the fourteen moment backdrops

The single biggest win. Each is a full-screen panel and the image sits behind
the text, graded to that moment's colour and slowly pushing in.

| id | the moment | what to look for |
| --- | --- | --- |
| `ned` | The Head of Eddard Stark | The sept steps, the crowd, Ilyn Payne with Ice |
| `birth` | The Dragons Are Born | Dany walking out of the pyre at dawn, ash and smoke |
| `blackwater` | Green Fire on the Bay | The wildfire explosion over the water, ships burning |
| `redwedding` | The Red Wedding | The hall at the Twins — wide, before or during |
| `purple` | The Purple Wedding | The feast, the tables, Joffrey's dais |
| `viper` | The Red Viper | The trial-by-combat pit, Oberyn circling |
| `hardhome` | The Night King Raises His Arms | The beach, the wights, the Night King's arms up |
| `hodor` | Hold the Door | The weirwood, the cave, or Hodor at the door |
| `bastards` | One Man Against Cavalry | Jon alone facing the charge; the mound of bodies |
| `sept` | Light of the Seven | Green wildfire erupting under the Great Sept |
| `loottrain` | Dracarys on the Roseroad | Drogon low over the field, the burning wagons |
| `longnight` | Not Today | The godswood, Arya, the Night King, blue-lit snow |
| `bells` | The Bells | King's Landing burning from above |
| `throne` | The Throne Melts | The ruined throne room, Drogon, the molten chair |

**Format:** landscape, 1600×900 or wider. Dark, wide shots survive best —
the grade tints heavily and the scrim darkens the centre, so bright busy
close-ups lose their detail and hurt readability. JPG is fine.

## Tier 2 — two section backdrops

| id | section | what to look for |
| --- | --- | --- |
| `dragons` | Fire made flesh | Drogon in flight, wings spread, against sky |
| `longnight` | The Long Night | The Wall, or the army of the dead marching |

Note `longnight` is shared with the Tier 1 moment of the same name — one file
covers both.

## Tier 3 — the house sigils

You flagged these specifically. Nine great houses plus three minor. These
appear on the house cards, in the expanded house panel, and as the small badge
on every cast card.

`stark` · `lannister` · `targaryen` · `baratheon` · `greyjoy` · `tyrell` ·
`martell` · `arryn` · `tully` · `bolton` · `mormont` · `watch`

**Format:** square, **transparent PNG**, 400×400 or larger. Transparency
matters — they sit on dark cards and get a drop shadow. A sigil on a solid
white or coloured background will look like a sticker. If you can only find
them on a background, say so and I'll key it out.

## Tier 4 — the Iron Throne

`throne` — one image. If supplied it replaces the WebGL model entirely and
keeps the same choreography: it pushes in as you scroll, and the melt becomes
a molten heat glow rising from the base.

**Best:** a **transparent PNG cutout** of the throne, shot straight on. A
normal photo works too but the composite is cleaner with a cutout.

If you'd rather keep the 3D model and just make it more accurate, send a
reference photo instead and say so — I'll reshape the geometry against it
rather than swapping it out.

## Tier 5 — cast portraits

Twenty cards, keyed by the exact character name. Optional and lowest priority,
but they make the cast section land.

`Jon Snow` · `Daenerys Targaryen` · `Tyrion Lannister` · `Arya Stark` ·
`Cersei Lannister` · `Eddard Stark` · `Sansa Stark` · `Jaime Lannister` ·
`Tywin Lannister` · `Brienne of Tarth` · `The Hound` · `Bran Stark` ·
`Melisandre` · `Ygritte` · `Joffrey Baratheon` · `Olenna Tyrell` ·
`Oberyn Martell` · `Theon Greyjoy` · `Samwell Tarly` · `The Night King`

**Format:** portrait or square, at least 400×500. Head and shoulders. They're
cropped to a band at the top of the card and desaturated until hover.

## The score

`assets/theme.mp3` — the main title. Anything the browser can decode. It
loops, so a version that loops cleanly sounds best.

---

## The manifest

One file, `assets/manifest.json`. All paths relative to `assets/`:

```json
{
  "audio":  "theme.mp3",
  "throne": "img/iron-throne.png",

  "scenes": {
    "redwedding": "img/red-wedding.jpg",
    "bells":      "img/kings-landing-burning.jpg",
    "hardhome":   "img/hardhome.jpg",
    "dragons":    "img/drogon.jpg"
  },

  "sigils": {
    "stark":     "sigils/stark.png",
    "lannister": "sigils/lannister.png"
  },

  "cast": {
    "Jon Snow":           "cast/jon-snow.jpg",
    "Daenerys Targaryen": "cast/daenerys.jpg"
  }
}
```

There's a filled-in template at `assets/manifest.example.json` — copy it to
`manifest.json` and delete the lines you don't have files for.

---

## A note on rights

Official *Game of Thrones* stills, sigil artwork and the main title are HBO's
copyrighted material. Fan pages use them constantly and it's rarely an issue
for something personal and non-commercial — but they are still HBO's, so this
repository ships without any of them, and what you add is your call. Keep the
page non-commercial and the attribution in the footer intact.
