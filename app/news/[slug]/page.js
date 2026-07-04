import { notFound } from 'next/navigation';
import { getContentPageBySlug, listStaticContentSlugs } from '../../../lib/content-pages';
import { cleanContentSlug } from '../../../lib/r2-content';

export const revalidate = 3600;
export const dynamic = 'force-static';
export const dynamicParams = true;

function getSlug(params) {
  return cleanContentSlug(params?.slug || '');
}

export async function generateStaticParams() {
  // Pre-render existing stable news URLs. New R2 news posts can still be generated on demand.
  return listStaticContentSlugs('news').map(slug => ({ slug }));
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const slug = getSlug(resolved);
  const page = await getContentPageBySlug('news', slug);
  return page?.metadata || { title: 'BestPackFactory News' };
}

export default async function NewsPostRoute({ params }) {
  const resolved = await params;
  const slug = getSlug(resolved);
  const page = await getContentPageBySlug('news', slug);
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
