/**
 * Полноэкранные скриншоты страниц через Chrome DevTools Protocol.
 *
 * Запуск (из папки site/):
 *   node tools/screenshot.mjs
 *
 * Требуется Edge или Chrome; путь можно задать переменной EDGE_PATH.
 * Скрипт сам поднимает headless-браузер, снимает страницы целиком
 * (captureBeyondViewport) и сохраняет PNG в ../shots.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const shotsDir = path.resolve(root, '..', 'shots');
const baseUrl = 'http://127.0.0.1:4321';

const pages = [
  { name: 'home', url: `${baseUrl}/` },
  { name: 'directions', url: `${baseUrl}/directions/` },
  { name: 'direction-detail', url: `${baseUrl}/directions/ohrana-truda/` },
  { name: 'jobs', url: `${baseUrl}/jobs/` },
  { name: 'contacts', url: `${baseUrl}/contacts/` },
  { name: 'documents', url: `${baseUrl}/documents/` },
  { name: 'info-organization', url: `${baseUrl}/info-organization/` },
  { name: 'politic', url: `${baseUrl}/politic/` },
  { name: '404', url: `${baseUrl}/404.html` },
];

const mobilePages = [{ name: 'home-mobile', url: `${baseUrl}/` }];

const edgeCandidates = [
  process.env.EDGE_PATH,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForDevTools(port, attempts = 60) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {
      // браузер ещё поднимается
    }
    await sleep(250);
  }
  throw new Error('Не дождались DevTools-порта');
}

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
        return;
      }
      if (message.method && this.listeners.has(message.method)) {
        for (const listener of this.listeners.get(message.method)) listener(message.params);
      }
    });
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  once(method) {
    return new Promise((resolve) => {
      const listener = (params) => {
        this.listeners.get(method).delete(listener);
        resolve(params);
      };
      if (!this.listeners.has(method)) this.listeners.set(method, new Set());
      this.listeners.get(method).add(listener);
    });
  }
}

async function main() {
  const edgePath = edgeCandidates.find((candidate) => existsSync(candidate));
  if (!edgePath) throw new Error('Не найден Edge/Chrome. Укажите EDGE_PATH.');

  await mkdir(shotsDir, { recursive: true });

  const port = 9300 + Math.floor(Math.random() * 400);
  const userDataDir = path.join(os.tmpdir(), `dsh-cdp-${Date.now()}`);
  const browser = spawn(
    edgePath,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      '--no-first-run',
      '--disable-extensions',
      `--user-data-dir=${userDataDir}`,
      `--remote-debugging-port=${port}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  try {
    await waitForDevTools(port);
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const page = targets.find((target) => target.type === 'page');
    if (!page) throw new Error('Не найден page-таргет');

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', reject, { once: true });
    });

    const cdp = new Cdp(ws);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });

    async function capture({ url, name, fullPage = true, width = 1440, height = 900, mobile = false }) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile,
      });

      const loaded = cdp.once('Page.loadEventFired');
      await cdp.send('Page.navigate', { url });
      await loaded;
      await sleep(400);
      await cdp.send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
      // Полноэкранный снимок не прокручивает страницу, поэтому ленивые картинки
      // нужно включить принудительно и дождаться их загрузки.
      await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          const images = Array.from(document.images);
          images.forEach((img) => { img.loading = 'eager'; });
          return Promise.all(images.map((img) => new Promise((resolve) => {
            if (img.complete && img.naturalWidth > 0) return resolve(true);
            img.addEventListener('load', () => resolve(true), { once: true });
            img.addEventListener('error', () => resolve(false), { once: true });
          })));
        })()`,
        awaitPromise: true,
      });
      // В полноэкранных снимках фиксированная кнопка доступности попадает в случайное место.
      await cdp.send('Runtime.evaluate', {
        expression:
          "document.head.insertAdjacentHTML('beforeend', '<style>.a11y-launcher{display:none!important}</style>')",
      });
      await sleep(250);

      const metrics = await cdp.send('Page.getLayoutMetrics');
      const size = metrics.cssContentSize ?? metrics.contentSize;
      const clipHeight = fullPage ? Math.ceil(size.height) : height;
      const clipWidth = Math.ceil(size.width);

      const screenshot = await cdp.send('Page.captureScreenshot', {
        format: 'png',
        fromSurface: true,
        captureBeyondViewport: fullPage,
        clip: { x: 0, y: 0, width: clipWidth, height: clipHeight, scale: 1 },
      });

      const target = path.join(shotsDir, `${name}.png`);
      await writeFile(target, Buffer.from(screenshot.data, 'base64'));
      console.log(`${name}: ${clipWidth}x${clipHeight} -> ${target}`);
    }

    for (const pageInfo of pages) await capture(pageInfo);
    for (const pageInfo of mobilePages) {
      await capture({ ...pageInfo, width: 390, height: 844, mobile: true, fullPage: false });
    }

    await cdp.send('Browser.close').catch(() => {});
  } finally {
    browser.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
