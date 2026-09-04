// 审计 content-site 下所有 <img> 缺失 width/height 的情况(CLS / Core Web Vitals)。
import fs from 'fs';
import path from 'path';

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const files = walk('content-site');
const rows = [];
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    if (/\bwidth\s*=/.test(tag) && /\bheight\s*=/.test(tag)) continue;
    const src = (tag.match(/src=["']([^"']+)["']/) || [])[1] || '(no-src)';
    rows.push([f.split(path.sep).join('/'), src]);
  }
}

console.log('html files scanned:', files.length);
console.log('img tags missing width/height:', rows.length);

const byFile = {};
rows.forEach(([f]) => (byFile[f] = (byFile[f] || 0) + 1));
console.log('\n-- by file --');
Object.entries(byFile)
  .sort((a, b) => b[1] - a[1])
  .forEach(([f, c]) => console.log(' ', String(c).padStart(3), f));

const bySrc = {};
rows.forEach(([, s]) => (bySrc[s] = (bySrc[s] || 0) + 1));
console.log('\n-- unique srcs:', Object.keys(bySrc).length, '--');
Object.entries(bySrc)
  .sort((a, b) => b[1] - a[1])
  .forEach(([s, c]) => console.log(' ', String(c).padStart(3), 'x', s));
