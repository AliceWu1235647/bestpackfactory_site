// scripts/add-breadcrumbs.mjs
//
// Adds a BreadcrumbList JSON-LD block to HTML files under content-site/
// that don't already have one.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONTENT_SITE = path.join(ROOT, 'content-site');
const LOCALES = new Set(['ar', 'de', 'es', 'fr', 'ja']);
const SITE_ORIGIN = 'https://www.bestpackfactory.com';

// Maps a top-level content category directory to its breadcrumb label and
// the URL slug of its "hub" listing page (relative to the site/locale root).
const CATEGORY_MAP = {
  products: { label: 'Products', slug: 'products.html' },
  blog: { label: 'Blog', slug: 'blog.html' },
  news: { label: 'News', slug: 'news.html' },
  factory: { label: 'Factory', slug: 'factory.html' },
  industries: { label: 'Industries', slug: 'industries.html' },
  materials: { label: 'Materials', slug: 'materials.html' },
  finishes: { label: 'Finishes', slug: 'finishes.html' },
  whitepapers: { label: 'Whitepapers', slug: 'whitepapers.html' },
  authors: { label: 'Authors', slug: null },
};

function walkHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkHtmlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractTitle(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!match) return null;
  let title = decodeEntities(match[1]).trim();
  title = title.replace(/\s*\|\s*BestPackFactory\s*$/i, '').trim();
  return title;
}

function buildBreadcrumbItems(filePath) {
  const relPath = path
    .relative(CONTENT_SITE, filePath)
    .split(path.sep)
    .join('/');
  const segments = relPath.split('/');

  let locale = null;
  let rest = segments;
  if (LOCALES.has(segments[0])) {
    locale = segments[0];
    rest = segments.slice(1);
  }

  const localePrefix = locale ? `/${locale}` : '';

  const html = fs.readFileSync(filePath, 'utf8');
  const rawTitle = extractTitle(html);
  const pageTitle = rawTitle || path.basename(filePath, '.html');

  const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` }];

  let category = null;
  if (rest.length >= 2) {
    category = CATEGORY_MAP[rest[0]] || null;
  }

  if (category) {
    const categoryItem = { '@type': 'ListItem', position: 2, name: category.label };
    if (category.slug) {
      categoryItem.item = `${SITE_ORIGIN}${localePrefix}/${category.slug}`;
    }
    items.push(categoryItem);
    items.push({ '@type': 'ListItem', position: 3, name: pageTitle });
  } else {
    // Top-level page (content-site/*.html or content-site/{locale}/*.html)
    // or an unmapped/unexpected category directory: 2-level breadcrumb.
    items.push({ '@type': 'ListItem', position: 2, name: pageTitle });
  }

  return items;
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');

  if (path.basename(filePath) === 'index.html') return false;
  if (original.includes('BreadcrumbList')) return false;
  if (!original.includes('</body>')) return false;

  const items = buildBreadcrumbItems(filePath);
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
  const scriptTag = `<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>`;

  const updated = original.replace('</body>', `${scriptTag}</body>`);
  fs.writeFileSync(filePath, updated, 'utf8');
  return true;
}

function main() {
  const files = walkHtmlFiles(CONTENT_SITE);
  let modifiedCount = 0;

  for (const file of files) {
    if (processFile(file)) {
      modifiedCount += 1;
      console.log(`Modified: ${path.relative(ROOT, file)}`);
    }
  }

  console.log(`\nScanned ${files.length} HTML files.`);
  console.log(`Modified ${modifiedCount} files (added BreadcrumbList JSON-LD).`);
}

main();
