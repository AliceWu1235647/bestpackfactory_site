import { NextResponse } from 'next/server';

const LANG_PREFIXES = new Set(['ar', 'de', 'es', 'fr', 'ja']);

export function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const segment = pathname.split('/')[1] || '';
  const lang = LANG_PREFIXES.has(segment) ? segment : 'en';
  const response = NextResponse.next();
  response.headers.set('x-lang', lang);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|assets|css|js|api).*)'],
};
