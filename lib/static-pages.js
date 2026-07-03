import fs from 'fs';
import path from 'path';

const CONTENT_ROOT = path.join(process.cwd(), 'content-site');

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
  return rewriteRelativeUrls(body).trim();
}

export function extractJsonLd(html) {
  const tags = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(html))) {
    let json = match[1].trim();
    // Some legacy static pages used doubled braces in JSON-LD during templating; normalize them for valid Schema output.
    json = json.replace(/\{\{/g, '{').replace(/\}\}/g, '}');
    if (json) tags.push(json);
  }
  return tags;
}

export function rewriteRelativeUrls(html) {
  return html
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

export function metadataFromHtml(html, routePath = '') {
  const title = attr(html, /<title[^>]*>([\s\S]*?)<\/title>/i) || 'BestPackFactory';
  const description = metaContent(html, 'name', 'description') || 'BestPackFactory custom packaging manufacturer.';
  const keywordsRaw = metaContent(html, 'name', 'keywords') || '';
  const canonical = attr(html, /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i) ||
    attr(html, /<link\s+[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["'][^>]*>/i);
  const ogImage = metaContent(html, 'property', 'og:image');
  const ogTitle = metaContent(html, 'property', 'og:title') || title;
  const ogDescription = metaContent(html, 'property', 'og:description') || description;
  const twitterImage = metaContent(html, 'name', 'twitter:image') || ogImage;
  return {
    title,
    description,
    keywords: keywordsRaw ? keywordsRaw.split(',').map(k => k.trim()).filter(Boolean) : undefined,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName: 'BestPackFactory',
      images: ogImage ? [ogImage] : undefined,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: twitterImage ? [twitterImage] : undefined
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
