import { extractBody, extractJsonLd, metadataFromHtml, rewriteRelativeUrls } from './static-pages';

const DEFAULT_REVALIDATE_SECONDS = 3600;
const VALID_TYPES = new Set(['blog', 'news']);

function env(name, fallback = '') {
  return process.env[name] || fallback;
}

export function contentRevalidateSeconds() {
  const n = Number(env('R2_CONTENT_REVALIDATE_SECONDS', env('R2_PRODUCT_REVALIDATE_SECONDS', String(DEFAULT_REVALIDATE_SECONDS))));
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_REVALIDATE_SECONDS;
}

export function r2ContentEnabled() {
  return Boolean(env('R2_PUBLIC_BASE_URL'));
}

function normalizeType(type = '') {
  const clean = String(type || '').toLowerCase().trim();
  return VALID_TYPES.has(clean) ? clean : null;
}

export function cleanContentSlug(value = '') {
  let slug = String(value || '').trim();
  try { slug = decodeURIComponent(slug); } catch {}
  slug = slug.replace(/^\/+/, '').replace(/^(blog|news)\//, '').replace(/\/index\.html$/, '').replace(/\.html$/, '').replace(/\.json$/, '');
  slug = slug.replace(/[^a-zA-Z0-9._/-]+/g, '-').replace(/\.{2,}/g, '.').replace(/\/+/g, '/');
  return slug.replace(/^\/+|\/+$/g, '');
}

export function contentTag(type, slug) {
  const t = normalizeType(type) || 'content';
  return `${t}:${cleanContentSlug(slug)}`;
}

export function contentIndexTag(type) {
  const t = normalizeType(type) || 'content';
  return `${t}:index`;
}

function baseUrl() {
  return env('R2_PUBLIC_BASE_URL').trim().replace(/\/+$/, '');
}

function typePrefix(type) {
  const t = normalizeType(type);
  if (t === 'blog') return env('R2_BLOG_JSON_PREFIX', 'blog').replace(/^\/+|\/+$/g, '');
  if (t === 'news') return env('R2_NEWS_JSON_PREFIX', 'news').replace(/^\/+|\/+$/g, '');
  return String(type || '').replace(/^\/+|\/+$/g, '');
}

function indexPath(type) {
  const t = normalizeType(type);
  if (t === 'blog') return env('R2_BLOG_INDEX_PATH', 'blog/index.json').replace(/^\/+/, '');
  if (t === 'news') return env('R2_NEWS_INDEX_PATH', 'news/index.json').replace(/^\/+/, '');
  return `${typePrefix(type)}/index.json`;
}

function contentJsonUrl(type, slug) {
  return `${baseUrl()}/${typePrefix(type)}/${encodeURIComponent(cleanContentSlug(slug))}.json`;
}

function contentHtmlUrl(type, slug) {
  return `${baseUrl()}/${typePrefix(type)}/${encodeURIComponent(cleanContentSlug(slug))}.html`;
}

function contentIndexUrl(type) {
  return `${baseUrl()}/${indexPath(type)}`;
}

async function fetchJson(url, tags = []) {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      next: {
        revalidate: contentRevalidateSeconds(),
        tags: ['content', ...tags]
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('[R2 content] JSON fetch failed:', url, error?.message || error);
    return null;
  }
}

async function fetchText(url, tags = []) {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      next: {
        revalidate: contentRevalidateSeconds(),
        tags: ['content', ...tags]
      }
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (error) {
    console.error('[R2 content] HTML fetch failed:', url, error?.message || error);
    return null;
  }
}

export async function getR2Content(type, slug) {
  const t = normalizeType(type);
  if (!t || !r2ContentEnabled()) return null;
  const clean = cleanContentSlug(slug);
  if (!clean) return null;
  const tags = [t, contentIndexTag(t), contentTag(t, clean)];
  const json = await fetchJson(contentJsonUrl(t, clean), tags);
  if (json) return json;
  const html = await fetchText(contentHtmlUrl(t, clean), tags);
  if (html) return { html, slug: clean, type: t };
  return null;
}

export async function getR2ContentIndex(type) {
  const t = normalizeType(type);
  if (!t || !r2ContentEnabled()) return null;
  return fetchJson(contentIndexUrl(t), [t, contentIndexTag(t), 'content:index']);
}

function siteUrl() {
  return env('NEXT_PUBLIC_SITE_URL', 'https://bestpackfactory.com').replace(/\/+$/, '');
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function imageUrl(image) {
  if (!image) return undefined;
  const raw = String(image);
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return `${siteUrl()}${raw}`;
  return `${siteUrl()}/${raw}`;
}

function contentPath(type, slug) {
  return `/${normalizeType(type)}/${cleanContentSlug(slug)}.html`;
}

export function metadataFromContent(content, type, slug) {
  const t = normalizeType(type);
  const clean = cleanContentSlug(slug);
  const fallbackTitle = t === 'news' ? 'Packaging News | BestPackFactory' : 'Packaging Blog | BestPackFactory';
  const title = content?.seoTitle || content?.title || content?.headline || fallbackTitle;
  const description = content?.metaDescription || content?.description || content?.quickAnswer || 'BestPackFactory packaging content for B2B buyers.';
  const canonical = content?.canonical || `${siteUrl()}${contentPath(t, clean)}`;
  const keywords = Array.isArray(content?.keywords) ? content.keywords : String(content?.keywords || '').split(',').map(k => k.trim()).filter(Boolean);
  const heroImage = imageUrl(content?.ogImage || content?.mainImage || '/assets/hero/slide-01-one-stop.webp');
  return {
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
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: heroImage ? [heroImage] : undefined
    }
  };
}

function specsTable(specs = {}) {
  const rows = Array.isArray(specs)
    ? specs.map(item => [item.label || item.name || item.key, item.value])
    : Object.entries(specs || {});
  if (!rows.length) return '';
  return `<section class="tech-spec-section geo-table-block"><h2>Parameter Table</h2><div class="spec-scroll"><table class="technical-spec-table"><tbody>${rows.map(([k,v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`).join('')}</tbody></table></div></section>`;
}

function checklistHtml(items = []) {
  if (!Array.isArray(items) || !items.length) return '';
  return `<section class="rfq-checklist"><h2>Procurement Checklist</h2><ol>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ol></section>`;
}

function faqHtml(faq = []) {
  if (!Array.isArray(faq) || !faq.length) return '';
  return `<section class="faq-block"><h2>FAQ</h2>${faq.map(item => `<details><summary>${escapeHtml(item.question || item.q)}</summary><p>${escapeHtml(item.answer || item.a)}</p></details>`).join('')}</section>`;
}

function sectionsHtml(sections = []) {
  if (!Array.isArray(sections) || !sections.length) return '';
  return sections.map(section => `<section><h2>${escapeHtml(section.heading || section.title || '')}</h2><p>${escapeHtml(section.body || section.text || '')}</p></section>`).join('');
}

function relatedHtml(links = []) {
  if (!Array.isArray(links) || !links.length) return '';
  return `<section><h2>Related Pages</h2><ul class="internal-links">${links.map(link => `<li><a href="${escapeHtml(link.href || link.url || '#')}">${escapeHtml(link.label || link.title || link.href || link.url)}</a></li>`).join('')}</ul></section>`;
}

function headerHtml() {
  return `<div class="topbar"><div>Custom Packaging Manufacturer | MOQ 500 PCS | Free Design | Fast Delivery Worldwide</div><div>Email: lisa@colorprintingpackage.com &nbsp; | &nbsp; WhatsApp: +86 158 8653 0985</div></div>
