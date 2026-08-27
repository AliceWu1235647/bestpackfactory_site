import { buildImageSitemap } from '../../lib/image-sitemap';

export const revalidate = 86400;

export async function GET() {
  return new Response(buildImageSitemap(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800'
    }
  });
}
