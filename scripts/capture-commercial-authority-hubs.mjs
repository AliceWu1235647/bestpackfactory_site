import { chromium } from 'file:///E:/codex/npm-global/node_modules/playwright/index.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { COMMERCIAL_AUTHORITY_ROUTES } from '../lib/commercial-authority-hubs.js';

const label = process.argv[2] || 'commercial-authority-local';
const base = (process.argv[3] || 'http://127.0.0.1:3000').replace(/\/$/, '');
const out = path.resolve('artifacts', 'commercial-authority', label);
mkdirSync(out, { recursive: true });

const routes = [
  ...COMMERCIAL_AUTHORITY_ROUTES.map(route => `/${route}`),
  '/dielines',
  '/dielines/paper-bag-dieline',
  '/dielines/child-resistant-pouch-dieline',
];
const viewports = [
  ['mobile-390', 390, 844],
  ['desktop-1440', 1440, 1000],
];
const report = [];
const browser = await chromium.launch();

for (const route of routes) {
  for (const [viewport, width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.route(/https:\/\/(?:fonts\.googleapis\.com|fonts\.gstatic\.com)\//, request => request.abort());
    const errors = [];
    page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
    page.on('console', message => {
      const value = message.text();
      if (message.type() === 'error' && !/ERR_(?:NETWORK_ACCESS_DENIED|FAILED)/i.test(value)) errors.push(`console: ${value}`);
    });
    const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      const style = document.createElement('style');
      style.textContent = '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';
      document.head.appendChild(style);
      document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
      for (let y = 0; y < document.documentElement.scrollHeight; y += 800) {
        window.scrollTo(0, y);
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      await Promise.all([...document.images].map(image => image.decode?.().catch(() => {}) || Promise.resolve()));
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(150);

    const facts = await page.evaluate(() => ({
      h1Count: document.querySelectorAll('h1').length,
      quickAnswers: document.querySelectorAll('[data-bpf-authority-quick-answer]').length,
      authorityHubs: document.querySelectorAll('[data-bpf-commercial-authority-hub]').length,
      header: document.querySelectorAll('header.header').length,
      whatsappDock: document.querySelectorAll('.bpf-contact-dock').length,
      bodyScrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    const isDieline = route.startsWith('/dielines');
    const expectedHub = !isDieline;
    if (facts.h1Count !== 1) errors.push(`expected one H1, found ${facts.h1Count}`);
    if (expectedHub && facts.quickAnswers !== 1) errors.push(`expected one buyer quick answer, found ${facts.quickAnswers}`);
    if (expectedHub && facts.authorityHubs !== 1) errors.push(`expected one authority hub, found ${facts.authorityHubs}`);
    if (facts.header !== 1 || facts.whatsappDock !== 1) errors.push('protected header or WhatsApp dock missing');
    if (facts.bodyScrollWidth > facts.viewportWidth + 1) errors.push(`horizontal overflow: ${facts.bodyScrollWidth}px > ${facts.viewportWidth}px`);

    const stem = `${route.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-') || 'home'}__${viewport}`;
    await page.screenshot({ path: path.join(out, `${stem}__viewport.png`), fullPage: false });
    await page.screenshot({ path: path.join(out, `${stem}__full.png`), fullPage: true });
    report.push({ route, viewport: { width, height }, status: response?.status() || null, ...facts, errors });
    await context.close();
  }
}

await browser.close();
writeFileSync(path.join(out, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Captured ${report.length} authority route/viewport combinations in ${out}`);
const failures = report.filter(item => item.status !== 200 || item.errors.length);
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
