import { NextResponse } from 'next/server';
import { getR2ProductIndex, r2Enabled } from '../../../lib/r2-products';

export const dynamic = 'force-dynamic';

export async function GET() {
  const enabled = r2Enabled();
  const index = enabled ? await getR2ProductIndex() : null;
  return NextResponse.json({
    ok: enabled ? Boolean(index) : false,
    r2Enabled: enabled,
    hasProductIndex: Boolean(index),
    count: Array.isArray(index?.products) ? index.products.length : Array.isArray(index) ? index.length : null,
    expectedEnv: ['R2_PUBLIC_BASE_URL', 'REVALIDATE_SECRET'],
    optionalEnv: ['R2_PRODUCT_JSON_PREFIX', 'R2_PRODUCT_INDEX_PATH', 'R2_PRODUCT_REVALIDATE_SECONDS', 'NEXT_PUBLIC_SITE_URL']
  });
}
