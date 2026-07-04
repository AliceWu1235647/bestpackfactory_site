import fs from 'fs';
import path from 'path';

const CONTENT_ROOT = path.join(process.cwd(), 'content-site');
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bestpackfactory.com';

const GLOBAL_KEYWORDS = [
  'custom packaging', 'b2b packaging', 'oem packaging', 'wholesale packaging',
  'strategy design manufacturing logistics', 'dieline', 'sampling', 'production', 'shipping'
];

const KEYWORD_RULES = [
  {
    test: /magnetic|luxury|rigid|gift/i,
    add: [
      'custom gift boxes', 'magnetic packaging', 'rigid boxes', 'magnetic rigid box',
      'collapsible magnetic gift box', 'foam insert', 'luxury gift box',
      'jewelry box', 'perfume box', 'premium packaging'
    ]
  },
  {
    test: /custom-boxes|custom boxes|box|boxes|carton|cardstock/i,
    add: [
      'custom gift boxes', 'rigid boxes', 'mailer boxes', 'corrugated mailer box',
      'sliding drawer box', 'cylinder tube packaging', 'cardstock product boxes',
      'cardstock boxes', 'folding carton', 'paperboard box', 'gift packaging'
    ]
  },
  {
    test: /flexible|pouch|pouches|bags|spout|retort|roll-stock|protein|collagen/i,
    add: [
      'pouch', 'pouches', 'stand up pouch', 'stand-up pouch', 'flat bottom pouch',
      'spout pouch', 'retort pouch', 'mylar pouch', 'flexible packaging',
      'roll film', 'high barrier pouch'
    ]
  },
  {
    test: /paper-bags|paper bags|shopping/i,
    add: [
      'paper bags', 'paper gift bag', 'paper shopping bag', 'luxury paper bag',
      'retail bag', 'gift bag', 'custom printed paper bags'
    ]
  },
  {
    test: /food|burger|pizza|fries|sandwich|bakery|shawarma/i,
    add: [
      'food packaging box', 'food packaging boxes', 'burger box', 'pizza box',
      'fries box', 'bakery box', 'takeaway box', 'cardstock food box'
    ]
  },
  {
    test: /label|sticker|tape|tissue/i,
    add: [
      'labels', 'stickers', 'roll labels', 'custom tape', 'tissue paper',
      'packaging accessories'
    ]
  },
  {
    test: /coffee/i,
    add: [
      'coffee bags', 'coffee pouch', 'flat bottom coffee bag', 'coffee packaging',
      'valve coffee bags', 'coffee bag with valve'
    ]
  },
  {
    test: /pet|dog|cat/i,
    add: [
      'pet food bags', 'dog food pouch', 'cat food pouch', 'pet food packaging',
      'flat bottom pet food bags'
    ]
  },
  {
    test: /pharma|medical|medicine|gs1|datamatrix|vitamin|supplement/i,
    add: [
      'pharma packaging', 'medical packaging', 'medicine box', 'supplement box',
      'vitamin packaging', 'gs1 datamatrix packaging'
    ]
  },
  {
    test: /cannabis|mylar|smell|pre-roll|cbd/i,
    add: [
      'cannabis packaging', 'cannabis mylar bags', 'smell proof mylar bags',
      'child resistant bags', 'pre roll packaging', 'cbd gummies packaging'
    ]
  }
];

