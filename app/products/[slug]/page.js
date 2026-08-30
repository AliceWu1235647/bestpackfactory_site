import { notFound } from 'next/navigation';
import { preload } from 'react-dom';
import { getProductPageBySlug, listStaticProductSlugs } from '../../../lib/product-pages';
import { cleanProductSlug, productTag } from '../../../lib/r2-products';

export const revalidate = 3600;
export const dynamic = 'force-static';
export const dynamicParams = true;

function getSlug(params) {
  return cleanProductSlug(params?.slug || '');
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
