# Asset brief — what to send, and a prompt to paste into another AI

Two things here:

1. **The tables** — every file the site can take, with its exact filename.
2. **The prompt** — copy the block into another AI (one that can browse the
   web) and ask it to find the real images.

Send whatever comes back and I'll wire it up. Partial is fine; anything
missing keeps the artwork the code draws.

**If the AI hands you an HTML page of results**, save it and run:

```bash
python3 tools/fetch-assets.py collection.html
```

That downloads every image, files it in the right folder, writes
`assets/manifest.json`, and reports anything too small to use full-bleed or
duplicated across two different slots.

---

## 1. Backdrops — 16 files → `assets/img/`

Landscape 16:9, 1920×1080 or wider, JPG.

| # | filename | episode | the shot |
| --- | --- | --- | --- |
| 1 | `ned.jpg` | S1E9 *Baelor* | Ned's execution on the steps of the Great Sept of Baelor |
| 2 | `birth.jpg` | S1E10 *Fire and Blood* | Daenerys in the ashes of the pyre at dawn, dragons on her |
| 3 | `blackwater.jpg` | S2E9 *Blackwater* | The wildfire explosion tearing through Stannis's fleet |
| 4 | `redwedding.jpg` | S3E9 *The Rains of Castamere* | The feast hall at the Twins, wide |
| 5 | `purple.jpg` | S4E2 *The Lion and the Rose* | Joffrey's wedding feast, the tables and dais |
| 6 | `viper.jpg` | S4E8 *The Mountain and the Viper* | Oberyn circling Gregor in the trial-by-combat yard |
| 7 | `hardhome.jpg` | S5E8 *Hardhome* | The Night King on the shore raising his arms |
| 8 | `hodor.jpg` | S6E5 *The Door* | Hodor holding the door, or the cave under the weirwood |
| 9 | `bastards.jpg` | S6E9 *Battle of the Bastards* | Jon alone facing the cavalry charge |
| 10 | `sept.jpg` | S6E10 *The Winds of Winter* | Green wildfire erupting through the Great Sept |
| 11 | `loottrain.jpg` | S7E4 *The Spoils of War* | Drogon low over the burning Loot Train on the Roseroad |
| 12 | `longnight.jpg` | S8E3 *The Long Night* | The godswood — Arya, the Night King, blue-lit snow |
| 13 | `bells.jpg` | S8E5 *The Bells* | King's Landing burning, wide or aerial |
| 14 | `throne.jpg` | S8E6 *The Iron Throne* | The ruined throne room, snow falling, or Drogon melting the chair |
| 15 | `dragons.jpg` | any | Drogon in flight, wings spread, against sky |
| 16 | `thewall.jpg` | any | The Wall, wide establishing shot, or Castle Black beneath it |

## 2. House sigils — 12 files → `assets/sigils/`

Square, **transparent PNG**, 1024×1024 or larger.

