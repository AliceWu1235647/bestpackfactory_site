// Reports <img> tags whose declared width/height imply a different aspect ratio
// than the file on disk. A wrong declared ratio is worse than no dimensions at all:
// the browser reserves a box of the wrong height, then reflows when the image loads,
// which is exactly the layout shift the attributes are supposed to prevent.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content-site');
const PUBLIC = path.join(ROOT, 'public');
const TOLERANCE = 0.02; // 2% — below this the reserved box is visually indistinguishable.

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

const bySrc = new Map();
let checked = 0;

for (const file of walk(CONTENT)) {
  const html = fs.readFileSync(file, 'utf8');
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const w = Number(attrOf(tag, 'width'));
    const h = Number(attrOf(tag, 'height'));
    if (!w || !h) continue;
    const src = attrOf(tag, 'src');
    const asset = resolveAsset(src, file);
    if (!asset) continue;
    const size = await intrinsicSize(asset);
    if (!size) continue;
    checked += 1;
    const declared = w / h;
    const actual = size.width / size.height;
    if (Math.abs(declared - actual) / actual <= TOLERANCE) continue;
    // Inline aspect-ratio wins over the attributes, so those tags are not shifting.
    const overridden = /aspect-ratio\s*:/i.test(attrOf(tag, 'style'));
    const key = `${src.split('?')[0]}|${w}x${h}|${overridden}`;
    const entry = bySrc.get(key) || {
      src: src.split('?')[0],
      declared: `${w}x${h}`,
      actual: `${size.width}x${size.height}`,
      declaredRatio: Number(declared.toFixed(3)),
      actualRatio: Number(actual.toFixed(3)),
      inlineAspectRatioOverride: overridden,
      occurrences: 0,
      pages: new Set()
    };
    entry.occurrences += 1;
    entry.pages.add(path.relative(CONTENT, file).replace(/\\/g, '/'));
    bySrc.set(key, entry);
  }
}

const rows = [...bySrc.values()]
  .map(e => ({ ...e, pageCount: e.pages.size, samplePages: [...e.pages].slice(0, 3), pages: undefined }))
  .sort((a, b) => b.occurrences - a.occurrences);

console.log(JSON.stringify({
  imagesWithDeclaredDimensions: checked,
  mismatchedGroups: rows.length,
  mismatchedOccurrences: rows.reduce((s, r) => s + r.occurrences, 0),
  shiftingOccurrences: rows.filter(r => !r.inlineAspectRatioOverride).reduce((s, r) => s + r.occurrences, 0),
  groups: rows.slice(0, 40)
}, null, 2));