function stripTags(value = '') {
  return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decode(value = '') {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function attr(html = '', name) {
  const re = new RegExp(`${name}=["']([^"']*)["']`, 'i');
  const m = html.match(re);
  return m ? decode(m[1]) : '';
}

function toSlugFromUrl(url = '') {
  let clean = String(url || '').trim().replace(/^\/+/, '');
  clean = clean.replace(/^products\//, '').replace(/\.html(?:[#?].*)?$/, '').replace(/\/$/, '');
  return clean;
}

function productUrl(slugOrUrl = '') {
  const raw = String(slugOrUrl || '').trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  let clean = raw.replace(/^\/+/, '');
  if (!clean) return '/products.html';
  if (clean.startsWith('products/')) return `/${clean.replace(/\.json$/i, '.html')}`;
  if (clean.endsWith('.html')) return `/products/${clean}`;
  return `/products/${toSlugFromUrl(clean)}.html`;
}

function imageUrl(image = '') {
  const raw = String(image || '').trim();
  if (!raw) return '/assets/hero/slide-01-one-stop.webp';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return raw;
  return `/${raw.replace(/^\/+/, '')}`;
}

function aliasKeywordsFor(product) {
  const hay = [product.title, product.name, product.slug, product.url, product.keywords, product.description, product.desc, product.category, ...(product.tags || [])].join(' ');
  const add = [];
  for (const rule of KEYWORD_RULES) {
    if (rule.test.test(hay)) add.push(...rule.add);
  }
  return [...new Set([...GLOBAL_KEYWORDS, ...add])];
}

export function normalizeSearchProduct(item = {}, fallbackSlug = '') {
  const slug = toSlugFromUrl(item.slug || fallbackSlug || item.url || item.path || item.id || item.title || item.name || '');
  const title = item.title || item.name || slug.replace(/-/g, ' ');
  const description = item.description || item.desc || item.quickAnswer || item.metaDescription || 'Custom packaging product from BestPackFactory.';
  const keywords = [
    ...(Array.isArray(item.keywords) ? item.keywords : String(item.keywords || '').split(/[,\n|]/)),
    ...(Array.isArray(item.tags) ? item.tags : []),
    ...(Array.isArray(item.searchKeywords) ? item.searchKeywords : []),
    ...(Array.isArray(item.aliases) ? item.aliases : [])
  ].map(v => String(v || '').trim()).filter(Boolean);

  const product = {
    title,
    name: title,
    slug,
    url: item.url ? productUrl(item.url) : productUrl(slug),
    description,
    desc: description,
    image: imageUrl(item.image || item.mainImage || item.ogImage || (Array.isArray(item.images) ? item.images[0] : '')),
    category: item.category || '',
    tags: Array.isArray(item.tags) ? item.tags : [],
    keywords: ''
  };
  product.keywords = [...new Set([...keywords, ...aliasKeywordsFor(product)])].join(' ');
  return product;
}

export function getStaticProductSearchIndex() {
  const file = path.join(CONTENT_ROOT, 'products.html');
  if (!fs.existsSync(file)) return [];
  const html = fs.readFileSync(file, 'utf8');
  const articleRe = /<article\b[^>]*class=["'][^"']*product-card[^"']*["'][^>]*>[\s\S]*?<\/article>/gi;
  const products = [];
  let match;
  while ((match = articleRe.exec(html))) {
    const article = match[0];
    const dataSearch = attr(article, 'data-search');
    const href = attr(article.match(/<a\b[^>]*>/i)?.[0] || '', 'href');
    const imgTag = article.match(/<img\b[^>]*>/i)?.[0] || '';
    const image = attr(imgTag, 'src');
    const title = decode(stripTags(article.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[1] || ''));
    const desc = decode(stripTags(article.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] || ''));
    const slug = toSlugFromUrl(href);
    if (!title || !slug) continue;
    products.push(normalizeSearchProduct({
      title,
      description: desc,
      url: href,
      image,
      keywords: dataSearch
    }, slug));
  }
  return products;
}

export function mergeProductSearchIndexes(staticProducts = [], r2Products = []) {
  const bySlug = new Map();
  for (const product of [...staticProducts, ...r2Products]) {
    const normalized = normalizeSearchProduct(product);
    if (!normalized.slug) continue;
    const existing = bySlug.get(normalized.slug);
    if (!existing) bySlug.set(normalized.slug, normalized);
    else {
      bySlug.set(normalized.slug, {
        ...existing,
        ...normalized,
        title: normalized.title || existing.title,
        description: normalized.description || existing.description,
        image: normalized.image || existing.image,
        keywords: [...new Set([existing.keywords, normalized.keywords].join(' ').split(/\s+/).filter(Boolean))].join(' ')
      });
    }
  }
  return Array.from(bySlug.values()).sort((a, b) => a.title.localeCompare(b.title));
}

export function searchIndexSynonymHelp() {
  return {
    supportedIntentKeywords: [
      'box', 'pouch', 'rigid box', 'mailer box', 'cardstock',
      'magnetic packaging', 'custom gift boxes', 'paper gift bag',
      'food packaging box', 'foam insert'
    ],
    r2IndexPath: process.env.R2_PRODUCT_INDEX_PATH || 'products/index.json'
  };
}
