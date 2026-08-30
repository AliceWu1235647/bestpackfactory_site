const SITE_URL = 'https://www.bestpackfactory.com';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function decodeBasicEntities(value = '') {
  return String(value)
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(parseInt(code, 16)));
}

function findArticleSchema(jsonLd = []) {
  for (const raw of jsonLd) {
    try {
      const parsed = JSON.parse(raw);
      const candidates = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.['@graph'])
          ? parsed['@graph']
          : [parsed];
      const article = candidates.find(item => ['Article', 'BlogPosting', 'TechArticle'].includes(item?.['@type']));
      if (article) return article;
    } catch {}
  }
  return null;
}

function firstImage(value) {
  const image = Array.isArray(value) ? value[0] : value;
  if (typeof image === 'string') return image;
  if (image && typeof image === 'object') return image.url || image.contentUrl || '';
  return '';
}

function localSiteUrl(value = '') {
  if (!value) return '';
  try {
    const url = new URL(value, SITE_URL);
    if (/^(www\.)?bestpackfactory\.com$/i.test(url.hostname)) return `${url.pathname}${url.search}`;
  } catch {}
  return value;
}

function contentHtml(body = '') {
  const article = body.match(/<article\b[\s\S]*?<\/article>/i)?.[0];
  if (article) return article;
  const main = body.match(/<main\b[\s\S]*?<\/main>/i)?.[0];
  if (main) return main;
  const sectionStart = body.search(/<section\b[^>]*class=["'][^"']*article-detail[^"']*["'][^>]*>/i);
  if (sectionStart >= 0) {
    const rest = body.slice(sectionStart);
    const boundary = rest.search(/<div\b[^>]*class=["'][^"']*bpf-whatsapp-chat|<footer\b|<script\b/i);
    return boundary >= 0 ? rest.slice(0, boundary) : rest;
  }
  return body;
}

function textFromHtml(html = '') {
  return decodeBasicEntities(html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' '))
    .trim();
}

function readingMinutes(body = '') {
  const words = textFromHtml(contentHtml(body)).match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) || [];
  return Math.max(3, Math.ceil(words.length / 220));
}

function titleFromBody(body = '') {
  const raw = body.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '';
  return textFromHtml(raw);
}

function formatDate(value = '') {
  if (!value) return '';
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

function authorMeta(article, minutes) {
  const author = Array.isArray(article?.author) ? article.author[0] : article?.author;
  const authorName = author?.name || 'Lisa Wu';
  const authorUrl = author?.url || '/authors/lisa-wu.html';
  const published = String(article?.datePublished || '').slice(0, 10);
  const modified = String(article?.dateModified || '').slice(0, 10);
  const parts = [
    `<span>Written by <a href="${escapeHtml(authorUrl)}" rel="author">${escapeHtml(authorName)}</a></span>`
  ];
  if (published) parts.push(`<span>Published <time datetime="${escapeHtml(published)}">${escapeHtml(formatDate(published))}</time></span>`);
  if (modified) parts.push(`<span>Reviewed <time datetime="${escapeHtml(modified)}">${escapeHtml(formatDate(modified))}</time></span>`);
  parts.push(`<span class="article-read-time" aria-label="Estimated reading time">${minutes} min read</span>`);
  return `<div class="content-author-meta" data-content-author="${escapeHtml(authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}">${parts.join('')}</div>`;
}

function addReadingTime(body, article, minutes) {
  if (/class=["'][^"']*article-read-time/i.test(body)) return body;
  const metaPattern = /(<div\b[^>]*class=["'][^"']*content-author-meta[^"']*["'][^>]*>)([\s\S]*?)(<\/div>)/i;
  if (metaPattern.test(body)) {
    return body.replace(metaPattern, (_match, open, content, close) =>
      `${open}${content}<span class="article-read-time" aria-label="Estimated reading time">${minutes} min read</span>${close}`
    );
  }
  return body.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)/i, `$1${authorMeta(article, minutes)}`);
}

function addHeroImage(body, article, title) {
  if (/class=["'][^"']*article-hero-media/i.test(body)) return body;
  const image = localSiteUrl(firstImage(article?.image));
  if (!image) return body;
  const figure = `<figure class="article-hero-media"><img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" width="1200" height="675" loading="eager" fetchpriority="high" decoding="async"/></figure>`;
  const metaPattern = /(<div\b[^>]*class=["'][^"']*content-author-meta[^"']*["'][^>]*>[\s\S]*?<\/div>)/i;
  if (metaPattern.test(body)) return body.replace(metaPattern, match => `${match}${figure}`);
  return body.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)/i, `$1${figure}`);
}

function addFallbackCta(body, slug, articleTitle) {
  const content = contentHtml(body);
  if (/href=["'][^"']*(?:contact\.html|wa\.me)/i.test(content)) return body;
  const headingId = `article-quote-${String(slug || 'guide').replace(/[^a-z0-9-]+/gi, '-')}`;
  const whatsappText = encodeURIComponent(`Hello BestPackFactory, I read "${articleTitle}" and need help with a custom packaging project.`);
  const cta = `<section class="article-conversion-cta" aria-labelledby="${escapeHtml(headingId)}"><div><span class="article-cta-kicker">Turn the guide into an RFQ</span><h2 id="${escapeHtml(headingId)}">Need help with your packaging specification?</h2><p>Share your product type, dimensions, quantity, artwork status, destination country and target date for a practical project review.</p></div><div class="article-cta-actions"><a class="btn" href="/contact.html">Request a project quote</a><a class="btn light" href="https://wa.me/8615886530985?text=${whatsappText}" rel="noopener" target="_blank">Ask Lisa on WhatsApp</a></div></section>`;
  if (/<\/article>/i.test(body)) return body.replace(/<\/article>/i, `${cta}</article>`);
  if (/<\/main>/i.test(body)) return body.replace(/<\/main>/i, `${cta}</main>`);
  const boundary = body.search(/<div\b[^>]*class=["'][^"']*bpf-whatsapp-chat|<footer\b|<script\b/i);
  if (boundary >= 0) return `${body.slice(0, boundary)}${cta}${body.slice(boundary)}`;
  return `${body}${cta}`;
}

export function enhanceBlogPostBody(page, slug = '') {
  if (!page?.body) return page?.body || '';
  const article = findArticleSchema(page.jsonLd) || {};
  const title = article.headline || titleFromBody(page.body) || page.metadata?.title || 'Custom packaging buyer guide';
  const minutes = readingMinutes(page.body);
  let body = addReadingTime(page.body, article, minutes);
  body = addHeroImage(body, article, title);
  body = addFallbackCta(body, slug, title);
  return body;
}
