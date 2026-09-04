import { notFound } from 'next/navigation';
import { getPage } from '../lib/static-pages';

export const revalidate = 3600;
export const dynamic = 'force-static';

export async function generateMetadata() {
  const page = getPage('index.html');
  return page?.metadata || { title: 'BestPackFactory' };
}

export default function HomePage() {
  const page = getPage('index.html');
  if (!page) notFound();
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/assets/hero/mobile-products/slide-01-products-720.webp"
        imagesizes="(max-width: 980px) 100vw, 800px"
        imagesrcset="/assets/hero/mobile-products/slide-01-products-480.webp 480w, /assets/hero/mobile-products/slide-01-products-720.webp 720w, /assets/hero/mobile-products/slide-01-products-900.webp 900w"
        media="(max-width: 980px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/assets/hero/slide-01-one-stop-scene-1600.webp"
        imagesizes="100vw"
        imagesrcset="/assets/hero/slide-01-one-stop-scene-720.webp 720w, /assets/hero/slide-01-one-stop-scene-1080.webp 1080w, /assets/hero/slide-01-one-stop-scene-1600.webp 1600w"
        media="(min-width: 981px)"
        fetchPriority="high"
      />
      <div dangerouslySetInnerHTML={{ __html: page.body }} suppressHydrationWarning={true} />
      {page.jsonLd.map((json, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      ))}
    </>
  );
}
