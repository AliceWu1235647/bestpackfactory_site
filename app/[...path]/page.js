import { notFound } from 'next/navigation';
import {
  getPage,
  listHtmlRoutes,
  normalizeArticleJsonLd,
  normalizePageEntityJsonLd,
  normalizeProductJsonLd,
} from '../../lib/static-pages';
import BlogIndex from '../BlogIndex';
import { injectCommercialAuthorityHub } from '../../lib/commercial-authority-hubs';

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

export async function generateMetadata({ params }) {
  const resolved = await params;
  const route = routeFromParams(resolved);
  const page = getPage(route);
  return page?.metadata || { title: 'BestPackFactory' };
}

export default async function StaticHtmlRoute({ params }) {
  const resolved = await params;
  const route = routeFromParams(resolved);
  if (route === 'blog.html') return <BlogIndex />;
  const page = getPage(route);
  if (!page) notFound();
  const body = injectCommercialAuthorityHub(page.body, route);
  const articleJsonLd = normalizeArticleJsonLd(page.jsonLd, page.metadata);
  const productJsonLd = normalizeProductJsonLd(articleJsonLd, body, page.metadata);
  const jsonLd = normalizePageEntityJsonLd(productJsonLd, page.metadata);
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: body }} suppressHydrationWarning={true} />
      {jsonLd.map((json, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      ))}
    </>
  );
}
