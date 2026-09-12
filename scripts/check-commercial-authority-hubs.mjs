import { DIELINES } from '../lib/dielines/catalog.js';
import {
  COMMERCIAL_AUTHORITY_ROUTES,
  COMMERCIAL_AUTHORITY_SUPPORTING_ROUTES,
  injectCommercialAuthorityHub,
  normalizeCommercialAuthorityJsonLd,
} from '../lib/commercial-authority-hubs.js';
import { getPage, listHtmlRoutes } from '../lib/static-pages.js';

const htmlRoutes = new Set(listHtmlRoutes());
const dielineRoutes = new Set([
  'dielines',
  ...DIELINES.map(entry => `dielines/${entry.slug}`),
]);

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function stripHtml(value) {
  return value.replace(/<[^>]+>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

function localHrefs(value) {
  return [...value.matchAll(/href=["'](\/[a-z0-9][^"'#?]*)["']/gi)].map(match => match[1].replace(/^\//, ''));
}

const errors = [];

for (const route of COMMERCIAL_AUTHORITY_ROUTES) {
  const page = getPage(route);
  if (!page) {
    errors.push(`${route}: source page missing`);
    continue;
  }
  const output = injectCommercialAuthorityHub(page.body, route);
  if (count(output, 'data-bpf-authority-quick-answer=') !== 1) errors.push(`${route}: quick answer marker is not unique`);
  if (count(output, 'data-bpf-commercial-authority-hub=') !== 1) errors.push(`${route}: authority marker is not unique`);
  if (count(output, '<h1') !== count(page.body, '<h1')) errors.push(`${route}: H1 count changed`);

  const quickStart = output.indexOf('data-bpf-authority-quick-answer=');
  const quickEnd = output.indexOf('</section>', quickStart);
  const quickWords = stripHtml(output.slice(quickStart, quickEnd)).split(/\s+/).filter(Boolean).length;
  if (quickWords < 80 || quickWords > 145) errors.push(`${route}: quick answer is ${quickWords} words; expected 80–145`);

  const authorityStart = output.indexOf('data-bpf-commercial-authority-hub=');
  const authorityEnd = output.indexOf('</section>', authorityStart);
  const authorityHtml = output.slice(authorityStart, authorityEnd);
  for (const href of localHrefs(authorityHtml)) {
    const normalized = href.endsWith('.html') ? href : href.replace(/\/$/, '');
    if (!htmlRoutes.has(normalized) && !dielineRoutes.has(normalized)) errors.push(`${route}: linked route missing: /${href}`);
  }

  const secondPass = injectCommercialAuthorityHub(output, route);
  if (secondPass !== output) errors.push(`${route}: injection is not idempotent`);

  const jsonLd = normalizeCommercialAuthorityJsonLd(page.jsonLd, route).join('\n');
  if (/ASTM D3475-compliant|Child-resistant zipper meets ASTM D3475 requirements/i.test(`${output}\n${jsonLd}`)) {
    errors.push(`${route}: unsupported child-resistant certification wording remains`);
  }
}

for (const route of COMMERCIAL_AUTHORITY_SUPPORTING_ROUTES) {
  const page = getPage(route);
  if (!page) {
    errors.push(`${route}: supporting source page missing`);
    continue;
  }
  const output = injectCommercialAuthorityHub(page.body, route);
  if (count(output, 'data-bpf-primary-authority-link=') !== 1) errors.push(`${route}: primary authority link marker is not unique`);
  if (count(output, '<h1') !== count(page.body, '<h1')) errors.push(`${route}: supporting-page H1 count changed`);
}

if (errors.length) {
  console.error(`Commercial authority hub check failed (${errors.length}):`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Commercial authority hub check passed: ${COMMERCIAL_AUTHORITY_ROUTES.length} primary routes, ${COMMERCIAL_AUTHORITY_SUPPORTING_ROUTES.length} supporting routes.`);
