"""Генерация фавиконов из единого знака: белая «С» на синем градиенте.

Запуск: python site/tools/make-favicons.py

Создаёт в site/public:
  favicon.svg, favicon.ico, favicon-16/32/48.png,
  apple-touch-icon.png (180), android-chrome-192/512.png,
  maskable-512.png, site.webmanifest и превью shots/favicon-preview.png.
"""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "site" / "public"
SHOTS = ROOT / "shots"

TOP = (47, 107, 255)      # #2f6bff
BOTTOM = (26, 67, 184)    # #1a43b8
PAGE_BG = (245, 247, 250) # #f5f7fa


def gradient(size: int) -> Image.Image:
    column = Image.new("RGB", (1, 256))
    for y in range(256):
        t = y / 255
        column.putpixel(
            (0, y),
            tuple(round(TOP[i] + (BOTTOM[i] - TOP[i]) * t) for i in range(3)),
        )
    return column.resize((size, size), Image.BILINEAR)


def rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def draw_mark(size: int, *, square: bool = False, mark_scale: float = 1.0) -> Image.Image:
    """Иконка с монограммом «С» (дуга с закруглёнными концами)."""
    supersample = 8 if size <= 64 else 4
    big = size * supersample

    background = gradient(big)
    if square:
        icon = background.convert("RGBA")
    else:
        mask = rounded_mask(big, radius=round(big * 0.22))
        icon = Image.new("RGBA", (big, big), (0, 0, 0, 0))
        icon.paste(background, (0, 0), mask)

    center = big / 2
    outer = big * 0.30 * mark_scale
    stroke = big * 0.17 * mark_scale
    inner = outer - stroke
    gap_degrees = 45

    mark = Image.new("L", (big, big), 0)
    drawer = ImageDraw.Draw(mark)
    drawer.ellipse((center - outer, center - outer, center + outer, center + outer), fill=255)
    drawer.ellipse((center - inner, center - inner, center + inner, center + inner), fill=0)
    # Вырез справа — раскрытая часть буквы «С».
    drawer.pieslice(
        (center - outer - 2, center - outer - 2, center + outer + 2, center + outer + 2),
        start=-gap_degrees,
        end=gap_degrees,
        fill=0,
    )
    # Закруглённые концы дуги.
    cap_radius = stroke / 2
    cap_center = (outer + inner) / 2
    for angle in (-gap_degrees, gap_degrees):
        radians = math.radians(angle)
        x = center + cap_center * math.cos(radians)
        y = center + cap_center * math.sin(radians)
        drawer.ellipse((x - cap_radius, y - cap_radius, x + cap_radius, y + cap_radius), fill=255)

    white = Image.new("RGBA", (big, big), (255, 255, 255, 255))
    icon = Image.composite(white, icon, mark)
    return icon.resize((size, size), Image.LANCZOS)


def save(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)
    print(f"{path.relative_to(ROOT)} — {image.width}x{image.height}")


def main() -> None:
    save(draw_mark(16), PUBLIC / "favicon-16.png")
    save(draw_mark(32), PUBLIC / "favicon-32.png")
    save(draw_mark(48), PUBLIC / "favicon-48.png")
    save(draw_mark(180), PUBLIC / "apple-touch-icon.png")
    save(draw_mark(192), PUBLIC / "android-chrome-192x192.png")
    save(draw_mark(512), PUBLIC / "android-chrome-512x512.png")
    # Maskable: квадрат без скруглений, знак в безопасной зоне.
    save(draw_mark(512, square=True, mark_scale=0.72), PUBLIC / "maskable-512.png")

    ico_source = draw_mark(256)
    ico_source.save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print("site/public/favicon.ico")

    # Превью для просмотра
    SHOTS.mkdir(exist_ok=True)
    width_total, height_total = 1500, 700
    preview = Image.new("RGB", (width_total, height_total), PAGE_BG)

    def place(tile: Image.Image, x: int, y: int) -> None:
        preview.paste(tile, (x, y), tile)

    large = draw_mark(512)
    place(large, 32, 32)
    place(draw_mark(180), 592, 32)
    place(draw_mark(96), 820, 32)
    place(draw_mark(64), 950, 32)
    place(draw_mark(48), 1050, 32)
    place(draw_mark(32), 1130, 32)
    place(draw_mark(16), 1200, 32)

    dark = Image.new("RGB", (width_total, 150), (11, 18, 32))
    preview.paste(dark, (0, 560))
    x = 40
    for size in (96, 64, 48, 32, 16):
        place(draw_mark(size), x, 570 + (96 - size) // 2 + 6)
        x += size + 50
    save(preview, SHOTS / "favicon-preview.png")


if __name__ == "__main__":
    main()
