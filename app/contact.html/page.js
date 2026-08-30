import { notFound } from 'next/navigation';
import { getPage } from '../../lib/static-pages';
import ContactForm from '../ContactForm';

export const revalidate = 3600;
export const dynamic = 'force-static';

export async function generateMetadata() {
  const page = getPage('contact.html');
  return page?.metadata || { title: 'Contact BestPackFactory' };
}

function contactBodyParts(body) {
  const withoutLegacyForm = body.replace(/<section[^>]*id=["']rfq-form-section["'][\s\S]*?<\/section>/i, '');
  const footerIndex = withoutLegacyForm.search(/<footer\b/i);
  if (footerIndex < 0) return { before: withoutLegacyForm, after: '' };
  return {
    before: withoutLegacyForm.slice(0, footerIndex),
    after: withoutLegacyForm.slice(footerIndex)
  };
}

export default function ContactPage() {
  const page = getPage('contact.html');
  if (!page) notFound();
  const parts = contactBodyParts(page.body);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: parts.before }} suppressHydrationWarning={true} />
      <ContactForm />
      {parts.after ? <div dangerouslySetInnerHTML={{ __html: parts.after }} suppressHydrationWarning={true} /> : null}
      {page.jsonLd.map((json, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      ))}
    </>
  );
}
