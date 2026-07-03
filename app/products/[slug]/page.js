import { notFound } from 'next/navigation';
import { getProductPageBySlug, listStaticProductSlugs } from '../../../lib/product-pages';
import { cleanProductSlug, productTag } from '../../../lib/r2-products';

export const revalidate = 3600;
export const dynamic = 'force-static';
export const dynamicParams = true;

function getSlug(params) {
  return cleanProductSlug(params?.slug || '');
}

export async function generateStaticParams() {
  // Pre-render existing stable product URLs. New R2 products can still be generated on demand.
  return listStaticProductSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const slug = getSlug(resolved);
  const page = await getProductPageBySlug(slug);
  return page?.metadata || { title: 'BestPackFactory Product' };
}

export default async function ProductRoute({ params }) {
  const resolved = await params;
  const slug = getSlug(resolved);
  const page = await getProductPageBySlug(slug);
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
