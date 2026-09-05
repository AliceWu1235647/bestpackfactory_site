// Batch 1 (2026-09-06): additive SEO only — no visual or content changes.
// A) Inject BreadcrumbList JSON-LD into product/blog pages that lack it.
// B) Link first plain-text keyword mention in blog articles to the three
//    orphaned keyword pages (same pattern as the earlier stand-up-pouch pass).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SITE = 'https://www.bestpackfactory.com';

function read(f) { return fs.readFileSync(f, 'utf8'); }
function write(f, s) { fs.writeFileSync(f, s); }
function listHtml(dir) {
  return fs.readdirSync(dir).filter(n => n.endsWith('.html')).map(n => path.join(dir, n));
}

function pageName(html, fallback) {
  const h1 = html.match(/<h1[^>]*>([^<]+)</);
  if (h1) return h1[1].trim().replace(/\s+/g, ' ');
  const t = html.match(/<title>([^<|]+)/);
  if (t) return t[1].trim().replace(/\s+/g, ' ');
  return fallback;
}

function breadcrumbJson(section, sectionUrl, name, url) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: section, item: sectionUrl },
      { '@type': 'ListItem', position: 3, name, item: url }
    ]
  });
}

// ---- A) BreadcrumbList ----
let bcAdded = 0;
for (const { dir, section, sectionUrl } of [
  { dir: path.join(ROOT, 'content-site', 'products'), section: 'Products', sectionUrl: `${SITE}/products.html` },
  { dir: path.join(ROOT, 'content-site', 'blog'), section: 'Blog', sectionUrl: `${SITE}/blog.html` },
  { dir: path.join(ROOT, 'content-site', 'news'), section: 'News', sectionUrl: `${SITE}/news.html` }
]) {
  if (!fs.existsSync(dir)) continue;
  for (const file of listHtml(dir)) {
    const html = read(file);
    if (/"@type":\s*"BreadcrumbList"/.test(html)) continue;
    if (!/<\/head>/.test(html)) continue;
    const slug = path.basename(file);
    const url = `${SITE}/${path.basename(dir)}/${slug}`;
    const name = pageName(html, slug.replace(/\.html$/, '').replace(/-/g, ' '));
    const tag = `<script type="application/ld+json">${breadcrumbJson(section, sectionUrl, name, url)}</script>\n</head>`;
    write(file, html.replace('</head>', tag));
    bcAdded++;
  }
}
console.log(`BreadcrumbList added: ${bcAdded}`);

// ---- B) internal links to orphan pages ----
// Anchor patterns are matched case-insensitively against plain text only
// (never inside a tag, an existing <a>, or a heading).
const TARGETS = [
  { href: '/products/cannabis-stand-up-pouches.html',
    patterns: [/cannabis stand[- ]up pouch(?:es)?/i, /child[- ]resistant stand[- ]up pouch(?:es)?/i] },
  { href: '/products/custom-paper-bags-wholesale.html',
    patterns: [/custom paper bags wholesale/i, /wholesale (?:custom )?paper bags/i, /paper bags wholesale/i] },
  { href: '/products/custom-boxes-moq-500.html',
    patterns: [/custom boxes (?:at |with )?moq 500/i, /moq 500 custom boxes/i] }
];

function linkFirstMention(html, href, patterns) {
  if (html.includes(`href="${href}"`)) return null; // already links there
  // Split into segments: skip <a>...</a>, headings, scripts, tags.
  const protectedRe = /(<a\b[\s\S]*?<\/a>|<h[1-6][\s\S]*?<\/h[1-6]>|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>)/gi;
  const parts = html.split(protectedRe);
  for (const pattern of patterns) {
    for (let i = 0; i < parts.length; i++) {
      const seg = parts[i];
      if (!seg || protectedRe.source && /^</.test(seg)) continue;
      const m = seg.match(pattern);
      if (m) {
        parts[i] = seg.replace(pattern, `<a href="${href}">${m[0]}</a>`);
        return parts.join('');
      }
    }
  }
  return null;
}

let linksAdded = 0;
const linkLog = [];
const blogDir = path.join(ROOT, 'content-site', 'blog');
for (const file of listHtml(blogDir)) {
  let html = read(file);
  let touched = false;
  for (const t of TARGETS) {
    const out = linkFirstMention(html, t.href, t.patterns);
    if (out) { html = out; touched = true; linksAdded++; linkLog.push(`${path.basename(file)} -> ${t.href}`); }
  }
  if (touched) write(file, html);
}
console.log(`Internal links added: ${linksAdded}`);
linkLog.forEach(l => console.log('  ' + l));
