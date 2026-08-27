const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.bestpackfactory.com';
const REVIEW_DATE = '2026-08-13';
const AUTHOR_URL = `${SITE}/authors/lisa-wu.html`;
const AUTHOR_ID = `${AUTHOR_URL}#person`;
const DEFAULT_IMAGE = `${SITE}/assets/hero/slide-01-one-stop.webp`;

const PRODUCT_H1_FILES = [
  '1kg-coffee-bean-bags.html',
  '250g-coffee-bags-with-valve.html',
  '500g-flat-bottom-coffee-bags.html',
  'bakery-paper-bags.html',
  'cannabis-flower-packaging-bags.html',
  'cannabis-mylar-bags.html',
  'cbd-gummies-packaging-bags.html',
  'child-resistant-cannabis-mylar-bags.html',
  'coffee-bags.html',
  'collagen-powder-packaging-pouches.html',
  'custom-boxes.html',
  'custom-compostable-stand-up-pouches.html',
  'custom-cosmetic-packaging-boxes.html',
  'custom-pizza-boxes.html',
  'custom-printed-tape.html',
  'custom-printed-tissue-paper.html',
  'custom-retort-pouches-ready-meal-packaging.html',
  'custom-roll-stock-film-snack-protein-bar.html',
  'custom-spout-pouches-sauce-baby-food.html',
  'custom-tea-packaging-bags.html',
  'flexible-packaging.html',
  'food-packaging.html',
  'kraft-paper-coffee-bags.html',
  'labels-stickers.html',
  'luxury-magnetic-boxes.html',
  'luxury-retail-paper-bags.html',
  'matte-black-coffee-bags.html',
  'paper-bags.html',
  'pet-bottles.html',
  'pet-food-bags.html',
  'pharma-packaging.html',
  'pharmaceutical-folding-cartons.html',
  'pre-roll-packaging-boxes.html',
  'protein-powder-stand-up-pouches.html',
  'roll-labels-for-automatic-labeling.html',
  'sandwich-packaging-boxes.html',
  'smell-proof-mylar-bags.html',
  'tin-boxes.html',
  'vitamin-supplement-packaging-boxes.html',
  'weight-loss-pill-packaging-boxes.html',
  'wine-magnetic-gift-boxes.html'
];

