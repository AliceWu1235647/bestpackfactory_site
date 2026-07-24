import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const file = path.join(process.cwd(), 'public', 'buyer-answer-index.json');
  const body = fs.readFileSync(file, 'utf8');
  return new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
