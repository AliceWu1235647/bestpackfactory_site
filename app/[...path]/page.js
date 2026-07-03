import { notFound } from 'next/navigation';
import { getPage } from '../../lib/static-pages';

export const revalidate = 3600;
export const dynamic = 'force-static';
export const dynamicParams = true;

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
  const page = getPage(route);
  if (!page) notFound();
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: page.body }} suppressHydrationWarning={true} />
      {page.jsonLd.map((json, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      ))}
    </>
  );
}
