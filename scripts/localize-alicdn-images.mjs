// 22 pages hotlinked product photography straight from Alibaba's CDN
// (sc02.alicdn.com). That is a live dependency on a third party the site does not
// control: they can block hotlinking at any time and the homepage loses its images,
// the files can't be sized or cached for Core Web Vitals, and every visitor's
// browser announces the site to Alibaba before the page finishes loading.
//
// This downloads each asset once, stores it locally in both asset roots, emits a
// WebP alongside the original, and rewrites every reference:
//   <img src>            -> /assets/products/<name>.webp        (root-relative, WebP)
//   JSON-LD / og / meta  -> https://www.bestpackfactory.com/... (absolute, original
//                           format — widest crawler and social-card support)
// The now-pointless dns-prefetch/preconnect hints to sc02.alicdn.com are dropped.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content-site');
const PUBLIC = path.join(ROOT, 'public');
const SITE = 'https://www.bestpackfactory.com';
const apply = !process.argv.includes('--dry-run');

// Names taken from the alt text already on the pages, so the filename describes the
// product rather than carrying Alibaba's opaque hash.
const ASSETS = {
  'H78bad36b45c34ee0a62ffa69d234cb27C.png': 'custom-spout-pouches-01',
  'H5d3fc2f4c2464a61b46521c37cfd01bbB.png': 'custom-compostable-stand-up-pouches-01',
  'Hc4a7bc2525aa4ffcbbbfdfd11b0c560be.png': 'custom-retort-pouches-01',
  'H9de6ba89a70e433586e49df6865fecc7z.png': 'custom-roll-stock-film-01',
  'H2d234bedbdec4fc5b8e5a5693fe9d853y.png': 'custom-shrink-sleeve-labels-01',
  'Hbd9d80e06b684eecacf08ece9d95bab2P.png': 'custom-pp-ring-binder-folders-01',
  'Hf8aed687639a40abbb5a465c2da80942Q.jpg': 'custom-luxury-gift-boxes-hero-01',
  'H319a19040719405da2da32f2b48aba73I.jpg': 'custom-black-foldable-magnetic-gift-boxes-01',
  'H1ced2695b2f846169fa306c397905446d.jpg': 'custom-black-foldable-magnetic-gift-boxes-02'
};

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs));
    else if (entry.name.endsWith('.html')) out.push(abs);
  }
  return out;
}

// Two derivatives per source: WebP for <img>, JPEG for og:image / JSON-LD (social
// crawlers still handle JPEG most reliably). The originals are photographs saved as
// ~2MB PNGs, so neither derivative keeps that format.
async function download(id, base) {
  const webpName = `${base}.webp`;
  const jpgName = `${base}.jpg`;
  const targetsFor = name => [PUBLIC, CONTENT].map(root => path.join(root, 'assets', 'products', name));

  if ([...targetsFor(webpName), ...targetsFor(jpgName)].every(fs.existsSync)) {
    const meta = await sharp(targetsFor(webpName)[0]).metadata();
    return { base, webpName, jpgName, width: meta.width, height: meta.pageHeight || meta.height, cached: true };
  }

  const res = await fetch(`https://sc02.alicdn.com/kf/${id}`);
  if (!res.ok) throw new Error(`${id}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(buf).metadata();
  const webp = await sharp(buf).webp({ quality: 82 }).toBuffer();
  // flatten(): the source PNGs carry alpha, and JPEG has no alpha channel.
  const jpg = await sharp(buf).flatten({ background: '#ffffff' }).jpeg({ quality: 85, mozjpeg: true }).toBuffer();

  if (apply) {
    for (const target of targetsFor(webpName)) {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, webp);
    }
    for (const target of targetsFor(jpgName)) fs.writeFileSync(target, jpg);
  }
  return {
    base,
    webpName,
    jpgName,
    width: meta.width,
    height: meta.pageHeight || meta.height,
    bytes: buf.length,
    webpBytes: webp.length,
    jpgBytes: jpg.length
  };
}

const downloaded = {};
for (const [id, base] of Object.entries(ASSETS)) {
  downloaded[id] = await download(id, base);
}

// Rewrite pass. The URL itself is never escaped, only the quotes around it, so a
// plain string search finds occurrences inside raw HTML and inside HTML embedded in
// JSON strings alike. Whether a hit is an <img src> is decided by looking back for
// a `src=` attribute allowing either quote style, escaped or not.
const IMG_SRC_BEFORE = /src\s*=\s*(?:\\?["'])$/i;
const stats = { filesChanged: 0, imgRefs: 0, otherRefs: 0, hintsRemoved: 0 };

for (const file of walk(CONTENT)) {
  const original = fs.readFileSync(file, 'utf8');
  if (!original.includes('sc02.alicdn.com')) continue;
  let html = original;

  for (const [id, info] of Object.entries(downloaded)) {
    const url = `https://sc02.alicdn.com/kf/${id}`;
    let index = html.indexOf(url);
    while (index !== -1) {
      const before = html.slice(Math.max(0, index - 12), index);
      const isImgSrc = IMG_SRC_BEFORE.test(before);
      const replacement = isImgSrc
        ? `/assets/products/${info.webpName}`
        : `${SITE}/assets/products/${info.jpgName}`;
      if (isImgSrc) stats.imgRefs += 1; else stats.otherRefs += 1;
      html = html.slice(0, index) + replacement + html.slice(index + url.length);
      index = html.indexOf(url, index + replacement.length);
    }
  }

  // Drop the resource hints; nothing on the page talks to that host any more.
  const withoutHints = html.replace(
    /\s*<link\b[^>]*(?:dns-prefetch|preconnect)[^>]*sc02\.alicdn\.com[^>]*>|\s*<link\b[^>]*sc02\.alicdn\.com[^>]*(?:dns-prefetch|preconnect)[^>]*>/gi,
    () => { stats.hintsRemoved += 1; return ''; }
  );
  html = withoutHints;

  if (html !== original) {
    if (apply) fs.writeFileSync(file, html);
    stats.filesChanged += 1;
  }
}

console.log(JSON.stringify({
  mode: apply ? 'apply' : 'dry-run',
  assets: Object.values(downloaded).map(a => ({
    base: a.base,
    size: `${a.width}x${a.height}`,
    saved: a.bytes
      ? `${Math.round(a.bytes / 1024)}KB source -> ${Math.round(a.webpBytes / 1024)}KB webp / ${Math.round(a.jpgBytes / 1024)}KB jpg`
      : 'cached'
  })),
  ...stats
}, null, 2));
