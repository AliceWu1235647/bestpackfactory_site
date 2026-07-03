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
      <div dangerouslySetInnerHTML={{ __html: page.body }} suppressHydrationWarning={true} />
      {page.jsonLd.map((json, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      ))}
    </>
  );
}
