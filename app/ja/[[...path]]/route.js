import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// Localized pages are served as their complete static HTML files (own lang/dir/
// canonical/hreflang), bypassing the root layout which hard-codes lang="en".
const CONTENT_ROOT = path.join(process.cwd(), 'content-site', 'ja');
export const dynamic = 'force-static';
export const dynamicParams = true;

export async function generateStaticParams() {
  const files = [];
  const walk = (dir, prefix) => {
    for (const name of fs.readdirSync(dir)) {
      const abs = path.join(dir, name);
      const st = fs.statSync(abs);
      if (st.isDirectory()) walk(abs, prefix ? prefix + '/' + name : name);
      else if (name.endsWith('.html')) {
        const rel = prefix ? prefix + '/' + name : name;
        files.push({ path: rel === 'index.html' ? [] : rel.split('/') });
      }
    }
  };
  if (fs.existsSync(CONTENT_ROOT)) walk(CONTENT_ROOT, '');
  return files;
}

export async function GET(_req, { params }) {
  const resolved = await params;
  let segments = resolved?.path || [];
  if (!Array.isArray(segments)) segments = [segments];
  let rel = segments.join('/');
  if (!rel) rel = 'index.html';
  if (!rel.endsWith('.html')) rel = rel + '.html';
  const normalized = path.normalize(rel).replace(/^\.\.[/\\\\]+/, '');
  const abs = path.join(CONTENT_ROOT, normalized);
  if (!abs.startsWith(CONTENT_ROOT)) return new NextResponse('Not Found', { status: 404 });
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) return new NextResponse('Not Found', { status: 404 });
  const html = fs.readFileSync(abs, 'utf8');
  return new NextResponse(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, s-maxage=86400, stale-while-revalidate=604800'
    }
  });
}
