import fs from 'fs';
import path from 'path';
import { getPage, listHtmlRoutes } from './static-pages';
import { cleanContentSlug, getR2Content, pageFromContent } from './r2-content';

function normalizeType(type = '') {
  const t = String(type || '').toLowerCase().trim();
  return t === 'blog' || t === 'news' ? t : null;
}

export function listStaticContentSlugs(type) {
  const t = normalizeType(type);
  if (!t) return [];
  return listHtmlRoutes()
    .filter(route => route.startsWith(`${t}/`) && route.endsWith('.html'))
    .map(route => route.replace(new RegExp(`^${t}/`), ''))
    .sort();
}

function localSeedPath(type, slug) {
  const t = normalizeType(type);
  if (!t) return null;
  return path.join(process.cwd(), 'r2-seed', t, `${cleanContentSlug(slug)}.json`);
}

async function getLocalSeedContent(type, slug) {
  const file = localSeedPath(type, slug);
  try {
    if (!file || !fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.error('[R2 seed] invalid content JSON:', file, error?.message || error);
    return null;
  }
}

export async function getContentPageBySlug(type, slug) {
  const t = normalizeType(type);
  const clean = cleanContentSlug(slug);
  if (!t || !clean) return null;

  const r2Content = await getR2Content(t, clean);
  if (r2Content) return pageFromContent(r2Content, t, clean);

  // Optional local seed fallback is useful in local development before uploading JSON to R2.
  if (process.env.USE_LOCAL_R2_SEED === 'true') {
    const seedContent = await getLocalSeedContent(t, clean);
    if (seedContent) return pageFromContent(seedContent, t, clean);
  }

  return getPage(`${t}/${clean}.html`);
}
