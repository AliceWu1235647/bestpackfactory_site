export const SITE_URL = 'https://www.bestpackfactory.com';

export function siteUrl(path = '') {
  const cleanPath = String(path || '');
  if (!cleanPath) return SITE_URL;
  return `${SITE_URL}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
}

export function forceWww(value = '') {
  return String(value || '').replace(/https:\/\/bestpackfactory\.com/gi, SITE_URL);
}

export function stripHtml(value = '') {
  return String(value || '')
    .replace(/&lt;\s*a\b[^&]*(?:&gt;)?/gi, '')
    .replace(/&lt;\s*\/\s*a\s*&gt;/gi, '')
    .replace(/<\s*a\b[^>]*>/gi, '')
    .replace(/<\s*\/\s*a\s*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export function safeJsonLd(value) {
  if (!value) return null;
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return JSON.stringify(JSON.parse(forceWww(JSON.stringify(parsed))));
  } catch {
    return null;
  }
}

export function absoluteImageUrl(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) return forceWww(raw);
  if (raw.startsWith('/')) return siteUrl(raw);
  return siteUrl(`/${raw.replace(/^\.?\//, '')}`);
}

export function canonicalForRoute(routePath = '') {
  const clean = String(routePath || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/^index\.html$/, '')
    .replace(/\/index\.html$/, '/');
  return clean ? siteUrl(`/${clean}`) : `${SITE_URL}/`;
}

