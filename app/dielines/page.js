import { DIELINES, CATEGORIES, defaultParams } from '../../lib/dielines/catalog.js';
import { previewSVG } from '../../lib/dielines/build.js';
import { SiteHeader, SiteFooter } from './chrome.js';
import styles from './dielines.module.css';

export const revalidate = 86400;
export const dynamic = 'force-static';

const SITE = 'https://www.bestpackfactory.com';

export const metadata = {
  title: 'Free Dieline Templates — Custom Size, PDF / DXF / AI Download | BestPackFactory',
  description:
    'Free packaging dieline templates you can resize and download as PDF, DXF, AI or SVG. Coffee bags, mylar pouches, magnetic rigid boxes, mailers and cartons — factory-verified, no sign-up required.',
  alternates: { canonical: `${SITE}/dielines` },
  openGraph: {
    title: 'Free Packaging Dieline Templates — Resize & Download',
    description: 'Parametric dielines for coffee bags, pouches, rigid boxes and cartons. PDF, DXF, AI, SVG. No sign-up.',
    url: `${SITE}/dielines`,
    type: 'website'
  }
};

const FAQ = [
  {
    q: 'Are these dieline templates really free?',
    a: 'Yes. Set your dimensions, download the file, use it commercially. No account, no email, no watermark. The files are generated in your browser, so nothing is stored on our side.'
  },
  {
    q: 'What is the difference between your dielines and a generic template library?',
    a: 'We are the factory. Every template carries the fold allowance for the board or film thickness you select, and the seal, valve and turn-in positions match how the job actually runs on our machines. Generic dielines usually omit that compensation, which is why they often fail at prepress.'
  },
  {
    q: 'Which file format should I use?',
    a: 'PDF for sending to a printer or reviewing with your team. DXF for a cutting table or CAD. AI for Adobe Illustrator, where you will lay artwork over the dieline. SVG for web mockups. All four contain the same geometry on separate CUT, FOLD, PERF, BLEED and GLUE layers.'
  },
  {
    q: 'Can you produce the packaging once my artwork is ready?',
    a: 'Yes, that is our business. MOQ is 500 pieces, samples ship in 7 to 10 days, and production runs 12 to 18 days. Send the dieline with your artwork on it and we will quote within 24 hours.'
  },
  {
    q: 'Do you check my artwork before printing?',
    a: 'Every order gets a free prepress check covering bleed, fold clearance, CMYK conversion, minimum font size and barcode placement. We send a digital proof for approval before anything goes on press.'
  }
];

function Thumb({ entry }) {
  let svg = null;
  try {
    svg = previewSVG(entry, defaultParams(entry));
  } catch {
    svg = null;
  }
  if (!svg) return <div className={styles.thumb} />;
  return <div className={styles.thumb} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export default function DielinesIndex() {
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Free Packaging Dieline Templates',
    url: `${SITE}/dielines`,
    description: metadata.description,
    isPartOf: { '@type': 'WebSite', name: 'BestPackFactory', url: SITE },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: DIELINES.length,
      itemListElement: DIELINES.map((d, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: d.name,
        url: `${SITE}/dielines/${d.slug}`
      }))
    }
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };

  return (
    <>
      <SiteHeader />
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>Free tools from the factory floor</div>
          <h1>Free packaging dieline templates</h1>
          <p>
            Set your own dimensions and download a production-ready dieline in PDF, DXF, AI or SVG.
            Fold allowance for board and film thickness is already compensated, so these files go
            straight to press — not back to your designer.
          </p>
          <ul className={styles.heroPoints}>
            <li>No sign-up or email required</li>
            <li>Layered CUT / FOLD / BLEED files</li>
            <li>Any size, generated instantly</li>
            <li>Commercial use allowed</li>
          </ul>
        </div>
      </section>

      <main className={styles.wrap}>
        {CATEGORIES.map(cat => {
          const items = DIELINES.filter(d => d.category === cat.id);
          if (!items.length) return null;
          return (
            <div key={cat.id}>
              <div className={styles.catHead}>
                <h2>{cat.name}</h2>
                <p>{cat.blurb}</p>
              </div>
              <div className={styles.grid}>
                {items.map(entry => (
                  <a className={styles.card} key={entry.slug} href={`/dielines/${entry.slug}`}>
                    <Thumb entry={entry} />
                    <div className={styles.cardBody}>
                      <span className={styles.tag}>Free download</span>
                      <h3>{entry.name}</h3>
                      <p>{entry.intro.slice(0, 118)}…</p>
                      <div className={styles.formats}>
                        {['PDF', 'DXF', 'AI', 'SVG'].map(f => (
                          <span className={styles.fmt} key={f}>{f}</span>
                        ))}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}

        <div className={styles.cta}>
          <div>
            <h3>Made something with these dielines?</h3>
            <p>
              We manufacture what you just designed. 500 pieces minimum, samples in 7–10 days,
              free prepress check on every order, worldwide shipping from Shenzhen.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <a className={styles.ctaBtn} href="/contact.html">Get a quote in 24h</a>
            <a
              className={`${styles.ctaBtn} ${styles.ghost}`}
              href="https://wa.me/8615886530985?text=Hello%20BestPackFactory%2C%20I%20downloaded%20a%20dieline%20and%20need%20a%20quote."
              rel="noopener"
              target="_blank"
            >
              WhatsApp Lisa
            </a>
          </div>
        </div>

        <div className={styles.faq}>
          <h2>Dieline template FAQ</h2>
          {FAQ.map(f => (
            <div className={styles.faqItem} key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
      </main>

      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </>
  );
}
