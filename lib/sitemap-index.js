import { escapeXml, sitemapDate } from './local-sitemap.js';

export const REQUIRED_SITEMAPS = [
  '/sitemap.xml',
  '/r2-products-sitemap.xml',
  '/r2-blog-sitemap.xml',
  '/r2-news-sitemap.xml',
  '/image-sitemap.xml',
  '/ai-sitemap.xml'
];

export function latestXmlLastmod(xml = '') {
  const dates = [...String(xml).matchAll(/<lastmod>\s*([^<]+)\s*<\/lastmod>/gi)]
    .map(match => sitemapDate(match[1]))
    .filter(Boolean)
    .sort();
  return dates.at(-1) || '';
}

export function createSitemapIndexXml({ base, paths = REQUIRED_SITEMAPS, lastmod = '' }) {
  const normalizedBase = String(base || '').replace(/\/+$/, '');
  const normalizedLastmod = sitemapDate(lastmod);
  const body = paths
    .map(sitemapPath => {
      const loc = escapeXml(`${normalizedBase}${sitemapPath}`);
      const modified = normalizedLastmod ? `<lastmod>${normalizedLastmod}</lastmod>` : '';
      return `  <sitemap><loc>${loc}</loc>${modified}</sitemap>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>`;
}
