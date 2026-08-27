import fs from 'fs';
import path from 'path';
import { getPage, listHtmlRoutes } from './static-pages';
import { cleanProductSlug, getR2Product, pageFromProduct } from './r2-products';

export function listStaticProductSlugs() {
  return listHtmlRoutes()
    .filter(route => route.startsWith('products/') && route.endsWith('.html'))
    .map(route => route.replace(/^products\//, '').replace(/\.html$/, ''))
    .sort();
}

function localSeedPath(slug) {
  return path.join(process.cwd(), 'r2-seed', 'products', `${cleanProductSlug(slug)}.json`);
}

async function getLocalSeedProduct(slug) {
  const file = localSeedPath(slug);
  try {
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.error('[R2 seed] invalid product JSON:', file, error?.message || error);
    return null;
  }
}

export async function getProductPageBySlug(slug) {
  const clean = cleanProductSlug(slug);
  if (!clean) return null;

  const r2Product = await getR2Product(clean);
  if (r2Product) return pageFromProduct(r2Product, clean);

  // Optional local seed fallback is useful in local development before uploading JSON to R2.
  if (process.env.USE_LOCAL_R2_SEED === 'true') {
    const seedProduct = await getLocalSeedProduct(clean);
    if (seedProduct) return pageFromProduct(seedProduct, clean);
  }

  return getPage(`products/${clean}.html`);
}
