const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONTENT_ROOT = path.join(ROOT, 'content-site');
const MARKER = 'data-internal-link-cluster="20260816"';
const REDIRECTED_STATIC_PAGES = new Set([
  'products/custom-food-packaging.html',
  'products/custom-paper-bags.html',
]);

function walkHtml(directory, output = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walkHtml(absolute, output);
    else if (entry.name.endsWith('.html')) output.push(absolute);
  }
  return output;
}

function relativePath(file) {
  return path.relative(CONTENT_ROOT, file).replace(/\\/g, '/');
}

function decodeEntities(value = '') {
  return String(value)
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function textFromTag(html, tag) {
  const value = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1] || '';
  return decodeEntities(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function clusterFor(relative) {
  if (/^blog\/[^/]+\.html$/i.test(relative)) return 'blog:buyer-guides';
  if (/^products\/[^/]+\.html$/i.test(relative)) {
    if (/(?:magnetic|gift|rigid|jewelry|cosmetic|perfume|candle|keepsake|bridal|apparel|pr-box)/i.test(relative)) return 'products:premium-boxes';
    if (/(?:coffee|tea|pouch|bag|mylar|cannabis|pet-food|collagen|flexible)/i.test(relative)) return 'products:flexible-packaging';
    if (/(?:food|sandwich|shawarma|burger|fries|bakery)/i.test(relative)) return 'products:food-packaging';
    if (/(?:pharma|medical|bottle)/i.test(relative)) return 'products:pharma-packaging';
    if (/(?:label|sticker|ribbon|binder|printing)/i.test(relative)) return 'products:print-accessories';
    return 'products:other';
  }
  const questionMatch = relative.match(/^industries\/([^/]+)\/questions\/[^/]+\.html$/i);
  if (questionMatch) return `industry-questions:${questionMatch[1]}`;
  if (/^industries\/[^/]+\.html$/i.test(relative)) return 'industries:solutions';
  for (const section of ['materials', 'finishes', 'factory', 'whitepapers', 'news']) {
    if (new RegExp(`^${section}\/[^/]+\\.html$`, 'i').test(relative)) return `${section}:resources`;
  }
  const rootResources = new Set([
    'about.html',
    'custom-packaging-manufacturer.html',
    'factory.html',
    'finishes.html',
    'industries.html',
    'materials.html',
    'packaging-buyer-answer-hub.html',
    'products.html',
    'quote-ready-packaging-sourcing-hub.html',
    'trust-profile.html',
    'whitepapers.html',
  ]);
  return rootResources.has(relative) ? 'root:buyer-paths' : null;
}

function relatedSection(items) {
  const links = items
    .map(item => `<li><a href="/${escapeHtml(item.relative)}">${escapeHtml(item.title)}</a></li>`)
    .join('');
  return `<section class="section related-resource-cluster" ${MARKER}><div class="section-head"><div><div class="eyebrow">Continue your research</div><h2>Related packaging buyer resources</h2><p>Use these closely related guides to compare specifications, prepare an RFQ and choose the right packaging path.</p></div></div><ul class="internal-links">${links}</ul></section>`;
}

const pages = walkHtml(CONTENT_ROOT)
  .map(file => {
    const relative = relativePath(file);
    const html = fs.readFileSync(file, 'utf8');
    return {
      file,
      relative,
      html,
      title: textFromTag(html, 'h1') || textFromTag(html, 'title') || relative,
      cluster: clusterFor(relative),
    };
  })
  .filter(page => page.cluster && !REDIRECTED_STATIC_PAGES.has(page.relative));

const clusters = new Map();
for (const page of pages) {
  if (!clusters.has(page.cluster)) clusters.set(page.cluster, []);
  clusters.get(page.cluster).push(page);
}
for (const items of clusters.values()) items.sort((a, b) => a.relative.localeCompare(b.relative));

let changedPages = 0;
let insertedLinks = 0;
const skipped = [];

for (const [cluster, items] of clusters) {
  if (items.length < 2) continue;
  for (let index = 0; index < items.length; index += 1) {
    const page = items[index];
    const count = Math.min(3, items.length - 1);
    const related = [];
    for (let offset = 1; offset <= count; offset += 1) {
      related.push(items[(index + offset) % items.length]);
    }
    const section = relatedSection(related);
    let updated = page.html;
    const existingSection = /<section\b[^>]*data-internal-link-cluster=["']20260816["'][^>]*>[\s\S]*?<\/section>/i;
    if (existingSection.test(updated)) updated = updated.replace(existingSection, section);
    else if (/<footer\b/i.test(updated)) updated = updated.replace(/<footer\b/i, `\n${section}\n<footer`);
    else if (/<\/main>/i.test(updated)) updated = updated.replace(/<\/main>/i, `\n${section}\n</main>`);
    else if (/<\/body>/i.test(updated)) updated = updated.replace(/<\/body>/i, `\n${section}\n</body>`);
    else {
      skipped.push(`${page.relative}: no safe insertion point found`);
      continue;
    }
    if (updated !== page.html) {
      fs.writeFileSync(page.file, updated, 'utf8');
      changedPages += 1;
      insertedLinks += related.length;
    }
  }
  console.log(`${cluster}: ${items.length} pages`);
}

console.log(JSON.stringify({ changedPages, insertedLinks, skipped }, null, 2));
