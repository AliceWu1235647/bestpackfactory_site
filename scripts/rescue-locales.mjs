// One-off rescue: the live deployment serves 5 translated locales whose source
// is not in this repo. Pull the rendered HTML back into content-site/ so a
// deploy from here stops deleting 120 indexed pages.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://www.bestpackfactory.com';
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentRoot = path.join(projectRoot, 'content-site');

const liveUrls = fs
  .readFileSync(path.join(projectRoot, 'live_urls.txt'), 'utf8')
  .split('\n')
  .map(s => s.trim())
  .filter(Boolean);

const localUrls = new Set(
  fs
    .readFileSync(path.join(projectRoot, 'local_urls.txt'), 'utf8')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
);

const missing = liveUrls.filter(u => !localUrls.has(u));

function localFileFor(url) {
  let pathname = new URL(url).pathname;
  if (pathname === '/') return null;
  // Locale roots such as /de are served as directories; store them as index.html.
  if (!pathname.endsWith('.html')) pathname = `${pathname.replace(/\/$/, '')}/index.html`;
  return path.join(contentRoot, pathname.replace(/^\//, ''));
}

// The rendered pages are Next.js output. Strip the framework shell and keep the
// document so lib/static-pages.js can consume it like any other content page.
function cleanup(html) {
  return html
    .replace(/<script src="\/_next\/[^"]*"[^>]*><\/script>/g, '')
    .replace(/<link rel="preload" as="script"[^>]*\/>/g, '')
    .replace(/<!--[A-Za-z0-9_-]{20,}-->/g, '');
}

let saved = 0;
let failed = 0;
const failures = [];

for (const url of missing) {
  const target = localFileFor(url);
  if (!target) continue;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = cleanup(await res.text());
    if (!/<\/html>/i.test(html)) throw new Error('truncated response');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, html, 'utf8');
    saved++;
    if (saved % 20 === 0) console.log(`  saved ${saved}/${missing.length}`);
  } catch (err) {
    failed++;
    failures.push(`${url} — ${err.message}`);
  }
}

console.log(`\nRescued ${saved} pages into content-site/`);
if (failed) {
  console.log(`Failed ${failed}:`);
  for (const f of failures) console.log(`  ${f}`);
}
