import fs from 'fs';
import path from 'path';

const CONTENT_ROOT = path.join(process.cwd(), 'content-site');
export const SITE_URL = 'https://www.bestpackfactory.com';
const LANG_LIST = ['de', 'fr', 'es', 'ja', 'ar'];

// Per-path hreflang alternates: /products/tin-boxes.html -> en + 5 languages + x-default.
// Emitted through generateMetadata alternates.languages so they are statically correct
// per page (unlike layout-level hreflang, which cannot know the path at build time).
export function langAlternatesFromRoute(routePath = '') {
  let rel = cleanRoute(routePath);
  if (rel === 'index.html' || !rel) rel = '/';
  else rel = `/${rel}`;
  if (rel !== '/' && !path.extname(rel)) rel = `${rel}.html`;
  const languages = { en: `${SITE_URL}${rel}`, 'x-default': `${SITE_URL}${rel}` };
  for (const lang of LANG_LIST) {
    languages[lang] = rel === '/' ? `${SITE_URL}/${lang}` : `${SITE_URL}/${lang}${rel}`;
  }
  return languages;
}

// Canonical + hreflang alternates for localized routes (de/fr/es/ja/ar).
// Mirrors the exact URL forms used by the localized static HTML heads:
//   /de            (lang index, no trailing slash)
//   /de/products/coffee-bags.html
export function localizedAlternates(routePath = '') {
  const lang = routePath.split('/')[0];
  const rel = routePath.slice(lang.length + 1) || 'index.html';
  const selfPath = rel === 'index.html' ? `/${lang}` : `/${lang}/${rel}`;
  const enPath = rel === 'index.html' ? '/' : `/${rel}`;
  const languages = { en: `${SITE_URL}${enPath}`, 'x-default': `${SITE_URL}${enPath}` };
  for (const l of LANG_LIST) {
    languages[l] = rel === 'index.html' ? `${SITE_URL}/${l}` : `${SITE_URL}/${l}/${rel}`;
  }
  return { canonical: `${SITE_URL}${selfPath}`, languages };
}

function safeDecode(value) {
  try { return decodeURIComponent(value); } catch { return value; }
}

function cleanRoute(routePath = '') {
  let clean = Array.isArray(routePath) ? routePath.join('/') : String(routePath || '');
  clean = safeDecode(clean).replace(/^\/+/, '').replace(/\/+$/, '');
  if (!clean || clean === '.') return 'index.html';
  clean = clean.replace(/\\/g, '/');
  return clean;
}

export function resolveHtmlFile(routePath = '') {
  let rel = cleanRoute(routePath);
  if (rel === 'index') rel = 'index.html';
  const candidates = [rel];
  if (!path.extname(rel)) candidates.push(`${rel}.html`, `${rel}/index.html`);
  for (const candidate of candidates) {
    const normalized = path.normalize(candidate).replace(/^\.\.[/\\]+/, '');
    const abs = path.join(CONTENT_ROOT, normalized);
    if (!abs.startsWith(CONTENT_ROOT)) continue;
    if (fs.existsSync(abs) && fs.statSync(abs).isFile() && abs.endsWith('.html')) return abs;
  }
  return null;
}

export function readHtml(routePath = '') {
  const file = resolveHtmlFile(routePath);
  if (!file) return null;
  return fs.readFileSync(file, 'utf8');
}

function extractBetween(html, startRe, endRe) {
  const start = html.search(startRe);
  if (start < 0) return '';
  const startMatch = html.match(startRe);
  const bodyStart = start + (startMatch ? startMatch[0].length : 0);
  const rest = html.slice(bodyStart);
  const end = rest.search(endRe);
  return end >= 0 ? rest.slice(0, end) : rest;
}

export function extractBody(html) {
  let body = extractBetween(html, /<body[^>]*>/i, /<\/body>/i) || html;
  body = body.replace(/<script[^>]*src=["'][^"']*main\.js[^"']*["'][^>]*><\/script>/gi, '');
  body = body.replace(/<script\s+defer=""\s+src="js\/main\.js"><\/script>/gi, '');
  // Strip inline JSON-LD from the body: it is re-emitted exactly once by the
  // route's page.jsonLd.map(), so leaving it in the body would double it.
  body = body.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');
  return rewriteRelativeUrls(body).trim();
}

export function extractJsonLd(html) {
  const tags = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(html))) {
    let json = match[1].trim();
    // Some legacy static pages wrapped the whole JSON-LD block in doubled braces during templating.
    // Only unwrap that exact outer wrapper so normal nested JSON objects keep their closing braces.
    if (json.startsWith('{{') && json.endsWith('}}')) {
      json = `{${json.slice(2, -2)}}`;
    }
    if (json) tags.push(json);
  }
  return tags;
}

function canonicalPathFromRoute(routePath = '') {
  let rel = cleanRoute(routePath);
  if (rel === 'index.html') return '/';
  if (!rel.endsWith('.html')) rel = `${rel}.html`;
  return `/${rel}`.replace(/\/index\.html$/i, '/');
}

function normalizeCanonical(value, routePath = '') {
  let pathName = canonicalPathFromRoute(routePath);
  if (value) {
    try {
      const parsed = new URL(value, SITE_URL);
      pathName = parsed.pathname || pathName;
    } catch {
      pathName = String(value).startsWith('/') ? String(value) : pathName;
    }
  }
  pathName = pathName.replace(/\/+/g, '/');
  if (/\/index\.html$/i.test(pathName)) {
    pathName = pathName.replace(/\/index\.html$/i, '/') || '/';
  }
  if (pathName !== '/' && !path.extname(pathName)) pathName = `${pathName.replace(/\/$/, '')}.html`;
  return `${SITE_URL}${pathName}`;
}

