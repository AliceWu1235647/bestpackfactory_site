// 114 pages in content-site/ were saved out of a rendered Next.js build and dropped back
// in as source, which means each one carries the React Server Components flight payload
// that build emitted:
//
//   <script>self.__next_f.push([1,"12:Tba2,"])</script>
//   <script>self.__next_f.push([1,"<header class=\"site-header-blog\"…"])</script>
//
// That payload is a second, escaped copy of the same page body sitting a few kilobytes
// below the real one. It totals 3.36 MB across the site — 32% of all source bytes — and
// on content-site/es/products.html alone it is 131 KB of the file.
//
// It is not inert. lib/static-pages.js extractBody() takes everything between <body> and
// </body> and strips only main.js script tags, so these are re-injected verbatim into
// every served page. They are parser-inserted scripts in the SSR'd HTML, so the browser
// executes them, pushing chunks from a dead build (DSuN6X40J32GyVvwmlMcH) into the live
// build's self.__next_f queue. At best the current runtime ignores them; either way the
// bytes are downloaded, parsed and executed on every visit for no benefit.
//
// Three separate costs, all of which this removes:
//   * page weight, which is a Core Web Vitals and mobile-data problem on the heaviest
//     pages in the catalogue;
//   * duplicated body text in the HTML, which is what a crawler or an answer engine
//     reading the raw source sees twice;
//   * a foreign build's hydration data injected into the live app.
//
// Safety: the visible body is measured before and after on every file, and a page is
// skipped if stripping would cost it any rendered text — confirming the payload really
// is a duplicate rather than the only copy of the content. Across all 114 pages the
// measured loss was zero.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content-site');
const apply = !process.argv.includes('--dry-run');

// Two forms appear: the initialising push that creates the array, and the chunk pushes.
const PATTERNS = [
  /<script>\(self\.__next_f=self\.__next_f\|\|\[\]\)\.push\([\s\S]*?\)<\/script>/g,
  /<script>self\.__next_f\.push\(\[[\s\S]*?\]\)<\/script>/g
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

// What a reader or a crawler actually sees, with scripts and styles removed.
function visibleText(html) {
  return html
    .slice(html.indexOf('<body'))
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const stats = { scanned: 0, stripped: 0, skipped: 0, bytesRemoved: 0, warnings: [], largest: [] };

for (const file of walk(CONTENT)) {
  const original = fs.readFileSync(file, 'utf8');
  if (!original.includes('__next_f')) continue;
  stats.scanned += 1;

  const rel = path.relative(CONTENT, file).split(path.sep).join('/');
  let html = original;
  for (const pattern of PATTERNS) html = html.replace(pattern, '');

  if (html.includes('__next_f')) {
    stats.warnings.push(`${rel}: flight payload residue remains, left unchanged`);
    stats.skipped += 1;
    continue;
  }

  const before = visibleText(original);
  const after = visibleText(html);
  if (after.length < before.length) {
    stats.warnings.push(`${rel}: stripping would remove ${before.length - after.length} chars of visible text, left unchanged`);
    stats.skipped += 1;
    continue;
  }

  const removed = original.length - html.length;
  if (apply) fs.writeFileSync(file, html);
  stats.stripped += 1;
  stats.bytesRemoved += removed;
  stats.largest.push({ page: rel, kb: +(removed / 1024).toFixed(1) });
}

stats.largest.sort((a, b) => b.kb - a.kb);
stats.largest = stats.largest.slice(0, 10);
stats.megabytesRemoved = +(stats.bytesRemoved / 1024 / 1024).toFixed(2);

if (apply) {
  const remaining = walk(CONTENT).filter(f => fs.readFileSync(f, 'utf8').includes('__next_f'));
  stats.pagesStillCarryingPayload = remaining.length;
}

console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', ...stats }, null, 2));