<header class="header"><div class="header-inner"><a class="logo" href="/index.html"><img alt="BestPackFactory" decoding="async" loading="lazy" src="/assets/logo/bestpackfactory-logo.svg?v=1.2"/></a><form action="/products.html" class="search" data-product-search="true" method="get" role="search"><input aria-label="Search custom packaging products" autocomplete="off" name="q" placeholder="Search products: coffee bags, pet food, pharma, cannabis..."/><button type="submit">Search</button></form><nav class="nav"><a href="/index.html">Home</a><a href="/products.html">Products</a><a href="/about.html">About Us</a><a href="/blog.html">Blog</a><a href="/news.html">News</a><a href="/whitepapers.html">Whitepapers</a><a href="/contact.html">Contact</a></nav><button aria-controls="mobileNavPanel" aria-expanded="false" aria-label="Open mobile menu" class="mobile-menu-toggle" type="button">☰</button><a class="btn" href="/contact.html">Get Quote</a></div></header>`;
}

function footerHtml() {
  return `<footer class="footer"><div><h3>BestPackFactory</h3><p>B2B custom packaging manufacturer for boxes, bags, labels, bottles, tins and printing.</p><p>Lisa Wu &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; lisa@colorprintingpackage.com &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; WhatsApp +86 158 8653 0985</p><p>Address: Printing Industrial Park, Longhua District, Shenzhen, Guangdong Province, 518109, China</p></div><div><h3>Products</h3><a href="/products.html">All Products</a><a href="/products/luxury-magnetic-boxes.html">Magnetic Boxes</a><a href="/products/flexible-packaging.html">Flexible Packaging</a></div><div><h3>Inquiry</h3><a href="/contact.html">Request Quote</a><a href="mailto:lisa@colorprintingpackage.com">Email Lisa</a></div></footer>`;
}

export function renderContentBody(content, type, slug) {
  const t = normalizeType(type);
  const clean = cleanContentSlug(slug);
  if (content?.html) return extractBody(content.html);
  const title = content?.title || content?.headline || clean.replace(/-/g, ' ');
  const description = content?.description || content?.metaDescription || '';
  const category = content?.category || (t === 'news' ? 'News' : 'Blog');
  const quickAnswer = content?.quickAnswer || content?.summary || description || 'A practical B2B packaging answer from BestPackFactory.';
  const bodyHtml = content?.bodyHtml ? rewriteRelativeUrls(content.bodyHtml) : '';
  const ctaTitle = content?.ctaTitle || 'CTA: Ask Lisa for a packaging quote';
  const ctaText = content?.ctaText || 'Send product size, target quantity, artwork status, required finish, destination country and launch deadline. BestPackFactory can connect strategy, design, sampling, manufacturing and logistics into one B2B packaging plan.';
  const related = content?.relatedLinks || [
    { href: '/products.html', label: 'All Products' },
    { href: '/contact.html', label: 'Contact BestPackFactory' }
  ];
  return `${headerHtml()}
