import { chromium } from 'file:///E:/codex/npm-global/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3000';
const routes = [
  '/products/cannabis-stand-up-pouches.html',
  '/products/custom-paper-bags-wholesale.html',
  '/products/custom-boxes-moq-500.html',
  '/products/cannabis-mylar-bags.html',
];
const out = 'E:/codex/temp/restore_repo/shots_p1';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
for (const route of routes) {
  const name = route.split('/').pop().replace('.html', '');
  for (const [label, width, height] of [['mob', 390, 844], ['desk', 1440, 2400]]) {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: label === 'mob' ? 2 : 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push('PAGEERR: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
    await page.goto(BASE + route, { waitUntil: 'networkidle' });
    const cluster = await page.locator('.related-resource-cluster').count();
    await page.evaluate(() => { const el = document.querySelector('.related-resource-cluster'); if (el) el.scrollIntoView({ block: 'center' }); });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${out}/${name}_${label}_cluster.png`, fullPage: false });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${out}/${name}_${label}_full.png`, fullPage: true });
    console.log('shot', name, label, '| cluster count:', cluster, '| errors:', errors.length, errors.slice(0, 3));
    await ctx.close();
  }
}
await browser.close();
