import { notFound } from 'next/navigation';
import { DIELINES, getDieline, CATEGORIES } from '../../../lib/dielines/catalog.js';
import DielineGenerator from '../DielineGenerator.js';
import { SiteHeader, SiteFooter } from '../chrome.js';
import styles from '../dielines.module.css';

export const revalidate = 86400;
export const dynamic = 'force-static';
export const dynamicParams = false;

const SITE = 'https://www.bestpackfactory.com';

export function generateStaticParams() {
  return DIELINES.map(d => ({ slug: d.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const entry = getDieline(slug);
  if (!entry) return { title: 'Dieline Template | BestPackFactory' };
  const title = `${entry.name} — Free PDF, DXF & AI Download | BestPackFactory`;
  const description = `${entry.intro.slice(0, 150)} Free custom-size download in PDF, DXF, AI and SVG. No sign-up.`;
  return {
    title,
    description,
    keywords: entry.keywords,
    alternates: { canonical: `${SITE}/dielines/${entry.slug}` },
    openGraph: { title, description, url: `${SITE}/dielines/${entry.slug}`, type: 'article' }
  };
}

export default async function DielinePage({ params }) {
  const { slug } = await params;
  const entry = getDieline(slug);
  if (!entry) notFound();

  const category = CATEGORIES.find(c => c.id === entry.category);
  const siblings = DIELINES.filter(d => d.category === entry.category && d.slug !== entry.slug).slice(0, 3);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Dielines', item: `${SITE}/dielines` },
      { '@type': 'ListItem', position: 3, name: entry.name, item: `${SITE}/dielines/${entry.slug}` }
    ]
  };

  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to download a custom ${entry.name}`,
    description: entry.intro,
    totalTime: 'PT2M',
    step: [
      { '@type': 'HowToStep', name: 'Set dimensions', text: 'Enter your internal dimensions in millimetres, or start from a preset size.' },
      { '@type': 'HowToStep', name: 'Check the preview', text: 'The live preview shows cut, fold, bleed and seal lines as you change values.' },
      { '@type': 'HowToStep', name: 'Download', text: 'Choose PDF, DXF, AI or SVG. The file is generated in your browser with no sign-up.' }
    ]
  };

  return (
    <>
      <SiteHeader />
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.crumbs}>
            <a href="/index.html">Home</a> › <a href="/dielines">Dielines</a> › {entry.name}
          </nav>
          <div className={styles.eyebrow}>{category?.name || 'Dieline template'}</div>
          <h1>{entry.name}</h1>
          <p>{entry.intro}</p>
          <ul className={styles.heroPoints}>
            <li>Free, no sign-up</li>
            <li>PDF · DXF · AI · SVG</li>
            <li>Fold allowance applied</li>
            <li>MOQ 500 pcs if you produce with us</li>
          </ul>
        </div>
      </section>

      <main className={styles.wrap}>
        <DielineGenerator entry={entry} />

        <div className={styles.notes}>
          <div className={styles.noteCard}>
            <h3>Recommended materials</h3>
            <ul>{entry.materials.map(m => <li key={m}>{m}</li>)}</ul>
          </div>
          <div className={styles.noteCard}>
            <h3>Production notes from our prepress team</h3>
            <ul>{entry.notes.map(n => <li key={n}>{n}</li>)}</ul>
          </div>
        </div>

        {entry.presets?.length ? (
          <div className={styles.noteCard} style={{ marginTop: 20 }}>
            <h3>Common sizes for this format</h3>
            <ul>
              {entry.presets.map(p => (
                <li key={p.name}>
                  <b>{p.name}</b> — {Object.entries(p.values).filter(([, v]) => typeof v === 'number').map(([k, v]) => `${k} ${v} mm`).join(', ')}. {p.note}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {entry.relatedProduct ? (
          <div className={styles.related}>
            <h3>Need these manufactured?</h3>
            <p>
              We produce this format in our own factory in Shenzhen. Send the dieline back with your
              artwork on it and we will quote within 24 hours — 500 pieces minimum.
            </p>
            <a href={entry.relatedProduct}>View {entry.relatedLabel} →</a>
          </div>
        ) : null}

        <div className={styles.cta}>
          <div>
            <h3>Free artwork check before you print</h3>
            <p>
              Send us your design on this dieline and our prepress team checks bleed, fold clearance,
              CMYK conversion, minimum font size and barcode placement — free, whether or not you
              order from us. It is the same check every production job goes through.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <a
              className={styles.ctaBtn}
              href={`/contact.html?subject=${encodeURIComponent(`Artwork check — ${entry.name}`)}`}
            >
              Send artwork for a free check
            </a>
            <a
              className={`${styles.ctaBtn} ${styles.ghost}`}
              href={`https://wa.me/8615886530985?text=${encodeURIComponent(`Hello BestPackFactory, I downloaded the ${entry.name} and would like a quote.`)}`}
              rel="noopener"
              target="_blank"
            >
              WhatsApp Lisa
            </a>
          </div>
        </div>

        {siblings.length ? (
          <>
            <div className={styles.catHead}>
              <h2>Related dieline templates</h2>
              <p>Same category, also free to download.</p>
            </div>
            <div className={styles.grid}>
              {siblings.map(s => (
                <a className={styles.card} key={s.slug} href={`/dielines/${s.slug}`}>
                  <div className={styles.cardBody}>
                    <span className={styles.tag}>Free download</span>
                    <h3>{s.name}</h3>
                    <p>{s.intro.slice(0, 110)}…</p>
                  </div>
                </a>
              ))}
            </div>
          </>
        ) : null}
      </main>

      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }} />
    </>
  );
}
