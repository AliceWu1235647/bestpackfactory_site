// scripts/add-product-offers.mjs
//
// Adds an `offers` property to Product JSON-LD blocks in product page HTML
// files that have a Product schema but lack `offers`.
//
// Scans:
//   content-site/products/*.html
//   content-site/{ar,de,es,fr,ja}/products/*.html

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONTENT_SITE = path.join(ROOT, 'content-site');
const LOCALES = ['ar', 'de', 'es', 'fr', 'ja'];

const LD_JSON_RE = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
const CANONICAL_RE = /<link[^>]*rel="canonical"[^>]*>/i;
const HREF_RE = /href="([^"]+)"/i;

function getProductDirs() {
  const dirs = [];
  const enDir = path.join(CONTENT_SITE, 'products');
  if (fs.existsSync(enDir)) dirs.push(enDir);
  for (const locale of LOCALES) {
    const localeDir = path.join(CONTENT_SITE, locale, 'products');
    if (fs.existsSync(localeDir)) dirs.push(localeDir);
  }
  return dirs;
}

function listHtmlFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.html'))
    .map((f) => path.join(dir, f));
}

function extractCanonicalUrl(html) {
  const linkMatch = html.match(CANONICAL_RE);
  if (linkMatch) {
    const hrefMatch = linkMatch[0].match(HREF_RE);
    if (hrefMatch) return hrefMatch[1];
  }
  return null;
}

function buildCanonicalFromPath(filePath) {
  const relPath = path
    .relative(CONTENT_SITE, filePath)
    .split(path.sep)
    .join('/');
  return `https://www.bestpackfactory.com/${relPath}`;
}

function buildOffers(canonicalUrl) {
  return {
    '@type': 'Offer',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: canonicalUrl,
    eligibleQuantity: {
      '@type': 'QuantitativeValue',
      minValue: 500,
      unitText: 'PCS',
    },
  };
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  const canonicalUrl =
    extractCanonicalUrl(original) || buildCanonicalFromPath(filePath);

  const updated = original.replace(LD_JSON_RE, (fullMatch, jsonText) => {
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return fullMatch;
    }

    // JSON-LD may be a single object or an array of objects (e.g. a
    // top-level array containing Product, FAQPage, BreadcrumbList, etc.).
    const isArray = Array.isArray(parsed);
    const productObj = isArray
      ? parsed.find((entry) => entry && entry['@type'] === 'Product')
      : parsed && parsed['@type'] === 'Product'
        ? parsed
        : null;

    if (!productObj) {
      return fullMatch;
    }

    if (Object.prototype.hasOwnProperty.call(productObj, 'offers')) {
      return fullMatch;
    }

    productObj.offers = buildOffers(canonicalUrl);
    modified = true;

    const isPretty = /\n/.test(jsonText);
    let newJsonText;
    if (isPretty) {
      newJsonText =
        '\r\n' +
        JSON.stringify(parsed, null, 2).replace(/\n/g, '\r\n') +
        '\r\n';
    } else {
      newJsonText = JSON.stringify(parsed);
    }

    return `<script type="application/ld+json">${newJsonText}</script>`;
  });

  if (modified) {
    fs.writeFileSync(filePath, updated, 'utf8');
    return true;
  }
  return false;
}

function main() {
  const dirs = getProductDirs();
  let modifiedCount = 0;
  let totalCount = 0;

  for (const dir of dirs) {
    const files = listHtmlFiles(dir);
    for (const file of files) {
      totalCount += 1;
      if (processFile(file)) {
        modifiedCount += 1;
        console.log(`Modified: ${path.relative(ROOT, file)}`);
      }
    }
  }

  console.log(`\nScanned ${totalCount} product files.`);
  console.log(`Modified ${modifiedCount} files (added offers to Product JSON-LD).`);
}

main();