const SHORT_TITLES = {
  'blog/brand-packaging-brief-checklist-custom-packaging-rfq.html': 'Brand Packaging Brief Checklist',
  'blog/cannabis-mylar-bags-b2b-sourcing-guide.html': 'Child-Resistant Cannabis Mylar Bags: B2B Guide',
  'blog/cardstock-product-boxes-and-food-packaging-box-procurement-guide.html': 'Cardstock & Food Packaging Box Buyer Guide',
  'blog/coffee-bag-pinhole-vs-degassing-valve-troubleshooting.html': 'Coffee Bag Pinholes vs Degassing Valves Guide',
  'blog/corrugated-mailer-box-vs-rigid-box-ecommerce-packaging-guide.html': 'Mailer Box vs Rigid Box: Ecommerce Guide',
  'blog/custom-coffee-bags-buying-guide-materials-valves.html': 'Custom Coffee Bags: Materials, Valves & MOQ',
  'blog/custom-coffee-bags-moq-500-b2b-guide.html': 'Custom Coffee Bags MOQ 500 PCS: B2B Guide',
  'blog/custom-gift-boxes-strategy-design-manufacturing-logistics.html': 'Custom Gift Boxes: B2B Production Guide',
  'blog/custom-magnetic-box-cost-guide.html': 'Custom Magnetic Box Cost Guide 2026',
  'blog/custom-packaging-cost-breakdown-materials-shipping.html': 'Custom Packaging Cost Breakdown Guide',
  'blog/custom-packaging-factory-direct-vs-trading-company-vs-marketplace-seller-guide.html': 'Factory vs Trading Company vs Marketplace Seller',
  'blog/custom-packaging-insert-inner-tray-guide.html': 'Packaging Inserts & Inner Trays: Material Guide',
  'blog/custom-packaging-landed-cost-calculator-buyer-guide.html': 'Custom Packaging Landed Cost Calculator',
  'blog/custom-packaging-lead-time-guide.html': 'Custom Packaging Lead Time Guide',
  'blog/custom-packaging-material-selection-guide.html': 'Custom Packaging Material Selection Guide',
  'blog/custom-packaging-moq-500-pcs-sourcing-guide.html': 'Custom Packaging MOQ 500 PCS: Sourcing Guide',
  'blog/custom-packaging-moq-500-what-you-need-to-know.html': 'Custom Packaging MOQ 500 PCS: Buyer Guide',
  'blog/custom-packaging-moq-guide-for-b2b-buyers.html': 'Custom Packaging MOQ Guide for B2B Buyers',
  'blog/custom-packaging-rfq-checklist.html': 'Custom Packaging RFQ Checklist',
  'blog/custom-packaging-sample-to-production-timeline-guide.html': 'Packaging Sample-to-Production Timeline',
  'blog/custom-packaging-supplier-comparison-guide.html': 'Packaging Supplier Comparison Guide',
  'blog/cylinder-tube-packaging-luxury-gifts-guide.html': 'Cylinder Tube Packaging Buyer Guide',
  'blog/dieline-artwork-checklist-custom-packaging.html': 'Dieline & Artwork Checklist for Packaging',
  'blog/dimensional-weight-box-sizing-guide.html': 'Dimensional Weight & Box Sizing Guide',
  'blog/flexible-packaging-vs-rigid-packaging-b2b-guide.html': 'Flexible vs Rigid Packaging: B2B Guide',
  'blog/food-packaging-compliance-document-request-checklist.html': 'Food Packaging Compliance Document Checklist',
  'blog/geo-custom-packaging-ai-search-guide.html': 'GEO Guide for Custom Packaging Buyers',
  'blog/how-to-choose-china-packaging-supplier.html': 'How to Choose a China Packaging Supplier',
  'blog/how-to-find-custom-packaging-supplier-china.html': 'Find a Custom Packaging Supplier in China',
  'blog/low-moq-seasonal-packaging-hybrid-plan.html': 'Low-MOQ Seasonal Packaging Inventory Plan',
  'blog/magnetic-box-inserts-finishes-guide.html': 'Magnetic Box Inserts & Finishes Guide',
  'blog/magnetic-gift-box-flat-pack-vs-assembled.html': 'Magnetic Gift Boxes: Flat-Pack vs Assembled',
  'blog/magnetic-rigid-box-packaging-procurement-guide.html': 'Magnetic Rigid Box Procurement Guide',
  'blog/mylar-bags-barrier-materials-rfq-checklist.html': 'Mylar Bag Barrier Material RFQ Checklist',
  'blog/packaging-damage-root-cause-checklist-ecommerce.html': 'Ecommerce Packaging Damage Checklist',
  'blog/packaging-sample-checklist-before-mass-production.html': 'Packaging Sample Approval Checklist',
  'blog/packaging-sample-color-tolerance-approval-guide.html': 'Packaging Color Tolerance Approval Guide',
  'blog/packaging-shipping-cost-guide-china.html': 'Packaging Shipping Cost from China',
  'blog/paper-gift-bag-and-foam-insert-luxury-packaging-guide.html': 'Paper Gift Bags & Foam Inserts: Buyer Guide',
  'blog/pet-food-packaging-trends-2025-b2b-guide.html': 'Pet Food Packaging Trends 2025: B2B Guide',
  'blog/prepare-artwork-dielines-packaging-production-china.html': 'Packaging Artwork & Dieline Guide',
  'blog/rigid-box-vs-folding-carton-procurement-guide.html': 'Rigid Box vs Folding Carton: Buyer Guide',
  'blog/rigid-boxes-vs-folding-cartons-vs-mailer-boxes.html': 'Rigid vs Folding vs Mailer Boxes: Buyer Guide',
  'blog/roll-label-winding-direction-application-checklist.html': 'Roll Label Winding Direction Checklist',
  'blog/skincare-cosmetic-box-insert-fit-guide.html': 'Skincare Box Insert Fit Guide',
  'blog/sliding-drawer-box-packaging-guide.html': 'Sliding Drawer Box Packaging Guide',
  'news/bestpackfactory-expands-low-moq-support-global-buyers.html': 'BestPackFactory Expands Low-MOQ Support',
  'news/bestpackfactory-faster-sampling-dieline-support-update.html': 'Faster Packaging Sampling & Dieline Support',
  'news/bestpackfactory-new-rfq-guidance-system-launch.html': 'New RFQ Guidance for Overseas Packaging Buyers',
  'news/bestpackfactory-one-stop-packaging-solutions-update.html': 'One-Stop Solutions for Boxes, Bags & Labels',
  'news/bestpackfactory-one-stop-strategy-design-manufacturing-logistics-model.html': 'BestPackFactory One-Stop Packaging Model',
  'news/luxury-packaging-trends-custom-gift-boxes-rigid-boxes-paper-bags.html': 'Luxury Packaging Trends for Premium Brands',
  'news/magnetic-packaging-mailer-boxes-b2b-sourcing-update.html': 'Magnetic & Mailer Box B2B Sourcing Update',
  'news/packaging-logistics-optimization-for-gift-boxes-paper-bags-inserts.html': 'Packaging Logistics for Gift Boxes & Bags'
};

