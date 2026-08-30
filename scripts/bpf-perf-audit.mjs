// One-off audit: per-page first-viewport weight, CLS risk, and render-blocking assets.
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
  const rel = clean.replace(/^\/+/, '');
  const candidate = path.join(ROOT, rel);
  return fs.existsSync(candidate) ? candidate : null;
}

const htmlFiles = walk(ROOT, name => name.endsWith('.html'));

const pages = [];
let missingDimTotal = 0;
let eagerAboveFold = 0;
const externalHosts = new Map();

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const imgs = html.match(/<img\b[^>]*>/gi) || [];

  let eagerBytes = 0;
  let eagerCount = 0;
  let missingDim = 0;

  for (const tag of imgs) {
    const isLazy = /loading\s*=\s*["']?lazy/i.test(tag);
    if (!/\bwidth\s*=/i.test(tag) || !/\bheight\s*=/i.test(tag)) missingDim++;

    const srcMatch = tag.match(/\bsrc\s*=\s*["']([^"']+)/i);
    if (!srcMatch) continue;
    const resolved = resolveAsset(srcMatch[1]);
    if (!isLazy) {
      eagerCount++;
      if (resolved) eagerBytes += fs.statSync(resolved).size;
    }
  }

  missingDimTotal += missingDim;
  eagerAboveFold += eagerCount;

  for (const m of html.matchAll(/(?:src|href)\s*=\s*["']https?:\/\/([^/"']+)/gi)) {
    externalHosts.set(m[1], (externalHosts.get(m[1]) || 0) + 1);
  }

  pages.push({
    page: file.replace(ROOT + path.sep, '').replace(/\\/g, '/'),
    htmlKB: Math.round(html.length / 1024),
    imgs: imgs.length,
    eagerCount,
    eagerKB: Math.round(eagerBytes / 1024),
    missingDim
  });
}

console.log('=== Heaviest eager (non-lazy) image payload per page — direct LCP impact ===');
for (const p of [...pages].sort((a, b) => b.eagerKB - a.eagerKB).slice(0, 15)) {
  console.log(
    String(p.eagerKB).padStart(5) + ' KB eager' +
    '  imgs=' + String(p.imgs).padStart(3) +
    '  eager=' + String(p.eagerCount).padStart(3) +
    '  html=' + String(p.htmlKB).padStart(4) + 'KB' +
    '  ' + p.page
  );
}

console.log('');
console.log('=== Largest HTML documents (inline weight, parsed before paint) ===');
for (const p of [...pages].sort((a, b) => b.htmlKB - a.htmlKB).slice(0, 10)) {
  console.log(String(p.htmlKB).padStart(4) + ' KB  ' + p.page);
}

console.log('');
console.log('=== External hosts referenced (each may cost a DNS+TLS handshake) ===');
for (const [host, count] of [...externalHosts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  console.log(String(count).padStart(5) + 'x  ' + host);
}

console.log('');
console.log('--- totals ---');
console.log(`pages: ${pages.length}`);
console.log(`<img> missing width/height: ${missingDimTotal}`);
console.log(`eager (non-lazy) <img> tags: ${eagerAboveFold}`);
const worst = pages.reduce((a, b) => (b.eagerKB > a.eagerKB ? b : a), pages[0]);
console.log(`worst page eager payload: ${worst.eagerKB} KB (${worst.page})`);
