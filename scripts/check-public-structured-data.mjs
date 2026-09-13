import {
  listHtmlRoutes,
  normalizeArticleJsonLd,
  normalizePageEntityJsonLd,
  normalizeProductJsonLd,
  pageFromHtml,
  readHtml,
} from '../lib/static-pages.js';
import { readFileSync } from 'node:fs';

const routes = listHtmlRoutes();
const failures = [];
let jsonLdBlocks = 0;
let productNodes = 0;
let articleNodes = 0;
let articleImagesAddedFromMetadata = 0;

function entityPageUrl(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value['@id'] || value.url || '';
  return '';
}

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
    if (!value.image) failures.push(`${route}: Product is missing image`);
    if (!value.mainEntityOfPage) failures.push(`${route}: Product is missing mainEntityOfPage`);
  }

  if (types.some(type => ['Article', 'BlogPosting', 'NewsArticle', 'TechArticle'].includes(type))) {
    articleNodes += 1;
    if (!value.description) failures.push(`${route}: Article is missing description`);
    if (!value.publisher?.name) failures.push(`${route}: Article publisher is missing name`);
    if (!value.publisher?.logo) failures.push(`${route}: Article publisher is missing logo`);
  }

  if (types.some(type => ['WebPage', 'AboutPage', 'ContactPage', 'Article', 'BlogPosting', 'NewsArticle', 'TechArticle', 'Product'].includes(type))) {
    const expected = pageCanonicals.get(route);
    for (const pageUrl of [value.url, entityPageUrl(value.mainEntityOfPage)]) {
      if (pageUrl && expected && pageUrl !== expected) {
        failures.push(`${route}: structured page URL does not match canonical (${pageUrl})`);
      }
    }
  }

  Object.values(value).forEach(item => visit(item, route));
}

const pageCanonicals = new Map();

for (const route of routes) {
  const html = readHtml(route);
  const page = pageFromHtml(html, route);
  pageCanonicals.set(route, page.metadata?.alternates?.canonical || '');

  if (/type=["']application\/ld\+json["']/i.test(page.body)) {
    failures.push(`${route}: JSON-LD remains inside rendered body`);
  }

  const unique = new Set(page.jsonLd);
  if (unique.size !== page.jsonLd.length) {
    failures.push(`${route}: duplicate JSON-LD payloads after extraction`);
  }

  const articleJsonLd = normalizeArticleJsonLd(page.jsonLd, page.metadata);
  const productJsonLd = normalizeProductJsonLd(articleJsonLd, page.body, page.metadata);
  const renderedJsonLd = normalizePageEntityJsonLd(productJsonLd, page.metadata);
  if (page.metadata?.openGraph?.images) {
    for (let index = 0; index < page.jsonLd.length; index += 1) {
      if (!/"image"\s*:/.test(page.jsonLd[index]) && /"image"\s*:/.test(renderedJsonLd[index])) {
        articleImagesAddedFromMetadata += 1;
      }
    }
  }

  for (const json of renderedJsonLd) {
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

console.log(`Structured-data check passed: ${routes.length} HTML pages, ${jsonLdBlocks} unique blocks, ${articleNodes} Article nodes, ${articleImagesAddedFromMetadata} Article images reused from existing metadata, ${productNodes} Product nodes, no duplicate body output, no unsupported Product offers.`);
