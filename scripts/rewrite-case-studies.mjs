// content-site/case-studies.html was shipping unfinished editorial copy to production.
// Three "case studies" were published live, each headed
//
//   <h3>Case: Custom Rigid Gift Boxes for a Beauty Brand <em>(placeholder)</em></h3>
//
// with list items reading literally "[Product description — TODO]", "[Packaging goal —
// TODO]" and "[Outcome — TODO]". The page also told visitors, in italics, that it was
// "placeholder structure only". It was indexable, in the sitemap, and linked from the
// main navigation of every page on the site.
//
// Two claims on the page were false as it stood: the meta description promised "case
// studies: rigid gift boxes, flat-bottom pet food bags and food packaging projects",
// and the opening line promised "real project examples". A buyer arriving from that
// snippet found TODO markers. For a supplier whose entire pitch is manufacturing
// precision, this was the single most damaging page on the site.
//
// What this rewrite does NOT do: invent the missing content. Filling in a client, a
// brief and an outcome would mean fabricating customer facts and results that cannot
// be verified — the same reason the FSC CoC claim was not repeated in the homepage FAQ.
// Named case studies are the user's to supply.
//
// What it does instead: convert the page from three fake case studies into three real
// specification walkthroughs. The question a sourcing buyer actually brings to a "case
// studies" page is "have you built something like mine, and what exactly did you
// specify?" — and that can be answered honestly and in far more depth than the
// placeholders ever did, because the specifications are already published across this
// site. Every figure below (ΔE ≤ 3.0, AQL 2.5, ±1.5 mm / ±2 mm, greyboard, PET/AL/PE,
// drop and seal testing, 3 mm bleed) was verified to appear on existing product,
// material and whitepaper pages before being used here.
//
// The "Result" row — which was a TODO, and which is where a dishonest rewrite would put
// an invented "sales lifted 30%" — becomes "Acceptance evidence": the checks actually
// run before shipment. That is a verifiable commitment rather than a testimonial, and
// it is worth more to a B2B buyer.
//
// Three further defects fixed in the same pass:
//   * All five hreflang alternates (de/fr/es/ja/ar) pointed at /<locale>/case-studies.html
//     and none of those files exist, so the whole cluster resolved to 404s. Removed,
//     leaving the self-referential en + x-default pair.
//   * The stale Next.js flight payload embedded in the body — a serialized duplicate of
//     the page from an older build — carried its own copy of the TODO text, so the
//     placeholders would have survived in the served HTML even after the visible markup
//     was fixed.
//   * The page had one internal body link. It now links to the product, material,
//     finish, industry and RFQ pages each walkthrough actually depends on.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const FILE = path.join(ROOT, 'content-site', 'case-studies.html');
const apply = !process.argv.includes('--dry-run');

const TITLE = 'Packaging Project Walkthroughs | BestPackFactory';
const DESCRIPTION =
  'How three common packaging projects are specified end to end: rigid gift boxes, ' +
  'flat-bottom pet food bags and grease-resistant food cartons, with the structure, ' +
  'tolerances and pre-shipment checks used on each.';

// Answers are written to be quotable verbatim by an answer engine, and every one is
// consistent with faq.html and the product specification tables.
const FAQ = [
  {
    q: 'Do you publish named customer case studies?',
    a: 'No. Client names, artwork and photographs are only published with written permission, and BestPackFactory does not publish work it has not been cleared to show. What is published instead is the full specification behind each project type — structure, material, tolerances and the checks run before shipment — so a buyer can judge the work on its technical detail rather than on a logo wall.'
  },
  {
    q: 'How is a packaging project specified from scratch?',
    a: 'Six stages: confirm dimensions and filling method, select material structure, produce a dieline, make and approve a physical sample, run bulk production, then inspect before shipment. A dieline and artwork proof are returned within 24 hours, samples in 5 to 7 working days, and bulk production runs 20 to 30 days after final sample approval.'
  },
  {
    q: 'What is checked before a shipment is released?',
    a: 'Colour is measured against the approved digital proof to ΔE ≤ 3.0. Dimensions are held to ±1.5 mm on paper boxes and ±2 mm on flexible packaging. Finished goods are inspected to AQL 2.5 for major defects, with random inspection before shipment. Structure-specific checks are added where the format demands them, such as seal strength and drop testing on filled pet food bags.'
  },
  {
    q: 'Can I get a specification walkthrough for my own product?',
    a: 'Yes. Send product dimensions, weight, filling condition, target quantity and destination port, and a structure recommendation with a dieline is prepared against those specifics. The dieline is free and is returned within 24 hours.'
  },
  {
    q: 'What if my product does not match any of these three walkthroughs?',
    a: 'These three cover the most common briefs, not the range. Paperboard and corrugated formats include folding cartons, mailers, rigid and magnetic boxes and paper bags; flexible formats include stand-up pouches, coffee bags with degassing valves, spout pouches, mylar bags and roll stock, alongside labels, PET bottles and tinplate tins.'
  }
];

