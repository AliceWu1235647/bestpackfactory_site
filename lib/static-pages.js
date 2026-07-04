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
  return rewriteRelativeUrls(body).trim();
}

export function extractJsonLd(html) {
  const tags = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(html))) {
    let json = match[1].trim();
    json = json.replace(/\{\{/g, '{').replace(/\}\}/g, '}');
    if (json) {
      try {
        let data = JSON.parse(json);
        if (data["@type"] === "Product") {
          if (!data.offers) {
            data.offers = {
              "@type": "Offer",
              "availability": "https://schema.org/InStock",
              "price": "0.00",
              "priceCurrency": "USD",
              "url": data.url || "https://www.bestpackfactory.com"
            };
          }
          if (!data.brand) {
            data.brand = { "@type": "Brand", "name": "BestPackFactory" };
          }
        }
        // Force WWW in all JSON-LD URLs
        let str = JSON.stringify(data).replace(/https:\/\/bestpackfactory\.com/g, 'https://www.bestpackfactory.com');
        tags.push(str);
      } catch(e) {
        tags.push(json.replace(/https:\/\/bestpackfactory\.com/g, 'https://www.bestpackfactory.com'));
      }
    }
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
  let title = titleAttr ? titleAttr[1].trim() : 'BestPackFactory';
  title = title.replace(/\s*\|\s*BestPackFactory\s*\|\s*BestPackFactory/gi, ' | BestPackFactory');
  
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) || 
                   html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
  const description = descMatch ? descMatch[1] : 'BestPackFactory custom packaging manufacturer.';

  const WWW_BASE = 'https://www.bestpackfactory.com';
  let canonical = `${WWW_BASE}/${cleanRoute(routePath).replace(/index\.html$/, '')}`;
  canonical = canonical.replace(/\/index\.html$/, '/');

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: 'BestPackFactory', type: 'website' }
  };
}

export function pageFromHtml(html, routePath = '') {
  if (!html) return null;
  const body = extractBody(html);
  const jsonLd = extractJsonLd(html);
  jsonLd.push(generateBreadcrumbs(routePath));
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
