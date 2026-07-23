import { rewriteRelativeUrls, extractBody, extractJsonLd, metadataFromHtml } from './static-pages';
import { SITE_URL, forceWww, optimizeMetadataForRoute, stripHtml } from './seo-utils';

const DEFAULT_REVALIDATE_SECONDS = 3600;

function env(name, fallback = '') {
  return process.env[name] || fallback;
}

export function r2Enabled() {
  return Boolean(env('R2_PUBLIC_BASE_URL'));
}

export function productRevalidateSeconds() {
  const n = Number(env('R2_PRODUCT_REVALIDATE_SECONDS', String(DEFAULT_REVALIDATE_SECONDS)));
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_REVALIDATE_SECONDS;
}

export function cleanProductSlug(value = '') {
  let slug = String(value || '').trim();
  try { slug = decodeURIComponent(slug); } catch {}
  slug = slug.replace(/^\/+/, '').replace(/^products\//, '').replace(/\/index\.html$/, '').replace(/\.html$/, '');
  slug = slug.replace(/[^a-zA-Z0-9._/-]+/g, '-').replace(/\.{2,}/g, '.').replace(/\/+/, '/');
  return slug.replace(/^\/+|\/+$/g, '');
}

export function productTag(slug) {
  return `product:${cleanProductSlug(slug)}`;
}

function baseUrl() {
  const base = env('R2_PUBLIC_BASE_URL').trim().replace(/\/+$/, '');
  return base;
}

function productJsonUrl(slug) {
  const pathPrefix = env('R2_PRODUCT_JSON_PREFIX', 'products').replace(/^\/+|\/+$/g, '');
  return `${baseUrl()}/${pathPrefix}/${encodeURIComponent(cleanProductSlug(slug))}.json`;
}

function indexJsonUrl() {
  const indexPath = env('R2_PRODUCT_INDEX_PATH', 'products/index.json').replace(/^\/+/, '');
  return `${baseUrl()}/${indexPath}`;
}

async function fetchJson(url, tags = []) {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      next: {
        revalidate: productRevalidateSeconds(),
        tags: ['products', ...tags]
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('[R2 products] fetch failed:', url, error?.message || error);
    return null;
  }
}

export async function getR2Product(slug) {
  if (!r2Enabled()) return null;
  const clean = cleanProductSlug(slug);
  if (!clean) return null;
  return fetchJson(productJsonUrl(clean), [productTag(clean)]);
}

export async function getR2ProductIndex() {
  if (!r2Enabled()) return null;
  return fetchJson(indexJsonUrl(), ['products:index', 'products-search']);
}

function siteUrl() {
  return SITE_URL;
}

function imageUrl(image) {
  if (!image) return undefined;
  const raw = String(image);
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return `${siteUrl()}${raw}`;
  return `${siteUrl()}/${raw}`;
}

export function metadataFromProduct(product, slug) {
  const clean = cleanProductSlug(slug);
  const title = stripHtml(product?.seoTitle || product?.title || product?.name || 'Custom Packaging Product | BestPackFactory');
  const description = stripHtml(product?.metaDescription || product?.description || product?.quickAnswer || 'Custom packaging product from BestPackFactory.');
  const canonical = forceWww(product?.canonical || `${siteUrl()}/products/${clean}.html`);
  const keywords = Array.isArray(product?.keywords) ? product.keywords : String(product?.keywords || '').split(',').map(k => k.trim()).filter(Boolean);
  const heroImage = imageUrl(product?.ogImage || product?.mainImage || product?.images?.[0]);
  return optimizeMetadataForRoute({
    title,
    description,
    keywords: keywords.length ? keywords : undefined,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'BestPackFactory',
      images: heroImage ? [heroImage] : undefined,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: heroImage ? [heroImage] : undefined
    }
  }, `products/${clean}.html`);
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function list(items = []) {
  if (!Array.isArray(items) || !items.length) return '';
  return `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function specsTable(specs = {}) {
  const rows = Array.isArray(specs)
    ? specs.map(item => [item.label || item.name || item.key, item.value])
    : Object.entries(specs || {});
  if (!rows.length) return '';
  return `<div class="tech-table-wrap"><table class="tech-table"><tbody>${rows.map(([k,v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`).join('')}</tbody></table></div>`;
}

function faqHtml(faq = []) {
  if (!Array.isArray(faq) || !faq.length) return '';
  return `<section class="section"><div class="eyebrow">FAQ</div><h2>Frequently Asked Questions</h2><div class="whitepaper-grid">${faq.map(item => `<article class="whitepaper-card"><h3>${escapeHtml(item.question || item.q)}</h3><p>${escapeHtml(item.answer || item.a)}</p></article>`).join('')}</div></section>`;
}

function productJsonLd(product, slug) {
  const clean = cleanProductSlug(slug);
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product?.name || product?.title || clean,
    description: product?.description || product?.quickAnswer || 'Custom packaging product.',
    image: product?.images?.map(imageUrl).filter(Boolean) || undefined,
    brand: { '@type': 'Brand', name: 'BestPackFactory' },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
      url: `${siteUrl()}/products/${clean}.html`
    }
  });
}

function faqJsonLd(faq = []) {
  if (!Array.isArray(faq) || !faq.length) return null;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(item => ({
      '@type': 'Question',
      name: item.question || item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.answer || item.a }
    }))
  });
}

