import { getR2ProductIndex } from '../../lib/r2-products';

export const revalidate = 3600;

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://bestpackfactory.com').replace(/\/+$/, '');
}

function cleanSlug(value = '') {
  return String(value || '').replace(/^products\//, '').replace(/\.json$/, '').replace(/\.html$/, '').replace(/^\/+|\/+$/g, '');
}

export async function GET() {
  const index = await getR2ProductIndex();
  const products = Array.isArray(index?.products) ? index.products : Array.isArray(index) ? index : [];
  const urls = products
    .map(item => cleanSlug(item.slug || item.url || item.json || item))
    .filter(Boolean)
    .map(slug => `  <url><loc>${siteUrl()}/products/${slug}.html</loc><changefreq>weekly</changefreq><priority>0.90</priority></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } });
}
