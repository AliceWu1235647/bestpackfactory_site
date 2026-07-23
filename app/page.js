import { notFound } from 'next/navigation';
import { getPage } from '../lib/static-pages';

// 1. STRENGTHENED ARCHITECTURE: Force-static at build time
export const dynamic = 'force-static';
// 2. STRENGTHENED ARCHITECTURE: ISR update every hour
export const revalidate = 3600;

export async function generateMetadata() {
  const page = getPage('index.html');
  if (!page) return { title: 'BestPackFactory' };
  
  // SEO Fix: Only touch the metadata URL, NOT the body content
  const metadata = page.metadata;
  if (metadata.alternates && metadata.alternates.canonical) {
    metadata.alternates.canonical = metadata.alternates.canonical.replace('https://bestpackfactory.com', 'https://www.bestpackfactory.com');
  }
  return metadata;
}

export default function HomePage() {
  const page = getPage('index.html');
  if (!page) notFound();
  return (
    <>
      <link rel="preload" as="image" href="/assets/hero/slide-01-mobile.avif" type="image/avif" media="(max-width: 980px)" fetchPriority="high" />
      <link rel="preload" as="image" href="/assets/hero/mobile-products/slide-01-products.avif" type="image/avif" media="(max-width: 980px)" fetchPriority="high" />
      <link
        rel="preload"
        as="image"
        href="/assets/hero/slide-01-one-stop-scene.avif"
        type="image/avif"
        imageSrcSet="/assets/hero/slide-01-one-stop-scene-640.avif 640w, /assets/hero/slide-01-one-stop-scene.avif 1600w"
        imageSizes="100vw"
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
