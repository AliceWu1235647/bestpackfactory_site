import fs from 'fs';
import path from 'path';
import { SITE_URL, absoluteImageUrl, canonicalForRoute, forceWww, optimizeMetadataForRoute, safeJsonLd, siteUrl, stripHtml } from './seo-utils';

const CONTENT_ROOT = path.join(process.cwd(), 'content-site');
const PUBLIC_ROOT = path.join(process.cwd(), 'public');
const AVIF_EXISTS_CACHE = new Map();

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

// Version: 2026-07-04T16:55:00
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
  body = normalizeImageMarkup(body);
  return rewriteRelativeUrls(body).trim();
}

function normalizeImageMarkup(html = '') {
  return String(html || '')
    .replace(/\swidth=["']([^"']+)["']\sheight=["']([^"']+)["']\swidth=["']\1["']\sheight=["']\2["']/gi, ' width="$1" height="$2"')
    .replace(/<img\b([^>]*?)\sloading=["']lazy["']([^>]*?)\/\s+loading=["']eager["']\s+fetchpriority=["']high["']>/gi, '<img$1 loading="eager" fetchpriority="high"$2>')
    .replace(/<\/picture>\s*<\/picture>/gi, '</picture>')
    .replace(/<picture\b[^>]*>[\s\S]*?<\/picture>/gi, addAvifSources)
    .replace(/<img\b(?=[^>]*\bhero-mobile-product-image\b)(?=[^>]*\bsrc=["'][^"']+\.webp["'])[^>]*>/gi, wrapAvifImg);
}

function cleanAssetPath(url = '') {
  const clean = String(url || '')
    .split(/[?#]/)[0]
    .replace(/\\/g, '/')
    .replace(/^https?:\/\/www\.bestpackfactory\.com\//i, '')
    .replace(/^(\.\.\/)+/, '')
    .replace(/^\.?\//, '')
    .replace(/^\/+/, '');
  return clean.startsWith('assets/') ? clean : '';
}

function publicAssetExists(relPath = '') {
  if (!relPath) return false;
  if (AVIF_EXISTS_CACHE.has(relPath)) return AVIF_EXISTS_CACHE.get(relPath);
  const exists = fs.existsSync(path.join(PUBLIC_ROOT, relPath));
  AVIF_EXISTS_CACHE.set(relPath, exists);
  return exists;
}

function avifCandidate(candidate = '') {
  const parts = String(candidate || '').trim().split(/\s+/);
  const url = parts[0] || '';
  if (!/\.webp$/i.test(url.split(/[?#]/)[0])) return null;
  const avifUrl = url.replace(/\.webp(?=([?#]|$))/i, '.avif');
  if (!publicAssetExists(cleanAssetPath(avifUrl))) return null;
  return [avifUrl, ...parts.slice(1)].join(' ');
}

function avifSrcset(srcset = '') {
  const converted = String(srcset || '')
    .split(',')
    .map(avifCandidate)
    .filter(Boolean);
  return converted.length ? converted.join(', ') : '';
}

function addAvifSources(pictureHtml = '') {
  if (/type=["']image\/avif["']/i.test(pictureHtml)) return pictureHtml;
  return pictureHtml.replace(/<source\b[^>]*\bsrcset=["']([^"']*\.webp[^"']*)["'][^>]*type=["']image\/webp["'][^>]*\/?>/gi, (source, srcset) => {
    const avif = avifSrcset(srcset);
    if (!avif) return source;
    const avifSource = source
      .replace(srcset, avif)
      .replace(/type=["']image\/webp["']/i, 'type="image/avif"');
    return `${avifSource}${source}`;
  });
}

function wrapAvifImg(imgHtml = '') {
  const srcMatch = imgHtml.match(/\bsrc=["']([^"']+\.webp)["']/i);
  if (!srcMatch) return imgHtml;
  const src = srcMatch[1];
  const avif = avifCandidate(src);
  if (!avif) return imgHtml;
  return `<picture><source srcset="${avif}" type="image/avif"/>${imgHtml}</picture>`;
}

export function extractJsonLd(html) {
  const tags = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(html))) {
    let json = match[1].trim();
    json = json.replace(/\{\{/g, '{').replace(/\}\}/g, '}');
    const safe = safeJsonLd(json);
    if (safe) tags.push(safe);
  }
  return tags;
}

function generateBreadcrumbs(routePath) {
  const WWW_BASE = 'https://www.bestpackfactory.com';
  const parts = routePath.split('/').filter(p => p && p !== 'index.html');
  const items = [{ "@type": "ListItem", "position": 1, "name": "Home", "item": `${WWW_BASE}/` }];
  let currentPath = '';
  parts.forEach((part, index) => {
    currentPath += `/${part}`;
    const name = part.replace(/\.html$/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    items.push({
      "@type": "ListItem",
      "position": index + 2,
      "name": name,
      "item": `${WWW_BASE}${currentPath.endsWith('.html') ? currentPath : currentPath + '.html'}`
    });
  });
  return JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items });
}

function injectGeoContent(body, routePath) {
  if (routePath.startsWith('products/') && !body.includes('rfq-checklist')) {
    return body + `
      <section class="section geo-extension" style="border-top:1px solid #eee; margin-top:40px; padding-top:40px;">
        <div class="rfq-checklist">
          <h3>Buyer RFQ Checklist</h3>
          <ol>
            <li><strong>Specifications:</strong> Confirm dimensions, material structure, and barrier requirements.</li>
            <li><strong>Artwork:</strong> Provide AI or high-res PDF with 3mm bleed.</li>
            <li><strong>Logistics:</strong> State destination country and expected delivery timeline.</li>
            <li><strong>Volume:</strong> MOQ starts at 500 PCS for custom projects.</li>
          </ol>
        </div>
      </section>`;
  }
  return body;
}

export function rewriteRelativeUrls(html) {
  return html
    .replace(/(\s(?:src|href|poster)=['"])(\.\.\/)+/gi, '$1/')
    .replace(/(\s(?:src|href|poster)=['"])(?!https?:|mailto:|tel:|sms:|#|\/|data:|javascript:)(assets\/|css\/|js\/|products\/|blog\/|news\/|whitepapers\/)/gi, '$1/$2')
    .replace(/(\s(?:href)=['"])(?!https?:|mailto:|tel:|sms:|#|\/|data:|javascript:)((?:index|products|about|contact|blog|news|whitepapers)\.html)/gi, '$1/$2');
}

export function metadataFromHtml(html, routePath = '') {
  const titleAttr = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  let title = titleAttr ? stripHtml(titleAttr[1].trim()) : 'BestPackFactory';
  title = title.replace(/\s*\|\s*BestPackFactory\s*\|\s*BestPackFactory/gi, ' | BestPackFactory');
  
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) || 
                   html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
  const description = descMatch ? stripHtml(descMatch[1]) : 'BestPackFactory custom packaging manufacturer.';

  const canonical = canonicalForRoute(cleanRoute(routePath));

  return optimizeMetadataForRoute({
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: 'BestPackFactory', type: 'website' }
  }, routePath);
}

function firstImageUrl(html) {
  const og = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i) ||
    html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i);
  if (og?.[1]) return absoluteImageUrl(og[1]);
  const img = html.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
  return img?.[1] ? absoluteImageUrl(img[1]) : undefined;
}

function firstH1(html) {
  const match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return match?.[1] ? stripHtml(match[1]) : '';
}

function hasSchemaType(jsonLd, type) {
  return jsonLd.some((json) => {
    try {
      const parsed = JSON.parse(json);
      return parsed?.['@type'] === type || (Array.isArray(parsed?.['@graph']) && parsed['@graph'].some(node => node?.['@type'] === type));
    } catch {
      return false;
    }
  });
}

function organizationJsonLd() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BestPackFactory',
    alternateName: 'BPF Packaging',
    url: SITE_URL,
    logo: siteUrl('/assets/logo/bestpackfactory-logo.svg'),
    description: 'B2B custom packaging manufacturer for boxes, bags, labels, bottles, tins, flexible packaging and printed packaging projects.',
    foundingDate: '2010',
    address: { '@type': 'PostalAddress', addressLocality: 'Shenzhen', addressRegion: 'Guangdong', addressCountry: 'CN' },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'lisa@colorprintingpackage.com',
      telephone: '+86-158-8653-0985',
      areaServed: 'Worldwide',
      availableLanguage: ['English', 'Chinese']
    },
    sameAs: [SITE_URL]
  });
}

function websiteJsonLd() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BestPackFactory',
    url: `${SITE_URL}/`,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/products.html?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  });
}

function productJsonLdFromHtml(html, routePath, metadata) {
  const name = firstH1(html) || stripHtml(metadata.title).replace(/\s*\|\s*.*$/, '') || 'Custom Packaging Product';
  const canonical = metadata?.alternates?.canonical || canonicalForRoute(routePath);
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: metadata.description,
    image: firstImageUrl(html) ? [firstImageUrl(html)] : undefined,
    brand: { '@type': 'Brand', name: 'BestPackFactory' },
    manufacturer: { '@type': 'Organization', name: 'BestPackFactory', url: SITE_URL },
    url: canonical,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
      url: canonical,
      priceSpecification: {
        '@type': 'PriceSpecification',
        description: 'B2B RFQ required. MOQ 500 PCS. No public retail checkout price.'
      }
    }
  });
}

function articleJsonLdFromHtml(html, routePath, metadata) {
  const headline = firstH1(html) || stripHtml(metadata.title) || 'BestPackFactory Packaging Guide';
  const canonical = metadata?.alternates?.canonical || canonicalForRoute(routePath);
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description: metadata.description,
    image: firstImageUrl(html) ? [firstImageUrl(html)] : undefined,
    author: { '@type': 'Organization', name: 'BestPackFactory' },
    publisher: {
      '@type': 'Organization',
      name: 'BestPackFactory',
      logo: { '@type': 'ImageObject', url: siteUrl('/assets/logo/bestpackfactory-logo.svg') }
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical }
  });
}

function addFallbackJsonLd(html, routePath, metadata, jsonLd) {
  const clean = cleanRoute(routePath);
  const output = [...jsonLd];
  if ((clean === 'index.html' || clean === '') && !hasSchemaType(output, 'Organization')) {
    output.push(organizationJsonLd());
  }
  if ((clean === 'index.html' || clean === '') && !hasSchemaType(output, 'WebSite')) {
    output.push(websiteJsonLd());
  }
  if (clean.startsWith('products/') && !hasSchemaType(output, 'Product')) {
    output.push(productJsonLdFromHtml(html, clean, metadata));
  }
  if ((clean.startsWith('blog/') || clean.startsWith('news/')) && !hasSchemaType(output, 'Article')) {
    output.push(articleJsonLdFromHtml(html, clean, metadata));
  }
  return output.map(forceWww);
}

export function pageFromHtml(html, routePath = '') {
  if (!html) return null;
  const body = extractBody(html);
  const metadata = metadataFromHtml(html, routePath);
  const jsonLd = addFallbackJsonLd(html, routePath, metadata, extractJsonLd(html));
  jsonLd.push(generateBreadcrumbs(routePath));
  return {
    body: injectGeoContent(body, routePath),
    metadata,
    jsonLd: jsonLd
  };
}

export function getPage(routePath = '') {
  const html = readHtml(routePath);
  return html ? pageFromHtml(html, routePath) : null;
}

export function listHtmlRoutes() {
  const routes = [];
  if (!fs.existsSync(CONTENT_ROOT)) return [];
  function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      const abs = path.join(dir, name);
      if (fs.statSync(abs).isDirectory()) walk(abs);
      else if (name.endsWith('.html')) routes.push(path.relative(CONTENT_ROOT, abs).replace(/\\/g, '/'));
    }
  }
  walk(CONTENT_ROOT);
  return routes.sort();
}
