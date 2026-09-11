import { listHtmlRoutes, pageFromHtml, readHtml } from '../lib/static-pages.js';
import { readFileSync } from 'node:fs';

const routes = listHtmlRoutes();
const failures = [];
let jsonLdBlocks = 0;
let productNodes = 0;

function visit(value, route) {
  if (Array.isArray(value)) {
    value.forEach(item => visit(item, route));
    return;
  }
  if (!value || typeof value !== 'object') return;

  const rawType = value['@type'];
  const types = Array.isArray(rawType) ? rawType : [rawType];
  if (types.includes('Product')) {
    productNodes += 1;
    if (Object.prototype.hasOwnProperty.call(value, 'offers')) {
      failures.push(`${route}: custom-quote Product still exposes offers`);
    }
  }

  Object.values(value).forEach(item => visit(item, route));
}

for (const route of routes) {
  const html = readHtml(route);
  const page = pageFromHtml(html, route);

  if (/type=["']application\/ld\+json["']/i.test(page.body)) {
    failures.push(`${route}: JSON-LD remains inside rendered body`);
  }

  const unique = new Set(page.jsonLd);
  if (unique.size !== page.jsonLd.length) {
    failures.push(`${route}: duplicate JSON-LD payloads after extraction`);
  }

  for (const json of page.jsonLd) {
    jsonLdBlocks += 1;
    try {
      visit(JSON.parse(json), route);
    } catch (error) {
      failures.push(`${route}: invalid JSON-LD (${error.message})`);
    }
  }
}

const generatedProductSource = readFileSync(new URL('../lib/r2-products.js', import.meta.url), 'utf8');
if (/\boffers\s*:/.test(generatedProductSource)) {
  failures.push('generated R2 product: source still defines an unsupported Product offer');
}

if (failures.length) {
  console.error(`Structured-data check failed with ${failures.length} issue(s):`);
  failures.slice(0, 100).forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Structured-data check passed: ${routes.length} HTML pages, ${jsonLdBlocks} unique blocks, ${productNodes} Product nodes, no duplicate body output, no unsupported Product offers.`);