export function renderProductBody(product, slug) {
  const clean = cleanProductSlug(slug);
  if (product?.html) return extractBody(product.html);
  if (product?.bodyHtml) return rewriteRelativeUrls(product.bodyHtml);

  const title = product?.title || product?.name || clean.replace(/-/g, ' ');
  const quickAnswer = product?.quickAnswer || product?.description || 'Factory-direct custom packaging with strategy, design, sampling, manufacturing and logistics support.';
  const images = Array.isArray(product?.images) ? product.images : [];
  const mainImage = imageUrl(product?.mainImage || images[0] || '/assets/hero/slide-01-one-stop.webp');
  const gallery = images.slice(0, 4).map((img, i) => `<img alt="${escapeHtml(title)} image ${i+1}" loading="lazy" src="${imageUrl(img)}"/>`).join('');
  const checklist = product?.procurementChecklist || product?.checklist || [
    'Confirm product size, target capacity and artwork dimensions.',
    'Choose material, structure, printing process and surface finish.',
    'Approve dieline, sample and pre-production proof before bulk production.',
    'Confirm export packing, shipping method and destination address.'
  ];
  return `
<div class="topbar"><div>Custom Packaging Manufacturer | MOQ 500 PCS | Free Design | Fast Delivery Worldwide</div><div>Email: lisa@colorprintingpackage.com &nbsp; | &nbsp; WhatsApp: +86 158 8653 0985</div></div>
<header class="header"><div class="header-inner"><a class="logo" href="/index.html"><img alt="BestPackFactory" decoding="async" loading="lazy" src="/assets/logo/bestpackfactory-logo.svg?v=1.2"/></a><form action="/products.html" class="search" data-product-search="true" method="get" role="search"><input aria-label="Search custom packaging products" autocomplete="off" name="q" placeholder="Search products: coffee bags, pet food, pharma, cannabis..."/><button type="submit">Search</button></form><nav class="nav"><a href="/index.html">Home</a><a href="/products.html">Products</a><a href="/about.html">About Us</a><a href="/blog.html">Blog</a><a href="/news.html">News</a><a href="/whitepapers.html">Whitepapers</a><a href="/contact.html">Contact</a></nav><button aria-controls="mobileNavPanel" aria-expanded="false" aria-label="Open mobile menu" class="mobile-menu-toggle" type="button">☰</button><a class="btn" href="/contact.html">Get Quote</a></div></header>
<section class="section product-detail"><div class="product-media"><img alt="${escapeHtml(title)}" src="${mainImage}" loading="eager"/>${gallery ? `<div class="product-gallery">${gallery}</div>` : ''}</div><div class="product-info"><div class="eyebrow">R2 ISR Product</div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(product?.description || quickAnswer)}</p><div class="bullets"><span>MOQ 500 PCS</span><span>OEM & ODM</span><span>Free Dieline</span><span>Worldwide Shipping</span></div><a class="btn" href="/contact.html">Request Quote</a></div></section>
<section class="section"><div class="eyebrow">Quick Answer</div><h2>${escapeHtml(product?.quickAnswerTitle || 'What should buyers know?')}</h2><p>${escapeHtml(quickAnswer)}</p></section>
<section class="section alt"><div class="eyebrow">Parameters</div><h2>Packaging Specification Table</h2>${specsTable(product?.specs || product?.parameters || {})}</section>
<section class="section"><div class="eyebrow">Procurement Checklist</div><h2>RFQ Checklist</h2>${list(checklist)}</section>
${faqHtml(product?.faq || [])}
<section class="section alt"><div class="eyebrow">Strategy + Design + Manufacturing + Logistics</div><h2>End-to-end B2B packaging support</h2><p>BestPackFactory helps connect packaging strategy, dieline design, sampling, manufacturing, quality control and export logistics so buyers can move from concept to shipment with fewer communication gaps.</p><a class="btn" href="/contact.html">Send RFQ</a></section>
<footer class="footer"><div><h3>BestPackFactory</h3><p>B2B custom packaging manufacturer for boxes, bags, labels, bottles, tins and printing.</p><p>Lisa Wu &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; lisa@colorprintingpackage.com &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; WhatsApp +86 158 8653 0985</p><p>Address: Printing Industrial Park, Longhua District, Shenzhen, Guangdong Province, 518109, China</p></div><div><h3>Products</h3><a href="/products.html">All Products</a><a href="/products/luxury-magnetic-boxes.html">Magnetic Boxes</a><a href="/products/flexible-packaging.html">Flexible Packaging</a></div><div><h3>Inquiry</h3><a href="/contact.html">Request Quote</a><a href="mailto:lisa@colorprintingpackage.com">Email Lisa</a></div></footer>`;
}

export function pageFromProduct(product, slug) {
  if (!product) return null;
  const clean = cleanProductSlug(slug);
  const body = renderProductBody(product, clean);
  const jsonLd = [];
  if (product?.html) jsonLd.push(...extractJsonLd(product.html));
  else {
    jsonLd.push(productJsonLd(product, clean));
    const faq = faqJsonLd(product?.faq || []);
    if (faq) jsonLd.push(faq);
  }
  return {
    body,
    metadata: product?.html ? metadataFromHtml(product.html, `products/${clean}.html`) : metadataFromProduct(product, clean),
    jsonLd
  };
}
