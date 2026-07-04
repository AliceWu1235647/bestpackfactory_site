import { notFound } from 'next/navigation';
import { getContentPageBySlug, listStaticContentSlugs } from '../../../lib/content-pages';
import { cleanContentSlug, contentTag } from '../../../lib/r2-content';

export const revalidate = 3600;
export const dynamic = 'force-static';
export const dynamicParams = true;

function getSlug(params) {
  return cleanContentSlug(params?.slug || '');
}

export async function generateStaticParams() {
  // Pre-render existing stable blog URLs. New R2 blog posts can still be generated on demand.
  return listStaticContentSlugs('blog').map(slug => ({ slug }));
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const slug = getSlug(resolved);
  const page = await getContentPageBySlug('blog', slug);
  return page?.metadata || { title: 'BestPackFactory Blog' };
}

export default async function BlogPostRoute({ params }) {
  const resolved = await params;
  const slug = getSlug(resolved);
  const page = await getContentPageBySlug('blog', slug);
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
