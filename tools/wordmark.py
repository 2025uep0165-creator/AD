#!/usr/bin/env python3
"""Draw the GAME OF THRONES wordmark and write it out as SVG paths.

The mark is not a font. It is one line of Trajan capitals with a small OF set
between the words; the T of THRONES carries an arm that runs on over the rest
of that word and stops at the S; and the O of OF is a ring with three bars
standing in its counter. Nothing you can install renders that, so the letters
are taken out of Cinzel as outlines, the arm and the O are drawn here, and the
result is one SVG that scales anywhere and is recoloured from the stylesheet.

    python3 tools/wordmark.py        # -> assets/img/wordmark.svg
"""

import pathlib

from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONT = ROOT / "assets/fonts/cinzel.woff2"
OUT = ROOT / "assets/img/wordmark.svg"

WEIGHT = 600           # the mark is cut a little heavier than body caps
UPEM = 1000
CAP = 700              # cap height in font units — the mark's measure
# The face in the mark is a condensed Trajan: across all three references the
# whole line runs about ten cap-heights wide. Cinzel set plain runs to nearly
# thirteen, so the glyphs are drawn narrow to bring the proportion back.
XSCALE = 0.82
TRACK = 30             # letter-spacing between the big capitals
SMALL = 0.50           # the OF, as a share of the capitals
SMALL_TRACK = 26
WORD_GAP = 118         # around the OF


def glyph_paths(text, font, glyphset, cmap, scale, x, y, track):
    """-> (list of path data, pen x after the run)"""
    out = []
    for i, ch in enumerate(text):
        name = cmap[ord(ch)]
        pen = SVGPathPen(glyphset)
        glyphset[name].draw(pen)
        d = pen.getCommands()
        if d:
            out.append(f'<path d="{d}" transform="translate({x:.1f} {y:.1f})'
                       f' scale({scale * XSCALE:.5f} {-scale:.5f})"/>')
        x += glyphset[name].width * scale * XSCALE
        if i < len(text) - 1:
            x += track * scale
    return out, x


def ink(glyphset, cmap, ch):
    """-> (points of the glyph outline) so the drawing can be fitted to it."""
    from fontTools.pens.recordingPen import RecordingPen
    pen = RecordingPen()
    glyphset[cmap[ord(ch)]].draw(pen)
    return [p for op, args in pen.value for p in args if isinstance(p, tuple)]


def t_arm(glyphset, cmap):
    """The T's crossbar, measured off the glyph itself: where its top sits and
    how thick it is. Guessing at this leaves a visible step where the drawn arm
    meets the letter's own bar."""
    pts = ink(glyphset, cmap, "T")
    top = max(y for _, y in pts)
    x0 = min(x for x, _ in pts)
    # the flat underside, taken just inboard of the serif at the left end
    bottom = max(y for x, y in pts if x0 + 40 < x < x0 + 140 and y < top - 30)
    return top, top - bottom


def run_width(text, glyphset, cmap, scale, track):
    w = sum(glyphset[cmap[ord(c)]].width for c in text) * scale * XSCALE
    return w + track * scale * (len(text) - 1)


def main():
    font = TTFont(FONT)
    font = instantiateVariableFont(font, {"wght": WEIGHT}, inplace=True)
    glyphset = font.getGlyphSet()
    cmap = font.getBestCmap()

    s = 1.0                                  # font units are the drawing units
    small = SMALL

    w_game    = run_width("GAME", glyphset, cmap, s, TRACK)
    w_o       = CAP * small * 1.12           # the drawn O runs a touch wide
    w_f       = run_width("F", glyphset, cmap, small, SMALL_TRACK)
    w_thrones = run_width("THRONES", glyphset, cmap, s, TRACK)

    of = w_o + SMALL_TRACK * small + w_f
    text_w = w_game + WORD_GAP + of + WORD_GAP + w_thrones

    pad_x, pad_y = 26, 18
    baseline = pad_y + CAP
    total_w = pad_x * 2 + text_w
    total_h = baseline + CAP * 0.16          # room for the descending serifs

    x0 = pad_x
    parts = []
    x = x0
    paths, x = glyph_paths("GAME", font, glyphset, cmap, s, x, baseline, TRACK)
    parts += paths
    x += WORD_GAP

    # the O: a ring with three bars standing in its counter
    oc = CAP * small / 2
    cx, cy = x + w_o / 2, baseline - oc
    r_out = oc * 1.1
    rx_in, ry_in = r_out * 0.815, r_out * 0.845     # sides a shade heavier
    bar_w = r_out * 0.115
    for k in (-1, 0, 1):
        bx = cx + k * rx_in * 0.56 - bar_w / 2
        parts.append(f'<rect x="{bx:.1f}" y="{cy - r_out:.1f}" '
                     f'width="{bar_w:.1f}" height="{r_out * 2:.1f}"/>')
    parts.append(
        f'<path d="M{cx:.1f} {cy - r_out:.1f}'
        f'a{r_out:.1f} {r_out:.1f} 0 100 {r_out * 2:.1f}'
        f'a{r_out:.1f} {r_out:.1f} 0 100 {-r_out * 2:.1f}'
        f'M{cx:.1f} {cy - ry_in:.1f}'
        f'a{rx_in:.1f} {ry_in:.1f} 0 100 {ry_in * 2:.1f}'
        f'a{rx_in:.1f} {ry_in:.1f} 0 100 {-ry_in * 2:.1f}Z" '
        f'fill-rule="evenodd"/>')
    x += w_o + SMALL_TRACK * small

    paths, x = glyph_paths("F", font, glyphset, cmap, small, x, baseline, SMALL_TRACK)
    parts += paths
    x += WORD_GAP

    # THRONES, and the T's arm carried on over the rest of the word
    t_left = x
    paths, x = glyph_paths("THRONES", font, glyphset, cmap, s, x, baseline, TRACK)
    parts += paths
    arm_top, arm_h = t_arm(glyphset, cmap)
    s_pts = ink(glyphset, cmap, "S")
    s_over = (glyphset[cmap[ord("S")]].width - max(px for px, _ in s_pts)) * XSCALE
    arm_x = t_left + min(px for px, _ in ink(glyphset, cmap, "T")) * XSCALE
    parts.append(f'<rect x="{arm_x:.1f}" y="{baseline - arm_top:.1f}" '
                 f'width="{x - s_over - arm_x:.1f}" height="{arm_h:.1f}"/>')

    body = "\n    ".join(parts)
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 {total_w:.0f} {total_h:.0f}" role="img"
     aria-label="Game of Thrones">
  <defs>
    <linearGradient id="wmGold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#f6ecd8"/>
      <stop offset="14%"  stop-color="#fffdf7"/>
      <stop offset="46%"  stop-color="#ffffff"/>
      <stop offset="72%"  stop-color="#fcf4e2"/>
      <stop offset="90%"  stop-color="#f0e0c0"/>
      <stop offset="100%" stop-color="#e8d3ac"/>
    </linearGradient>
  </defs>
  <g fill="url(#wmGold)">
    {body}
  </g>
</svg>
'''
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(svg)
    print(f"{OUT.relative_to(ROOT)}  {total_w:.0f}x{total_h:.0f}  {len(svg)/1024:.1f} KB")


if __name__ == "__main__":
    main()
