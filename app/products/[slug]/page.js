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

function toAbsoluteAssetPath(src = '') {
  const clean = src.trim().replace(/^(\.\.\/)+/, '');
  if (!clean) return '';
  if (/^assets\//i.test(clean)) return `/${clean}`;
  return clean;
}

// Browsers render the WebP from <picture><source>, so preloading the JPG
// fallback from <img src> downloads an image that is never painted.
function getPrimaryProductImage(body = '') {
  const picturePattern = /<picture\b[^>]*>([\s\S]*?)<\/picture>/gi;
  for (const pic of body.matchAll(picturePattern)) {
    const sourceMatch = pic[1].match(/<source\b[^>]*\bsrcset=(['"])(.*?)\1[^>]*>/i);
    const imgMatch = pic[1].match(/<img\b[^>]*\bsrc=(['"])(.*?)\1/i);
    const imgSrc = imgMatch ? imgMatch[2] : '';
    if (/(?:^|\/)logo(?:\/|[-_.])/i.test(imgSrc)) continue;
    if (sourceMatch) {
      const sizesMatch = pic[1].match(/<source\b[^>]*\bsizes=(['"])(.*?)\1/i);
      const entries = sourceMatch[2].split(',').map(entry => {
        const [url, descriptor] = entry.trim().split(/\s+/);
        return `${toAbsoluteAssetPath(url)}${descriptor ? ` ${descriptor}` : ''}`;
      });
      const first = entries[0]?.split(/\s+/)[0] || toAbsoluteAssetPath(imgSrc);
      return { href: first, imageSrcSet: entries.join(', '), imageSizes: sizesMatch ? sizesMatch[2] : undefined };
    }
    if (imgSrc) return { href: toAbsoluteAssetPath(imgSrc) };
  }
  const imagePattern = /<img\b[^>]*\bsrc=(['"])(.*?)\1/gi;
  for (const match of body.matchAll(imagePattern)) {
    const src = match[2].trim();
    if (!src || /(?:^|\/)logo(?:\/|[-_.])/i.test(src)) continue;
    return { href: toAbsoluteAssetPath(src) };
  }
  return null;
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
  if (primaryImage) {
    preload(primaryImage.href, {
      as: 'image',
      fetchPriority: 'high',
      imageSrcSet: primaryImage.imageSrcSet,
      imageSizes: primaryImage.imageSizes,
    });
  }
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: page.body }} suppressHydrationWarning={true} />
      {page.jsonLd.map((json, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      ))}
    </>
  );
}
