// scripts/add-locale-canonicals.mjs
//
// Adds <link rel="canonical"> to locale HTML files
// (content-site/{ar,de,es,fr,ja}/**/*.html) that don't already have one.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONTENT_SITE = path.join(ROOT, 'content-site');
const LOCALES = ['ar', 'de', 'es', 'fr', 'ja'];
const SITE_ORIGIN = 'https://www.bestpackfactory.com';

const VIEWPORT_META_RE = /<meta[^>]*name="viewport"[^>]*\/?>|<meta[^>]*content="[^"]*"[^>]*name="viewport"[^>]*\/?>/i;

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

function buildCanonicalUrl(filePath) {
  const relPath = path
    .relative(CONTENT_SITE, filePath)
    .split(path.sep)
    .join('/');
  const segments = relPath.split('/');

  if (segments[segments.length - 1] === 'index.html') {
    segments.pop();
    const dirPart = segments.join('/');
    return `${SITE_ORIGIN}/${dirPart}${dirPart ? '/' : ''}`;
  }

  return `${SITE_ORIGIN}/${relPath}`;
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');

  if (/rel="canonical"/i.test(original)) return false;

  const canonicalUrl = buildCanonicalUrl(filePath);
  const canonicalTag = `<link rel="canonical" href="${canonicalUrl}"/>`;

  let updated;
  const viewportMatch = original.match(VIEWPORT_META_RE);
  if (viewportMatch) {
    const idx = original.indexOf(viewportMatch[0]) + viewportMatch[0].length;
    updated = original.slice(0, idx) + canonicalTag + original.slice(idx);
  } else if (original.includes('</head>')) {
    updated = original.replace('</head>', `${canonicalTag}</head>`);
  } else {
    return false;
  }

  fs.writeFileSync(filePath, updated, 'utf8');
  return true;
}

function main() {
  let totalCount = 0;
  let modifiedCount = 0;

  for (const locale of LOCALES) {
    const localeDir = path.join(CONTENT_SITE, locale);
    if (!fs.existsSync(localeDir)) continue;

    const files = walkHtmlFiles(localeDir);
    for (const file of files) {
      totalCount += 1;
      if (processFile(file)) {
        modifiedCount += 1;
        console.log(`Modified: ${path.relative(ROOT, file)}`);
      }
    }
  }

  console.log(`\nScanned ${totalCount} locale HTML files.`);
  console.log(`Modified ${modifiedCount} files (added canonical link).`);
}

main();