const WALKTHROUGHS = [
  {
    id: 'rigid-gift-box',
    heading: 'Walkthrough 1 — Rigid gift box for a beauty or fragrance launch',
    intro:
      'The brief that arrives most often: a premium unboxing moment, a product that must not move in transit, and a launch date that fixes the schedule. The cost driver is not the box — it is the finish stack and the insert.',
    rows: [
      ['Typical brief', 'A retail-facing gift box for a skincare or fragrance set, shelf-presented, with a fitted insert so nothing rattles.'],
      ['Structure specified', 'Rigid greyboard base and lid, wrapped in coated paper, with soft-touch lamination, foil-stamped logo and a die-cut velvet-covered insert.'],
      ['Why that structure', 'Rigid greyboard holds a square edge and survives handling that a folding carton would crush. Soft-touch lamination is what produces the perceived weight buyers describe as premium; foil stamping supplies the single high-contrast detail that reads at shelf distance.'],
      ['Where the cost sits', 'Board thickness, wrap paper, and the number of separate finishing passes. Each additional pass — foil, embossing, spot UV — is a separate setup, so consolidating finishes onto one panel lowers unit cost more than reducing box size does.'],
      ['Sampling', '6 working days from artwork confirmation, after a free dieline returned within 24 hours.'],
      ['Acceptance evidence', 'Colour to ΔE ≤ 3.0 against the approved proof, dimensions to ±1.5 mm, lid-to-base fit checked on the sample, and AQL 2.5 major-defect inspection before shipment.']
    ],
    links: [
      ['/products/custom-rigid-boxes.html', 'Custom rigid boxes'],
      ['/finishes/soft-touch-packaging.html', 'Soft-touch lamination'],
      ['/finishes/foil-stamping-packaging.html', 'Foil stamping'],
      ['/industries/cosmetic-packaging.html', 'Cosmetic packaging']
    ]
  },
  {
    id: 'pet-food-bag',
    heading: 'Walkthrough 2 — Flat-bottom bag for a pet food brand',
    intro:
      'Pet food is the format where packaging fails most visibly, because the bag is heavy, the contents are oily and abrasive, and the failure happens in the buyer’s warehouse rather than on the shelf.',
    rows: [
      ['Typical brief', 'A resealable retail bag for dry kibble or freeze-dried treats that stands unaided, survives palletised transit and keeps fat from migrating into the laminate.'],
      ['Structure specified', 'PET/AL/PE barrier laminate in a flat-bottom (box-pouch) construction with a press-to-close zipper and reinforced side gussets.'],
      ['Why that structure', 'The aluminium layer supplies the oxygen and aroma barrier that oily kibble needs — a metallised film will not hold the same barrier once fat contacts it. Flat-bottom construction gives five printable panels and a base that stands under load, which side-gusset bags will not do at higher fill weights.'],
      ['Where the cost sits', 'Laminate structure and thickness, bag size, and zipper type. Moving from a metallised to a foil laminate is the largest single step in unit cost, and is the one that should be decided by the fat content of the product rather than by price.'],
      ['Sampling', '7 working days from artwork confirmation. Filled samples are recommended over empty ones, because seal and drop behaviour cannot be judged on an unfilled bag.'],
      ['Acceptance evidence', 'Colour to ΔE ≤ 3.0, dimensions to ±2 mm on flexible packaging, seal strength verified on the approved structure, drop testing on filled samples, and AQL 2.5 major-defect inspection before shipment.']
    ],
    links: [
      ['/products/custom-flat-bottom-pouches.html', 'Flat-bottom pouches'],
      ['/materials/pet-pe-aluminum-film.html', 'PET / AL / PE barrier film'],
      ['/industries/pet-food-packaging.html', 'Pet food packaging'],
      ['/blog/pet-food-packaging-buyer-guide.html', 'Pet food buyer guide']
    ]
  },
  {
    id: 'food-carton',
    heading: 'Walkthrough 3 — Grease-resistant cartons for a food service brand',
    intro:
      'Food service is a volume-and-consistency problem rather than a luxury one. The specification has to survive hot, oily contents and a repeat order cycle where every batch must match the last.',
    rows: [
      ['Typical brief', 'Branded takeaway cartons or bags for hot, greasy food, in repeat volumes, that hold their appearance from counter to customer.'],
      ['Structure specified', 'Kraft or white cardboard with a grease-resistant coating on the contact face, flexo-printed, with a locking base for stack strength.'],
      ['Why that structure', 'The coating, not the board weight, is what stops oil striking through and darkening the print. Flexo printing is specified over digital because the economics invert at food-service volumes, and because it holds colour more consistently across repeat runs.'],
      ['Where the cost sits', 'Board grade, coating type and the number of print colours. Restricting artwork to two or three spot colours on kraft is usually the difference between a viable unit cost and a redesign.'],
      ['Sampling', '5 working days from artwork confirmation — the fastest of the three, because the structures are simpler and the tooling is lighter.'],
      ['Acceptance evidence', 'Colour to ΔE ≤ 3.0, dimensions to ±1.5 mm, grease resistance confirmed on the coated face, food-contact material declarations supplied where the application requires them, and AQL 2.5 inspection before shipment.']
    ],
    links: [
      ['/products/custom-food-packaging.html', 'Custom food packaging'],
      ['/products/custom-folding-cartons.html', 'Folding cartons'],
      ['/materials/kraft-paper-packaging.html', 'Kraft paper'],
      ['/industries/food-packaging.html', 'Food packaging']
    ]
  }
];

