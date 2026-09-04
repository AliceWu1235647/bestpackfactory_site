// Rewrites declared <img> width/height to the file's real intrinsic size wherever
// the two disagree. Companion to scripts/audit-image-ratios.mjs — see that file for
// why a wrong declared ratio causes the layout shift the attributes should prevent.
//
// Rendered size is controlled by CSS everywhere these images appear (`.logo img`
// sets an explicit width; galleries set width or an inline aspect-ratio), so this
// only corrects the placeholder box the browser reserves before load.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content-site');
const PUBLIC = path.join(ROOT, 'public');
const TOLERANCE = 0.02;
const apply = !process.argv.includes('--dry-run');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs));
    else if (entry.name.endsWith('.html')) out.push(abs);
  }
  return out;
}

function resolveAsset(src, htmlFile) {
  if (!src || /^(?:https?:)?\/\//i.test(src) || src.startsWith('data:')) return null;
  const clean = src.split('#')[0].split('?')[0];
  if (!clean) return null;
  const decoded = decodeURIComponent(clean);
  const candidates = [];
  if (decoded.startsWith('/')) {
    const rel = decoded.replace(/^\/+/, '');
    candidates.push([PUBLIC, path.join(PUBLIC, rel)], [CONTENT, path.join(CONTENT, rel)]);
  } else {
    const fromDoc = path.resolve(path.dirname(htmlFile), decoded);
    candidates.push([CONTENT, fromDoc]);
    if (fromDoc.startsWith(CONTENT)) candidates.push([PUBLIC, path.join(PUBLIC, path.relative(CONTENT, fromDoc))]);
    candidates.push([PUBLIC, path.join(PUBLIC, decoded)], [CONTENT, path.join(CONTENT, decoded)]);
  }
  for (const [base, abs] of candidates) {
    if (abs.startsWith(base) && fs.existsSync(abs) && fs.statSync(abs).isFile()) return abs;
  }
  return null;
}

const sizeCache = new Map();
async function intrinsicSize(file) {
  if (sizeCache.has(file)) return sizeCache.get(file);
  let size = null;
  try {
    const meta = await sharp(file).metadata();
    const height = meta.pageHeight || meta.height;
    if (meta.width > 0 && height > 0) size = { width: meta.width, height };
  } catch { /* ignore */ }
  sizeCache.set(file, size);
  return size;
}

function attrOf(tag, name) {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'));
  return m ? m[2].trim() : '';
}

function setAttr(tag, name, value) {
  return tag.replace(
    new RegExp(`(\\b${name}\\s*=\\s*)(["'])[\\s\\S]*?\\2`, 'i'),
    (_m, lead, quote) => `${lead}${quote}${value}${quote}`
  );
}

const stats = { filesChanged: 0, tagsFixed: 0 };

for (const file of walk(CONTENT)) {
  const html = fs.readFileSync(file, 'utf8');
  let next = html;
  let fixedHere = 0;

  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const w = Number(attrOf(tag, 'width'));
    const h = Number(attrOf(tag, 'height'));
    if (!w || !h) continue;
    const asset = resolveAsset(attrOf(tag, 'src'), file);
    if (!asset) continue;
    const size = await intrinsicSize(asset);
    if (!size) continue;
    const declared = w / h;
    const actual = size.width / size.height;
    if (Math.abs(declared - actual) / actual <= TOLERANCE) continue;

    const updated = setAttr(setAttr(tag, 'width', size.width), 'height', size.height);
    if (updated === tag) continue;
    next = next.replace(tag, () => updated);
    fixedHere += 1;
  }

  if (fixedHere && apply) fs.writeFileSync(file, next);
  if (fixedHere) { stats.filesChanged += 1; stats.tagsFixed += fixedHere; }
}

console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', ...stats }, null, 2));
