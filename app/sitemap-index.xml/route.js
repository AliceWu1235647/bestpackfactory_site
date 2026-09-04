import fs from 'fs';
import path from 'path';
import { siteUrl } from '../../lib/site-structure';
import { createSitemapIndexXml, latestXmlLastmod, REQUIRED_SITEMAPS } from '../../lib/sitemap-index';

export const revalidate = 3600;

export async function GET() {
  const base = siteUrl();
  const staticSitemap = fs.readFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), 'utf8');
  const lastmod = latestXmlLastmod(staticSitemap);
  const xml = createSitemapIndexXml({ base, paths: REQUIRED_SITEMAPS, lastmod });
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
