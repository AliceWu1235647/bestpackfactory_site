// Adds intrinsic width/height to <img> tags that lack them, so the browser can
// reserve layout space before the image loads. Missing dimensions are the main
// source of Cumulative Layout Shift, which is a Core Web Vitals ranking signal.
//
// Dimensions are read from the actual image files with sharp — never guessed — so a
// declared aspect ratio can't disagree with the asset and introduce distortion.
//
// Scope is opt-in via --include. Product pages are excluded by default: their
// galleries use grid stretch rather than width:100%, so the aspect-ratio hint
// interacts with the layout differently and wants a rendered check first.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content-site');
const PUBLIC = path.join(ROOT, 'public');

const apply = !process.argv.includes('--dry-run');
const includeArg = process.argv.find(a => a.startsWith('--include='));
// Default: locale mirrors plus root-level pages. Excludes products/.
const include = includeArg ? includeArg.slice('--include='.length).split(',') : ['ar', 'de', 'es', 'fr', 'ja', '(root)'];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs));
    else if (entry.name.endsWith('.html')) out.push(abs);
  }
  return out;
}

function sectionOf(rel) {
  const first = rel.split('/')[0];
  return first.includes('.') ? '(root)' : first;
}

// src="/assets/products/x.webp?v=1.2#frag" -> disk path, or null when not local.
// Product pages mix root-absolute srcs with document-relative ones like
// "../assets/logo/...", so relative srcs are resolved against the page's own
// directory as well as the two asset roots.
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
    // The same tree is mirrored under public/, so map the resolved content-site
    // path across when the asset only lives there.
    if (fromDoc.startsWith(CONTENT)) {
      candidates.push([PUBLIC, path.join(PUBLIC, path.relative(CONTENT, fromDoc))]);
    }
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
    // Multi-frame formats report per-frame height under pageHeight.
    const height = meta.pageHeight || meta.height;
    if (meta.width > 0 && height > 0) size = { width: meta.width, height };
  } catch { /* unreadable or vector without a fixed viewBox */ }
  sizeCache.set(file, size);
  return size;
}

function attrOf(tag, name) {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'));
  return m ? m[2].trim() : '';
}

const stats = { filesChanged: 0, imgsFixed: 0, skippedNoAsset: 0, skippedUnreadable: 0, alreadySized: 0 };
const unresolved = new Set();

for (const file of walk(CONTENT)) {
  const rel = path.relative(CONTENT, file).replace(/\\/g, '/');
  if (!include.includes(sectionOf(rel))) continue;

  const html = fs.readFileSync(file, 'utf8');
  const tags = html.match(/<img\b[^>]*>/gi) || [];
  let next = html;
  let fixedHere = 0;

  for (const tag of tags) {
    const hasW = !!attrOf(tag, 'width');
    const hasH = !!attrOf(tag, 'height');
    if (hasW && hasH) { stats.alreadySized += 1; continue; }

    const asset = resolveAsset(attrOf(tag, "src"), file);
    if (!asset) { stats.skippedNoAsset += 1; unresolved.add(attrOf(tag, 'src')); continue; }
    const size = await intrinsicSize(asset);
    if (!size) { stats.skippedUnreadable += 1; continue; }

    const additions = [];
    if (!hasW) additions.push(` width="${size.width}"`);
    if (!hasH) additions.push(` height="${size.height}"`);
    // Insert before the tag terminator so self-closing syntax is preserved.
    const updated = tag.replace(/\s*\/?>$/, match => `${additions.join('')}${match.trimStart() === '/>' ? '/>' : match}`);
    // Function form: a literal replacement string would treat `$&`/`$'` in a URL
    // as substitution patterns. Replaces the first remaining unfixed occurrence,
    // so repeated identical tags are each handled on their own loop iteration.
    next = next.replace(tag, () => updated);
    fixedHere += 1;
  }

  if (fixedHere && apply) fs.writeFileSync(file, next);
  if (fixedHere) { stats.filesChanged += 1; stats.imgsFixed += fixedHere; }
}

console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', include, ...stats }, null, 2));
if (unresolved.size) console.log('unresolved srcs:', [...unresolved].slice(0, 20));
