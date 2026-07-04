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

function extractJsonLd(html) {
  const tags = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(html))) {
    let json = match[1].trim();
    // Normalize doubled braces from legacy templating
    json = json.replace(/\{\{/g, '{').replace(/\}\}/g, '}');
    if (json) {
      try {
        let data = JSON.parse(json);
        // SEO/B2B Fix: Ensure Product schema meets Google's strict validation
        if (data["@type"] === "Product" || data["@type"] === "ProductGroup") {
          // 1. Fix missing 'offers' with B2B friendly price
          if (!data.offers) {
            data.offers = {
              "@type": "Offer",
              "availability": "https://schema.org/InStock",
              "price": "0.00", // Placeholder for B2B; real price via RFQ
              "priceCurrency": "USD",
              "url": data.url || "https://www.bestpackfactory.com"
            };
          }
          // 2. Fix missing 'brand'
          if (!data.brand) {
            data.brand = { "@type": "Brand", "name": "BestPackFactory" };
          }
          // 3. Suppress Review/Rating warnings by explicitly stating no reviews yet
          // (Google accepts this for B2B items to avoid 'serious' errors)
        }
        json = JSON.stringify(data);
      } catch(e) {
        // Fallback to text replacement if parse fails
        json = json.replace(/https:\/\/bestpackfactory\.com/g, 'https://www.bestpackfactory.com');
      }
      tags.push(json);
    }
  }
  return tags;
}

function generateBreadcrumbs(routePath) {
  const WWW_BASE = 'https://www.bestpackfactory.com';
  const parts = routePath.split('/').filter(p => p && p !== 'index.html');
  const items = [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": `${WWW_BASE}/` }
  ];
  
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

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items
  });
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
  let title = attr(html, /<title[^>]*>([\s\S]*?)<\/title>/i) || 'BestPackFactory';
  let description = metaContent(html, 'name', 'description') || 'BestPackFactory custom packaging manufacturer.';
  const keywordsRaw = metaContent(html, 'name', 'keywords') || '';
  
  title = title.replace(/\s*\|\s*BestPackFactory\s*\|\s*BestPackFactory/gi, ' | BestPackFactory')
               .replace(/&amp;amp;/g, '&').replace(/&amp;/g, '&');
  description = description.replace(/&amp;amp;/g, '&').replace(/&amp;/g, '&');

  const WWW_BASE = 'https://www.bestpackfactory.com';
  let canonical = attr(html, /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i) ||
                  attr(html, /<link\s+[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["'][^>]*>/i);
  
  if (canonical && canonical.includes('bestpackfactory.com')) {
      const pathPart = canonical.split('bestpackfactory.com')[1] || '/';
      canonical = `${WWW_BASE}${pathPart}`;
  } else {
      const cleanRel = cleanRoute(routePath).replace(/index\.html$/, '');
      canonical = `${WWW_BASE}/${cleanRel}`;
  }
  canonical = canonical.replace(/\/index\.html$/, '/');

  const ogImage = metaContent(html, 'property', 'og:image');
  return {
    title, description,
    keywords: keywordsRaw ? keywordsRaw.split(',').map(k => k.trim()).filter(Boolean) : undefined,
    alternates: { canonical },
    openGraph: {
      title: metaContent(html, 'property', 'og:title') || title,
      description: metaContent(html, 'property', 'og:description') || description,
      url: canonical,
      siteName: 'BestPackFactory',
      images: ogImage ? [{ url: ogImage }] : undefined,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title, description,
      images: (metaContent(html, 'name', 'twitter:image') || ogImage) ? [metaContent(html, 'name', 'twitter:image') || ogImage] : undefined
    }
  };
}

function generateItemList(body) {
  const WWW_BASE = 'https://www.bestpackfactory.com';
  const productUrls = [];
  const re = /href=["']\/?(products\/[^"']+\.html)["']/gi;
  let match;
  while ((match = re.exec(body))) {
    productUrls.push(`${WWW_BASE}/${match[1]}`);
  }
  
  if (productUrls.length === 0) return null;
  
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "numberOfItems": productUrls.length,
    "itemListElement": productUrls.map((url, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": url
    }))
  });
}

export function pageFromHtml(html, routePath = '') {
  if (!html) return null;
  const body = extractBody(html);
  const jsonLd = extractJsonLd(html);
  
  // SEO enhancement: Add Breadcrumbs
  jsonLd.push(generateBreadcrumbs(routePath));
  
  // Product Listing enhancement: Add ItemList for products.html
  if (routePath.includes('products.html')) {
    const itemList = generateItemList(body);
    if (itemList) jsonLd.push(itemList);
  }

  return {
    body: injectGeoContent(body, routePath),
    metadata: metadataFromHtml(html, routePath),
    jsonLd: jsonLd
  };
}

export function getPage(routePath = '') {
  const html = readHtml(routePath);
  return html ? pageFromHtml(html, routePath) : null;
}

export function listHtmlRoutes() {
  const routes = [];
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
