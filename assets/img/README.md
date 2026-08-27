# assets/img/

## Adding real photographs

Every section that has a backdrop ships with a **painted scene** — a burning
King's Landing, the Wall, a godswood, a hall of columns — generated in code.
Any of them can be swapped for a real image.

### How

1. Put your image files in this folder.
2. Create `manifest.json` here, mapping a section id to a filename:

```json
{
  "redwedding": "red-wedding.jpg",
  "bells":      "kings-landing-burning.jpg",
  "hardhome":   "the-wall.jpg",
  "longnight":  "night-king.jpg",
  "dragons":    "drogon.jpg"
}
```

That's it. Anything listed replaces the painting on load and inherits the
same treatment the paintings get: the moment's colour grade, the slow
push-in drift, and the darkening scrim that keeps the text readable. Anything
*not* listed keeps its painting, so a partial manifest is fine.

If `manifest.json` doesn't exist you'll see one harmless 404 in the console
and the paintings stand on their own.

### The ids you can use

**Moments** (each is a full-screen panel in the stacking sequence):

| id | the moment |
| --- | --- |
| `ned` | The Head of Eddard Stark |
| `birth` | The Dragons Are Born |
| `blackwater` | Green Fire on the Bay |
| `redwedding` | The Red Wedding |
| `purple` | The Purple Wedding |
| `viper` | The Red Viper |
| `hardhome` | The Night King Raises His Arms |
| `hodor` | Hold the Door |
| `bastards` | One Man Against Cavalry |
| `sept` | Light of the Seven |
| `loottrain` | Dracarys on the Roseroad |
| `longnight` | Not Today |
| `bells` | The Bells |
| `throne` | The Throne Melts |

**Sections**: `dragons`, and the Long Night section — note the Long Night
section shares the id `longnight` with the moment of the same name, so listing
it sets both.

### What works best

Wide, dark, low-detail images. The grade tints heavily toward the moment's
colour and the scrim darkens the centre, so a bright or busy photo loses most
of its detail and can make the text harder to read. Landscapes, silhouettes
and wide shots survive the treatment far better than close-ups.

Aim for roughly 1600×900 or larger — they're drawn cover-fit, so anything
smaller will be visibly soft.

### One caution

Official *Game of Thrones* stills and screencaps are HBO's copyrighted
material. Fan pages use them all the time and it's rarely an issue for
something personal and non-commercial, but it is still their material — so
this repository ships without any, and what you add here is your call.