const STAGES = [
  ['1. Dimensions and filling', 'Product size, weight and how it is filled. This decides the format before any material is discussed, and it is where most under-specified RFQs stall.'],
  ['2. Material structure', 'Board grade and thickness, or laminate structure, chosen against barrier, load and contact requirements rather than against price alone.'],
  ['3. Dieline', 'A structural dieline with 3 mm bleed, returned free within 24 hours, against which artwork is built.'],
  ['4. Physical sample', '5 to 7 working days. Colour, fit, seal and structure are judged on the sample, not on a screen proof.'],
  ['5. Bulk production', '20 to 30 days after final sample approval, on a schedule fixed on the order sheet.'],
  ['6. Inspection and shipment', 'AQL 2.5 major-defect inspection, then flat-packed into export cartons and quoted FOB Shenzhen, CIF, EXW or DDP.']
];

// ---------------------------------------------------------------------------

function escapeText(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escapeAttr(value) {
  return escapeText(value).replace(/"/g, '&quot;');
}

function specTable(rows) {
  const body = rows
    .map(([th, td]) => `<tr><th>${escapeText(th)}</th><td>${escapeText(td)}</td></tr>`)
    .join('\n');
  return `<div class="spec-scroll"><table class="technical-spec-table"><tbody>\n${body}\n</tbody></table></div>`;
}

function walkthroughHtml(item) {
  const links = item.links
    .map(([href, label]) => `<a href="${escapeAttr(href)}">${escapeText(label)}</a>`)
    .join(' · ');
  return [
    `<section class="tech-spec-section geo-table-block" id="${escapeAttr(item.id)}">`,
    `<h2>${escapeText(item.heading)}</h2>`,
    `<p>${escapeText(item.intro)}</p>`,
    specTable(item.rows),
    `<p class="tech-note">Specifications: ${links}</p>`,
    '</section>'
  ].join('\n');
}

const bodyHtml = [
  '<h1>Packaging Project Walkthroughs</h1>',
  '<p class="blog-meta">BestPackFactory · Shenzhen factory-direct · MOQ 500 PCS · 24h RFQ response</p>',
  '<p class="answer-first-snippet"><strong>Packaging project walkthroughs</strong> — how three common briefs are specified end to end, from dimensions through material structure, dieline, sampling and pre-shipment inspection. Every specification below is the one published on the corresponding product page.</p>',

  '<section class="ai-snapshot quick-answer-box">',
  '<h2>Quick Answer</h2>',
  '<p>BestPackFactory does not publish named client case studies, because client names and artwork are only shown with written permission. Published instead is the complete specification behind each project type: structure, material, tolerances, sampling time and the checks run before shipment. Every project follows the same six stages — dimensions, material, dieline, sample, production, inspection — with a free dieline in 24 hours, samples in 5 to 7 working days and bulk production 20 to 30 days after sample approval.</p>',
  '</section>',

  '<section class="tech-spec-section geo-table-block">',
  '<h2>How every project runs</h2>',
  `<p>The same six stages apply whether the order is 500 rigid boxes or a repeat run of food cartons. Stage 1 is where projects succeed or stall: an RFQ that arrives without dimensions, weight and filling method cannot be quoted accurately, only guessed at. The <a href="/custom-packaging-rfq-template.html">RFQ template</a> exists to capture those fields in one pass.</p>`,
  specTable(STAGES),
  '</section>',

  ...WALKTHROUGHS.map(walkthroughHtml),

  '<section class="tech-spec-section">',
  '<h2>What is published here, and what is not</h2>',
  '<p>Named customers, their artwork and their photographs are not published without written permission, and no logo appears on this site that has not been cleared. That rules out the format most supplier sites use, where a wall of brand marks stands in for evidence.</p>',
  '<p>The substitute offered here is specification detail: the structure chosen, the reason it was chosen over the alternative, the tolerance it is held to and the check that proves it. Those are verifiable against the <a href="/products.html">product pages</a>, the <a href="/whitepapers.html">technical whitepapers</a> and the <a href="/faq.html">FAQ</a>, and they are the same numbers written onto the order sheet. Certificates are verified per order; BestPackFactory does not claim certifications it does not hold.</p>',
  '<p>If a project of your own is already under way, a specification walkthrough can be prepared against it directly — see the <a href="/quote-ready-packaging-sourcing-hub.html">sourcing hub</a> for what to prepare, or request a <a href="/samples.html">free dieline</a>.</p>',
  '</section>',

  '<section class="faq-block">',
  '<h2>FAQ</h2>',
  ...FAQ.map(item => `<details><summary>${escapeText(item.q)}</summary><p>${escapeText(item.a)}</p></details>`),
  '</section>',

  '<p class="blog-cta"><a class="btn-cta" href="/contact.html">Send your specification and get a walkthrough for your own project →</a></p>'
].join('\n');

// ---------------------------------------------------------------------------

const original = fs.readFileSync(FILE, 'utf8');
let html = original;
const changes = [];

// --- 1. replace the article body -----------------------------------------
// Anchored on </article></main> rather than the first </article>: the old body nested
// three <article class="case-study-frame"> blocks inside the blog-article wrapper, so a
// non-greedy match to the first closing tag swallows only the opening third of the page
// and leaves two placeholder blocks stranded after the replacement.
const ARTICLE = /<article class="blog-article">[\s\S]*<\/article>(?=\s*<\/main>)/;
if (!ARTICLE.test(html)) throw new Error('blog-article wrapper not found');
html = html.replace(ARTICLE, () => `<article class="blog-article">\n${bodyHtml}\n</article>`);
changes.push('article body rewritten');

// --- 2. strip the stale flight payload ------------------------------------
// A serialized copy of the old page from build DSuN6X40J32GyVvwmlMcH, carrying its own
// copy of the TODO text. extractBody() in lib/static-pages.js only strips main.js
// script tags, so everything here is re-injected into the served page.
const flightBefore = (html.match(/<script>self\.__next_f\.push\(/g) || []).length;
html = html.replace(/<script>\(self\.__next_f=self\.__next_f\|\|\[\]\)\.push\([\s\S]*?\)<\/script>/g, '');
html = html.replace(/<script>self\.__next_f\.push\(\[[\s\S]*?\]\)<\/script>/g, '');
const flightAfter = (html.match(/<script>self\.__next_f\.push\(/g) || []).length;
changes.push(`flight payload scripts ${flightBefore} -> ${flightAfter}`);

// --- 3. metadata ----------------------------------------------------------
html = html.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${escapeText(TITLE)}</title>`);
for (const pattern of [
  /(<meta name="description" content=")([^"]*)(")/i,
  /(<meta property="og:description" content=")([^"]*)(")/i,
  /(<meta name="twitter:description" content=")([^"]*)(")/i
]) {
  html = html.replace(pattern, (_m, lead, _old, tail) => `${lead}${escapeAttr(DESCRIPTION)}${tail}`);
}
for (const pattern of [
  /(<meta property="og:title" content=")([^"]*)(")/i,
  /(<meta name="twitter:title" content=")([^"]*)(")/i
]) {
  html = html.replace(pattern, (_m, lead, _old, tail) => `${lead}${escapeAttr(TITLE)}${tail}`);
}
changes.push('title/description/og/twitter rewritten');

// --- 4. drop hreflang alternates that point at files which do not exist ----
const localeAlternates = [...html.matchAll(/<link rel="alternate" hrefLang="(de|fr|es|ja|ar)"[^>]*\/>/gi)];
for (const match of localeAlternates) html = html.replace(match[0], '');
changes.push(`removed ${localeAlternates.length} hreflang alternates pointing at non-existent locale pages`);

// --- 5. JSON-LD -----------------------------------------------------------
const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
const collection = ldBlocks.find(block => {
  try { return JSON.parse(block[1])['@type'] === 'CollectionPage'; } catch { return false; }
});
if (!collection) throw new Error('CollectionPage JSON-LD not found');

const article = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Packaging Project Walkthroughs',
  description: DESCRIPTION,
  url: 'https://www.bestpackfactory.com/case-studies.html',
  author: { '@type': 'Organization', name: 'BestPackFactory' },
  publisher: { '@type': 'Organization', name: 'BestPackFactory', url: 'https://www.bestpackfactory.com/' },
  isPartOf: { '@type': 'WebSite', name: 'BestPackFactory', url: 'https://www.bestpackfactory.com/' }
};
const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(item => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a }
  }))
};
html = html.replace(
  collection[0],
  () => `<script type="application/ld+json">${JSON.stringify(article)}</script>` +
        `<script type="application/ld+json">${JSON.stringify(faqLd)}</script>`
);
changes.push('CollectionPage -> Article + FAQPage');

// --- checks ---------------------------------------------------------------
const body = html.slice(html.indexOf('<body'));
const visible = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

if (/TODO|\(placeholder\)|placeholder structure/i.test(body)) {
  throw new Error('placeholder text still present');
}
// Google requires FAQPage markup to reproduce content visible on the page.
const unseen = FAQ.filter(item => !body.includes(escapeText(item.q)));
if (unseen.length) throw new Error(`FAQ questions in markup but not visible: ${unseen.map(u => u.q).join(' | ')}`);

const internalLinks = new Set([...body.matchAll(/href="(\/[^"#]*)"/g)].map(m => m[1]));
for (const href of internalLinks) {
  if (href.endsWith('.html')) {
    const target = path.join(ROOT, 'content-site', href.replace(/^\//, ''));
    if (!fs.existsSync(target)) throw new Error(`internal link target missing: ${href}`);
  }
}

const stats = {
  mode: apply ? 'apply' : 'dry-run',
  changes,
  words: visible.trim().split(/\s+/).length,
  internalLinks: internalLinks.size,
  faqQuestions: FAQ.length,
  placeholdersRemaining: 0,
  bytes: { before: original.length, after: html.length }
};

if (apply) fs.writeFileSync(FILE, html);
console.log(JSON.stringify(stats, null, 2));
