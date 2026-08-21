import sys
from pathlib import Path

import pytest
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import img2png


def make(path: Path, mode="RGB", size=(8, 6), color=(255, 0, 0), **kwargs):
    Image.new(mode, size, color).save(path, **kwargs)
    return path


def test_converts_jpeg_to_png(tmp_path):
    src = make(tmp_path / "photo.jpg")
    assert img2png.main([str(src)]) == 0
    out = tmp_path / "photo.png"
    with Image.open(out) as im:
        assert im.format == "PNG"
        assert im.size == (8, 6)


def test_preserves_transparency(tmp_path):
    src = tmp_path / "logo.webp"
    Image.new("RGBA", (4, 4), (0, 128, 255, 0)).save(src)
    img2png.main([str(src)])
    with Image.open(tmp_path / "logo.png") as im:
        assert im.mode == "RGBA"
        assert im.getpixel((0, 0))[3] == 0


def test_background_flattens_alpha(tmp_path):
    src = tmp_path / "logo.png"
    Image.new("RGBA", (4, 4), (0, 0, 0, 0)).save(src)
    img2png.main([str(src), "-o", str(tmp_path / "out.png"), "--background", "white"])
    with Image.open(tmp_path / "out.png") as im:
        assert im.mode == "RGB"
        assert im.getpixel((0, 0)) == (255, 255, 255)


def test_cmyk_is_converted_to_rgb(tmp_path):
    src = make(tmp_path / "print.jpg", mode="CMYK", color=(0, 0, 0, 0))
    img2png.main([str(src)])
    with Image.open(tmp_path / "print.png") as im:
        assert im.mode == "RGB"


def test_all_frames_writes_each_frame(tmp_path):
    src = tmp_path / "anim.gif"
    # Distinct colors: the GIF encoder drops frames identical to the previous one.
    frames = [Image.new("RGB", (4, 4), c) for c in ((255, 0, 0), (0, 255, 0), (0, 0, 255))]
    frames[0].save(src, save_all=True, append_images=frames[1:])
    assert img2png.main([str(src), "--all-frames"]) == 0
    assert sorted(p.name for p in tmp_path.glob("anim_*.png")) == [
        "anim_000.png", "anim_001.png", "anim_002.png"
    ]


def test_single_frame_by_default(tmp_path):
    src = tmp_path / "anim.gif"
    # Distinct colors: the GIF encoder drops frames identical to the previous one.
    frames = [Image.new("RGB", (4, 4), c) for c in ((255, 0, 0), (0, 255, 0), (0, 0, 255))]
    frames[0].save(src, save_all=True, append_images=frames[1:])
    img2png.main([str(src)])
    assert (tmp_path / "anim.png").exists()
    assert not list(tmp_path.glob("anim_*.png"))


def test_directory_input_with_output_dir(tmp_path):
    src_dir = tmp_path / "in"
    (src_dir / "nested").mkdir(parents=True)
    make(src_dir / "a.jpg")
    make(src_dir / "nested" / "b.bmp")
    out_dir = tmp_path / "out"

    img2png.main([str(src_dir), "-o", str(out_dir)])
    assert (out_dir / "a.png").exists()
    assert not (out_dir / "b.png").exists()

    img2png.main([str(src_dir), "-r", "-o", str(out_dir)])
    assert (out_dir / "b.png").exists()


def test_refuses_to_overwrite_without_force(tmp_path, capsys):
    src = make(tmp_path / "photo.jpg")
    (tmp_path / "photo.png").write_bytes(b"stale")

    assert img2png.main([str(src)]) == 1
    assert (tmp_path / "photo.png").read_bytes() == b"stale"
    assert "already exists" in capsys.readouterr().err

    assert img2png.main([str(src), "--force"]) == 0
    assert (tmp_path / "photo.png").read_bytes() != b"stale"


def test_reports_unreadable_file(tmp_path, capsys):
    bad = tmp_path / "broken.jpg"
    bad.write_bytes(b"not an image")
    assert img2png.main([str(bad)]) == 1
    assert "cannot read image" in capsys.readouterr().err


def test_one_failure_does_not_stop_the_batch(tmp_path):
    make(tmp_path / "good.jpg")
    (tmp_path / "bad.jpg").write_bytes(b"nope")
    assert img2png.main([str(tmp_path)]) == 1
    assert (tmp_path / "good.png").exists()


def test_exif_orientation_is_applied(tmp_path):
    src = tmp_path / "rotated.jpg"
    image = Image.new("RGB", (10, 4), (1, 2, 3))
    exif = image.getexif()
    exif[274] = 6  # rotate 90 degrees
    image.save(src, exif=exif)

    img2png.main([str(src)])
    with Image.open(tmp_path / "rotated.png") as im:
        assert im.size == (4, 10)


def test_parse_color_rejects_nonsense():
    with pytest.raises(Exception):
        img2png.parse_color("not-a-color")
