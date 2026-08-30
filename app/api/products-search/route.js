import { NextResponse } from 'next/server';
import { getR2ProductIndex, cleanProductSlug, productRevalidateSeconds } from '../../../lib/r2-products';
import { getStaticProductSearchIndex, mergeProductSearchIndexes, normalizeSearchProduct } from '../../../lib/product-search-index';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function norm(value = '') { return String(value || '').toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim(); }
function safeLimit(value, fallback, maximum) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), maximum) : fallback;
}
function score(product, q) {
  if (!q) return 1;
  const hay = norm([product.title, product.name, product.description, product.desc, product.keywords, product.category, product.slug, product.url, ...(product.tags || [])].join(' '));
  const title = norm(product.title || product.name);
  let value = 0;
  if (title.includes(q)) value += 100;
  if (hay.includes(q)) value += 60;
  const words = q.split(' ').filter(Boolean);
  if (words.length && words.every(w => hay.includes(w))) value += 30;
  for (const w of words) if (hay.includes(w)) value += 5;
  return value;
}

export async function GET(request) {
  const url = new URL(request.url);
  const q = norm(url.searchParams.get('q') || '').slice(0, 200);
  const limit = safeLimit(url.searchParams.get('limit'), 500, 1000);
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
    query: q,
    products: products
      .map(product => ({ product, score: score(product, q) }))
      .filter(item => !q || item.score > 0)
      .sort((a, b) => b.score - a.score || String(a.product.title).localeCompare(String(b.product.title)))
      .slice(0, limit)
      .map(item => item.product)
  }, {
    headers: {
      'Cache-Control': q ? 'no-store' : `public, s-maxage=${productRevalidateSeconds()}, stale-while-revalidate=86400`
    }
  });
}
