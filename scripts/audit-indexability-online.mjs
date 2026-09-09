const DEFAULT_ORIGIN = 'https://www.bestpackfactory.com';
const origin = String(process.argv[2] || DEFAULT_ORIGIN).replace(/\/+$/, '');
const concurrency = Math.max(1, Math.min(12, Number(process.env.AUDIT_CONCURRENCY || 6)));
const userAgent = 'BestPackFactoryIndexabilityAudit/1.0 (+https://www.bestpackfactory.com/)';

function requestUrl(value = '') {
  const target = new URL(value, origin);
  const localAudit = /^(?:localhost|127\.0\.0\.1)$/i.test(new URL(origin).hostname);
  if (localAudit && /^(?:www\.)?bestpackfactory\.com$/i.test(target.hostname)) {
    return new URL(`${target.pathname}${target.search}`, origin).toString();
  }
  return target.toString();
}

function decodeXml(value = '') {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function firstMatch(value, patterns) {
  for (const pattern of patterns) {
    const match = String(value).match(pattern);
    if (match?.[1]) return decodeXml(match[1].trim());
  }
  return '';
}

function sitemapLocations(xml = '') {
  return [...String(xml).matchAll(/<sitemap\b[^>]*>[\s\S]*?<loc>\s*([^<]+)\s*<\/loc>[\s\S]*?<\/sitemap>/gi)]
    .map(match => decodeXml(match[1].trim()));
}

function pageLocations(xml = '') {
  return [...String(xml).matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)]
    .map(match => firstMatch(match[1], [/<loc>\s*([^<]+)\s*<\/loc>/i]))
    .filter(Boolean);
}

function normalizeUrl(value = '') {
  if (!String(value).trim()) return '';
  try {
    const url = new URL(value, origin);
    url.hash = '';
    return url.toString();
  } catch {
    return '';
  }
}

async function request(url, options = {}) {
  const response = await fetch(requestUrl(url), {
    redirect: options.redirect || 'manual',
    headers: { 'user-agent': userAgent, accept: options.accept || 'text/html,application/xhtml+xml' },
    signal: AbortSignal.timeout(30000)
  });
  return response;
}

async function loadSitemaps() {
  const indexUrl = `${origin}/sitemap-index.xml`;
  const indexResponse = await request(indexUrl, { redirect: 'follow', accept: 'application/xml,text/xml' });
  if (!indexResponse.ok) throw new Error(`Sitemap index returned ${indexResponse.status}: ${indexUrl}`);
  const indexXml = await indexResponse.text();
  const children = sitemapLocations(indexXml);
  if (!children.length) throw new Error(`No child sitemaps found in ${indexUrl}`);

  const childResults = [];
  for (const childUrl of children) {
    const response = await request(childUrl, { redirect: 'follow', accept: 'application/xml,text/xml' });
    const xml = await response.text();
    childResults.push({
      url: childUrl,
      status: response.status,
      pages: response.ok ? pageLocations(xml) : []
    });
  }
  return { indexUrl, children: childResults };
}

async function inspectPage(url) {
  try {
    const response = await request(url);
    const location = response.headers.get('location') || '';
    const contentType = response.headers.get('content-type') || '';
    const body = response.status === 200 && /text\/html|application\/xhtml\+xml/i.test(contentType)
      ? await response.text()
      : '';
    const canonical = firstMatch(body, [
      /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i,
      /<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i
    ]);
    const robots = firstMatch(body, [
      /<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      /<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']robots["'][^>]*>/i
    ]).toLowerCase();
    const xRobotsTag = (response.headers.get('x-robots-tag') || '').toLowerCase();
    const expected = normalizeUrl(url);
    const actualCanonical = normalizeUrl(canonical);
    return {
      url,
      status: response.status,
      location: location ? normalizeUrl(new URL(location, url).toString()) : '',
      canonical: actualCanonical,
      noindex: /(?:^|,)\s*noindex(?:\s*,|$)/i.test(`${robots},${xRobotsTag}`),
      canonicalMismatch: Boolean(actualCanonical && actualCanonical !== expected),
      missingCanonical: response.status === 200 && /text\/html|application\/xhtml\+xml/i.test(contentType) && !actualCanonical,
      contentType
    };
  } catch (error) {
    return { url, status: 0, error: error?.message || String(error) };
  }
}

async function mapLimit(values, limit, mapper) {
  const results = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor++;
      results[index] = await mapper(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker));
  return results;
}

const sitemap = await loadSitemaps();
const allLocations = sitemap.children.flatMap(child => child.pages);
const uniqueLocations = [...new Set(allLocations)];
const duplicateCount = allLocations.length - uniqueLocations.length;
const pages = await mapLimit(uniqueLocations, concurrency, inspectPage);

const summary = {
  auditedAt: new Date().toISOString(),
  origin,
  sitemapIndex: sitemap.indexUrl,
  childSitemaps: sitemap.children.map(child => ({ url: child.url, status: child.status, pages: child.pages.length })),
  listedUrls: allLocations.length,
  uniqueUrls: uniqueLocations.length,
  duplicateSitemapEntries: duplicateCount,
  status200: pages.filter(page => page.status === 200).length,
  redirects: pages.filter(page => page.status >= 300 && page.status < 400).length,
  notFound: pages.filter(page => page.status === 404).length,
  otherErrors: pages.filter(page => page.status === 0 || page.status >= 400 && page.status !== 404).length,
  noindex: pages.filter(page => page.noindex).length,
  missingCanonical: pages.filter(page => page.missingCanonical).length,
  canonicalMismatch: pages.filter(page => page.canonicalMismatch).length
};

const issues = pages.filter(page =>
  page.status !== 200 || page.noindex || page.missingCanonical || page.canonicalMismatch
);

console.log(JSON.stringify({ summary, issues }, null, 2));
if (issues.length) {
  process.exitCode = 1;
}
