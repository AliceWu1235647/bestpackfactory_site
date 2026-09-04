import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { getStaticProductSearchIndex, mergeProductSearchIndexes, normalizeSearchProduct } from '../../../lib/product-search-index';
import { getR2ProductIndex, cleanProductSlug } from '../../../lib/r2-products';
import { getR2ContentIndex, cleanContentSlug } from '../../../lib/r2-content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ROOT = path.join(process.cwd(), 'content-site');
let staticPageCache;

function norm(value = '') { return String(value || '').toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim(); }
function safeLimit(value, fallback, maximum) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), maximum) : fallback;
}
function strip(html = '') { return String(html).replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
function match(html, re) { const m = html.match(re); return m ? m[1].replace(/\s+/g, ' ').trim() : ''; }
function meta(html) { return match(html, /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) || match(html, /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i); }
function title(html, fallback) { return match(html, /<title[^>]*>([\s\S]*?)<\/title>/i) || fallback; }
function walk(dir, files = []) { for (const name of fs.readdirSync(dir)) { const abs = path.join(dir, name); const st = fs.statSync(abs); if (st.isDirectory()) walk(abs, files); else if (name.endsWith('.html')) files.push(abs); } return files; }

function staticPages() {
  if (staticPageCache) return staticPageCache;
  staticPageCache = walk(ROOT).map(file => {
    const html = fs.readFileSync(file, 'utf8');
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const url = rel === 'index.html' ? '/' : `/${rel}`;
    return { type: rel.startsWith('products/') ? 'product' : rel.startsWith('blog/') ? 'blog' : rel.startsWith('news/') ? 'news' : 'page', title: title(html, rel), description: meta(html), url, text: strip(html).slice(0, 2500) };
  });
  return staticPageCache;
}

function score(item, q) {
  const hay = norm([item.title, item.description, item.url, item.keywords, item.text].join(' '));
  if (!q) return 1;
  let s = 0;
  if (norm(item.title).includes(q)) s += 100;
  if (hay.includes(q)) s += 60;
  const words = q.split(' ').filter(Boolean);
  if (words.length && words.every(w => hay.includes(w))) s += 30;
  for (const w of words) if (hay.includes(w)) s += 5;
  return s;
}

export async function GET(request) {
  const url = new URL(request.url);
  const q = norm(url.searchParams.get('q') || '').slice(0, 200);
  const limit = safeLimit(url.searchParams.get('limit'), 20, 50);
  const products = getStaticProductSearchIndex().map(p => ({ ...normalizeSearchProduct(p, cleanProductSlug(p.slug || p.url || p.title)), type: 'product' }));
  let r2Products = [];
  let r2Content = [];
  try {
    const idx = await getR2ProductIndex();
    const list = Array.isArray(idx?.products) ? idx.products : Array.isArray(idx?.items) ? idx.items : Array.isArray(idx) ? idx : [];
    r2Products = list.map(p => ({ ...normalizeSearchProduct(p, cleanProductSlug(p.slug || p.url || p.title)), type: 'r2-product' }));
  } catch {}
  for (const type of ['blog', 'news']) {
    try {
      const idx = await getR2ContentIndex(type);
      const list = Array.isArray(idx?.[type === 'blog' ? 'posts' : 'news']) ? idx[type === 'blog' ? 'posts' : 'news'] : Array.isArray(idx?.items) ? idx.items : Array.isArray(idx) ? idx : [];
      r2Content.push(...list.map(item => {
        const slug = cleanContentSlug(item.slug || item.url || item.path || item.title);
        return { type: `r2-${type}`, title: item.title || slug, description: item.description || item.metaDescription || '', url: `/${type}/${slug}.html`, keywords: Array.isArray(item.keywords) ? item.keywords.join(' ') : item.keywords || '' };
      }));
    } catch {}
  }
  const mergedProducts = mergeProductSearchIndexes(products, r2Products).map(p => ({ ...p, type: p.type || 'product' }));
  const all = [...mergedProducts, ...r2Content, ...staticPages()];
  const seen = new Set();
  const results = all
    .map(item => ({ item, score: score(item, q) }))
    .filter(x => !q || x.score > 0)
    .sort((a, b) => b.score - a.score || String(a.item.title).localeCompare(String(b.item.title)))
    .map(x => x.item)
    .filter(item => { const key = item.url || item.title; if (seen.has(key)) return false; seen.add(key); return true; })
    .slice(0, limit);
  return NextResponse.json({ ok: true, q, count: results.length, results }, { headers: { 'Cache-Control': 'no-store' } });
}
