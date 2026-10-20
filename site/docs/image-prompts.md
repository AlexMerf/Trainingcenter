# Промты для генерации изображений

Набор картинок для современной версии сайта учебного центра «Специалист».
Сейчас на сайте есть только один старый hero-рисунок из архива, портрет и CSS-иконки —
фотографии сильно поднимут уровень портфолио-проекта.

## Общая стилистика (добавляй к каждому фото-промту)

> professional corporate photography for an adult education center, bright airy interior,
> soft natural daylight, light blue and white color palette with subtle deep-blue accents,
> realistic, clean, modern, shallow depth of field, 35mm lens, high detail,
> no text, no letters, no logos, no watermarks, no UI overlays, no cartoons

**Негативный промт (общий):**

> text, letters, words, logo, watermark, signature, UI, screenshot, cartoon, illustration,
> 3d render, oversaturated, cluttered, dark, low quality, deformed faces, extra fingers,
> bad anatomy, distorted hands, collage

**Параметры:** Midjourney — `--ar 3:2 --style raw --v 6.1`; DALL·E 3 / Flux — просто текст промта.
Генерируй по 2 варианта каждого кадра и оставляй тот, где нет текста и искажённых лиц.

---

## 1. Hero главной страницы — обязательно

**Файл:** `hero.webp` · **Пропорции:** 3:2 · **Размер:** 1600×1067+
**Где:** большой блок на главной. Важно: группа справа, слева пустое место под текст и карточку.

```text
Wide-angle photograph of a bright modern training room: a small group of adult professionals
(ages 30–50, diverse, business casual) sitting at laptops during an online professional
development course, a friendly female instructor in her 40s standing beside a large wall screen,
soft daylight from large windows, light blue and white palette with deep-blue accents,
the group is positioned on the right side of the frame, clean negative space on the left,
shallow depth of field, realistic corporate photography, 3:2
```

## 2. Портреты педагогов — обязательно (3 шт., один стиль)

Квадратные, светлый фон, одинаковая студия и свет. Люди вымышленные.

**Файл:** `staff-director.webp` · 1:1 · 800×800

```text
Corporate portrait photograph of a friendly 55-year-old man with short grey hair and a neat
beard, light-blue business shirt, warm confident smile, looking slightly off-camera,
bright light-grey studio background with a soft blue gradient, professional headshot,
softbox lighting, sharp focus, 1:1
```

**Файл:** `staff-methodist.webp` — женщина 40–45 лет, методист

```text
Corporate portrait photograph of a friendly 42-year-old woman with shoulder-length light-brown
hair, business casual blazer over a white top, warm smile, looking at the camera,
bright light-grey studio background with a soft blue gradient, professional headshot,
softbox lighting, sharp focus, 1:1
```

**Файл:** `staff-teacher.webp` — мужчина 45–50 лет, инженер-энергетик

```text
Corporate portrait photograph of a friendly 48-year-old man with short dark hair and glasses,
dark-blue business shirt without tie, calm confident expression, looking at the camera,
bright light-grey studio background with a soft blue gradient, professional headshot,
softbox lighting, sharp focus, 1:1
```

## 3. Изображения направлений — обязательно (7 шт.)

**Формат:** 3:2, 1200×800, файлы `program-*.webp`. Используются на карточках каталога и в шапке
страницы программы. Стиль — та же «съёмка», светлые и чистые кадры.

| Направление | Файл | Промт (дополняй стилистикой сверху) |
|---|---|---|
| Охрана труда | `program-ohrana-truda.webp` | `Photograph of a safety engineer in a white hard hat and reflective vest holding a clipboard and checking a checklist at a modern manufacturing facility, bright industrial interior, blue safety accents, shallow depth of field, 3:2` |
| Пожарная безопасность | `program-pozharnaya-bezopasnost.webp` | `Fire safety training session: a man in a dark uniform demonstrating the use of a red fire extinguisher to a small group of employees outdoors on a bright day, realistic corporate photo, 3:2` |
| Электробезопасность | `program-elektrobezopasnost.webp` | `Close-up of an electrician in blue workwear and protective gloves inspecting a modern electrical panel with a multimeter, bright technical room, shallow depth of field, 3:2` |
| Первая помощь | `program-pervaya-pomoshch.webp` | `First aid training: an instructor demonstrating CPR on a training manikin in a bright classroom, several adult employees watching and practising, realistic corporate photo, 3:2` |
| Экология | `program-ekologiya.webp` | `Environmental specialist in a high-visibility vest taking a water sample from a river in a green landscape, industrial facility blurred in the distance, bright daylight, 3:2` |
| Промышленная безопасность | `program-promyshlennaya-bezopasnost.webp` | `Industrial safety engineer in a hard hat and safety glasses inspecting a pipeline at a modern chemical plant, bright daylight, blue overalls, realistic industrial photography, 3:2` |
| Обучение профессиям | `program-obuchenie-professiyam.webp` | `Vocational training workshop: a young adult learning to work on a metal lathe under supervision of an experienced mentor, bright modern workshop, realistic photography, 3:2` |

