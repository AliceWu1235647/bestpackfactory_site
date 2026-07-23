import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const file = path.join(process.cwd(), 'public', 'robots.txt');
  const body = fs.readFileSync(file, 'utf8');
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
