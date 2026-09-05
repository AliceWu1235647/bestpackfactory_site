import { NextResponse } from 'next/server';

const LOCALE_MAP = { ar: 'ar', de: 'de', es: 'es', fr: 'fr', ja: 'ja' };
const LOCALE_ROOT_RE = /^\/(ar|de|es|fr|ja)\/?$/;

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname !== '/' &&
    !/\.\w+$/.test(pathname) &&
    !pathname.startsWith('/_next/') &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/assets/') &&
    !pathname.startsWith('/css/') &&
    !pathname.startsWith('/js/') &&
    !pathname.startsWith('/fonts/') &&
    !pathname.startsWith('/dielines') &&
    !LOCALE_ROOT_RE.test(pathname)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `${pathname}.html`;
    return NextResponse.redirect(url, 308);
  }

  const firstSegment = pathname.split('/')[1];
  const locale = LOCALE_MAP[firstSegment];
  if (locale) {
    const response = NextResponse.next();
    response.headers.set('Content-Language', locale);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|assets|css|js|fonts|favicon).*)'],
};
