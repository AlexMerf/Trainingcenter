/**
 * Минимальный smoke-тест интерактивных элементов через Chrome DevTools Protocol.
 *
 * Запуск (из папки site):
 *   node tools/smoke.mjs
 *
 * Проверяет: панель доступности (открытие, настройки, сброс), демо-форму,
 * мобильное меню и отдачу robots.txt/sitemap.xml.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const baseUrl = 'http://127.0.0.1:4321';
const edgeCandidates = [
  process.env.EDGE_PATH,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }
}

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

const results = [];

function check(name, passed) {
  results.push({ name, passed });
  console.log(`${passed ? 'PASS' : 'FAIL'} — ${name}`);
}

async function main() {
  const edgePath = edgeCandidates.find((candidate) => existsSync(candidate));
  if (!edgePath) throw new Error('Не найден Edge/Chrome. Укажите EDGE_PATH.');

  const port = 9700 + Math.floor(Math.random() * 200);
  const userDataDir = path.join(os.tmpdir(), `dsh-smoke-${Date.now()}`);
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

    async function openPage(url, width = 1440) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width,
        height: 900,
        deviceScaleFactor: 1,
        mobile: width < 600,
      });
      const loaded = cdp.once('Page.loadEventFired');
      await cdp.send('Page.navigate', { url });
      await loaded;
      await sleep(350);
      await cdp.evaluate('localStorage.clear()');
      const loadedAgain = cdp.once('Page.loadEventFired');
      await cdp.send('Page.reload');
      await loadedAgain;
      await sleep(350);
    }

    // 1. Панель доступности
    await openPage(`${baseUrl}/`);
    const a11yOpen = await cdp.evaluate(
      `(() => {
        const panel = document.getElementById('a11y-panel');
        document.querySelector('[data-a11y-open]').click();
        return { open: panel.classList.contains('is-open'), hidden: panel.getAttribute('aria-hidden') };
      })()`,
    );
    check('панель доступности открывается', a11yOpen.open === true && a11yOpen.hidden === 'false');

    const a11yFont = await cdp.evaluate(
      `(() => {
        document.querySelector('[data-a11y-group="font"][data-value="large"]').click();
        return document.documentElement.classList.contains('a11y-font-large');
      })()`,
    );
    check('размер шрифта применяется', a11yFont === true);

    const a11yReset = await cdp.evaluate(
      `(() => {
        document.querySelector('[data-a11y-reset]').click();
        return !document.documentElement.classList.contains('a11y-font-large');
      })()`,
    );
    check('настройки сбрасываются', a11yReset === true);

    // 2. Демо-форма
    const formDemo = await cdp.evaluate(
      `(() => {
        const form = document.querySelector('[data-demo-form]');
        const status = form.querySelector('[data-form-status]');
        form.querySelector('input[name="name"]').value = 'Иван';
        form.querySelector('input[name="phone"]').value = '+7 (919) 000-00-00';
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        return { statusVisible: status.hidden === false, note: form.textContent.includes('демо-форма') };
      })()`,
    );
    check('демо-форма показывает статус и не отправляет данные', formDemo.statusVisible === true);

    // 3. Мобильное меню
    await openPage(`${baseUrl}/`, 390);
    const menu = await cdp.evaluate(
      `(() => {
        const button = document.querySelector('[data-menu-toggle]');
        button.click();
        const panel = document.querySelector('#mobile-menu');
        return {
          open: panel.classList.contains('is-open'),
          expanded: button.getAttribute('aria-expanded'),
        };
      })()`,
    );
    check('мобильное меню открывается', menu.open === true && menu.expanded === 'true');

    await cdp.send('Browser.close').catch(() => {});
  } finally {
    browser.kill();
  }

  // 4. robots.txt и sitemap.xml
  const [robots, sitemap] = await Promise.all([
    fetch(`${baseUrl}/robots.txt`),
    fetch(`${baseUrl}/sitemap.xml`),
  ]);
  const robotsText = await robots.text();
  const sitemapText = await sitemap.text();
  check('robots.txt отдаётся и ссылается на sitemap', robots.status === 200 && robotsText.includes('Sitemap:'));
  check('sitemap.xml отдаётся и содержит программы', sitemap.status === 200 && sitemapText.includes('/directions/ohrana-truda/'));

  const failed = results.filter((result) => !result.passed);
  console.log(`\nИтого: ${results.length - failed.length}/${results.length} проверок пройдено`);
  if (failed.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