`stark` (direwolf) · `lannister` (lion) · `targaryen` (three-headed dragon) ·
`baratheon` (crowned stag) · `greyjoy` (kraken) · `tyrell` (rose) ·
`martell` (sun and spear) · `arryn` (falcon and moon) · `tully` (trout) ·
`bolton` (flayed man) · `mormont` (bear) · `watch` (Night's Watch)

## 3. The Iron Throne — 1 file → `assets/img/`

`iron-throne.png` — straight-on, **transparent PNG cutout**, 2000px tall.
Replaces the 3D model. A plain photo works too, a cutout composites cleaner.

## 4. Cast portraits — 20 files → `assets/cast/`

Portrait, 800×1000, JPG. Official HBO promo shots work best.

`jon-snow` · `daenerys` · `tyrion` · `arya` · `cersei` · `ned` · `sansa` ·
`jaime` · `tywin` · `brienne` · `the-hound` · `bran` · `melisandre` ·
`ygritte` · `joffrey` · `olenna` · `oberyn` · `theon` · `samwell` ·
`night-king`

## 5. Audio — 1 file → `assets/`

`theme.mp3` — the main title by Ramin Djawadi. It loops on the page.

---

## The prompt to paste

Copy everything between the lines.

---

> I'm building a personal, non-commercial Game of Thrones fan tribute website
> and I need to collect real images from the show. Please help me find them.
>
> For each item below, show me the actual image so I can save it, and give me
> the direct source URL underneath. Work through them in order — if you can
> only do a few at a time, just keep going when I say "next". Tell me the
> filename to save each one as.
>
> Good places to look: the Game of Thrones Wiki (gameofthrones.fandom.com),
> Wiki of Westeros, HBO's official press and media assets, IMDb episode photo
> galleries, screencap archives like screencaps.us or kissthemgoodbye,
> Wikimedia Commons, and official HBO promotional material.
>
> **PART 1 — 16 episode stills.** Landscape, as high-resolution as you can
> find, ideally 1920×1080 or larger. I want wide shots rather than tight
> close-ups, and darker frames rather than bright ones, because text will be
> laid over them. No fan art, no posters with text on them, no watermarks.
>
> 1. `ned.jpg` — Season 1 Episode 9 "Baelor". Ned Stark's execution on the
>    steps of the Great Sept of Baelor. Wide shot of the steps and the crowd.
> 2. `birth.jpg` — Season 1 Episode 10 "Fire and Blood". Daenerys in the ashes
>    of Khal Drogo's funeral pyre at dawn with the three newborn dragons.
> 3. `blackwater.jpg` — Season 2 Episode 9 "Blackwater". The wildfire
>    explosion in Blackwater Bay — green fire and burning ships.
> 4. `redwedding.jpg` — Season 3 Episode 9 "The Rains of Castamere". The feast
>    hall at the Twins during the Red Wedding, wide shot of the hall.
> 5. `purple.jpg` — Season 4 Episode 2 "The Lion and the Rose". Joffrey and
>    Margaery's wedding feast — the outdoor tables and the royal dais.
> 6. `viper.jpg` — Season 4 Episode 8 "The Mountain and the Viper". Oberyn
>    Martell fighting Gregor Clegane in the trial by combat.
> 7. `hardhome.jpg` — Season 5 Episode 8 "Hardhome". The Night King standing
>    on the shore raising his arms to raise the dead.
> 8. `hodor.jpg` — Season 6 Episode 5 "The Door". Hodor holding the door, or
>    the cave beneath the weirwood tree.
> 9. `bastards.jpg` — Season 6 Episode 9 "Battle of the Bastards". Jon Snow
>    standing alone on the battlefield facing the charging cavalry.
> 10. `sept.jpg` — Season 6 Episode 10 "The Winds of Winter". The Great Sept
>     of Baelor exploding in green wildfire.
> 11. `loottrain.jpg` — Season 7 Episode 4 "The Spoils of War". The Loot Train
>     Attack — Drogon flying low over the burning wagons.
> 12. `longnight.jpg` — Season 8 Episode 3 "The Long Night". The godswood at
>     Winterfell — Arya, the Night King, blue-lit snow.
> 13. `bells.jpg` — Season 8 Episode 5 "The Bells". King's Landing burning —
>     a wide or aerial shot of the city on fire.
> 14. `throne.jpg` — Season 8 Episode 6 "The Iron Throne". The ruined throne
>     room with snow falling through the broken roof, or Drogon melting the
>     Iron Throne.
> 15. `dragons.jpg` — Any season. Drogon in flight, wings fully spread,
>     against the sky.
> 16. `thewall.jpg` — Any season. A wide establishing shot of the Wall, or
>     Castle Black at the base of it.
>
> **PART 2 — 12 house sigils.** I need the official house sigil artwork as
> **square PNG files with transparent backgrounds**, 1024×1024 or larger. Not
> photographs of banners — the clean emblem artwork. If you can only find them
> on a solid background, give me those and say so.
>
> Stark (direwolf), Lannister (lion), Targaryen (three-headed dragon),
> Baratheon (crowned stag), Greyjoy (kraken), Tyrell (rose), Martell (sun and
> spear), Arryn (falcon and crescent moon), Tully (trout), Bolton (flayed
> man), Mormont (bear), and the Night's Watch.
>
> **PART 3 — the Iron Throne.** One clean image of the Iron Throne itself,
> photographed or rendered straight on, as high resolution as possible.
> A **transparent PNG cutout with no background** is ideal. Save as
> `iron-throne.png`.
>
> **PART 4 — 20 character portraits.** Official HBO promotional portraits,
> head and shoulders, portrait orientation, at least 800×1000:
> Jon Snow, Daenerys Targaryen, Tyrion Lannister, Arya Stark, Cersei
> Lannister, Ned Stark, Sansa Stark, Jaime Lannister, Tywin Lannister,
> Brienne of Tarth, Sandor Clegane (The Hound), Bran Stark, Melisandre,
> Ygritte, Joffrey Baratheon, Olenna Tyrell, Oberyn Martell, Theon Greyjoy,
> Samwell Tarly, and the Night King.
>
> **PART 5 — the music.** Where can I get the Game of Thrones "Main Title"
> theme by Ramin Djawadi as an audio file I can use on a personal site? Give
> me the legitimate options — the official soundtrack on streaming or
> purchase stores, and anything that's freely licensed.
>
> Finally, give me a plain list at the end of every filename you found, so I
> can check what's missing.

---

## If that AI can't browse or comes up short

Some tools can't fetch images, and official transparent-background sigils in
particular can be hard to find. In that case ask it to **generate** the
missing pieces instead — there's a full generation prompt in the appendix
below, written so the sixteen backdrops come back as a matching set.

<details>
<summary>Generation fallback prompt</summary>

> Generate these as original artwork. **Global style, keep all 16 consistent:**
> cinematic matte painting, wide establishing shot, 16:9, 1920×1080. Low-key
> lighting, one dominant light source, desaturated muted colour, heavy
> atmospheric haze. Medieval dark fantasy. No text, no watermarks, no borders.
> No faces in the foreground — people small, distant, silhouetted. Keep the
> centre of the frame uncluttered, text goes over it.
>
> 1. `ned.jpg` — stone cathedral plaza at dusk, wide steps, a crowd of
>    silhouetted medieval figures from behind, cold grey light, banners.
> 2. `birth.jpg` — dawn over a dry plain, the smoking collapsed remains of a
>    great funeral pyre, drifting ash, embers, low golden light.
> 3. `blackwater.jpg` — night naval battle, ships burning with emerald-green
>    flame, green light on black water, a walled city on cliffs above.
> 4. `redwedding.jpg` — long stone feast hall at night, trestle tables, dark
>    red banners, guttering torchlight, empty and ominous.
> 5. `purple.jpg` — outdoor royal wedding feast, golden pavilions, warm
>    late-afternoon light, a raised dais.
> 6. `viper.jpg` — sand-floored fighting pit ringed by stone tiers, harsh
>    midday sun, dust in the air.
> 7. `hardhome.jpg` — frozen shoreline at dusk, wooden palisade, dark figures
>    massing on the beach, cold blue light, driving snow.
> 8. `hodor.jpg` — cave beneath enormous pale tree roots, faint blue-green
>    light, a heavy stone doorway.
> 9. `bastards.jpg` — muddy battlefield under heavy grey sky, broken banners,
>    spent arrows, dust and haze.
> 10. `sept.jpg` — domed cathedral erupting in a towering column of
>     emerald-green fire, seen across a medieval city at night.
> 11. `loottrain.jpg` — burning wheat field, overturned wagons, the shadow of
>     a winged creature across the ground, thick smoke.
> 12. `longnight.jpg` — snow-covered grove of pale white trees with deep red
>     leaves at night, blue moonlight, low mist.
> 13. `bells.jpg` — vast medieval city burning seen from above, collapsed
>     towers, orange firelight and black smoke.
> 14. `throne.jpg` — ruined stone throne room, roof torn open, snow and ash
>     falling through shafts of pale light, rubble.
> 15. `dragons.jpg` — enormous black dragon in flight over dark mountains at
>     dusk, wings spread, against a burning orange sky.
> 16. `thewall.jpg` — colossal sheer wall of blue ice to the horizon, aurora
>     above, tiny torches at the base for scale.
>
> Then 12 heraldic emblems — flat vector heraldry, centred, symmetrical, bold
> silhouette, 1024×1024, **transparent background**, no text, no shield
> outline: direwolf head (grey), rampant lion (gold), three-headed dragon
> (red), crowned stag (black), kraken (gold), rose (gold and green), sun
> pierced by a spear (red/orange), falcon above a crescent moon (white),
> leaping trout (silver), flayed man (pale red), standing bear (black),
> crossed longswords (black steel).

</details>

---

Filenames don't need to be exact — tell me what each one is and I'll place and
wire it. Keep the page non-commercial and the attribution in the footer intact.