## 4. OG-обложка для соцсетей — обязательно

**Файл:** `og-cover.png` · 1200×630. Текст и логотип наложу кодом — нужен только фон,
поэтому в кадре не должно быть букв.

```text
Abstract minimal background for a social media cover: smooth deep-blue to light-blue gradient,
subtle thin geometric lines and a soft light glow, clean spacious composition with empty area
in the center-left for a headline, no text, no letters, modern corporate brand style, 1200x630
```

## 5. Дополнительные кадры — по желанию

| Файл | Где | Промт |
|---|---|---|
| `team.webp` (3:2) | секция «Почему нам доверяют» | `Small team meeting in a bright modern office: three colleagues discussing an education programme at a table with laptops and printed documents, warm natural light, blue accents, realistic corporate photo, 3:2` |
| `online-learning.webp` (3:2) | блок «Как проходит обучение» | `Close-up over-the-shoulder photo of an adult learner taking notes in a notebook next to a laptop with a blurred online course interface, home office, soft daylight, shallow depth of field, no readable text, 3:2` |
| `certificate.webp` (3:2) | шаг «Документ» | `Close-up of hands receiving an official certificate folder across a light desk in a bright office, shallow depth of field, realistic corporate photo, 3:2` |
| `office.webp` (3:2) | страница «Контакты» | `Modern bright reception area of a small educational center: light wood desk, blue accent wall, plants, soft daylight, clean interior photography, no people, 3:2` |

---

## Куда складывать

Создай папку `incoming/` в корне репозитория и положи туда файлы с именами из таблиц
(можно PNG/JPG — конвертирую и оптимизирую сам). После этого я:

1. сконвертирую в WebP/AVIF, обрежу под нужные пропорции и сгенерирую ретина-версии;
2. заменю старый hero-рисунок, добавлю фото на карточки и страницы программ;
3. заведу поле `photo` в контенте педагогов и подставлю портреты;
4. добавлю `og:image` и Twitter Card в `BaseLayout`;
5. пересоберу, пересниму скриншоты и покажу результат.

## Если нужна не фотография, а иллюстрация

Замени блок «Общая стилистика» на:

> modern flat vector illustration, clean minimal corporate style, light blue and white palette,
> deep-blue accents, soft gradients, geometric shapes, no text, no letters, consistent style

и добавь `--ar` с нужными пропорциями. Фотографии для такого сайта предпочтительнее:
они повышают доверие и лучше смотрятся в портфолио.
---

## Статус: изображения получены и интегрированы

Сгенерированные файлы обработаны скриптом `site/tools/process-images.py` и встроены в сайт:

- `hero.png` → `site/public/images/hero.webp` (кроп под карточку главной);
- `program-1…7.png` → `site/public/images/programs/*.webp` по направлениям
  (нумерация не совпадала с порядком направлений — сопоставлено по содержимому:
  1 — электробезопасность, 2 — охрана труда, 3 — пожарная безопасность,
  4 — первая помощь, 5 — экология, 6 — промышленная безопасность, 7 — обучение профессиям);
- `staff-*.png` → `site/public/images/staff/{director,methodist,teacher}.webp`;
- `og-cover.png` → `site/public/images/og-cover.jpg` (1200×630, подключена в Open Graph и Twitter Card).

Исходники PNG остаются в `incoming/` и не коммитятся.
## Фавикон и знак

Знак уже нарисован кодом: белая «С» на синем градиенте, набор размеров и иконок
генерирует `site/tools/make-favicons.py` (см. `site/README.md`). Для фавикона
векторный знак надёжнее ИИ-картинки: он остаётся чётким в 16 px и на retina.

Если нужен альтернативный ИИ-вариант знака — сгенерируй и покажи, интегрируем:

```text
Minimal app icon for an education center: bold white monogram letter C on a deep blue
rounded square with a smooth vertical gradient, flat vector style, centered, high contrast,
simple geometric shapes, no text besides the monogram, no shadows, no gradients other than
the background, clean edges, readable at 16x16, 1:1
```

Для «живого» логотипа с иллюстрацией (книга, шапочка, диплом) добавь в промт
описание символа, но помни: мелкие детали в 16 px превращаются в кашу —
для вкладки браузера лучше отдельный упрощённый знак.