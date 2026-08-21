#!/usr/bin/env python3
"""Convert images of any common format to PNG."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageOps, ImageSequence

# Extensions we attempt to open. Pillow sniffs the real format from the file
# contents, so this is only used when walking directories.
IMAGE_EXTENSIONS = {
    ".bmp", ".dib", ".gif", ".icns", ".ico", ".jfif", ".jp2", ".jpe", ".jpeg",
    ".jpg", ".pbm", ".pcx", ".pgm", ".png", ".ppm", ".sgi", ".tga", ".tif",
    ".tiff", ".webp", ".xbm",
}

# Modes PNG can store directly; anything else is converted before saving.
PNG_SAFE_MODES = {"1", "L", "LA", "I", "I;16", "P", "PA", "RGB", "RGBA"}


class ConversionError(Exception):
    """Raised when a single input cannot be converted."""


def parse_color(value: str) -> tuple[int, int, int]:
    """Parse a #rrggbb / #rgb / named color into an RGB triple."""
    from PIL import ImageColor

    try:
        rgb = ImageColor.getrgb(value)
    except ValueError as exc:
        raise argparse.ArgumentTypeError(f"unrecognized color: {value!r}") from exc
    return rgb[:3]


def flatten(image: Image.Image, background: tuple[int, int, int]) -> Image.Image:
    """Composite an image with alpha onto a solid background."""
    rgba = image.convert("RGBA")
    canvas = Image.new("RGBA", rgba.size, (*background, 255))
    canvas.alpha_composite(rgba)
    return canvas.convert("RGB")


def prepare(image: Image.Image, background: tuple[int, int, int] | None) -> Image.Image:
    """Return a copy of `image` in a mode PNG can store."""
    if background is not None:
        return flatten(image, background)
    if image.mode in PNG_SAFE_MODES:
        return image
    # CMYK, YCbCr, HSV, F, ... have no PNG representation.
    return image.convert("RGBA" if "A" in image.getbands() else "RGB")


def frame_paths(destination: Path, count: int) -> list[Path]:
    if count == 1:
        return [destination]
    width = max(3, len(str(count - 1)))
    return [
        destination.with_name(f"{destination.stem}_{i:0{width}d}{destination.suffix}")
        for i in range(count)
    ]


def convert(
    source: Path,
    destination: Path,
    *,
    all_frames: bool = False,
    background: tuple[int, int, int] | None = None,
    optimize: bool = False,
    overwrite: bool = False,
) -> list[Path]:
    """Convert one image file to PNG. Returns the paths written."""
    try:
        with Image.open(source) as image:
            frames = (
                [f.copy() for f in ImageSequence.Iterator(image)]
                if all_frames
                else [image.copy()]
            )
            # EXIF orientation is baked into the pixels; PNG has no such tag.
            frames = [ImageOps.exif_transpose(f) or f for f in frames]
            frames = [prepare(f, background) for f in frames]
    except FileNotFoundError:
        raise ConversionError("no such file")
    except OSError as exc:
        raise ConversionError(f"cannot read image ({exc})")

    targets = frame_paths(destination, len(frames))
    existing = [t for t in targets if t.exists()]
    if existing and not overwrite:
        raise ConversionError(f"{existing[0].name} already exists (use --force)")

    written = []
    for frame, target in zip(frames, targets):
        target.parent.mkdir(parents=True, exist_ok=True)
        try:
            frame.save(target, format="PNG", optimize=optimize)
        except OSError as exc:
            raise ConversionError(f"cannot write {target} ({exc})")
        written.append(target)
    return written


def collect_inputs(paths: list[Path], recursive: bool) -> list[Path]:
    """Expand directories into the image files they contain."""
    inputs: list[Path] = []
    for path in paths:
        if path.is_dir():
            pattern = "**/*" if recursive else "*"
            inputs.extend(
                sorted(
                    p for p in path.glob(pattern)
                    if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS
                )
            )
        else:
            inputs.append(path)
    return inputs


def destination_for(source: Path, output: Path | None, single_input: bool) -> Path:
    if output is None:
        return source.with_suffix(".png")
    if output.is_dir() or not single_input or output.suffix.lower() != ".png":
        return output / f"{source.stem}.png"
    return output


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="img2png",
        description="Convert JPEG, WebP, GIF, BMP, TIFF and other images to PNG.",
    )
    parser.add_argument("inputs", nargs="+", type=Path, metavar="INPUT",
                        help="image files, or directories of images")
    parser.add_argument("-o", "--output", type=Path,
                        help="output file (single input) or output directory; "
                             "defaults to alongside each input")
    parser.add_argument("-r", "--recursive", action="store_true",
                        help="descend into subdirectories of directory inputs")
    parser.add_argument("--all-frames", action="store_true",
                        help="write every frame of animated GIFs and multi-page TIFFs")
    parser.add_argument("--background", type=parse_color, metavar="COLOR",
                        help="flatten transparency onto this color, e.g. white or #ffffff")
    parser.add_argument("--optimize", action="store_true",
                        help="spend extra time compressing (smaller files)")
    parser.add_argument("-f", "--force", action="store_true",
                        help="overwrite existing files")
    parser.add_argument("-q", "--quiet", action="store_true",
                        help="only report errors")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    inputs = collect_inputs(args.inputs, args.recursive)
    if not inputs:
        print("img2png: no images found", file=sys.stderr)
        return 1

    if args.output is not None and (len(inputs) > 1 or args.all_frames):
        args.output.mkdir(parents=True, exist_ok=True)

    failures = 0
    for source in inputs:
        destination = destination_for(source, args.output, single_input=len(inputs) == 1)
        try:
            written = convert(
                source,
                destination,
                all_frames=args.all_frames,
                background=args.background,
                optimize=args.optimize,
                overwrite=args.force,
            )
        except ConversionError as exc:
            print(f"img2png: {source}: {exc}", file=sys.stderr)
            failures += 1
            continue
        if not args.quiet:
            for target in written:
                print(f"{source} -> {target}")

    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
