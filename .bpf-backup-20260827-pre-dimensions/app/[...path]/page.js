import { notFound } from 'next/navigation';
import { getPage, listHtmlRoutes, readHtml, langAlternatesFromRoute, localizedAlternates } from '../../lib/static-pages';
import BlogIndex from '../BlogIndex';

export const revalidate = 3600;
export const dynamic = 'force-static';
export const dynamicParams = true;

export async function generateStaticParams() {
  // Pre-render stable non-product static SEO pages, including industry/material/finish/factory hubs.
  // Product, blog and news detail pages are handled by their own ISR routes.
  return listHtmlRoutes()
    .filter(route => route !== 'index.html')
    .filter(route => route !== 'contact.html')
    .filter(route => !route.startsWith('products/'))
    .filter(route => !route.startsWith('blog/'))
    .filter(route => !route.startsWith('news/'))
    .map(route => ({ path: route.split('/') }));
}


function routeFromParams(params) {
  const value = params?.path || [];
  return Array.isArray(value) ? value.join('/') : String(value || '');
}

const LANG_RE = /^(de|fr|es|ja|ar)\//;
const LANG_DIR = { de: 'ltr', fr: 'ltr', es: 'ltr', ja: 'ltr', ar: 'rtl' };

export async function generateMetadata({ params }) {
  const resolved = await params;
  const route = routeFromParams(resolved);
  // Localized pages render the full HTML file (with own lang/dir/canonical/hreflang),
  // so suppress Next metadata to avoid duplicate <head> output.
  if (LANG_RE.test(route)) {
    const full = readHtml(route);
    if (!full) return {};
    const t = full.match(/<title>([\s\S]*?)<\/title>/i);
    const d = full.match(/<meta[^>]*content="([^"]*)"[^>]*name="description"/i) || full.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
    return {
      title: t ? t[1].trim() : undefined,
      description: d ? d[1] : undefined,
      alternates: localizedAlternates(route)
    };
  }
  const page = getPage(route);
  const base = page?.metadata || { title: 'BestPackFactory' };
  return {
    ...base,
    alternates: {
      ...(base.alternates || {}),
      languages: langAlternatesFromRoute(route)
    }
  };
}

export default async function StaticHtmlRoute({ params }) {
  const resolved = await params;
  const route = routeFromParams(resolved);
  if (route === 'blog.html') return <BlogIndex />;
  const page = getPage(route);
  if (!page) notFound();
  // For localized pages, inject a client-side fix for <html lang/dir>.
  // The Next.js root layout hard-codes lang="en" dir="ltr"; middleware-set
  // request headers are not visible to the layout's headers(), so we set the
  // document attributes from the page component (runs before paint).
  let langFix = null;
  if (LANG_RE.test(route)) {
    const lang = route.split('/')[0];
    const dir = LANG_DIR[lang] || 'ltr';
    langFix = (
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
  return (
    <>
      {langFix}
      <div dangerouslySetInnerHTML={{ __html: page.body }} suppressHydrationWarning={true} />
      {page.jsonLd.map((json, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      ))}
    </>
  );
}
