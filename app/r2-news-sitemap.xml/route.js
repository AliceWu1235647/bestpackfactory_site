import { getR2ContentIndex, contentRevalidateSeconds } from '../../lib/r2-content';
import { escapeXml, localHtmlEntries, mergeSitemapEntries, sitemapItemDate } from '../../lib/local-sitemap';

export const revalidate = 3600;

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bestpackfactory.com')
    .replace(/^https:\/\/bestpackfactory\.com/i, 'https://www.bestpackfactory.com')
    .replace(/\/+$/, '');
}

function cleanSlug(value = '') {
  return String(value || '').replace(/^news\//, '').replace(/\.json$/, '').replace(/\.html$/, '').replace(/^\/+|\/+$/g, '');
}

function itemSlug(item) {
  return cleanSlug(item?.slug || item?.url || item?.path || item?.json || item?.id || item);
}

export async function GET() {
  const index = await getR2ContentIndex('news');
  const posts = Array.isArray(index?.news) ? index.news : Array.isArray(index?.items) ? index.items : Array.isArray(index) ? index : [];
  const entries = mergeSitemapEntries(
    posts.map(item => ({ slug: itemSlug(item), lastmod: sitemapItemDate(item) })),
    localHtmlEntries('news')
  );
  const urls = entries
    .map(({ slug, lastmod }) => `  <url><loc>${escapeXml(`${siteUrl()}/news/${slug}.html`)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>weekly</changefreq><priority>0.86</priority></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': `public, s-maxage=${contentRevalidateSeconds()}, stale-while-revalidate=86400` } });
}