const CITATIONS = {
  'blog/coffee-bag-material-guide.html': [
    'https://www.iso.org/cms/live/live/en/sites/isoorg/contents/data/standard/09/10/91001.html?browse=tc',
    'https://www.iso.org/standard/72382.html',
    'https://store.astm.org/f0088_f0088m-23.html',
    'https://store.astm.org/rr-f02-2001.html'
  ],
  'blog/packaging-sample-checklist-before-mass-production.html': [
    'https://store.astm.org/d5276-19.html',
    'https://www.iso.org/standard/85464.html'
  ],
  'blog/food-packaging-compliance-document-request-checklist.html': [
    'https://www.fda.gov/food/food-ingredients-packaging/packaging-food-contact-substances-fcs',
    'https://www.fda.gov/food/food-ingredients-packaging/food-packaging-other-substances-come-contact-food-information-consumers',
    'https://eur-lex.europa.eu/eli/reg/2004/1935/2021-03-27/eng/pdf'
  ],
  'blog/packaging-sample-color-tolerance-approval-guide.html': [
    'https://www.iso.org/standard/83759.html',
    'https://www.iso.org/standard/57833.html'
  ],
  'blog/variable-data-pharma-packaging.html': [
    'https://ref.gs1.org/guidelines/datamatrix/',
    'https://www.iso.org/cms/%20render/live/en/sites/isoorg/contents/data/standard/07/68/76876.html?browse=ics'
  ]
};

