"""Компактные превью скриншотов для README: обрезка первого экрана и webp.

Запуск: python site/tools/make-previews.py

Берёт полные снимки из shots/, обрезает верхнюю часть (первый экран страницы),
уменьшает до ширины PREVIEW_WIDTH и сохраняет в shots/preview/.
Полные PNG остаются на месте — README ссылается на превью, а оригиналы
доступны по ссылкам «полный снимок».
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SHOTS = ROOT / "shots"
OUT = SHOTS / "preview"

PREVIEW_WIDTH = 1200
PREVIEW_HEIGHT = 1050
QUALITY = 82

# Снимки, для которых делаем превью (favicon-preview и мобильная версия не нужны).
NAMES = [
    "home",
    "directions",
    "direction-detail",
    "jobs",
    "contacts",
    "documents",
    "info-organization",
    "politic",
    "404",
]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    for name in NAMES:
        src = SHOTS / f"{name}.png"
        if not src.exists():
            print(f"пропуск: нет файла {src}")
            continue

        with Image.open(src) as image:
            image = image.convert("RGB")
            width, height = image.size
            crop_height = min(height, PREVIEW_HEIGHT)
            preview = image.crop((0, 0, width, crop_height))
            ratio = min(1.0, PREVIEW_WIDTH / width)
            if ratio < 1.0:
                preview = preview.resize(
                    (round(width * ratio), round(crop_height * ratio)),
                    Image.LANCZOS,
                )

            dst = OUT / f"{name}.webp"
            preview.save(dst, "webp", quality=QUALITY, method=6)

        size_kb = dst.stat().st_size / 1024
        total += size_kb
        print(f"{dst.relative_to(ROOT)}  {preview.width}x{preview.height}  {size_kb:.0f} КБ")

    print(f"Итого: {len(NAMES)} превью, {total:.0f} КБ")


if __name__ == "__main__":
    main()
