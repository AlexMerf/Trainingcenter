<div align="center">

# Учебный центр «Специалист» — современная версия сайта

**Портфолио-демо: архивный статический сайт перезапущен на Astro 5**

[![Astro](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://trainingcenter-1rbj-alexmerfs-projects.vercel.app)

</div>

---

Дизайн-концепт — «Корпоративный»: чистый светлый стиль, глубокий синий акцент,
крупная типографика, много воздуха.

> [!WARNING]
> Это демонстрационный проект. Реквизиты, цены, документы и часть контента — примеры
> для портфолио; отправка форм не подключена, все заявки остаются в браузере.

## Содержание

- [Стек](#стек)
- [Запуск](#запуск)
- [Страницы](#страницы)
- [Структура](#структура)
- [Контент](#контент)
- [Изображения](#изображения)
- [Фавиконы и иконки](#фавиконы-и-иконки)
- [Что реализовано](#что-реализовано)
- [Скриншоты](#скриншоты)
- [Деплой на Vercel](#деплой-на-vercel)
- [Демо-ограничения](#демо-ограничения)

## Стек

| Технология | Роль |
| :-- | :-- |
| **Astro 5** | Статическая генерация, ноль JS по умолчанию |
| **TypeScript** | Данные и разметка с типами |
| **Tailwind CSS 4** | Vite-плагин + дизайн-токены в `src/styles/global.css` |
| **Manrope** | Self-hosted через `@fontsource-variable/manrope` |
| **Vanilla JS** | Мобильное меню, демо-формы, панель доступности |

## Запуск

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # статическая сборка в dist/
pnpm preview    # локальный просмотр собранного сайта
pnpm typecheck  # astro check
```

> [!NOTE]
> В среде DSH песочница Windows блокирует spawn дочерних процессов, который
> использует esbuild, поэтому `pnpm dev` / `pnpm build` в ней запускаются с полным
> доступом. На обычной машине и в CI ограничений нет.

## Страницы

| Маршрут | Содержимое |
| :-- | :-- |
| `/` | Главная: hero, направления, преимущества, процесс, форма, педагоги, документы |
| `/directions/` | Каталог из 7 направлений |
| `/directions/[slug]/` | Карточка программы (7 статических страниц: модули, результаты, стоимость) |
| `/jobs/` | Вакансии |
| `/contacts/` | Контакты, схематичная карта, реквизиты, форма |
| `/documents/` | Лицензия и документы |
| `/info-organization/` | «Сведения об образовательной организации» |
| `/politic/` | Политика обработки персональных данных |
| `404` | Страница ошибки |
| `/robots.txt`, `/sitemap.xml` | Генерируются автоматически |

## Структура

```
site/
├── public/               # favicon, изображения (hero, программы, портреты, OG-обложка)
├── src/
│   ├── components/       # SiteHeader, SiteFooter, Breadcrumbs, PageHero, DirectionCard,
│   │                     # LeadForm, Icon, AccessibilityWidget
│   ├── data/content.ts   # ЕДИНЫЙ источник контента: программы, вакансии, документы, контакты
│   ├── layouts/BaseLayout.astro
│   ├── pages/            # маршруты (в том числе динамические карточки программ)
│   └── styles/global.css # токены, компонентные классы, стили панели доступности
├── docs/
│   └── image-prompts.md  # промты для генерации изображений
├── tools/
│   ├── process-images.py # обработка исходников картинок → webp в public/images
│   ├── inspect-incoming.py # проверка входящих картинок и контактный лист
│   ├── make-favicons.py  # генерация набора фавиконов из единого знака
│   ├── make-previews.py  # компактные превью скриншотов для README
│   ├── screenshot.mjs    # полноэкранные скриншоты через Chrome DevTools Protocol
│   └── smoke.mjs         # smoke-тест интерактива (панель доступности, формы, меню)
└── README.md
```

## Контент

Весь контент сайта — программы, вакансии, документы, педагоги, реквизиты — лежит в
[`src/data/content.ts`](src/data/content.ts). Новая программа или вакансия добавляется
одним объектом: карточки и страницы создаются автоматически.

| Данные | Экспорт |
| :-- | :-- |
| Программы обучения | `programs` |
| Вакансии | `vacancies` |
| Документы | `documents` |
| Педагоги | `staff` |
| Реквизиты и контакты | `site`, `legalInfo` |
| Навигация, статистика, преимущества | `nav`, `stats`, `guarantees` |

## Изображения

- Фотографии сгенерированы с помощью ИИ специально для этого демо-проекта
  (промты — в [`docs/image-prompts.md`](docs/image-prompts.md)).
- Исходники лежат в `incoming/` в корне репозитория и не коммитятся (`.gitignore`).
- `tools/process-images.py` обрезает и оптимизирует их в `site/public/images/`:
  hero, 7 картинок программ, 3 портрета педагогов и OG-обложка 1200×630.
- В демо-макете портреты — вымышленные люди. При запуске реального сайта их нужно
  заменить на настоящих сотрудников (с согласием на публикацию).

```bash
python site/tools/inspect-incoming.py   # что лежит в incoming/ + контактный лист
python site/tools/process-images.py     # обрезка и оптимизация в public/images/
```

## Фавиконы и иконки

Единый знак — белая «С» на синем градиенте, он же используется в шапке и подвале.
`tools/make-favicons.py` генерирует полный набор в `site/public`:

| Файл | Назначение |
| :-- | :-- |
| `favicon.svg` | Векторный, для современных браузеров |
| `favicon.ico` | 16/32/48/64 для старых браузеров |
| `favicon-16.png`, `favicon-32.png`, `favicon-48.png` | PNG-размеры |
| `apple-touch-icon.png` | 180×180 для iOS |
| `android-chrome-192x192.png`, `android-chrome-512x512.png` | Android |
| `maskable-512.png` | С безопасной зоной для Android |
| `site.webmanifest` | Манифест PWA (цвета, иконки, `start_url`) |

Превью всех размеров: [`shots/favicon-preview.png`](../shots/favicon-preview.png).

```bash
python site/tools/make-favicons.py      # из корня репозитория
```

## Что реализовано

- **Доступность** — панель «Версия для слабовидящих» (размер шрифта, межбуквенное
  расстояние, контраст/инверсия, скрытие изображений) с сохранением настроек в
  `localStorage`; семантическая разметка, `aria`-атрибуты, фокус-стили,
  `prefers-reduced-motion`.
- **SEO** — уникальные `title`/`description`, canonical, Open Graph, JSON-LD
  (`EducationalOrganization`, `Course`, `ItemList`), `sitemap.xml`, `robots.txt`.
- **Адаптив** — сетки и типографика от 320px, мобильное меню, полноэкранные макеты.
- **Контент отдельно от кода** — новые программы и вакансии добавляются одним объектом,
  карточки и страницы создаются автоматически.

## Скриншоты

Полноэкранные снимки страниц лежат в `shots/` в корне репозитория:

| Файл | Страница |
| :-- | :-- |
| `home.png`, `home-mobile.png` | Главная (десктоп и мобильная) |
| `directions.png` | Каталог направлений |
| `direction-detail.png` | Карточка программы |
| `jobs.png` | Вакансии |
| `contacts.png` | Контакты |
| `documents.png` | Документы |
| `info-organization.png` | Сведения об организации |
| `politic.png` | Политика |
| `404.png` | Страница ошибки |

Переснять: запустить `pnpm preview` (порт 4321) и выполнить `node tools/screenshot.mjs`
из папки `site/`. Smoke-тест интерактива — `node tools/smoke.mjs`.

Компактные превью для README (первый экран, webp) лежат в
[`shots/preview/`](../shots/preview/) и пересобираются из полных снимков:

```bash
python site/tools/make-previews.py      # из корня репозитория
```

## Деплой на Vercel

| Настройка | Значение |
| :-- | :-- |
| Проект | `trainingcenter-1rbj` (команда AlexMerf's projects) |
| Git-интеграция | ветка `main`, пуш запускает production-деплой |
| Root Directory | `site` |
| Framework | Astro |
| Node.js | 22.x |
| Переменная окружения | `SITE_URL` = `https://trainingcenter-1rbj-alexmerfs-projects.vercel.app` |

`SITE_URL` используется для canonical, Open Graph и `sitemap.xml`. Локально и в CI без
`SITE_URL` подставляется заглушка `https://trainingcenter.example`.

## Демо-ограничения

Что подключить при запуске реального сайта:

1. **Формы** — сейчас `preventDefault` + сообщение «это демо». Для реальных заявок нужен
   serverless-эндпоинт → Telegram/почта/CRM + антиспам + согласие по 152-ФЗ.
2. **Документы** — PDF-файлы и ссылки на скачивание — заглушки.
3. **Карта** — схематичная заглушка вместо интерактивной карты.
4. **Контент** — цены, сроки, вакансии и реквизиты — примеры.
