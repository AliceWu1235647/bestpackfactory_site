import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { cleanProductSlug, productTag } from '../../../lib/r2-products';
import { cleanContentSlug, contentTag, contentIndexTag } from '../../../lib/r2-content';

function normalizePath(path) {
  let p = String(path || '/').trim();
  if (!p.startsWith('/')) p = `/${p}`;
  return p;
}

function contentTags(type, slug) {
  const clean = cleanContentSlug(slug);
  if (!clean) return [];
  return [contentTag(type, clean), type, contentIndexTag(type), 'content', 'content:index'];
}

function tagsFromPayload(payload) {
  const tags = [];
  if (payload.tag) tags.push(payload.tag);
  if (Array.isArray(payload.tags)) tags.push(...payload.tags);

  if (payload.productSlug) {
    const slug = cleanProductSlug(payload.productSlug);
    if (slug) tags.push(productTag(slug), 'products', 'products:index', 'products-search');
  }
  if (payload.blogSlug) tags.push(...contentTags('blog', payload.blogSlug));
  if (payload.newsSlug) tags.push(...contentTags('news', payload.newsSlug));

  if (payload.path && String(payload.path).startsWith('/products/')) {
    const slug = cleanProductSlug(String(payload.path).replace(/^\/products\//, ''));
    if (slug) tags.push(productTag(slug), 'products', 'products:index', 'products-search');
  }
  if (payload.path && String(payload.path).startsWith('/blog/')) {
    const slug = cleanContentSlug(String(payload.path).replace(/^\/blog\//, ''));
    if (slug) tags.push(...contentTags('blog', slug));
  }
  if (payload.path && String(payload.path).startsWith('/news/')) {
    const slug = cleanContentSlug(String(payload.path).replace(/^\/news\//, ''));
    if (slug) tags.push(...contentTags('news', slug));
  }
  return [...new Set(tags.filter(Boolean).map(String))];
}

async function readPayload(request) {
  const url = new URL(request.url);
  const payload = {
    path: url.searchParams.get('path'),
    tag: url.searchParams.get('tag'),
    secret: url.searchParams.get('secret'),
    productSlug: url.searchParams.get('productSlug'),
    blogSlug: url.searchParams.get('blogSlug'),
    newsSlug: url.searchParams.get('newsSlug')
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
    if (path.startsWith('/blog/')) {
      revalidatePath('/blog.html');
      revalidatePath('/r2-blog-sitemap.xml');
      revalidated.paths.push('/blog.html', '/r2-blog-sitemap.xml');
    }
    if (path.startsWith('/news/')) {
      revalidatePath('/news.html');
      revalidatePath('/r2-news-sitemap.xml');
      revalidated.paths.push('/news.html', '/r2-news-sitemap.xml');
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
    revalidateTag('content');
    revalidateTag('content:index');
    revalidateTag(contentIndexTag('blog'));
    revalidateTag(contentIndexTag('news'));
    revalidatePath('/api/products-search');
    revalidatePath('/r2-products-sitemap.xml');
    revalidatePath('/r2-blog-sitemap.xml');
    revalidatePath('/r2-news-sitemap.xml');
    revalidated.tags.push('products', 'products:index', 'products-search', 'content', 'content:index', contentIndexTag('blog'), contentIndexTag('news'));
    revalidated.paths.push('/api/products-search', '/r2-products-sitemap.xml', '/r2-blog-sitemap.xml', '/r2-news-sitemap.xml');
  }

  return NextResponse.json({ ok: true, revalidated, at: new Date().toISOString() });
}

export async function GET(request) {
  return handle(request);
}

export async function POST(request) {
  return handle(request);
}
