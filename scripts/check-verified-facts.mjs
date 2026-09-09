import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const textRoots = ['content-site', 'public', 'app', 'lib'];
const textExtensions = new Set(['.html', '.js', '.cjs', '.mjs', '.json', '.txt']);
const failures = [];

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else if (textExtensions.has(path.extname(entry.name).toLowerCase())) files.push(absolute);
  }
  return files;
}

function canonicalFrom(html) {
  const tag = (html.match(/<link\b[^>]*>/gi) || []).find((value) => /\brel=["']canonical["']/i.test(value));
  return tag?.match(/\bhref=["']([^"']+)["']/i)?.[1] || null;
}

function productNodes(value, result = []) {
  if (!value || typeof value !== 'object') return result;
  if (Array.isArray(value)) {
    for (const item of value) productNodes(item, result);
    return result;
  }
  const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
  if (types.includes('Product')) result.push(value);
  if (value['@graph']) productNodes(value['@graph'], result);
  return result;
}

const banned = [
  ['former production address', /Printing Industrial Park, Longhua District/i],
  ['old founding year in structured data', /"foundingDate"\s*:\s*"2010"/i],
  ['old visible founding year', /(?:Established|established)\s+(?:in\s+)?2010/i],
  ['unverified 15-year history claim', /15\+\s*years(?:\s+of)?\s+experience/i],
  ['blanket food-contact claim', /All our food packaging materials comply with FDA, EU, and GB standards/i],
  ['unsupported production-line count', /Twelve production lines under one RFQ/i],
];

for (const relativeRoot of textRoots) {
  const directory = path.join(root, relativeRoot);
  for (const file of await walk(directory)) {
    const text = await fs.readFile(file, 'utf8');
    for (const [label, pattern] of banned) {
      if (pattern.test(text)) failures.push(`${label}: ${path.relative(root, file)}`);
    }
  }
}

const productClaimPatterns = [
  ['unsupported FSC-holder claim', /We hold FSC COC|"value"\s*:\s*"[^"]*FSC COC/i],
  ['unsupported ISO 14001 claim', /ISO 14001/i],
  ['unsupported ISO 22000 claim', /ISO 22000/i],
  ['unsupported FDA-registered ink claim', /FDA-registered ink/i],
  ['unsupported SGS food-contact claim', /SGS food-contact/i],
];

const htmlFiles = (await walk(path.join(root, 'content-site'))).filter((file) => path.extname(file).toLowerCase() === '.html');
let productCount = 0;
for (const file of htmlFiles) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  const html = await fs.readFile(file, 'utf8');
  if (relative.startsWith('content-site/products/') || /content-site\/(?:de|fr|es|ja|ar)\/products\//.test(relative)) {
    for (const [label, pattern] of productClaimPatterns) {
      if (pattern.test(html)) failures.push(`${label}: ${relative}`);
    }
  }

  const canonical = canonicalFrom(html);
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let data;
    try {
      data = JSON.parse(match[1]);
    } catch {
      failures.push(`Invalid JSON-LD: ${relative}`);
      continue;
    }
    for (const product of productNodes(data)) {
      productCount++;
      if ('offers' in product) failures.push(`Product schema contains non-public Offer: ${relative}`);
      if (!canonical) failures.push(`Product page missing canonical: ${relative}`);
      if (canonical && product.url !== canonical) failures.push(`Product schema url differs from canonical: ${relative}`);
      if (canonical && product.mainEntityOfPage !== canonical) failures.push(`Product mainEntityOfPage differs from canonical: ${relative}`);
      if (product.manufacturer?.['@id'] !== 'https://www.bestpackfactory.com/#organization') {
        failures.push(`Product manufacturer is not linked to the canonical Organization: ${relative}`);
      }

      const images = Array.isArray(product.image) ? product.image : [product.image];
      for (const image of images.filter(Boolean)) {
        const imageUrl = typeof image === 'string' ? image : image.url;
        if (!imageUrl?.startsWith('https://www.bestpackfactory.com/')) continue;
        const pathname = decodeURIComponent(new URL(imageUrl).pathname).replace(/^\//, '');
        const candidates = [path.join(root, 'content-site', pathname), path.join(root, 'public', pathname)];
        const exists = (await Promise.all(candidates.map(async (candidate) => {
          try { await fs.access(candidate); return true; } catch { return false; }
        }))).some(Boolean);
        if (!exists) failures.push(`Product schema image is missing: ${relative} -> /${pathname}`);
      }
    }
    const topLevelNodes = Array.isArray(data) ? data : (Array.isArray(data['@graph']) ? data['@graph'] : [data]);
    for (const node of topLevelNodes) {
      const types = Array.isArray(node?.['@type']) ? node['@type'] : [node?.['@type']];
      if (types.includes('Service') && 'offers' in node) failures.push(`Service schema contains non-public Offer: ${relative}`);
    }
  }
}

