import { chromium } from 'file:///E:/codex/npm-global/node_modules/playwright/index.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const label = process.argv[2] || 'baseline';
const base = (process.argv[3] || 'http://127.0.0.1:3000').replace(/\/$/, '');
const routeFilter = process.argv[4] || '';
const out = path.resolve('artifacts', 'geo-visuals', label);
mkdirSync(out, { recursive: true });

const routes = [
  ['home', '/'],
  ['products', '/products.html'],
  ['custom-packaging-manufacturer', '/custom-packaging-manufacturer.html'],
  ['rigid-boxes', '/products/custom-rigid-boxes.html'],
  ['magnetic-boxes', '/products/luxury-magnetic-boxes.html'],
  ['paper-bags', '/products/paper-bags.html'],
  ['custom-printed-stand-up-pouches', '/products/custom-stand-up-pouches.html'],
  ['stand-up-pouch-manufacturer', '/products/stand-up-pouch.html'],
  ['flexible-packaging', '/products/flexible-packaging.html'],
  ['contact', '/contact.html'],
  ['arabic-products', '/ar/products.html']
];

const viewports = [
  ['mobile-390', 390, 844, 1],
  ['desktop-1440', 1440, 1000, 1]
];

const report = [];
const browser = await chromium.launch();

for (const [routeName, route] of routes.filter(([name]) => !routeFilter || name === routeFilter)) {
  for (const [viewportName, width, height, deviceScaleFactor] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.route(/https:\/\/(?:fonts\.googleapis\.com|fonts\.gstatic\.com)\//, route => route.abort());
    const errors = [];
    page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
    page.on('console', message => {
      const value = message.text();
      // Local sandbox blocks remote Google Fonts. It does not indicate a site
      // rendering defect and the production browser can still use its fallback.
      if (message.type() === 'error' && !/ERR_(?:NETWORK_ACCESS_DENIED|FAILED)/i.test(value)) errors.push(`console: ${value}`);
    });

    const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      document.querySelectorAll('[data-autoplay-ms]').forEach(element => element.removeAttribute('data-autoplay-ms'));
      const style = document.createElement('style');
      style.textContent = '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';
      document.head.appendChild(style);
      document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
      for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
        window.scrollTo(0, y);
        await new Promise(resolve => setTimeout(resolve, 12));
      }
      await Promise.all([...document.images].map(image => image.decode?.().catch(() => {}) || Promise.resolve()));
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(250);

    const stem = `${routeName}__${viewportName}`;
    await page.screenshot({ path: path.join(out, `${stem}__viewport.png`), fullPage: false });
    await page.screenshot({ path: path.join(out, `${stem}__full.png`), fullPage: true });

    const selectors = {
      header: 'header.header',
      whatsappDock: '.bpf-contact-dock',
      contactForm: '.contact-form-container',
      localeSwitcher: '.locale-switcher'
    };
    const components = {};
    for (const [component, selector] of Object.entries(selectors)) {
      const locator = page.locator(selector).first();
      const count = await locator.count();
      components[component] = count;
      if (count) {
        if (component === 'whatsappDock') {
          // The dock has transparent space around the circular button. Give that
          // space a controlled backdrop so unrelated body copy beneath the fixed
          // component cannot create a false pixel difference.
          await locator.evaluate(element => { element.style.background = '#fff'; });
        }
        await locator.screenshot({ path: path.join(out, `${stem}__${component}.png`) });
      }
    }
    const productGrid = page.locator('.products-grid-fixed').first();
    const productGridCount = await productGrid.count();
    components.productGrid = productGridCount;
    if (productGridCount) {
      await productGrid.scrollIntoViewIfNeeded();
      const box = await productGrid.boundingBox();
      if (box) {
        await page.locator('.bpf-contact-dock').evaluateAll(elements => elements.forEach(element => { element.dataset.captureVisibility = element.style.visibility; element.style.visibility = 'hidden'; }));
        await page.screenshot({
          path: path.join(out, `${stem}__productGrid.png`),
          clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.width, height: Math.min(box.height, 3000) }
        });
        await page.locator('.bpf-contact-dock').evaluateAll(elements => elements.forEach(element => { element.style.visibility = element.dataset.captureVisibility || ''; delete element.dataset.captureVisibility; }));
      }
    }

    report.push({
      route,
      viewport: { width, height },
      status: response?.status() || null,
      lang: await page.locator('html').getAttribute('lang'),
      dir: await page.locator('html').getAttribute('dir'),
      h1Count: await page.locator('h1').count(),
      components,
      errors
    });
    await context.close();
  }
}

await browser.close();
writeFileSync(path.join(out, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Captured ${report.length} route/viewport combinations in ${out}`);
if (report.some(item => item.status !== 200 || item.errors.length || item.h1Count !== 1)) process.exitCode = 1;
