"""Обработка входящих изображений и раскладка по папкам site/public/images.

Запуск: python site/tools/process-images.py

- hero: кроп под пропорции карточки на главной (почти квадрат) + webp;
- программы: 1200x800 webp, имена по слагам направлений;
- педагоги: 800x800 webp;
- OG-обложка: 1200x630 jpg для соцсетей.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

root = Path(__file__).resolve().parents[2]
incoming = root / "incoming"
public = root / "site" / "public" / "images"

PROGRAM_MAP = {
    "program-1.png": "elektrobezopasnost",
    "program-2.png": "ohrana-truda",
    "program-3.png": "pozharnaya-bezopasnost",
    "program-4.png": "pervaya-pomoshch",
    "program-5.png": "ekologiya",
    "program-6.png": "promyshlennaya-bezopasnost",
    "program-7.png": "obuchenie-professiyam",
}

STAFF_MAP = {
    "staff-director.png": "director",
    "staff-methodist.png": "methodist",
    "staff-teacher.png": "teacher",
}

# Кроп героя: убираем пустую левую часть, оставляем группу, преподавателя и экран.
HERO_CROP = (340, 0, 1440, 1024)
HERO_SIZE = (1100, 1024)

PROGRAM_SIZE = (1200, 800)
STAFF_SIZE = (800, 800)
OG_SIZE = (1200, 630)


def save_webp(image: Image.Image, path: Path, quality: int = 84) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "WEBP", quality=quality, method=6)
    print(f"{path.relative_to(root)} — {image.width}x{image.height}, {path.stat().st_size // 1024} КБ")


def main() -> None:
    # 1. Hero
    with Image.open(incoming / "hero.png") as hero:
        cropped = hero.convert("RGB").crop(HERO_CROP)
        cropped = cropped.resize(HERO_SIZE, Image.LANCZOS)
        save_webp(cropped, public / "hero.webp", quality=86)

    # 2. Программы
    for filename, slug in PROGRAM_MAP.items():
        with Image.open(incoming / filename) as image:
            resized = image.convert("RGB").resize(PROGRAM_SIZE, Image.LANCZOS)
            save_webp(resized, public / "programs" / f"{slug}.webp")

    # 3. Портреты
    for filename, slug in STAFF_MAP.items():
        with Image.open(incoming / filename) as image:
            resized = image.convert("RGB").resize(STAFF_SIZE, Image.LANCZOS)
            save_webp(resized, public / "staff" / f"{slug}.webp", quality=86)

    # 4. OG-обложка (jpg — максимальная совместимость соцсетей)
    with Image.open(incoming / "og-cover.png") as cover:
        resized = cover.convert("RGB").resize(OG_SIZE, Image.LANCZOS)
        target = public / "og-cover.jpg"
        resized.save(target, "JPEG", quality=90, optimize=True, progressive=True)
        print(f"{target.relative_to(root)} — {resized.width}x{resized.height}, {target.stat().st_size // 1024} КБ")

    # 5. Удаляем неиспользуемый старый портрет из архива
    legacy = public / "img.webp"
    if legacy.exists():
        legacy.unlink()
        print("удалён старый site/public/images/img.webp")


if __name__ == "__main__":
    main()