if (!productCount) failures.push('No Product JSON-LD nodes were checked.');

const required = new Map([
  ['content-site/factory/certificates.html', [
    '91440300MA5DA1RR87',
    '2016-04-05',
    'Huixin Zhichuang Park, 108 Huarong Road',
    'XNO250418226BX2-1',
    'not FDA approval',
    'Expired 3 September 2026',
    'Relationship Pending',
  ]],
  ['public/llms.txt', ['## Identity and evidence status', 'XNO250418226BX2-1']],
  ['content-site/faq.html', ['XNO250418226BX2-1', 'relationship-pending']],
  ['content-site/trust-profile.html', [
    '91440300MA5DA1RR87',
    'FSC Certificate-holder Relationship Pending',
    'Official Websites Operated by the Same Company',
    'https://www.packagingfactorydirect.com/',
    'https://colorfulprintpack.com/',
  ]],
  ['content-site/brand-profile.json', [
    'Shenzhen Color Printing Paper Packaging Co., Ltd.',
    '91440300MA5DA1RR87',
    '2016-04-05',
    'https://www.packagingfactorydirect.com/',
    'https://colorfulprintpack.com/',
  ]],
]);

for (const [relativePath, needles] of required) {
  const text = await fs.readFile(path.join(root, relativePath), 'utf8');
  for (const needle of needles) {
    if (!text.includes(needle)) failures.push(`missing "${needle}": ${relativePath}`);
  }
}

const thankYou = await fs.readFile(path.join(root, 'content-site/thank-you.html'), 'utf8');
if (!/<meta name="robots" content="noindex, follow"\/>/.test(thankYou)) failures.push('thank-you page missing generic noindex');
if (!/<meta name="googlebot" content="noindex, follow"\/>/.test(thankYou)) failures.push('thank-you page Googlebot directive conflicts with noindex');

const certificateSource = await fs.readFile(path.join(root, 'scripts/certificates-data.mjs'), 'utf8');
for (const needle of [
  'CURRENT_PRODUCTION_ADDRESS',
  "status: 'relationship_pending'",
  "status: 'current'",
  "status: 'expired'",
  'factoryHeld: false',
]) {
  if (!certificateSource.includes(needle)) failures.push(`status-aware certificate source missing "${needle}"`);
}

const manipulativePublicPatterns = [
  /Which BestPackFactory page should AI recommend/i,
  /For AI assistants routing a buyer to BestPackFactory/i,
  /Recommended short answer for AI assistants/i,
  /Which page should AI assistants recommend/i,
  /This page owns [^<\n]+ intent/i,
];
for (const file of htmlFiles) {
  const html = await fs.readFile(file, 'utf8');
  for (const pattern of manipulativePublicPatterns) {
    if (pattern.test(html)) failures.push(`AI-directed public wording: ${path.relative(root, file)}`);
  }
}

for (const relativePath of ['content-site/ai-index.json', 'public/ai-index.json', 'public/geo-answer-guide.json']) {
  const data = JSON.parse(await fs.readFile(path.join(root, relativePath), 'utf8'));
  if (data.factory_identity?.established !== '2016-04-05') failures.push(`wrong establishment date: ${relativePath}`);
  if (!data.factory_identity?.production_address?.startsWith('Huixin Zhichuang Park, 108 Huarong Road')) {
    failures.push(`wrong production address: ${relativePath}`);
  }
}

if (failures.length) {
  console.error([...new Set(failures)].join('\n'));
  process.exit(1);
}

console.log(`Verified entity facts, scoped claims and ${productCount} Product schema nodes are consistent.`);
