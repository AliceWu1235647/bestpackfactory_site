import { notFound } from 'next/navigation';
import { preload } from 'react-dom';
import { getPage, langAlternatesFromRoute, localizedAlternates } from '../../../lib/static-pages';
import { getProductPageBySlug, listStaticProductSlugs } from '../../../lib/product-pages';
import { cleanProductSlug, productTag } from '../../../lib/r2-products';

export const revalidate = 3600;
export const dynamic = 'force-static';
export const dynamicParams = true;

const LANG_PREFIX = /^(de|fr|es|ja|ar)\/[a-z0-9-]+\.html$/;
const LANG_DIR = { de: 'ltr', fr: 'ltr', es: 'ltr', ja: 'ltr', ar: 'rtl' };

function langFixScript(lang) {
  const dir = LANG_DIR[lang] || 'ltr';
  return (
    <script
      dangerouslySetInnerHTML={{
        __html:
          'document.documentElement.setAttribute("lang",' +
          JSON.stringify(lang) +
          ');document.documentElement.setAttribute("dir",' +
          JSON.stringify(dir) +
          ');'
      }}
    />
  );
}

function getSlug(params) {
  const raw = params?.slug || '';
  // Localized product pages live under /{lang}/products/{slug}.html in content-site.
  // Next matches them through this route with slug = "{lang}/products/{slug}".
  // Return the raw multi-segment path so getPage() can resolve the localized file.
  if (/^(de|fr|es|ja|ar)\/products\//.test(raw)) return raw;
  return cleanProductSlug(raw);
}

function getPrimaryProductImage(body = '') {
  const imagePattern = /<img\b[^>]*\bsrc=(['"])(.*?)\1/gi;
  for (const match of body.matchAll(imagePattern)) {
    const src = match[2].trim();
    if (!src || /(?:^|\/)logo(?:\/|[-_.])/i.test(src)) continue;
    if (/^assets\//i.test(src)) return `/${src}`;
    return src;
  }
  return '';
}

export async function generateStaticParams() {
  // Pre-render existing stable product URLs. New R2 products can still be generated on demand.
  return listStaticProductSlugs().map(slug => ({ slug }));
}

function isLocalizedSlug(slug) {
  return /^(de|fr|es|ja|ar)\/products\//.test(slug);
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const slug = getSlug(resolved);
  if (isLocalizedSlug(slug)) {
    const page = getPage(slug + '.html');
    const base = page?.metadata || { title: 'BestPackFactory Product' };
    return {
      ...base,
      alternates: {
        ...(base.alternates || {}),
        languages: localizedAlternates(slug + '.html').languages
      }
    };
  }
  const page = await getProductPageBySlug(slug);
  const base = page?.metadata || { title: 'BestPackFactory Product' };
  const cleanSlug = cleanProductSlug(resolved?.slug || '').replace(/\.html$/, '');
  return {
    ...base,
    alternates: {
      ...(base.alternates || {}),
      languages: langAlternatesFromRoute(`products/${cleanSlug}.html`)
    }
  };
}

export default async function ProductRoute({ params }) {
  const resolved = await params;
  const slug = getSlug(resolved);
  if (isLocalizedSlug(slug)) {
    const page = getPage(slug + '.html');
    if (!page) notFound();
    const lang = slug.split('/')[0];
    return (
      <>
        {langFixScript(lang)}
        <div dangerouslySetInnerHTML={{ __html: page.body }} suppressHydrationWarning={true} />
        {page.jsonLd.map((json, index) => (
          <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
        ))}
      </>
    );
  }
  const page = await getProductPageBySlug(slug);
  if (!page) notFound();
  const primaryImage = getPrimaryProductImage(page.body);
  if (primaryImage) preload(primaryImage, { as: 'image', fetchPriority: 'high' });
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: page.body }} suppressHydrationWarning={true} />
      {page.jsonLd.map((json, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      ))}
    </>
  );
}