<main class="section article-detail geo-article">
  <div class="eyebrow">${escapeHtml(category)} · R2 ISR</div>
  <h1>${escapeHtml(title)}</h1>
  ${description ? `<p class="tech-note">${escapeHtml(description)}</p>` : ''}
  <section class="ai-snapshot quick-answer-box"><h2>Quick Answer</h2><p>${escapeHtml(quickAnswer)}</p></section>
  ${specsTable(content?.parameters || content?.specs || {})}
  ${bodyHtml || sectionsHtml(content?.sections || [])}
  ${checklistHtml(content?.procurementChecklist || content?.checklist || [])}
  ${faqHtml(content?.faq || [])}
  <section class="rfq-template-box"><h2>${escapeHtml(ctaTitle)}</h2><p>${escapeHtml(ctaText)}</p><div class="rfq-actions"><a class="btn" href="/contact.html">Request Factory Quote</a><a class="btn light" href="/products.html">View Packaging Products</a></div></section>
  ${relatedHtml(related)}
</main>
${footerHtml()}`;
}

function articleJsonLd(content, type, slug) {
  const t = normalizeType(type);
  const clean = cleanContentSlug(slug);
  const title = content?.title || content?.headline || clean.replace(/-/g, ' ');
  const description = content?.metaDescription || content?.description || content?.quickAnswer || '';
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished: content?.datePublished || content?.publishedAt || new Date().toISOString().slice(0,10),
    dateModified: content?.dateModified || content?.updatedAt || new Date().toISOString().slice(0,10),
    author: { '@type': 'Organization', name: 'BestPackFactory' },
    publisher: { '@type': 'Organization', name: 'BestPackFactory', logo: { '@type': 'ImageObject', url: `${siteUrl()}/assets/logo/bestpackfactory-logo.svg` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl()}${contentPath(t, clean)}` }
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

export function pageFromContent(content, type, slug) {
  const t = normalizeType(type);
  const clean = cleanContentSlug(slug);
  if (!content) return null;
  if (content?.html) {
    return {
      body: extractBody(content.html),
      metadata: metadataFromHtml(content.html, `${t}/${clean}.html`),
      jsonLd: extractJsonLd(content.html)
    };
  }
  const jsonLd = [articleJsonLd(content, t, clean)];
  const faq = faqJsonLd(content?.faq || []);
  if (faq) jsonLd.push(faq);
  return {
    body: renderContentBody(content, t, clean),
    metadata: metadataFromContent(content, t, clean),
    jsonLd
  };
}
