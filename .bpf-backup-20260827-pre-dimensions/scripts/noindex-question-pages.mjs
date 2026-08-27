// Retire template-style /questions/ pages from Google's index (keep them crawlable,
// nofollow-free so internal links still pass value). Run: node scripts/noindex-question-pages.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const contentRoot = path.resolve(scriptDir, '..', 'content-site');

function walkHtml(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkHtml(absolute));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(absolute);
  }
  return files;
}

let added = 0;
let already = 0;
let skipped = 0;

for (const file of walkHtml(contentRoot)) {
  if (!/questions[\\/][^\\/]+\.html$/i.test(file)) continue; // only /questions/<slug>.html leaves
  const html = fs.readFileSync(file, 'utf8');
  if (/<meta\s+[^>]*name=["']robots["']/i.test(html)) {
    // Keep existing robots meta untouched (do not override an explicit index decision).
    already += 1;
    continue;
  }
  const marker = '<head>';
  const index = html.toLowerCase().indexOf(marker);
  if (index < 0) {
    skipped += 1;
    continue;
  }
  const insertAt = index + marker.length;
  const updated = `${html.slice(0, insertAt)}\n  <meta name="robots" content="noindex, follow" />${html.slice(insertAt)}`;
  fs.writeFileSync(file, updated, 'utf8');
  added += 1;
}

console.log(`noindex-question-pages: added=${added}, already-had-robots=${already}, skipped=${skipped}`);
