import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { cleanProductSlug, productTag } from '../../../lib/r2-products';

function normalizePath(path) {
  let p = String(path || '/').trim();
  if (!p.startsWith('/')) p = `/${p}`;
  return p;
}

function tagsFromPayload(payload) {
  const tags = [];
  if (payload.tag) tags.push(payload.tag);
  if (Array.isArray(payload.tags)) tags.push(...payload.tags);
  if (payload.productSlug) {
    const slug = cleanProductSlug(payload.productSlug);
    if (slug) tags.push(productTag(slug), 'products', 'products:index', 'products-search');
  }
  if (payload.path && String(payload.path).startsWith('/products/')) {
    const slug = cleanProductSlug(String(payload.path).replace(/^\/products\//, ''));
    if (slug) tags.push(productTag(slug), 'products', 'products:index', 'products-search');
  }
  return [...new Set(tags.filter(Boolean).map(String))];
}

async function readPayload(request) {
  const url = new URL(request.url);
  const payload = {
    path: url.searchParams.get('path'),
    tag: url.searchParams.get('tag'),
    secret: url.searchParams.get('secret'),
    productSlug: url.searchParams.get('productSlug')
  };
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      Object.assign(payload, body || {});
    } catch {}
  }
  return payload;
}

async function handle(request) {
  const payload = await readPayload(request);
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json({ ok: false, error: 'REVALIDATE_SECRET is not configured on Vercel.' }, { status: 500 });
  }
  if (payload.secret !== expected) {
    return NextResponse.json({ ok: false, error: 'Invalid revalidation secret' }, { status: 401 });
  }

  const revalidated = { paths: [], tags: [] };
  if (payload.path) {
    const path = normalizePath(payload.path);
    revalidatePath(path);
    revalidated.paths.push(path);
    if (path.startsWith('/products/')) {
      revalidatePath('/api/products-search');
      revalidatePath('/r2-products-sitemap.xml');
      revalidated.paths.push('/api/products-search', '/r2-products-sitemap.xml');
    }
  }
  for (const tag of tagsFromPayload(payload)) {
    revalidateTag(tag);
    revalidated.tags.push(tag);
  }
  if (!revalidated.paths.length && !revalidated.tags.length) {
    revalidateTag('products');
    revalidateTag('products:index');
    revalidateTag('products-search');
    revalidatePath('/api/products-search');
    revalidatePath('/r2-products-sitemap.xml');
    revalidated.tags.push('products', 'products:index', 'products-search');
    revalidated.paths.push('/api/products-search', '/r2-products-sitemap.xml');
  }

  return NextResponse.json({ ok: true, revalidated, at: new Date().toISOString() });
}

export async function GET(request) {
  return handle(request);
}

export async function POST(request) {
  return handle(request);
}
