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
      <div dangerouslySetInnerHTML={{ __html: page.body }} suppressHydrationWarning={true} />
      {page.jsonLd.map((json, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      ))}
    </>
  );
}
