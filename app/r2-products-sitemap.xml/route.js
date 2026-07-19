import { getR2ProductIndex } from '../../lib/r2-products';
import { listStaticProductSlugs } from '../../lib/product-pages';
import { SITE_URL } from '../../lib/seo-utils';

export const revalidate = 3600;

function siteUrl() {
  return SITE_URL;
}

function cleanSlug(value = '') {
  return String(value || '').replace(/^products\//, '').replace(/\.json$/, '').replace(/\.html$/, '').replace(/^\/+|\/+$/g, '');
}

export async function GET() {
  const index = await getR2ProductIndex();
  const products = Array.isArray(index?.products) ? index.products : Array.isArray(index) ? index : [];
  const slugs = products
    .map(item => cleanSlug(item.slug || item.url || item.json || item))
    .filter(Boolean)
    .concat(listStaticProductSlugs().map(cleanSlug));
  const urls = [...new Set(slugs)]
    .filter(Boolean)
    .sort()
    .map(slug => `  <url><loc>${siteUrl()}/products/${slug}.html</loc><changefreq>weekly</changefreq><priority>0.90</priority></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } });
}
