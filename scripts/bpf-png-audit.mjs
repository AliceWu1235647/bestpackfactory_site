// One-off audit: inventory PNG assets, count HTML references, estimate WebP savings.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

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

const htmlFiles = walk(ROOT, name => name.endsWith('.html'));
const allHtml = htmlFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');

const pngs = walk(path.join(ROOT, 'assets'), name => /\.png$/i.test(name));

let totalBytes = 0;
let referencedBytes = 0;
const rows = [];

for (const file of pngs) {
  const bytes = fs.statSync(file).size;
  totalBytes += bytes;
  const base = path.basename(file);
  const refs = allHtml.split(base).length - 1;
  if (refs > 0) referencedBytes += bytes;

  const meta = await sharp(file).metadata();
  const webpExists = fs.existsSync(file.replace(/\.png$/i, '.webp'));

  rows.push({
    file: file.replace(ROOT + path.sep + 'assets' + path.sep, '').replace(/\\/g, '/'),
    kb: Math.round(bytes / 1024),
    refs,
    dims: `${meta.width}x${meta.height}`,
    hasAlpha: meta.hasAlpha,
    webpExists
  });
}

rows.sort((a, b) => b.kb - a.kb);
for (const r of rows) {
  console.log(
    String(r.kb).padStart(5) + ' KB' +
    '  refs=' + String(r.refs).padStart(3) +
    '  ' + r.dims.padStart(11) +
    '  alpha=' + (r.hasAlpha ? 'Y' : 'N') +
    '  webp=' + (r.webpExists ? 'Y' : 'N') +
    '  ' + r.file
  );
}

console.log('---');
console.log(`PNG count: ${pngs.length}`);
console.log(`PNG total: ${(totalBytes / 1048576).toFixed(1)} MB`);
console.log(`PNG referenced in HTML: ${(referencedBytes / 1048576).toFixed(1)} MB`);
console.log(`PNGs with no HTML reference: ${rows.filter(r => r.refs === 0).length}`);
console.log(`PNGs already having a .webp sibling: ${rows.filter(r => r.webpExists).length}`);
