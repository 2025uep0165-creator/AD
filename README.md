# img2png

A small command-line tool that converts ordinary images — JPEG, WebP, GIF, BMP,
TIFF, ICO and anything else [Pillow](https://python-pillow.org/) can read — to PNG.

## Install

```sh
pip install -r requirements.txt
```

## Usage

Convert one image (writes `photo.png` next to the input):

```sh
python img2png.py photo.jpg
```

Convert several, or a whole folder, into an output directory:

```sh
python img2png.py *.webp -o converted/
python img2png.py ~/pictures -r -o converted/
```

### Options

| Option | Effect |
| --- | --- |
| `-o, --output` | Output file (single input) or output directory. Defaults to writing beside each input. |
| `-r, --recursive` | Descend into subdirectories of directory inputs. |
| `--all-frames` | Write every frame of an animated GIF or multi-page TIFF as `name_000.png`, `name_001.png`, … Only the first frame is written otherwise. |
| `--background COLOR` | Flatten transparency onto a solid color (`white`, `#ffffff`, …) instead of keeping the alpha channel. |
| `--optimize` | Spend extra time compressing for smaller files. |
| `-f, --force` | Overwrite existing files. Without it, an existing target is an error. |
| `-q, --quiet` | Print only errors. |

## Behavior notes

- **Transparency is preserved** by default; use `--background` to composite it away.
- **EXIF orientation is applied** to the pixels, since PNG has no orientation tag —
  a rotated phone photo comes out upright.
- **CMYK, YCbCr and other modes PNG cannot store** are converted to RGB/RGBA.
- **Existing files are never overwritten** unless you pass `--force`.
- A failed input doesn't stop the batch; the remaining images still convert and the
  exit code is `1`.

## Tests

```sh
pip install -r requirements-dev.txt
python -m pytest tests
```