function normalizeAbsoluteSiteUrls(value, routePath = '') {
  if (!value) return value;
  return String(value)
    .replace(/https:\/\/(?:www\.)?bestpackfactory\.com(\/[^"'\s<)]*)?/gi, (_m, rawPath = '/') => {
      let pathName = rawPath || '/';
      pathName = pathName.split('#')[0].split('?')[0] || '/';
      if (pathName !== '/' && !path.extname(pathName)) pathName = `${pathName.replace(/\/$/, '')}.html`;
      return `${SITE_URL}${pathName}`;
    })
    .replace(/https:\/\/www\.bestpackfactory\.com\/index\.html/gi, `${SITE_URL}/`);
}

function normalizeSiteHostOnly(value) {
  if (!value) return value;
  return String(value).replace(/https:\/\/(?:www\.)?bestpackfactory\.com/gi, SITE_URL);
}

export function rewriteRelativeUrls(html) {
  return normalizeSiteHostOnly(html)
    .replace(/(\s(?:src|href|poster)=['"])(\.\.\/)+/gi, '$1/')
    .replace(/(\s(?:src|href|poster)=['"])(?!https?:|mailto:|tel:|sms:|#|\/|data:|javascript:)(assets\/|css\/|js\/|products\/|blog\/|news\/|whitepapers\/)/gi, '$1/$2')
    .replace(/(\s(?:href)=['"])(?!https?:|mailto:|tel:|sms:|#|\/|data:|javascript:)((?:index|products|about|contact|blog|news|whitepapers)\.html)/gi, '$1/$2');
}

function attr(html, regex) {
  const m = html.match(regex);
  return m ? m[1].trim() : undefined;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function metaContent(html, key, value) {
  const v = escapeRegex(value);
  const re1 = new RegExp(`<meta\\s+[^>]*(?:${key})=[\"']${v}[\"'][^>]*content=[\"']([^\"']*)[\"'][^>]*>`, 'i');
  const re2 = new RegExp(`<meta\\s+[^>]*content=[\"']([^\"']*)[\"'][^>]*(?:${key})=[\"']${v}[\"'][^>]*>`, 'i');
  return attr(html, re1) || attr(html, re2);
}

function robotsFromHtml(html) {
  const generic = metaContent(html, 'name', 'robots') || '';
  const google = metaContent(html, 'name', 'googlebot') || '';
  const tokens = `${generic},${google}`
    .toLowerCase()
    .split(',')
    .map(token => token.trim())
    .filter(Boolean);
  const has = directive => tokens.includes(directive);
  const valueFor = directive => {
    const token = tokens.find(item => item.startsWith(`${directive}:`));
    return token ? token.slice(directive.length + 1).trim() : undefined;
  };
  const maxSnippet = valueFor('max-snippet');
  const maxVideoPreview = valueFor('max-video-preview');
  const maxImagePreview = valueFor('max-image-preview');
  const index = !(has('noindex') || has('none'));
  const follow = !(has('nofollow') || has('none'));

  return {
    index,
    follow,
    googleBot: {
      index,
      follow,
      'max-snippet': maxSnippet === undefined ? -1 : Number(maxSnippet),
      'max-image-preview': maxImagePreview || 'large',
      'max-video-preview': maxVideoPreview === undefined ? -1 : Number(maxVideoPreview)
    }
  };
}

export function metadataFromHtml(html, routePath = '') {
  const title = attr(html, /<title[^>]*>([\s\S]*?)<\/title>/i) || 'BestPackFactory';
  const description = metaContent(html, 'name', 'description') || 'BestPackFactory custom packaging manufacturer.';
  const keywordsRaw = metaContent(html, 'name', 'keywords') || '';
  const canonicalRaw = attr(html, /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i) ||
    attr(html, /<link\s+[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["'][^>]*>/i);
  const canonical = normalizeCanonical(canonicalRaw, routePath);
  const ogImage = normalizeAbsoluteSiteUrls(metaContent(html, 'property', 'og:image'), routePath);
  const ogImageAlt = metaContent(html, 'property', 'og:image:alt');
  const ogTitle = metaContent(html, 'property', 'og:title') || title;
  const ogDescription = metaContent(html, 'property', 'og:description') || description;
  const twitterImage = normalizeAbsoluteSiteUrls(metaContent(html, 'name', 'twitter:image') || ogImage, routePath);
  const twitterImageAlt = metaContent(html, 'name', 'twitter:image:alt') || ogImageAlt;
  return {
    title,
    description,
    keywords: keywordsRaw ? keywordsRaw.split(',').map(k => k.trim()).filter(Boolean) : undefined,
    robots: robotsFromHtml(html),
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName: 'BestPackFactory',
      images: ogImage ? [{ url: ogImage, alt: ogImageAlt }] : undefined,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: twitterImage ? [{ url: twitterImage, alt: twitterImageAlt }] : undefined
    }
  };
}

export function pageFromHtml(html, routePath = '') {
  if (!html) return null;
  return {
    body: extractBody(html),
    metadata: metadataFromHtml(html, routePath),
    jsonLd: extractJsonLd(html)
  };
}

export function getPage(routePath = '') {
  const html = readHtml(routePath);
  if (!html) return null;
  return pageFromHtml(html, routePath);
}

export function listHtmlRoutes() {
  const routes = [];
  function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      const abs = path.join(dir, name);
      const st = fs.statSync(abs);
      if (st.isDirectory()) walk(abs);
      else if (name.endsWith('.html')) {
        let rel = path.relative(CONTENT_ROOT, abs).replace(/\\/g, '/');
        routes.push(rel);
      }
    }
  }
  walk(CONTENT_ROOT);
  return routes.sort();
}
