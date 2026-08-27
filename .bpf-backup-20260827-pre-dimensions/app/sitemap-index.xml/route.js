import { siteUrl } from '../../lib/site-structure';

export const revalidate = 3600;

export async function GET() {
  const base = siteUrl();
  const sitemaps = [
    '/sitemap.xml',
    '/r2-products-sitemap.xml',
    '/r2-blog-sitemap.xml',
    '/r2-news-sitemap.xml',
    '/image-sitemap.xml',
    '/sitemap-de.xml',
    '/sitemap-fr.xml',
    '/sitemap-es.xml',
    '/sitemap-ja.xml',
    '/sitemap-ar.xml'
  ];
  const body = sitemaps
    .map(path => `  <sitemap><loc>${base}${path}</loc></sitemap>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
