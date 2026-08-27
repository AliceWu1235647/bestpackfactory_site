import { notFound } from 'next/navigation';
import { getPage, langAlternatesFromRoute } from '../lib/static-pages';

export const revalidate = 3600;
export const dynamic = 'force-static';

export async function generateMetadata() {
  const page = getPage('index.html');
  const base = page?.metadata || { title: 'BestPackFactory' };
  return {
    ...base,
    alternates: {
      ...(base.alternates || {}),
      languages: langAlternatesFromRoute('index.html')
    }
  };
}

export default function HomePage() {
  const page = getPage('index.html');
  if (!page) notFound();
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/assets/hero/mobile-products/slide-01-products.webp"
        media="(max-width: 980px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/assets/hero/slide-01-one-stop-scene.webp"
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
