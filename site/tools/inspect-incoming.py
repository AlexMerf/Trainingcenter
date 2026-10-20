"""Проверка входящих изображений и контактный лист для просмотра.

Запуск: python site/tools/inspect-incoming.py
"""
from __future__ import annotations

import glob
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[2]
incoming = root / "incoming"
out = root / "shots" / "incoming-sheet.png"

files = sorted(incoming.glob("*.png")) + sorted(incoming.glob("*.jpg"))
print(f"Файлов: {len(files)}")
for path in files:
    with Image.open(path) as image:
        print(f"{path.name:26} {image.width}x{image.height} {image.mode}")

columns = 3
thumb_w = 520
pad = 16
label_h = 34

thumbs = []
for path in files:
    with Image.open(path) as image:
        ratio = thumb_w / image.width
        thumb = image.convert("RGB").resize((thumb_w, max(1, int(image.height * ratio))))
        canvas = Image.new("RGB", (thumb_w, thumb.height + label_h), "white")
        canvas.paste(thumb, (0, 0))
        draw = ImageDraw.Draw(canvas)
        try:
            font = ImageFont.truetype("arial.ttf", 20)
        except OSError:
            font = ImageFont.load_default()
        draw.text((8, thumb.height + 6), f"{path.name} ({image.width}x{image.height})", fill="black", font=font)
        thumbs.append(canvas)

rows = (len(thumbs) + columns - 1) // columns
cell_h = max(t.height for t in thumbs) + pad
sheet = Image.new("RGB", (columns * (thumb_w + pad) + pad, rows * cell_h + pad), "#e5e7eb")

for index, thumb in enumerate(thumbs):
    row, col = divmod(index, columns)
    x = pad + col * (thumb_w + pad)
    y = pad + row * cell_h
    sheet.paste(thumb, (x, y))

out.parent.mkdir(exist_ok=True)
sheet.save(out)
print(f"Контактный лист: {out} ({sheet.width}x{sheet.height})")