const EVIDENCE_BLOCKS = {
  'blog/coffee-bag-material-guide.html': `<section class="content-evidence" aria-labelledby="coffee-test-methods"><h2 id="coffee-test-methods">Test methods, real reference data and reporting limits</h2><p><strong>Method:</strong> Treat barrier and seal figures as RFQ acceptance targets until a named laboratory report confirms the final laminate, conditioning and test conditions. Oxygen transmission can be measured under ISO 15105-2:2025. Water-vapour reporting must name the method and temperature/humidity conditions.</p><ul><li><a href="https://www.iso.org/cms/live/live/en/sites/isoorg/contents/data/standard/09/10/91001.html?browse=tc" rel="noopener noreferrer">ISO 15105-2:2025</a> covers equal-pressure gas transmission measurement for plastic film and sheeting.</li><li><a href="https://www.iso.org/standard/72382.html" rel="noopener noreferrer">ISO 2528:2017</a> is a gravimetric WVTR method, but ISO states that it is generally not recommended below 1 g/m²/day. A lower target therefore needs a method with suitable sensitivity agreed with the laboratory.</li><li><a href="https://store.astm.org/f0088_f0088m-23.html" rel="noopener noreferrer">ASTM F88/F88M-23</a> measures flexible-barrier seal strength and requires the support technique to remain consistent within a test series.</li><li><strong>Real method-validation data:</strong> <a href="https://store.astm.org/rr-f02-2001.html" rel="noopener noreferrer">ASTM research report RR:F02-2001</a> records a 2021 F88 interlaboratory study with six volunteer laboratories, four materials and 30 replicate results requested for each material.</li></ul><p class="evidence-limit"><strong>Evidence limit:</strong> The ASTM figures above describe validation of the test method, not a BestPackFactory production batch. A buyer-facing certificate should identify the laminate, specimen count, equipment, conditions, individual/summary results and acceptance limit.</p></section>`,
  'blog/packaging-sample-checklist-before-mass-production.html': `<section class="content-evidence" aria-labelledby="sample-test-methods"><h2 id="sample-test-methods">Sample test method and acceptance record</h2><p><strong>Method:</strong> Write the sample protocol before testing: packed product and mass, conditioning, drop orientation and height, number of drops, inspection points and pass/fail criteria. Photograph the sample before and after testing and keep its revision number with the approval record.</p><ul><li><a href="https://store.astm.org/d5276-19.html" rel="noopener noreferrer">ASTM D5276-19</a> covers free-fall drop testing of loaded boxes, cylindrical containers, bags and sacks. The standard evaluates the container and its inner packing as a packed system.</li><li><a href="https://www.iso.org/standard/85464.html" rel="noopener noreferrer">ISO 2859-1:2026</a> provides AQL-indexed sample sizes and acceptance/rejection rules for lot-by-lot inspection. The inspection level, lot size, defect classes and AQL must be agreed before inspection.</li></ul><p class="evidence-limit"><strong>Evidence limit:</strong> A 1.0 m drop or a stated AQL is a project starting point, not a universal pass result. Final values depend on packed mass, distribution route, product fragility and buyer requirements.</p></section>`,
  'blog/food-packaging-compliance-document-request-checklist.html': `<section class="content-evidence" aria-labelledby="food-compliance-method"><h2 id="food-compliance-method">Verification method and authoritative sources</h2><p><strong>Method:</strong> Build a material-and-use matrix covering each food-contact layer, supplier, thickness, food type, contact temperature, contact duration and destination market. Match every declaration or migration report to that matrix and retain its sample identity and date.</p><ul><li>The <a href="https://www.fda.gov/food/food-ingredients-packaging/packaging-food-contact-substances-fcs" rel="noopener noreferrer">U.S. FDA food-contact substance guidance</a> explains the regulatory routes used for substances that contact food.</li><li>The <a href="https://www.fda.gov/food/food-ingredients-packaging/food-packaging-other-substances-come-contact-food-information-consumers" rel="noopener noreferrer">FDA consumer information page</a> explains that packaging substances can migrate into food and are assessed for intended use.</li><li><a href="https://eur-lex.europa.eu/eli/reg/2004/1935/2021-03-27/eng/pdf" rel="noopener noreferrer">EU Regulation (EC) No 1935/2004</a> is the official framework for materials and articles intended to contact food in the European Union.</li></ul><p class="evidence-limit"><strong>Evidence limit:</strong> No single “food grade” statement proves worldwide compliance. The responsible importer or food business should verify the exact structure and intended use for its destination market.</p></section>`,
  'blog/packaging-sample-color-tolerance-approval-guide.html': `<section class="content-evidence" aria-labelledby="color-verification-method"><h2 id="color-verification-method">Color verification method and reporting fields</h2><p><strong>Method:</strong> Record the physical reference, substrate, ink and print process, finish, viewing condition, instrument geometry, illuminant/observer, color-difference formula and acceptance limit. Measure agreed locations and keep the approved physical sample with project and revision identifiers.</p><ul><li><a href="https://www.iso.org/standard/83759.html" rel="noopener noreferrer">ISO 3664:2025</a> specifies viewing conditions for critical comparison of prints and reference objects.</li><li><a href="https://www.iso.org/standard/57833.html" rel="noopener noreferrer">ISO 12647-2:2013</a> specifies process-control parameters for offset production and is applicable to cardboard packaging.</li></ul><p class="evidence-limit"><strong>Evidence limit:</strong> A ΔE value without a formula, instrument conditions, substrate and reference is incomplete. The page therefore treats color tolerances as buyer-supplier acceptance targets, not as published batch measurements.</p></section>`,
  'blog/variable-data-pharma-packaging.html': `<section class="content-evidence" aria-labelledby="datamatrix-verification-method"><h2 id="datamatrix-verification-method">GS1 DataMatrix verification method and real grading data</h2><p><strong>Method:</strong> Verify both encoded data and print quality on the final printed carton. Record the code content, X-dimension, quiet zone, location, verifier model and calibration status, plus the complete grade notation.</p><ul><li>The official <a href="https://ref.gs1.org/guidelines/datamatrix/" rel="noopener noreferrer">GS1 DataMatrix Guideline</a> states that quality covers both correct GS1 data and symbol print quality. Its ISO/IEC 15415 scale runs from numeric grade 4 (best) to 0 (worst), corresponding to letter grades A through F.</li><li><a href="https://www.iso.org/cms/%20render/live/en/sites/isoorg/contents/data/standard/07/68/76876.html?browse=ics" rel="noopener noreferrer">ISO/IEC 15415:2024</a> defines measurement and grading methods for two-dimensional barcode symbols.</li></ul><p class="evidence-limit"><strong>Evidence limit:</strong> A reported grade is meaningful only with the aperture, illumination and angle. Grade A or B figures on this site are project targets, not claims about an untested production lot.</p></section>`
};

