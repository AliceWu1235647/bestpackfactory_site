// Add intrinsic dimensions to local raster images without changing their CSS presentation.
// Width/height lets the browser reserve space before an image arrives, reducing CLS.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const CONTENT = path.resolve(process.argv[2] || 'content-site');
const META = new Map();
let scanned = 0;
let changedFiles = 0;
let changedImages = 0;
let skipped = 0;

function walk(dir, test) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, test));
    else if (test(entry.name)) out.push(full);
  }
  return out;
}

function localAsset(url, htmlDir) {
  let clean = url.split('?')[0].split('#')[0];
  if (/^https?:\/\//i.test(clean) || clean.startsWith('//') || clean.startsWith('data:')) return null;
  if (clean.startsWith('/')) return path.join(CONTENT, clean.replace(/^\/+/, ''));
  if (clean.startsWith('../') || clean.startsWith('./')) return path.resolve(htmlDir, clean);
  return path.join(CONTENT, clean);
}

async function getMeta(asset) {
  if (!asset || !fs.existsSync(asset)) return null;
  if (META.has(asset)) return META.get(asset);
  const ext = path.extname(asset).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext)) {
    META.set(asset, null);
    return null;
  }
  try {
    const value = await sharp(asset).metadata();
    const result = value.width && value.height ? { width: value.width, height: value.height } : null;
    META.set(asset, result);
    return result;
  } catch {
    META.set(asset, null);
    return null;
  }
}

function imageUrl(tag) {
  const src = tag.match(/\bsrc\s*=\s*["']([^"']+)/i)?.[1];
  if (src) return src;
  const srcset = tag.match(/\bsrcset\s*=\s*["']([^"']+)/i)?.[1];
  return srcset?.split(',')[0]?.trim().split(/\s+/)[0] || null;
}

const files = walk(CONTENT, name => name.endsWith('.html'));
for (const file of files) {
  const htmlDir = path.dirname(file);
  const original = fs.readFileSync(file, 'utf8');
  let changed = false;
  let output = original;
  const tags = original.match(/<img\b[^>]*>/gi) || [];

  for (const tag of tags) {
    if (/\bwidth\s*=|\bheight\s*=/i.test(tag)) continue;
    const url = imageUrl(tag);
    const asset = localAsset(url, htmlDir);
    const meta = await getMeta(asset);
    scanned++;
    if (!meta) { skipped++; continue; }
    const replacement = tag.replace(/\s*\/?\s*>$/, ` width="${meta.width}" height="${meta.height}">`);
    output = output.replace(tag, replacement);
    changed = true;
    changedImages++;
  }

  if (changed && output !== original) {
    fs.writeFileSync(file, output, 'utf8');
    changedFiles++;
    console.log(`[changed] ${path.relative(CONTENT, file).split(path.sep).join('/')} `);
  }
}

console.log(`\nDONE: files=${files.length} scanned=${scanned} changedImages=${changedImages} changedFiles=${changedFiles} skipped=${skipped}`);
