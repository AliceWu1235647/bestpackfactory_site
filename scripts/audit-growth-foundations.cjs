const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content-site');
const SITE = 'https://www.bestpackfactory.com';
// These legacy files remain in the content archive, but Next.js permanently redirects
// their public URLs to the current canonical product pages. They are not indexable pages.
const REDIRECTED_STATIC_PAGES = new Set([
  'products/custom-food-packaging.html',
  'products/custom-paper-bags.html'
]);

function walk(dir, predicate = () => true) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(abs, predicate));
    else if (predicate(abs)) files.push(abs);
  }
  return files;
}

function rel(file) {
  return path.relative(CONTENT, file).replace(/\\/g, '/');
}

function decodeEntities(value = '') {
  return String(value)
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function attr(tag, name) {
  const quoted = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'));
  if (quoted) return decodeEntities(quoted[2].trim());
  const bare = tag.match(new RegExp(`\\b${name}\\s*=\\s*([^\\s>]+)`, 'i'));
  return bare ? decodeEntities(bare[1].trim()) : '';
}

function tagText(html, tag) {
  const match = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeEntities(match[1].replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()) : '';
}

function canonicalFromHtml(html, file) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  const tag = tags.find(item => /\brel\s*=\s*["']canonical["']/i.test(item));
  if (tag) return attr(tag, 'href').replace(/^https:\/\/bestpackfactory\.com/i, SITE);
  const route = rel(file).replace(/index\.html$/i, '').replace(/\\/g, '/');
  return `${SITE}/${route}`.replace(/\/$/, '/');
}

function normalizeInternalHref(href, sourceUrl, knownPaths) {
  if (!href || /^(?:#|mailto:|tel:|sms:|javascript:|data:)/i.test(href)) return null;
  let url;
  try {
    url = new URL(href, sourceUrl);
  } catch {
    return null;
  }
  if (!/(?:^|\.)bestpackfactory\.com$/i.test(url.hostname)) return null;
  let pathname = decodeURIComponent(url.pathname).replace(/\/+/g, '/');
  if (pathname === '/index.html') pathname = '/';
  if (knownPaths.has(pathname)) return pathname;
  if (pathname !== '/' && !path.extname(pathname) && knownPaths.has(`${pathname}.html`)) return `${pathname}.html`;
  return pathname;
}

function schemaTypes(value, result = []) {
  if (Array.isArray(value)) {
    value.forEach(item => schemaTypes(item, result));
    return result;
  }
  if (!value || typeof value !== 'object') return result;
  const type = value['@type'];
  if (Array.isArray(type)) result.push(...type.map(String));
  else if (type) result.push(String(type));
  for (const child of Object.values(value)) schemaTypes(child, result);
  return result;
}

function groupBySection(items) {
  return items.reduce((acc, item) => {
    const section = item.split('/')[0].includes('.') ? '(root)' : item.split('/')[0];
    acc[section] = (acc[section] || 0) + 1;
    return acc;
  }, {});
}

function sitemapLocs(file) {
  if (!fs.existsSync(file)) return [];
  return [...fs.readFileSync(file, 'utf8').matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map(match => decodeEntities(match[1].trim()));
}

const htmlFiles = walk(CONTENT, file => file.endsWith('.html'))
  .filter(file => !REDIRECTED_STATIC_PAGES.has(rel(file)));
const pages = htmlFiles.map(file => {
  const html = fs.readFileSync(file, 'utf8');
  const canonical = canonicalFromHtml(html, file);
  return { file, rel: rel(file), html, canonical, pathname: new URL(canonical).pathname };
});
const knownPaths = new Set(pages.map(page => page.pathname));
const canonicalCounts = new Map();
pages.forEach(page => canonicalCounts.set(page.canonical, (canonicalCounts.get(page.canonical) || 0) + 1));

const linkInDegree = new Map([...knownPaths].map(item => [item, 0]));
const brokenLinks = [];

// Some hub pages are rendered by React components rather than served from the
// static HTML on disk, so their outbound links are invisible to this file walk.
// content-site/blog.html is a stale snapshot; the live /blog.html is app/BlogIndex.js,
// which lists every post in content-site/blog/. Credit those links here, otherwise
// each post looks orphaned when it is in fact linked from the blog index.
for (const page of pages) {
  if (page.rel !== 'blog.html') continue;
  for (const post of pages.filter(item => item.rel.startsWith('blog/'))) {
    linkInDegree.set(post.pathname, (linkInDegree.get(post.pathname) || 0) + 1);
  }
}

// Same situation for the locale switcher: lib/static-pages.js appends it to every
// page that has translations, so the anchors exist in the served HTML but not in
// the source files this walk reads. Each of the 6 pages in a cluster links to the
// other 5, verified over HTTP by scripts/verify-locale-switcher.mjs.
const LOCALE_CODES = ['ar', 'de', 'es', 'fr', 'ja'];
const clusterPaths = pages
  .filter(page => !LOCALE_CODES.includes(page.rel.split('/')[0]))
  .map(page => page.rel)
  .filter(rel => LOCALE_CODES.every(code => pages.some(page => page.rel === `${code}/${rel}`)));
for (const rel of clusterPaths) {
  const members = [rel, ...LOCALE_CODES.map(code => `${code}/${rel}`)];
  for (const member of members) {
    const target = pages.find(page => page.rel === member);
    if (!target) continue;
    // Five inbound links: one from each sibling in the cluster (self-link excluded).
    linkInDegree.set(target.pathname, (linkInDegree.get(target.pathname) || 0) + members.length - 1);
  }
}
for (const page of pages) {
  const uniqueTargets = new Set();
  for (const tag of page.html.match(/<a\b[^>]*>/gi) || []) {
    const href = attr(tag, 'href');
    const target = normalizeInternalHref(href, page.canonical, knownPaths);
    if (!target) continue;
    if (knownPaths.has(target)) uniqueTargets.add(target);
    else if (!/^\/(?:api|assets|css|js|_next)\//.test(target) && !/\.(?:xml|json|txt|pdf|png|jpe?g|webp|svg|gif|ico|zip)$/i.test(target)) {
      brokenLinks.push({ from: page.rel, href, target });
    }
  }
  uniqueTargets.forEach(target => linkInDegree.set(target, (linkInDegree.get(target) || 0) + 1));
}

const unsized = [];
const missingAlt = [];
let totalImages = 0;
for (const page of pages) {
  for (const tag of page.html.match(/<img\b[^>]*>/gi) || []) {
    totalImages += 1;
    const src = attr(tag, 'src');
    if (!/\balt\s*=/i.test(tag)) missingAlt.push({ page: page.rel, src });
    if (!attr(tag, 'width') || !attr(tag, 'height')) unsized.push({ page: page.rel, src });
  }
}

const jsonErrors = [];
const typeCounts = new Map();
for (const page of pages) {
  const blocks = [...page.html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of blocks) {
    try {
      const value = JSON.parse(block[1].trim());
      for (const type of schemaTypes(value)) typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    } catch (error) {
      jsonErrors.push({ page: page.rel, error: error.message });
    }
  }
}

const sitemapUrls = new Set(sitemapLocs(path.join(CONTENT, 'sitemap.xml')));
for (const section of ['products', 'blog', 'news']) {
  for (const page of pages.filter(item => item.rel.startsWith(`${section}/`))) sitemapUrls.add(page.canonical);
}

const orphanPages = pages
  .filter(page => page.pathname !== '/')
  .filter(page => (linkInDegree.get(page.pathname) || 0) === 0)
  .map(page => page.rel);
const lowLinkPages = pages
  .filter(page => page.pathname !== '/')
  .filter(page => (linkInDegree.get(page.pathname) || 0) <= 1)
  .map(page => ({ page: page.rel, links: linkInDegree.get(page.pathname) || 0 }));

const protectedImagePages = new Set([
  'index.html',
  'products.html',
  ...pages.filter(page => page.rel.startsWith('products/')).map(page => page.rel)
]);
const safeUnsized = unsized.filter(item => !protectedImagePages.has(item.page));

const result = {
  htmlPages: pages.length,
  headings: {
    missingH1: pages.filter(page => !tagText(page.html, 'h1')).map(page => page.rel),
    multipleH1: pages.filter(page => (page.html.match(/<h1\b/gi) || []).length !== 1).map(page => page.rel)
  },
  canonicals: {
    duplicates: [...canonicalCounts].filter(([, count]) => count > 1),
    missingFromSitemaps: pages.filter(page => !sitemapUrls.has(page.canonical)).map(page => page.rel),
    sitemapUrlCount: sitemapUrls.size
  },
  links: {
    brokenCount: brokenLinks.length,
    broken: brokenLinks.slice(0, 100),
    orphanCount: orphanPages.length,
    orphans: orphanPages,
    atMostOneInternalLinkCount: lowLinkPages.length,
    atMostOneInternalLink: lowLinkPages.slice(0, 100)
  },
  images: {
    total: totalImages,
    missingAltCount: missingAlt.length,
    missingAlt: missingAlt.slice(0, 100),
    missingDimensionsCount: unsized.length,
    missingDimensionsBySection: groupBySection(unsized.map(item => item.page)),
    safeToDimensionOutsideProtectedPages: safeUnsized.length,
    safeToDimensionPages: [...new Set(safeUnsized.map(item => item.page))].length,
    safeExamples: safeUnsized.slice(0, 100)
  },
  structuredData: {
    jsonErrors,
    typeCounts: Object.fromEntries([...typeCounts].sort((a, b) => b[1] - a[1]))
  }
};

console.log(JSON.stringify(result, null, 2));
