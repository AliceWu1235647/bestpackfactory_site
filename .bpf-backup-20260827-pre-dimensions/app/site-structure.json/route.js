import { NextResponse } from 'next/server';
import { HYBRID_SITE_STRUCTURE } from '../../lib/site-structure';

export const revalidate = 3600;

export async function GET() {
  return NextResponse.json(HYBRID_SITE_STRUCTURE, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' }
  });
}
