import fs from 'fs';
import path from 'path';

const CONTENT_ROOT = path.join(process.cwd(), 'content-site');
const SITE_URL = 'https://www.bestpackfactory.com';

// content-site/<code>/ holds the translated mirrors of a subset of the English
// pages. assets/, css/, js/ and the other asset folders are not locales.
export const LOCALES = ['ar', 'de', 'es', 'fr', 'ja'];

// Native language label, used by the locale switcher injected into every
// translated page and its English source.
export const LOCALE_LABELS = {
  en: 'English',
  ar: 'العربية',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  ja: '日本語'
};

let translatedPathCache = null;

/**
 * Relative paths (e.g. `products/coffee-bags.html`) that exist in English AND in
 * every locale directory. Derived from disk so adding a translation is enough to
 * put it into the hreflang cluster, the sitemap and the locale switcher.
 */
export function translatedPaths() {
  if (translatedPathCache) return translatedPathCache;
  const base = path.join(CONTENT_ROOT, LOCALES[0]);
  const found = [];
  if (fs.existsSync(base)) {
    (function walk(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const absolute = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(absolute);
        else if (entry.name.endsWith('.html')) {
          found.push(path.relative(base, absolute).replace(/\\/g, '/'));
        }
      }
    })(base);
  }
  translatedPathCache = found
    .filter(rel => fs.existsSync(path.join(CONTENT_ROOT, rel)))
    .filter(rel => LOCALES.every(code => fs.existsSync(path.join(CONTENT_ROOT, code, rel))))
    .sort();
  return translatedPathCache;
}

// Next.js hands catch-all params in as a segment array, and links arrive
// percent-encoded, so normalise both shapes before matching against disk paths.
function normalizeRoute(route = '') {
  const raw = Array.isArray(route) ? route.join('/') : String(route || '');
  let clean = raw;
  try { clean = decodeURIComponent(raw); } catch { /* keep raw when malformed */ }
  return clean.replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
}

/** `ar/products.html` -> { locale: 'ar', rel: 'products.html' }; English -> locale 'en'. */
export function splitLocaleRoute(route = '') {
  const clean = normalizeRoute(route);
  const [first, ...rest] = clean.split('/');
  if (LOCALES.includes(first)) {
    return { locale: first, rel: rest.join('/') || 'index.html' };
  }
  return { locale: 'en', rel: clean || 'index.html' };
}

/** Public URL for a translated path in a given locale, matching live URL shape. */
export function localeUrl(locale, rel) {
  const isRoot = locale === 'en';
  const prefix = isRoot ? '' : `/${locale}`;
  if (rel === 'index.html') return `${SITE_URL}${prefix || '/'}`;
  return `${SITE_URL}${prefix}/${rel}`;
}

/** Same as localeUrl but site-relative, for in-page links. */
export function localeHref(locale, rel) {
  return localeUrl(locale, rel).slice(SITE_URL.length) || '/';
}

/**
 * Next.js `alternates.languages` map for a route, or undefined when the route
 * has no translations. English is the x-default.
 */
export function hreflangFor(route = '') {
  const { locale, rel } = splitLocaleRoute(route);
  if (!translatedPaths().includes(rel)) return undefined;
  const languages = { en: localeUrl('en', rel) };
  for (const code of LOCALES) languages[code] = localeUrl(code, rel);
  languages['x-default'] = localeUrl('en', rel);
  return { languages, self: localeUrl(locale, rel) };
}

/**
 * Crawlable locale switcher for a route in the translated cluster, or '' when the
 * route has no translations.
 *
 * hreflang tags in <head> tell a crawler the translations exist, but nothing on the
 * site linked to them, so all 110 locale pages sat with zero internal in-degree.
 * These are real anchors in the served body — every page in the cluster links to
 * its five siblings, which is both the crawl path and the human-facing control.
 */
export function localeSwitcherHtml(route = '') {
  const { locale: current, rel } = splitLocaleRoute(route);
  if (!translatedPaths().includes(rel)) return '';
  const items = ['en', ...LOCALES].map(code => {
    const active = code === current;
    return `<li><a href="${localeHref(code, rel)}" hreflang="${code}" lang="${code}"` +
      `${active ? ' aria-current="page"' : ''}>${LOCALE_LABELS[code]}</a></li>`;
  }).join('');
  return '<nav class="locale-switcher" aria-label="Language">' +
    '<span class="locale-switcher-label">Language</span>' +
    `<ul>${items}</ul></nav>`;
}
