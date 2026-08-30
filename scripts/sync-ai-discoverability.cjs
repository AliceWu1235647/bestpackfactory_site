const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_ROOT = path.join(ROOT, 'content-site');
const UPDATED = '2026-08-15';

function decodeEntities(value) {
  return String(value || '')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleFromHtml(html, fallback) {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const raw = h1 || title || fallback;
  return decodeEntities(String(raw).replace(/<[^>]+>/g, '').replace(/\s*[|–—-]\s*BestPackFactory.*$/i, ''));
}

function clusterFor(slug, title) {
  const text = `${slug} ${title}`.toLowerCase();
  if (/coffee|tea/.test(text)) return 'High-barrier Coffee & Tea Packaging';
  if (/cannabis|mylar|child.resistant|smell.proof/.test(text)) return 'Cannabis Smell-Proof Packaging';
  if (/pharma|medical|medicine/.test(text)) return 'Pharmaceutical & Medical Packaging';
  if (/cosmetic|skincare|beauty|perfume/.test(text)) return 'Cosmetic & Beauty Packaging';
  if (/stand.up|flat.bottom|spout|retort|roll.stock|pouch|compostable/.test(text)) return 'Flexible Packaging';
  if (/label|sticker|shrink.sleeve/.test(text)) return 'Labels & Printed Packaging';
  if (/paper.bag|tissue|ribbon|binder|folder/.test(text)) return 'Retail Packaging Accessories';
  if (/food|meal|snack|bakery|burger/.test(text)) return 'Food Packaging';
  if (/rigid|magnetic|gift.box|packaging.box|folding.carton/.test(text)) return 'Custom Boxes';
  return 'Custom Packaging';
}

function productCatalog() {
  const productDir = path.join(CONTENT_ROOT, 'products');
  return fs.readdirSync(productDir)
    .filter(name => name.endsWith('.html'))
    .sort()
    .map(name => {
      const slug = name.replace(/\.html$/i, '');
      const html = fs.readFileSync(path.join(productDir, name), 'utf8');
      const title = titleFromHtml(html, slug.replace(/-/g, ' '));
      return {
        title,
        url: `products/${name}`,
        cluster: clusterFor(slug, title)
      };
    });
}

function updateIndex(file, catalog) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const existing = new Set((data.products || []).map(item => String(item.url || '').replace(/^\/+/, '')));
  const missing = catalog.filter(item => !existing.has(item.url));
  data.products = [...(data.products || []), ...missing];
  data.discovery = {
    llms_summary: 'https://www.bestpackfactory.com/llms.txt',
    rss_feed: 'https://www.bestpackfactory.com/feed.xml',
    sitemap_index: 'https://www.bestpackfactory.com/sitemap-index.xml',
    ai_sitemap: 'https://www.bestpackfactory.com/ai-sitemap.xml',
    author_profile: 'https://www.bestpackfactory.com/authors/lisa-wu.html',
    search_crawlers_allowed: [
      'Googlebot',
      'Google-Extended',
      'OAI-SearchBot',
      'ChatGPT-User',
      'Claude-SearchBot',
      'Claude-User',
      'PerplexityBot',
      'Perplexity-User'
    ]
  };
  data.updated = UPDATED;
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return { file: path.relative(ROOT, file), added: missing.length, total: data.products.length };
}

function updateLlms(file) {
  let text = fs.readFileSync(file, 'utf8');
  text = text.replace(/\[Last updated:\s*[^\]]+\]/i, `[Last updated: ${UPDATED}]`);
  const section = `## Machine-readable discovery\n\n- [RSS feed](https://www.bestpackfactory.com/feed.xml): The latest packaging engineering, sourcing, quality-control and compliance articles.\n- [Sitemap index](https://www.bestpackfactory.com/sitemap-index.xml): Canonical discovery entry for product, article, image and AI resource sitemaps.\n- [AI resource sitemap](https://www.bestpackfactory.com/ai-sitemap.xml): Machine-readable resources and high-priority answer pages.\n- [Complete product catalog](https://www.bestpackfactory.com/ai-index.json): Product URLs, intent clusters, contact data and author identity.\n`;
  if (/## Machine-readable discovery/i.test(text)) {
    text = text.replace(/## Machine-readable discovery[\s\S]*?(?=\n## |$)/i, section.trimEnd());
  } else {
    text = `${text.trimEnd()}\n\n${section}`;
  }
  fs.writeFileSync(file, text.endsWith('\n') ? text : `${text}\n`, 'utf8');
}

const catalog = productCatalog();
const results = [
  updateIndex(path.join(ROOT, 'public', 'ai-index.json'), catalog),
  updateIndex(path.join(CONTENT_ROOT, 'ai-index.json'), catalog)
];
updateLlms(path.join(ROOT, 'public', 'llms.txt'));
updateLlms(path.join(CONTENT_ROOT, 'llms.txt'));

console.log(JSON.stringify({ updated: UPDATED, sourceProducts: catalog.length, indexes: results }, null, 2));
