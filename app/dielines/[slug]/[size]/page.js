import { notFound } from 'next/navigation';
import { DIELINES, getDieline } from '../../../../lib/dielines/catalog.js';
import DielineGenerator from '../../DielineGenerator.js';
import { SiteHeader, SiteFooter } from '../../chrome.js';
import styles from '../../dielines.module.css';

export const revalidate = 86400;
export const dynamic = 'force-static';
export const dynamicParams = false;

const SITE = 'https://www.bestpackfactory.com';

// Mirror of the slugify used when generating size slugs — must stay in sync.
function slugify(s) {
  return String(s).toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function generateStaticParams() {
  const params = [];
  for (const d of DIELINES) {
    for (const p of (d.presets || [])) {
      params.push({ slug: d.slug, size: slugify(p.name) });
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const { slug, size } = await params;
  const entry = getDieline(slug);
  if (!entry) return { title: 'Dieline Template | BestPackFactory' };
  const preset = entry.presets?.find(p => slugify(p.name) === size);
  if (!preset) return { title: `${entry.name} | BestPackFactory` };

  // Build a human-readable dimension string from the preset's numeric values.
  const dimStr = Object.entries(preset.values)
    .filter(([, v]) => typeof v === 'number')
    .map(([k, v]) => `${k} ${v} mm`)
    .join(', ');

  const title = `${preset.name} ${entry.name} — Free Dieline (${dimStr}) | BestPackFactory`;
  const description = `Download a free ${preset.name} ${entry.name} dieline (${dimStr}). ${preset.note} PDF, DXF, AI and SVG — no sign-up.`;
  const canonical = `${SITE}/dielines/${entry.slug}/${size}`;
  return {
    title,
    description,
    keywords: [...(entry.keywords || []), preset.name, dimStr],
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'article' }
  };
}

export default async function SizePage({ params }) {
  const { slug, size } = await params;
  const entry = getDieline(slug);
  if (!entry) notFound();
  const preset = entry.presets?.find(p => slugify(p.name) === size);
  if (!preset) notFound();

  // Pre-fill the generator with this preset's values so the page lands on the
  // exact size the visitor searched for — the tool is still live-adjustable.
  const entryWithDefault = {
    ...entry,
    fields: entry.fields.map(f => ({
      ...f,
      default: preset.values[f.key] !== undefined ? preset.values[f.key] : f.default
    }))
  };

  const dimStr = Object.entries(preset.values)
    .filter(([, v]) => typeof v === 'number')
    .map(([k, v]) => `${k} ${v} mm`)
    .join(', ');

  const pageUrl = `${SITE}/dielines/${entry.slug}/${size}`;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Dielines', item: `${SITE}/dielines` },
      { '@type': 'ListItem', position: 3, name: entry.name, item: `${SITE}/dielines/${entry.slug}` },
      { '@type': 'ListItem', position: 4, name: preset.name, item: pageUrl }
    ]
  };

  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to download a ${preset.name} ${entry.name} dieline`,
    description: `Download a free ${preset.name} dieline (${dimStr}) for ${entry.name.toLowerCase()}. ${preset.note}`,
    totalTime: 'PT2M',
    step: [
      { '@type': 'HowToStep', name: 'Confirm dimensions', text: `The dimensions are pre-set to ${dimStr}. Adjust any value to fine-tune the layout.` },
      { '@type': 'HowToStep', name: 'Check the live preview', text: 'The preview updates in real time showing cut, fold, bleed and seal lines.' },
      { '@type': 'HowToStep', name: 'Download', text: 'Choose PDF for print, DXF for a cutting table, AI for Illustrator, or SVG for web. Generated in your browser, no sign-up needed.' }
    ]
  };

  return (
    <>
      <SiteHeader />
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.crumbs}>
            <a href="/index.html">Home</a> ›{' '}
            <a href="/dielines">Dielines</a> ›{' '}
            <a href={`/dielines/${entry.slug}`}>{entry.name}</a> ›{' '}
            {preset.name}
          </nav>
          <div className={styles.eyebrow}>{entry.name}</div>
          <h1>{preset.name} {entry.name}</h1>
          <p>
            Pre-set to {dimStr}. {preset.note} Adjust any dimension live — the
            file reflects exactly what you see in the preview.
          </p>
          <ul className={styles.heroPoints}>
            <li>Free, no sign-up</li>
            <li>PDF · DXF · AI · SVG</li>
            <li>Fold allowance applied</li>
            <li>MOQ 500 pcs if you produce with us</li>
          </ul>
        </div>
      </section>

      <main className={styles.wrap}>
        <DielineGenerator entry={entryWithDefault} />

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

        {entry.presets?.length > 1 ? (
          <div className={styles.noteCard} style={{ marginTop: 20 }}>
            <h3>Other sizes for this format</h3>
            <ul>
              {entry.presets.filter(p => slugify(p.name) !== size).map(p => (
                <li key={p.name}>
                  <a href={`/dielines/${entry.slug}/${slugify(p.name)}`}><b>{p.name}</b></a>
                  {' — '}
                  {Object.entries(p.values).filter(([, v]) => typeof v === 'number').map(([k, v]) => `${k} ${v} mm`).join(', ')}.
                  {' '}{p.note}
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
              order from us.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <a
              className={styles.ctaBtn}
              href={`/contact.html?subject=${encodeURIComponent(`Artwork check — ${preset.name} ${entry.name} (${dimStr})`)}`}
            >
              Send artwork for a free check
            </a>
            <a
              className={`${styles.ctaBtn} ${styles.ghost}`}
              href={`https://wa.me/8615886530985?text=${encodeURIComponent(`Hello BestPackFactory, I downloaded the ${preset.name} ${entry.name} dieline (${dimStr}) and would like a quote.`)}`}
              rel="noopener"
              target="_blank"
            >
              WhatsApp Lisa
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }} />
    </>
  );
}