const EVIDENCE_ANCHORS = {
  'blog/coffee-bag-material-guide.html': '<h2>Related product pages</h2>',
  'blog/packaging-sample-checklist-before-mass-production.html': '<section class="faq-block">',
  'blog/food-packaging-compliance-document-request-checklist.html': '<section><h2>Sources and further reading</h2>',
  'blog/packaging-sample-color-tolerance-approval-guide.html': '<section><h2>Sources and further reading</h2>',
  'blog/variable-data-pharma-packaging.html': '<h2>Related product pages</h2>'
};

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function write(rel, value) {
  fs.writeFileSync(path.join(ROOT, rel), value, 'utf8');
}

function listHtml(relDir) {
  return fs.readdirSync(path.join(ROOT, relDir))
    .filter((name) => name.endsWith('.html'))
    .sort()
    .map((name) => `${relDir}/${name}`);
}

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, '&quot;');
}

function metaValue(html, key) {
  const tag = html.match(new RegExp(`<meta\\b(?=[^>]*(?:property|name)=["']${key.replace(':', '\\:')}["'])[^>]*>`, 'i'))?.[0];
  return tag?.match(/content=["']([^"']*)/i)?.[1] || '';
}

function setMeta(html, kind, key, value) {
  const matcher = new RegExp(`<meta\\b(?=[^>]*${kind}=["']${key.replace(':', '\\:')}["'])[^>]*>`, 'i');
  const tag = `<meta ${kind}="${key}" content="${escapeAttr(value)}"/>`;
  return matcher.test(html) ? html.replace(matcher, tag) : html.replace('</head>', `${tag}\n</head>`);
}

function absoluteUrl(url, canonical) {
  try {
    return new URL(url, canonical).href;
  } catch {
    return DEFAULT_IMAGE;
  }
}

function canonicalOf(html) {
  return html.match(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*href=["']([^"']+)/i)?.[1]
    || html.match(/<link\b(?=[^>]*href=["']([^"']+)["'])(?=[^>]*rel=["']canonical["'])[^>]*>/i)?.[1]
    || '';
}

function firstArticleImageFromJsonLd(html) {
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(match[1]);
      const queue = [data];
      while (queue.length) {
        const item = queue.shift();
        if (Array.isArray(item)) {
          queue.push(...item);
        } else if (item && typeof item === 'object') {
          const types = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
          if (types.some((type) => ['Article', 'BlogPosting', 'NewsArticle'].includes(type)) && item.image) {
            const image = Array.isArray(item.image) ? item.image[0] : item.image;
            return typeof image === 'string' ? image : image?.url || '';
          }
          queue.push(...Object.values(item));
        }
      }
    } catch {}
  }
  return '';
}

function bestOgImage(html, canonical) {
  const existing = metaValue(html, 'og:image');
  if (existing) return absoluteUrl(existing, canonical);
  const schemaImage = firstArticleImageFromJsonLd(html);
  if (schemaImage && !schemaImage.includes('/logo/')) return absoluteUrl(schemaImage, canonical);
  for (const match of html.matchAll(/<img\b[^>]*src=["']([^"']+)/gi)) {
    if (!match[1].includes('/logo/')) return absoluteUrl(match[1], canonical);
  }
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']*\/products\/[^"']+\.html)/gi)) {
    const productUrl = absoluteUrl(match[1], canonical);
    const pathname = new URL(productUrl).pathname.replace(/^\//, '');
    const productFile = path.join(ROOT, 'content-site', pathname);
    if (!fs.existsSync(productFile)) continue;
    const productHtml = fs.readFileSync(productFile, 'utf8');
    const productSchemaImage = productHtml.match(/"image"\s*:\s*"([^"]+)"/i)?.[1];
    if (productSchemaImage) return productSchemaImage;
    const productImg = productHtml.match(/<img\b[^>]*src=["']([^"']+)/i)?.[1];
    if (productImg && !productImg.includes('/logo/')) return absoluteUrl(productImg, productUrl);
  }
  return DEFAULT_IMAGE;
}

function findSitemapDates() {
  const html = read('content-site/sitemap.xml');
  const dates = new Map();
  for (const match of html.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) {
    dates.set(match[1], match[2]);
  }
  return dates;
}

function personAuthor() {
  return {
    '@type': 'Person',
    '@id': AUTHOR_ID,
    name: 'Lisa Wu',
    url: AUTHOR_URL,
    jobTitle: 'Sales Manager & Packaging Project Advisor',
    description: 'Lisa Wu coordinates B2B packaging specifications, quotations, sampling and production communication for BestPackFactory buyers.',
    sameAs: [`${SITE}/contact.html`, 'https://wa.me/8615886530985']
  };
}

function updateArticleJsonLd(html, rel, canonical, image, publishedFallback) {
  let articleCount = 0;
  let parseErrors = 0;
  const citations = CITATIONS[rel];
  html = html.replace(/(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (full, open, raw, close) => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      parseErrors += 1;
      return full;
    }
    const visit = (item) => {
      if (Array.isArray(item)) return item.forEach(visit);
      if (!item || typeof item !== 'object') return;
      const types = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
      if (types.some((type) => ['Article', 'BlogPosting', 'NewsArticle'].includes(type))) {
        articleCount += 1;
        item.author = personAuthor();
        item.datePublished = item.datePublished || publishedFallback;
        item.dateModified = REVIEW_DATE;
        item.image = item.image || [image];
        item.publisher = item.publisher || {
          '@type': 'Organization',
          name: 'BestPackFactory',
          logo: { '@type': 'ImageObject', url: `${SITE}/assets/logo/bestpackfactory-logo.svg` }
        };
        item.mainEntityOfPage = item.mainEntityOfPage || { '@type': 'WebPage', '@id': canonical };
        if (citations) item.citation = citations;
      }
      for (const value of Object.values(item)) visit(value);
    };
    visit(data);
    return `${open}${JSON.stringify(data)}${close}`;
  });
  if (parseErrors) throw new Error(`${rel}: ${parseErrors} JSON-LD block(s) could not be parsed`);
  if (!articleCount) {
    const headline = (html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .trim();
    const description = metaValue(html, 'description');
    if (!headline || !description) throw new Error(`${rel}: cannot build missing Article JSON-LD safely`);
    const article = {
      '@context': 'https://schema.org',
      '@type': rel.startsWith('news/') ? 'NewsArticle' : 'Article',
      headline,
      description,
      image: [image],
      datePublished: publishedFallback,
      dateModified: REVIEW_DATE,
      author: personAuthor(),
      publisher: {
        '@type': 'Organization',
        name: 'BestPackFactory',
        logo: { '@type': 'ImageObject', url: `${SITE}/assets/logo/bestpackfactory-logo.svg` }
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical }
    };
    if (citations) article.citation = citations;
    html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(article)}</script>\n</head>`);
  }
  return html;
}

function formatDate(iso) {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
}

function addVisibleAuthor(html, published) {
  html = html.replace(/<div class="content-author-meta"[^>]*data-content-author="lisa-wu"[\s\S]*?<\/div>/i, '');
  html = html.replace(/<p[^>]*>\s*Published [^<]*?By BestPackFactory\s*<\/p>/gi, '');
  const block = `<div class="content-author-meta" data-content-author="lisa-wu"><span>Written by <a href="/authors/lisa-wu.html" rel="author">Lisa Wu</a>, Sales Manager &amp; Packaging Project Advisor</span><span>Published <time datetime="${published}">${formatDate(published)}</time></span><span>Reviewed <time datetime="${REVIEW_DATE}">${formatDate(REVIEW_DATE)}</time></span><p>Lisa coordinates B2B packaging specifications, quotations, sampling and production communication with the BestPackFactory team.</p></div>`;
  if (!/<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(html)) throw new Error('Article is missing H1');
  return html.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)/i, `$1${block}`);
}

function addEvidence(html, rel) {
  const block = EVIDENCE_BLOCKS[rel];
  if (!block) return html;
  const id = block.match(/<h2 id="([^"]+)/)?.[1];
  if (id && html.includes(`id="${id}"`)) return html;
  const anchor = EVIDENCE_ANCHORS[rel];
  if (!html.includes(anchor)) throw new Error(`${rel}: evidence insertion anchor missing`);
  return html.replace(anchor, `${block}\n${anchor}`);
}

function updateProductHeadings() {
  let count = 0;
  for (const file of PRODUCT_H1_FILES) {
    const rel = `content-site/products/${file}`;
    let html = read(rel);
    if (/<h1\b/i.test(html)) {
      if (/<h1\b[^>]*class=["'][^"']*product-primary-heading/i.test(html)) {
        count += 1;
        continue;
      }
      throw new Error(`${rel}: unexpected existing H1`);
    }
    const firstH2 = html.match(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/i);
    if (!firstH2) throw new Error(`${rel}: no H2 available for semantic promotion`);
    html = html.replace(firstH2[0], `<h1 class="product-primary-heading">${firstH2[2]}</h1>`);
    write(rel, html);
    count += 1;
  }
  return count;
}

function updateArticles() {
  const sitemapDates = findSitemapDates();
  const files = [...listHtml('content-site/blog'), ...listHtml('content-site/news')];
  let shortened = 0;
  let evidence = 0;
  for (const rel of files) {
    const shortRel = rel.replace(/^content-site\//, '');
    let html = read(rel);
    const canonical = canonicalOf(html);
    if (!canonical) throw new Error(`${rel}: canonical missing`);
    const currentTitle = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '';
    const decodedTitle = currentTitle.replace(/&amp;/g, '&');
    const shortTitle = SHORT_TITLES[shortRel] || decodedTitle;
    if (SHORT_TITLES[shortRel]) shortened += 1;
    if ([...shortTitle].length > 60) throw new Error(`${rel}: title remains over 60 characters`);
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(shortTitle)}</title>`);
    const image = bestOgImage(html, canonical);
    html = setMeta(html, 'property', 'og:title', shortTitle);
    html = setMeta(html, 'property', 'og:type', 'article');
    html = setMeta(html, 'property', 'og:site_name', 'BestPackFactory');
    html = setMeta(html, 'property', 'og:url', canonical);
    html = setMeta(html, 'property', 'og:image', image);
    html = setMeta(html, 'name', 'twitter:card', 'summary_large_image');
    html = setMeta(html, 'name', 'twitter:title', shortTitle);
    html = setMeta(html, 'name', 'twitter:image', image);
    const publishedFromSchema = html.match(/"datePublished"\s*:\s*"(\d{4}-\d{2}-\d{2})"/i)?.[1];
    const published = publishedFromSchema || sitemapDates.get(canonical);
    if (!published) throw new Error(`${rel}: no defensible publication date found`);
    html = updateArticleJsonLd(html, shortRel, canonical, image, published);
    html = addVisibleAuthor(html, published);
    const beforeEvidence = html;
    html = addEvidence(html, shortRel);
    if (html !== beforeEvidence) evidence += 1;
    write(rel, html);
  }
  return { files: files.length, shortened, evidence };
}

function updateSitemap(rel) {
  let xml = read(rel);
  xml = xml.replace(/(<url>\s*<loc>https:\/\/www\.bestpackfactory\.com\/(?:products|blog|news)\/[^<]+<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/g, `$1${REVIEW_DATE}$2`);
  if (!xml.includes(AUTHOR_URL)) {
    xml = xml.replace('</urlset>', `  <url><loc>${AUTHOR_URL}</loc><lastmod>${REVIEW_DATE}</lastmod><changefreq>monthly</changefreq><priority>0.60</priority></url>\n</urlset>`);
  }
  write(rel, xml);
}

function updateAiSitemap() {
  const rel = 'public/ai-sitemap.xml';
  let xml = read(rel);
  if (!xml.includes(AUTHOR_URL)) {
    xml = xml.replace('</urlset>', `  <url><loc>${AUTHOR_URL}</loc><lastmod>${REVIEW_DATE}</lastmod></url>\n</urlset>`);
  }
  write(rel, xml);
}

function updateAiIndex(rel) {
  const data = JSON.parse(read(rel));
  data.authors = [{
    name: 'Lisa Wu',
    url: 'authors/lisa-wu.html',
    role: 'Sales Manager & Packaging Project Advisor',
    sameAs: ['contact.html', 'https://wa.me/8615886530985'],
    scope: 'B2B packaging specification intake, sampling and production communication'
  }];
  write(rel, `${JSON.stringify(data, null, 2)}\n`);
}

function updateLlms(rel) {
  let text = read(rel);
  if (!text.includes(AUTHOR_URL)) {
    text = `${text.trimEnd()}\n\n## Author identity\n\n- [Lisa Wu — Sales Manager & Packaging Project Advisor](${AUTHOR_URL}): Coordinates B2B packaging specifications, quotations, sampling and production communication.\n`;
  }
  write(rel, text);
}

function main() {
  if (PRODUCT_H1_FILES.length !== 41) throw new Error('Product H1 scope must remain exactly 41 files');
  if (Object.keys(SHORT_TITLES).length !== 54) throw new Error(`Expected 54 title overrides, found ${Object.keys(SHORT_TITLES).length}`);
  for (const [rel, title] of Object.entries(SHORT_TITLES)) {
    if ([...title].length > 60) throw new Error(`${rel}: override exceeds 60 characters`);
    if (!fs.existsSync(path.join(ROOT, 'content-site', rel))) throw new Error(`${rel}: title target missing`);
  }
  const products = updateProductHeadings();
  const articles = updateArticles();
  updateSitemap('content-site/sitemap.xml');
  updateSitemap('public/sitemap.xml');
  updateAiSitemap();
  updateAiIndex('content-site/ai-index.json');
  updateAiIndex('public/ai-index.json');
  updateLlms('content-site/llms.txt');
  updateLlms('public/llms.txt');
  console.log(JSON.stringify({ products, ...articles, author: AUTHOR_URL }, null, 2));
}

main();
