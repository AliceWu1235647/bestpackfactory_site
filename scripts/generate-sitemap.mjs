import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { LOCALES, localeUrl, splitLocaleRoute, translatedPaths } from '../lib/locales.js';

const SITE_URL = 'https://www.bestpackfactory.com';
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const contentRoot = path.join(projectRoot, 'content-site');
const outputs = [
  path.join(projectRoot, 'public', 'sitemap.xml'),
  path.join(contentRoot, 'sitemap.xml')
];

function dielineSizeSlug(name) {
  return String(name).toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function walkHtml(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkHtml(absolute));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(absolute);
  }
  return files;
}

function firstMatch(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return '';
}

function sitemapDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

function lastModified(html, file) {
  const structuredDates = [
    ...[...html.matchAll(/["']dateModified["']\s*:\s*["']([^"']+)["']/gi)].map(match => sitemapDate(match[1])),
    ...[...html.matchAll(/["']datePublished["']\s*:\s*["']([^"']+)["']/gi)].map(match => sitemapDate(match[1]))
  ].filter(Boolean).sort();
  if (structuredDates.length) return structuredDates[structuredDates.length - 1];
  return sitemapDate(fs.statSync(file).mtime);
}

function canonicalUrl(html) {
  const raw = firstMatch(html, [
    /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i,
    /<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i
  ]);
  if (!raw) return '';
  try {
    const url = new URL(raw, SITE_URL);
    if (!/^(www\.)?bestpackfactory\.com$/i.test(url.hostname)) return '';
    url.protocol = 'https:';
    url.hostname = 'www.bestpackfactory.com';
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/$/, url.pathname === '/' ? '/' : '');
  } catch {
    return '';
  }
}

function robotsValue(html) {
  return firstMatch(html, [
    /<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']robots["'][^>]*>/i
  ]).toLowerCase();
}

function isDedicatedContentUrl(url) {
  const pathname = new URL(url).pathname;
  return /^\/(?:(?:ar|de|es|fr|ja)\/)?(?:products|blog|news)\//i.test(pathname);
}

function pageHints(url) {
  const pathname = new URL(url).pathname;
  if (pathname === '/') return { changefreq: 'weekly', priority: '1.00' };
  if (/^\/(?:products|blog|news|factory|industries|materials|finishes)\.html$/i.test(pathname)) {
    return { changefreq: 'weekly', priority: '0.90' };
  }
  if (/^\/(?:contact|about)\.html$/i.test(pathname)) {
    return { changefreq: 'monthly', priority: '0.80' };
  }
  return { changefreq: 'monthly', priority: '0.70' };
}

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const pages = new Map();
let skippedNoCanonical = 0;
let skippedNoindex = 0;
let skippedDedicated = 0;

function routeFromFile(file) {
  return path.relative(contentRoot, file).replace(/\\/g, '/');
}

// xhtml:link rows for a translated route. Google requires the annotations to be
// reciprocal: every page in the cluster lists the whole cluster, itself included.
function sitemapAlternates(route) {
  const { rel } = splitLocaleRoute(route);
  if (!translatedPaths().includes(rel)) return undefined;
  const rows = [{ hreflang: 'en', href: localeUrl('en', rel) }];
  for (const code of LOCALES) rows.push({ hreflang: code, href: localeUrl(code, rel) });
  rows.push({ hreflang: 'x-default', href: localeUrl('en', rel) });
  return rows;
}

// The translated mirrors under content-site/<locale>/ carry no <link rel="canonical">,
// so this walk used to skip all 110 of them even though the app serves each one with a
// route-derived canonical. Rebuild the same canonical here so the sitemap agrees with
// what is actually served instead of hiding the translations from crawlers.
function localeFallbackCanonical(file) {
  const route = routeFromFile(file);
  const { locale, rel } = splitLocaleRoute(route);
  if (locale === 'en') return '';
  if (!translatedPaths().includes(rel)) return '';
  return localeUrl(locale, rel);
}

for (const file of walkHtml(contentRoot)) {
  const html = fs.readFileSync(file, 'utf8');
  const canonical = canonicalUrl(html) || localeFallbackCanonical(file);
  if (!canonical) {
    skippedNoCanonical++;
    continue;
  }
  if (/(?:^|,)\s*noindex(?:\s*,|$)/i.test(robotsValue(html))) {
    skippedNoindex++;
    continue;
  }
  if (isDedicatedContentUrl(canonical)) {
    skippedDedicated++;
    continue;
  }
  const entry = {
    loc: canonical,
    lastmod: lastModified(html, file),
    ...pageHints(canonical),
    alternates: sitemapAlternates(routeFromFile(file))
  };
  const existing = pages.get(canonical);
  if (!existing || entry.lastmod > existing.lastmod) pages.set(canonical, entry);
}

// Dieline routes are React pages under app/dielines, so the HTML walk above
// never sees them. Read them from the catalogue the routes themselves use.
const { DIELINES } = await import(
  pathToFileURL(path.join(projectRoot, 'lib', 'dielines', 'catalog.js')).href
);
const today = new Date().toISOString().slice(0, 10);
pages.set(`${SITE_URL}/dielines`, {
  loc: `${SITE_URL}/dielines`, lastmod: today, changefreq: 'monthly', priority: '0.90'
});
for (const entry of DIELINES) {
  const loc = `${SITE_URL}/dielines/${entry.slug}`;
  pages.set(loc, { loc, lastmod: today, changefreq: 'monthly', priority: '0.90' });
  for (const preset of entry.presets || []) {
    const sizeLoc = `${loc}/${dielineSizeSlug(preset.name)}`;
    pages.set(sizeLoc, { loc: sizeLoc, lastmod: today, changefreq: 'monthly', priority: '0.80' });
  }
}

const sortedPages = [...pages.values()].sort((a, b) => {
  if (a.loc === `${SITE_URL}/`) return -1;
  if (b.loc === `${SITE_URL}/`) return 1;
  return a.loc.localeCompare(b.loc);
});

const urlXml = sortedPages.map(page => {
  const alternates = (page.alternates || [])
    .map(alt => `<xhtml:link rel="alternate" hreflang="${escapeXml(alt.hreflang)}" href="${escapeXml(alt.href)}"/>`)
    .join('');
  return `  <url><loc>${escapeXml(page.loc)}</loc><lastmod>${page.lastmod}</lastmod><changefreq>${page.changefreq}</changefreq><priority>${page.priority}</priority>${alternates}</url>`;
}).join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urlXml}\n</urlset>\n`;

for (const output of outputs) {
  const current = fs.existsSync(output) ? fs.readFileSync(output, 'utf8') : '';
  if (current !== sitemap) fs.writeFileSync(output, sitemap, 'utf8');
  console.log(`${path.relative(projectRoot, output)}: ${sortedPages.length} static canonical URLs`);
}

console.log(`Excluded ${skippedDedicated} product/blog/news detail URLs handled by dedicated sitemaps.`);
console.log(`Skipped ${skippedNoindex} noindex pages and ${skippedNoCanonical} pages without a canonical URL.`);

