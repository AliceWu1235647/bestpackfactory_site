// Rewrite local .jpg/.jpeg/.png image references in content-site HTML to existing .webp siblings.
// Only rewrites when the .webp sibling exists on disk. External URLs and files without webp are left untouched.
// Usage: node rewrite-image-refs.mjs <content-site-dir>
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';

const CONTENT = path.resolve(process.argv[2] || 'content-site');
const EXT_RE = /\.(jpg|jpeg|png)$/i;

let changedFiles = 0, replaced = 0, noWebpSkipped = 0, externalSkipped = 0, totalRefs = 0;
const noWebpList = new Set();

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const abs = path.join(dir, name);
    const st = statSync(abs);
    if (st.isDirectory()) walk(abs);
    else if (name.endsWith('.html')) processFile(abs);
  }
}

function findWebpSibling(url, htmlDir) {
  // url may be /assets/products/foo.jpg, assets/..., ../assets/...,
  // https://www.bestpackfactory.com/assets/... (own absolute), or other external
  let clean = url.split('?')[0].split('#')[0];
  if (/^https?:\/\/(?:www\.)?bestpackfactory\.com\//i.test(clean)) {
    // own absolute URL — treat as local root-relative
    clean = '/' + clean.replace(/^https?:\/\/(?:www\.)?bestpackfactory\.com\//i, '');
  } else if (/^https?:/i.test(clean)) {
    return null; // other external — skip
  }
  let abs;
  if (clean.startsWith('/')) {
    abs = path.join(CONTENT, clean.replace(/^\/+/, ''));
  } else if (clean.startsWith('../')) {
    abs = path.resolve(htmlDir, clean);
  } else {
    abs = path.join(CONTENT, clean);
  }
  const webp = abs.replace(EXT_RE, '.webp');
  if (existsSync(webp) && statSync(webp).isFile()) return webp;
  return null;
}

function rewriteUrl(url, htmlDir) {
  const m = url.match(EXT_RE);
  if (!m) return { url, changed: false };
  totalRefs++;
  const webp = findWebpSibling(url, htmlDir);
  if (!webp) {
    if (/^https?:/i.test(url.split('?')[0])) {
      if (/^https?:\/\/(?:www\.)?bestpackfactory\.com\//i.test(url)) { noWebpSkipped++; noWebpList.add(url.split('?')[0]); }
      else externalSkipped++;
    }
    else { noWebpSkipped++; noWebpList.add(url.split('?')[0]); }
    return { url, changed: false };
  }
  replaced++;
  return { url: url.replace(EXT_RE, '.webp'), changed: true };
}

function processFile(abs) {
  const htmlDir = path.dirname(abs);
  let content = readFileSync(abs, 'utf8');
  let orig = content;

  // Attribute values: src, href, poster, data-src, data-bg
  content = content.replace(/(\b(?:src|href|poster|data-src|data-bg)=["'])([^"']*?\.(?:jpg|jpeg|png)(?:[?#][^"']*)?)(["'])/gi, (whole, pre, url, post) => {
    const r = rewriteUrl(url, htmlDir);
    return r.changed ? pre + r.url + post : whole;
  });

  // srcset: comma-separated url [descriptor] pairs
  content = content.replace(/(\bsrcset=["'])([^"']*?)(["'])/gi, (whole, pre, srcset, post) => {
    const items = srcset.split(',').map(item => item.trim()).filter(Boolean);
    const out = items.map(item => {
      const parts = item.split(/\s+/);
      const r = rewriteUrl(parts[0], htmlDir);
      return r.changed ? [r.url, ...parts.slice(1)].join(' ') : item;
    });
    return pre + out.join(', ') + post;
  });

  // og:image / twitter:image meta content
  content = content.replace(/(<meta\b[^>]*\b(?:property|name)=["'](?:og:image|twitter:image)[^>]*\bcontent=["'])([^"']*?\.(?:jpg|jpeg|png))([^"']*)(["'])/gi, (whole, pre, url, rest, post) => {
    const r = rewriteUrl(url, htmlDir);
    return r.changed ? pre + r.url + rest + post : whole;
  });

  // image URLs inside JSON-LD blocks (Product/Organization image arrays)
  content = content.replace(/(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (whole, open, body, close) => {
    const out = body.replace(/(["'\/])([\w\-/]+?\.(?:jpg|jpeg|png))(["'])/g, (m, q1, url, q2) => {
      const r = rewriteUrl(url, htmlDir);
      return r.changed ? q1 + r.url + q2 : m;
    });
    return out === body ? whole : open + out + close;
  });

  if (content !== orig) {
    writeFileSync(abs, content, 'utf8');
    changedFiles++;
    const count = (orig.match(EXT_RE) || []).length;
    console.log(`[changed] ${path.relative(CONTENT, abs)}`);
  }
}

walk(CONTENT);
console.log(`\nDONE: totalRefs=${totalRefs} replaced=${replaced} changedFiles=${changedFiles} noWebpSkipped=${noWebpSkipped} externalSkipped=${externalSkipped}`);
if (noWebpList.size) {
  console.log(`Local refs without webp sibling (${noWebpList.size}):`);
  for (const u of noWebpList) console.log(`  ${u}`);
}
