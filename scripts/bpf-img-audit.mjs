// Audit: image dimension/lazy coverage + eager payload, on the LIVE source tree.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'content-site';

function walk(dir, test) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, test));
    else if (test(entry.name)) out.push(full);
  }
  return out;
}

function resolveAsset(src) {
  const clean = src.split('?')[0].split('#')[0];
  if (/^https?:/i.test(clean) || clean.startsWith('//') || clean.startsWith('data:')) return null;
  const candidate = path.join(ROOT, clean.replace(/^\/+/, ''));
  return fs.existsSync(candidate) ? candidate : null;
}

const files = walk(ROOT, n => n.endsWith('.html'));

let total = 0, noDim = 0, lazy = 0, eager = 0;
const pages = [];

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  let missing = 0, eagerBytes = 0, eagerCount = 0;

  for (const tag of imgs) {
    total++;
    if (!/\bwidth\s*=/i.test(tag) || !/\bheight\s*=/i.test(tag)) { noDim++; missing++; }
    const isLazy = /loading\s*=\s*["']?lazy/i.test(tag);
    if (isLazy) lazy++;
    else {
      eager++; eagerCount++;
      const m = tag.match(/\bsrc\s*=\s*["']([^"']+)/i);
      const r = m && resolveAsset(m[1]);
      if (r) eagerBytes += fs.statSync(r).size;
    }
  }

  pages.push({
    page: file.replace(ROOT + path.sep, '').split(path.sep).join('/'),
    imgs: imgs.length,
    missing,
    eagerCount,
    eagerKB: Math.round(eagerBytes / 1024),
    htmlKB: Math.round(html.length / 1024)
  });
}

console.log(`HTML files: ${files.length}`);
console.log(`total <img>: ${total}`);
console.log(`missing width/height: ${noDim}  (${(noDim / total * 100).toFixed(0)}%)`);
console.log(`lazy: ${lazy}   eager: ${eager}`);

console.log('\n=== worst pages by missing dimensions ===');
for (const p of [...pages].sort((a, b) => b.missing - a.missing).slice(0, 12)) {
  if (p.missing > 0) console.log(`  ${String(p.missing).padStart(3)} missing  ${p.page}`);
}

console.log('\n=== heaviest eager payload (LCP impact) ===');
for (const p of [...pages].sort((a, b) => b.eagerKB - a.eagerKB).slice(0, 12)) {
  console.log(`  ${String(p.eagerKB).padStart(4)} KB  eager=${String(p.eagerCount).padStart(2)}  ${p.page}`);
}

console.log('\n=== largest HTML docs ===');
for (const p of [...pages].sort((a, b) => b.htmlKB - a.htmlKB).slice(0, 8)) {
  console.log(`  ${String(p.htmlKB).padStart(4)} KB  ${p.page}`);
}
