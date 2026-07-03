import { NextResponse } from 'next/server';
import { getR2ProductIndex, r2Enabled } from '../../../lib/r2-products';
import { getR2ContentIndex, r2ContentEnabled } from '../../../lib/r2-content';

export const dynamic = 'force-dynamic';

function countIndex(index, key) {
  if (Array.isArray(index)) return index.length;
  if (Array.isArray(index?.[key])) return index[key].length;
  if (Array.isArray(index?.items)) return index.items.length;
  return null;
}

export async function GET() {
  const enabled = r2Enabled() || r2ContentEnabled();
  const productIndex = r2Enabled() ? await getR2ProductIndex() : null;
  const blogIndex = r2ContentEnabled() ? await getR2ContentIndex('blog') : null;
  const newsIndex = r2ContentEnabled() ? await getR2ContentIndex('news') : null;
  return NextResponse.json({
    ok: enabled ? Boolean(productIndex || blogIndex || newsIndex) : false,
    r2Enabled: enabled,
    products: { hasIndex: Boolean(productIndex), count: countIndex(productIndex, 'products') },
    blog: { hasIndex: Boolean(blogIndex), count: countIndex(blogIndex, 'posts') },
    news: { hasIndex: Boolean(newsIndex), count: countIndex(newsIndex, 'news') },
    expectedEnv: ['R2_PUBLIC_BASE_URL', 'REVALIDATE_SECRET'],
    optionalEnv: [
      'R2_PRODUCT_JSON_PREFIX', 'R2_PRODUCT_INDEX_PATH', 'R2_PRODUCT_REVALIDATE_SECONDS',
      'R2_BLOG_JSON_PREFIX', 'R2_BLOG_INDEX_PATH', 'R2_NEWS_JSON_PREFIX', 'R2_NEWS_INDEX_PATH', 'R2_CONTENT_REVALIDATE_SECONDS',
      'NEXT_PUBLIC_SITE_URL'
    ]
  });
}
