import { NextResponse } from 'next/server';

// Tag localized requests so the root layout can set <html lang> and dir correctly.
// IMPORTANT: must set REQUEST headers (NextResponse.next({ request: { headers } }))
// so that headers() in the root layout can read them. Response headers are not
// visible to layout's headers().
const LANG_PREFIX = /^\/(de|fr|es|ja|ar)(\/|$)/;

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const match = pathname.match(LANG_PREFIX);
  if (match) {
    const lang = match[1];
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-bpf-lang', lang);
    requestHeaders.set('x-bpf-dir', dir);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/(de|fr|es|ja|ar)/:path*'],
};
