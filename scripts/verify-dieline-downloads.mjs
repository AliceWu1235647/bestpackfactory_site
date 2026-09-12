import { chromium } from 'file:///E:/codex/npm-global/node_modules/playwright/index.mjs';
import { readFileSync, statSync } from 'node:fs';

const base = (process.argv[2] || 'http://127.0.0.1:3000').replace(/\/$/, '');
const pages = [
  '/dielines/paper-bag-dieline',
  '/dielines/tuck-end-box-dieline',
  '/dielines/display-tray-dieline',
  '/dielines/two-piece-gift-box-dieline',
  '/dielines/wine-bottle-box-dieline',
  '/dielines/gable-top-box-dieline',
  '/dielines/roll-end-tray-dieline'
];
const formats = [
  ['PDF', '.pdf'],
  ['DXF', '.dxf'],
  ['AI', '.ai'],
  ['SVG', '.svg']
];

function validate(format, path) {
  const bytes = statSync(path).size;
  if (bytes < 1000) throw new Error(`${format} is unexpectedly small (${bytes} bytes)`);
  const head = readFileSync(path).subarray(0, 256).toString('utf8');
  if ((format === 'PDF' || format === 'AI') && !head.startsWith('%PDF-')) {
    throw new Error(`${format} does not have a PDF-compatible signature`);
  }
  if (format === 'DXF' && !head.includes('SECTION')) throw new Error('DXF header is missing');
  if (format === 'SVG' && !head.includes('<svg')) throw new Error('SVG root is missing');
  return bytes;
}

const browser = await chromium.launch();
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const extraHTTPHeaders = bypassSecret ? {
  'x-vercel-protection-bypass': bypassSecret,
  'x-vercel-set-bypass-cookie': 'true'
} : undefined;
try {
  for (const route of pages) {
    const context = await browser.newContext({ acceptDownloads: true, extraHTTPHeaders });
    const page = await context.newPage();
    await page.goto(`${base}${route}`, { waitUntil: 'networkidle', timeout: 60000 });
    for (const [format, extension] of formats) {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 30000 }),
        page.getByRole('button', { name: `Download ${format}` }).click()
      ]);
      const path = await download.path();
      const filename = download.suggestedFilename();
      if (!filename.toLowerCase().endsWith(extension)) {
        throw new Error(`${route}: ${format} filename has the wrong extension: ${filename}`);
      }
      const bytes = validate(format, path);
      console.log(`OK ${route.padEnd(38)} ${format.padEnd(3)} ${String(bytes).padStart(6)} bytes ${filename}`);
    }
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(`Validated ${pages.length * formats.length} real browser downloads from ${base}`);
