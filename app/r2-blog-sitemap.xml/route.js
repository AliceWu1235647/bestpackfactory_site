import { getR2ContentIndex, contentRevalidateSeconds } from '../../lib/r2-content';

export const revalidate = 3600;

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://bestpackfactory.com').replace(/\/+$/, '');
}

function cleanSlug(value = '') {
  return String(value || '').replace(/^blog\//, '').replace(/\.json$/, '').replace(/\.html$/, '').replace(/^\/+|\/+$/g, '');
}

function itemSlug(item) {
  return cleanSlug(item?.slug || item?.url || item?.path || item?.json || item?.id || item);
}

export async function GET() {
  const index = await getR2ContentIndex('blog');
  const posts = Array.isArray(index?.posts) ? index.posts : Array.isArray(index?.items) ? index.items : Array.isArray(index) ? index : [];
  const urls = posts
    .map(itemSlug)
    .filter(Boolean)
    .map(slug => `  <url><loc>${siteUrl()}/blog/${slug}.html</loc><changefreq>weekly</changefreq><priority>0.88</priority></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': `public, s-maxage=${contentRevalidateSeconds()}, stale-while-revalidate=86400` } });
}
