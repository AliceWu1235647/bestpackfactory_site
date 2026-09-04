import fs from 'fs';
import path from 'path';
import { hreflangFor, localeSwitcherHtml } from './locales.js';

const CONTENT_ROOT = path.join(process.cwd(), 'content-site');
const SITE_URL = 'https://www.bestpackfactory.com';

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

// The static HTML in content-site/ predates the /dielines feature, so its nav
// and footer have no link to it. Rather than rewrite 396 HTML files (and risk
// touching product/hero/carousel markup), we inject the links here at the single
// point every page body flows through. Keyed off stable anchors; leaves all
// image markup untouched.
function injectDielineLinks(body) {
  // Desktop nav (<nav class="nav">…Contact</a></nav>)
  body = body.replace(
    /(<a href="\/contact\.html">Contact<\/a>)(<\/nav>)/i,
    '$1<a href="/dielines">Free Dielines</a>$2'
  );
  // Mobile nav (<div class="mobile-nav-links">…Contact</a></div>)
  body = body.replace(
    /(<a href="\/contact\.html">Contact<\/a>)(<\/div>)/i,
    '$1<a href="/dielines">Free Dielines</a>$2'
  );
  // Footer Products column
  body = body.replace(
    /(<h3>Products<\/h3><a href="\/products\.html">All Products<\/a>)/i,
    '$1<a href="/dielines">Free Dieline Templates</a>'
  );
  return body;
}

export function extractBody(html) {
  let body = extractBetween(html, /<body[^>]*>/i, /<\/body>/i) || html;
  body = body.replace(/<script[^>]*src=["'][^"']*main\.js[^"']*["'][^>]*><\/script>/gi, '');
  body = body.replace(/<script\s+defer=""\s+src="js\/main\.js"><\/script>/gi, '');
  body = injectDielineLinks(body);
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
  // Whether this is a directory index is decided by the file the route actually
  // resolves to: both `/ja` and `/ja/index.html` land on `ja/index.html`, which is
  // served at `/ja`. Its source canonical already says `/ja`, so the extension rule
  // below must leave it alone rather than inventing `/ja.html`.
  const resolvedFile = resolveHtmlFile(routePath);
  let directoryIndex = resolvedFile
    ? /(^|[/\\])index\.html$/i.test(resolvedFile)
    : /(^|\/)index\.html$/i.test(cleanRoute(routePath));
  if (/\/index\.html$/i.test(pathName)) {
    pathName = pathName.replace(/\/index\.html$/i, '/') || '/';
    directoryIndex = true;
  }
  // A locale mirror's index canonicalises to the bare locale root (`/ja`), which
  // is what the hreflang cluster advertises. Falling through to the extension
  // rule below would rewrite it to `/ja.html` and point the cluster at a URL the
  // site never serves.
  if (directoryIndex) {
    pathName = pathName === '/' ? '/' : pathName.replace(/\/$/, '');
  } else if (pathName !== '/' && !path.extname(pathName)) {
    pathName = `${pathName.replace(/\/$/, '')}.html`;
  }
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

// Pages that exist in English plus the five translated locales must declare a
// reciprocal hreflang cluster, otherwise the translations read as duplicate or
// machine-translated doorway pages. The cluster is keyed off the route, so it
// stays correct for both the English source and every locale mirror.
function buildAlternates(canonical, routePath = '') {
  const cluster = hreflangFor(routePath);
  if (!canonical && !cluster) return undefined;
  const alternates = {};
  if (canonical) alternates.canonical = canonical;
  if (cluster) alternates.languages = cluster.languages;
  return alternates;
}

export function metadataFromHtml(html, routePath = '') {
  const title = attr(html, /<title[^>]*>([\s\S]*?)<\/title>/i) || 'BestPackFactory';
  // 110 pages (93 of them blog posts) ship no <meta name="description"> but do carry a
  // written og:description. Falling straight through to the generic string gave every
  // one of them the same description, so og:description is tried first and the generic
  // string is left as the last resort it was meant to be.
  const description = metaContent(html, 'name', 'description') ||
    metaContent(html, 'property', 'og:description') ||
    'BestPackFactory custom packaging manufacturer.';
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
    alternates: buildAlternates(canonical, routePath),
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

// The switcher is appended here rather than inside extractBody() because
// lib/r2-content.js and lib/r2-products.js call extractBody() without a route, and
// an empty route would resolve to the English homepage and stamp the wrong cluster
// onto every R2-served page. Only routes that came through getPage() are keyed.
function appendLocaleSwitcher(body, routePath) {
  const switcher = localeSwitcherHtml(routePath);
  if (!switcher) return body;
  // Placed before <header so it renders as a full-width bar at the very top of the
  // page — above the logo and main nav — where multilingual visitors see it immediately.
  const headerIdx = body.indexOf('<header');
  if (headerIdx !== -1) {
    return body.slice(0, headerIdx) + switcher + body.slice(headerIdx);
  }
  return body.includes('</footer>')
    ? body.replace(/<\/footer>/i, () => `</footer>${switcher}`)
    : `${body}${switcher}`;
}

export function pageFromHtml(html, routePath = '') {
  if (!html) return null;
  return {
    body: appendLocaleSwitcher(extractBody(html), routePath),
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
