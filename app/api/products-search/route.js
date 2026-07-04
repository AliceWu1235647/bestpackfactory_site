import { NextResponse } from 'next/server';
import { getR2ProductIndex, cleanProductSlug, productRevalidateSeconds } from '../../../lib/r2-products';
import { getStaticProductSearchIndex, mergeProductSearchIndexes, normalizeSearchProduct } from '../../../lib/product-search-index';

export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const staticProducts = getStaticProductSearchIndex();
  let r2Products = [];
  let r2Enabled = false;

  try {
    const r2Index = await getR2ProductIndex();
    r2Enabled = Boolean(r2Index);
    const list = Array.isArray(r2Index)
      ? r2Index
      : Array.isArray(r2Index?.products)
        ? r2Index.products
        : Array.isArray(r2Index?.items)
          ? r2Index.items
          : [];
    r2Products = list.map((item) => normalizeSearchProduct(item, cleanProductSlug(item.slug || item.url || item.path || item.id || item.title)));
  } catch (error) {
    console.error('[products-search] R2 index failed:', error?.message || error);
  }

  const products = mergeProductSearchIndexes(staticProducts, r2Products);

  return NextResponse.json({
    ok: true,
    source: r2Enabled ? 'static+r2' : 'static',
    revalidate: productRevalidateSeconds(),
    count: products.length,
    products
  }, {
    headers: {
      'Cache-Control': `public, s-maxage=${productRevalidateSeconds()}, stale-while-revalidate=86400`
    }
  });
}
