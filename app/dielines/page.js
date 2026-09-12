import { DIELINES, CATEGORIES, defaultParams } from '../../lib/dielines/catalog.js';
import { previewSVG } from '../../lib/dielines/build.js';
import { SiteHeader, SiteFooter } from './chrome.js';
import styles from './dielines.module.css';

export const revalidate = 86400;
export const dynamic = 'force-static';

const SITE = 'https://www.bestpackfactory.com';
const PRESET_COUNT = DIELINES.reduce((count, entry) => count + (entry.presets?.length || 0), 0);

export const metadata = {
  title: 'Free Dieline Templates — Custom Size, PDF / DXF / AI Download | BestPackFactory',
  description:
    'Free packaging engineering dieline templates you can resize and download as PDF, DXF, AI or SVG. Coffee bags, pouches, rigid boxes, mailers and cartons — 1:1 mm files, no sign-up required.',
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
    a: 'The downloads keep dimensions in millimetres at 1:1 scale and separate cut, fold, seal, safe-artwork and non-printing information. Structure-specific inputs such as board caliper, seal width, turn-in and handle spacing are exposed where relevant. A converter still has to approve its own crease rules, machine tolerances and a physical blank before tooling.'
  },
  {
    q: 'Which file format should I use?',
    a: 'PDF for review and 100% scale printing. DXF for CAD or a cutting table. The AI download is PDF-compatible artwork that opens in Adobe Illustrator. SVG is best for vector inspection and web mockups. The four exports use the same generated geometry; DXF and SVG preserve named technical layers.'
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
            Set your dimensions and download a 1:1 mm production-preflight template in PDF, DXF,
            AI or SVG. Construction allowances are shown where the selected structure supports
            them; your converter approves the final stock, crease and machine settings before tooling.
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

        <div className={styles.catHead}>
          <h2>How to reference and verify this dieline library</h2>
          <p>A public, no-gate engineering resource for packaging buyers, designers and educators.</p>
        </div>
        <div className={styles.notes}>
          <div className={styles.noteCard}>
            <h3>What the library contains</h3>
            <ul>
              <li>{DIELINES.length} base parametric structures and {PRESET_COUNT} named size presets.</li>
              <li>PDF, DXF, AI-compatible PDF and SVG exports generated from the same dimensions.</li>
              <li>1:1 millimetre geometry with named cut, fold, bleed or structure-specific technical information.</li>
              <li>No account, email gate, watermark or payment is required.</li>
            </ul>
          </div>
          <div className={styles.noteCard}>
            <h3>Responsible use and citation</h3>
            <ul>
              <li>Link directly to the relevant permanent template URL when it helps your readers; no reciprocal link is required.</li>
              <li>Record the dimensions and download date when a file is used in a specification or teaching resource.</li>
              <li>A converter must approve stock, crease rules, tolerances, sealing and a physical blank before production tooling.</li>
              <li>Last methodology review: September 12, 2026.</li>
            </ul>
          </div>
        </div>

        <div className={styles.noteCard} style={{ marginTop: 20 }}>
          <h3>Continue from structure to supplier qualification</h3>
          <ul>
            <li><a href="/products/custom-packaging-boxes.html">Paper box manufacturer sourcing center</a></li>
            <li><a href="/products/custom-rigid-boxes.html">Rigid box manufacturer sourcing center</a></li>
            <li><a href="/products/paper-bags.html">Paper bag manufacturer sourcing center</a></li>
            <li><a href="/products/stand-up-pouch.html">Stand-up pouch manufacturer sourcing center</a></li>
            <li><a href="/products/flexible-packaging.html">Flexible packaging manufacturer sourcing center</a></li>
            <li><a href="/products/custom-printed-tissue-paper.html">Printed tissue paper manufacturer sourcing center</a></li>
            <li><a href="/industries/food-packaging-manufacturer.html">Food packaging manufacturer sourcing center</a></li>
          </ul>
        </div>

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
