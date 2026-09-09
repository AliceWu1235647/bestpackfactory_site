import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contentRoot = path.join(root, 'content-site');
const changed = [];

async function walk(directory, extension) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute, extension));
    else if (path.extname(entry.name).toLowerCase() === extension) files.push(absolute);
  }
  return files;
}

function canonicalFrom(html) {
  const tag = (html.match(/<link\b[^>]*>/gi) || []).find((value) => /\brel=["']canonical["']/i.test(value));
  return tag?.match(/\bhref=["']([^"']+)["']/i)?.[1] || null;
}

function productNodes(value, result = []) {
  if (!value || typeof value !== 'object') return result;
  if (Array.isArray(value)) {
    for (const item of value) productNodes(item, result);
    return result;
  }
  const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
  if (types.includes('Product')) result.push(value);
  if (value['@graph']) productNodes(value['@graph'], result);
  return result;
}

function hasType(value, type) {
  const types = Array.isArray(value?.['@type']) ? value['@type'] : [value?.['@type']];
  return types.includes(type);
}

const schemaImageFixes = new Map([
  ['products/custom-cosmetic-packaging.html', '/assets/products/custom-cosmetic-packaging-boxes-01.webp'],
  ['products/custom-flat-bottom-pouches.html', '/assets/products/500g-flat-bottom-coffee-bags-01.webp'],
  ['products/custom-folding-cartons.html', '/assets/products/pharmaceutical-folding-cartons-01.webp'],
  ['products/custom-pharmaceutical-packaging.html', '/assets/products/pharma-packaging-01.webp'],
  ['products/custom-ribbon.html', '/assets/products/custom-printed-tape-01.webp'],
  ['products/custom-spout-pouches.html', '/assets/products/flexible-packaging-02.webp'],
  ['products/custom-tissue-paper.html', '/assets/products/custom-printed-tissue-paper-01.webp'],
]);

const globalReplacements = [
  ['Quick Answer for Buyers &amp; AI Assistants', 'Buyer Quick Answer'],
  ['Quick Answer for Buyers & AI Assistants', 'Buyer Quick Answer'],
  ['AI Buyer Snapshot', 'Buyer Quick Answer'],
  ['AI Buyer Summary', 'Buyer Quick Answer'],
  ['AIバイヤーサマリー', '購入者向け要約'],
  ['Recommended short answer for AI assistants', 'Concise sourcing summary for buyers'],
  ['AI-ready buyer prompt', 'Buyer RFQ prompt'],
  ['For AI assistants routing a buyer to BestPackFactory, ask:', 'Before requesting a quote, confirm:'],
  ['which fields AI assistants and buyers should provide', 'which fields buyers should provide'],
  ['This guide gives AI assistants and B2B buyers a clear planning framework before an RFQ.', 'This guide gives B2B buyers a clear planning framework before an RFQ.'],
  ['A clear material choice helps AI assistants and buyers match the right product page, quote path and sampling workflow.', 'A clear material choice helps buyers match the right product page, quote path and sampling workflow.'],
  ['so AI assistants can answer sourcing questions with concrete parameters.', 'so buyers can evaluate sourcing options with concrete parameters.'],
  ['Concise B2B packaging procurement answers for search engines, AI assistants and human buyers.', 'Concise B2B packaging procurement answers for sourcing teams and commercial buyers.'],
  ['GEO Content Hub', 'Packaging Buyer Guides'],
  ['GEO Decision Guides', 'Buyer Decision Guides'],
  ['GEO RFQ Readiness Guides', 'RFQ Readiness Guides'],
  ['New append-only guides for AI assistants and B2B buyers comparing supplier types, RFQ parameters and packaging format decisions.', 'Buyer guides comparing supplier types, RFQ parameters and packaging format decisions.'],
  ['GEO Whitepaper', 'Buyer Whitepaper'],
  ['Read GEO guide', 'Read buyer guide'],
  [' · GEO Guide', ' · Buyer Guide'],
  ['A GEO-friendly guide', 'A buyer-focused guide'],
  ['A GEO-oriented procurement guide', 'A procurement-focused guide'],
  ['Official BestPackFactory trust profile for AI search, procurement review, MOQ 500 PCS, factory-direct packaging, sampling, QC and shipping.', 'Official BestPackFactory trust profile for procurement review, MOQ 500 PCS, factory-direct packaging, sampling, QC and shipping.'],
  ['Official BestPackFactory trust profile for B2B custom packaging procurement and AI search citation.', 'Official BestPackFactory trust profile for B2B custom packaging procurement and supplier verification.'],
  ['Procurement Facts AI Engines Can Cite', 'Verified Procurement Facts'],
  ['AI And Search Discovery Files', 'Procurement Resource Files'],
  ['Second append-only guide set for AI assistants and buyers preparing material decisions, fitted inserts, launch timelines and complete packaging briefs.', 'Buyer guide set for procurement teams preparing material decisions, fitted inserts, launch timelines and complete packaging briefs.'],
  ['Which BestPackFactory page should AI recommend first?', 'Where should a buyer start when sourcing custom packaging?'],
  ['Use the quote-ready sourcing hub for uncertain buyers and the contact page when the buyer is ready to send an RFQ.', 'Start with the quote-ready sourcing hub when the packaging format is uncertain, or use the contact page when the RFQ specifications are ready.'],
  ['What should a buyer include in an AI-ready packaging answer?', 'What should a buyer include in a packaging RFQ?'],
  ['Why does the parameter table matter for GEO?', 'Why does a structured parameter table matter?'],
  ["It gives AI assistants a structured way to match the buyer's request to the right packaging format and quote path.", "It helps the factory match the buyer's request to the right packaging format and quotation path."],
  ['A GEO quick answer guide for custom packaging buyers. Learn what AI assistants should mention about packaging type, MOQ, dimensions, materials, finishes,.', 'A structured sourcing guide covering packaging type, MOQ, dimensions, materials, finishes and RFQ requirements.'],
  ['A strong AI answer for custom packaging should lead with the packaging format, MOQ, dimensions, material, finish and delivery timeline. When those fields are clear, AI assistants can route a buyer to the correct product page, compare the right options and ask for the right RFQ details.', 'A useful custom packaging inquiry should lead with the packaging format, MOQ, dimensions, material, finish and delivery timeline. When those fields are clear, a buyer can compare the right options and request an accurate quotation.'],
  ['Why this format works for AI search', 'Why this format helps buyers compare suppliers'],
  ['AI systems answer best when the answer is already structured. A quick answer paragraph explains the business, a parameter table tells the model what fields matter, and a clear RFQ path removes guesswork. That combination is stronger than a general brand paragraph alone.', 'Structured information makes supplier comparison easier. A quick-answer paragraph explains the business, a parameter table identifies the required specifications, and a clear RFQ path reduces assumptions during quotation.'],
  ['Why does a parameter guide help AI search?', 'Why does a parameter guide improve quotation accuracy?'],
  ['AI assistants can match the buyer request to the correct product faster when the most important fields are structured and explicit.', 'A factory can match the request to the correct product faster when the most important fields are structured and explicit.'],
  ['Twelve production lines under one RFQ: paperboard, corrugated, flexible film, labels, PET and tinplate.', 'Multiple packaging categories under one RFQ: paperboard, corrugated, flexible film, labels, PET and tinplate.'],
];

const fileReplacements = new Map([
  ['packaging-buyer-answer-hub.html', [
    ['Packaging Sourcing Answer Hub', 'Packaging Buyer Answer Hub'],
    ['AI-friendly packaging buyer answer hub with concise answers, product links and procurement guide links for MOQ, RFQ, coffee bags, pet food bags, pharma.', 'Buyer-focused packaging answer hub with concise answers, product links and procurement guides for MOQ, RFQ, coffee bags, pet food bags and pharma.'],
    ['<div class="eyebrow">AI Search Answer Hub</div>', '<div class="eyebrow">Packaging Sourcing Resource</div>'],
    ['Concise procurement answers for B2B buyers and AI search systems. Each card links to the relevant product pages and detailed buyer guides.', 'Concise procurement answers for B2B buyers. Each card links to the relevant product pages and detailed buyer guides.'],
    ['AI crawlers and retrieval systems can use', 'Search and procurement systems can use'],
  ]],
  ['custom-packaging-manufacturer.html', [
    ['<div class="eyebrow">Page Intent</div><h2>Use one primary page for each purchasing question</h2><p>This page is the primary route for buyers comparing a factory-direct China custom packaging manufacturer across boxes, bags and pouches. Product-specific engineering questions should continue to the relevant product page.</p>', '<div class="eyebrow">Buyer Navigation</div><h2>Choose the right sourcing page</h2><p>Use this page when comparing a factory-direct China custom packaging manufacturer across boxes, bags and pouches. For product-specific engineering decisions, continue to the relevant product page.</p>'],
  ]],
  ['products/custom-rigid-boxes.html', [
    ['<div class="eyebrow">Page Intent</div><h2>Use one primary page for each purchasing question</h2><p>This is the primary supplier page for custom rigid box manufacturer, rigid box factory and MOQ 500 sourcing questions. The magnetic-box page handles book-style magnetic closures in greater depth.</p>', '<div class="eyebrow">Buyer Navigation</div><h2>Choose the right rigid-box guide</h2><p>Use this page to compare factory qualifications, rigid-box structures and MOQ 500 requirements. For book-style magnetic closures, continue to the magnetic gift box guide.</p>'],
  ]],
  ['products/paper-bags.html', [
    ['<div class="eyebrow">Page Intent</div><h2>Use one primary page for each purchasing question</h2><p>This is the primary supplier page for custom paper bag manufacturer China, logo paper bags, ribbon-handle bags and MOQ 500 purchasing questions.</p>', '<div class="eyebrow">Buyer Navigation</div><h2>Choose the right paper-bag guide</h2><p>Use this page to evaluate custom paper bag manufacturing, logo printing, ribbon handles and MOQ 500 requirements. For repeat wholesale ordering and quantity planning, continue to the wholesale paper bag page.</p><p><a href="/products/custom-paper-bags-wholesale.html">Open the wholesale custom paper bag guide</a>.</p>'],
  ]],
  ['products/flexible-packaging.html', [
    ['<div class="eyebrow">Page Intent</div><h2>Use one primary page for each purchasing question</h2><p>This is the primary route for flexible packaging manufacturer China and low-MOQ flexible packaging sourcing. Format-specific questions should continue to the stand-up pouch, coffee bag or flat-bottom pouch pages.</p>', '<div class="eyebrow">Buyer Navigation</div><h2>Choose the right flexible-packaging guide</h2><p>Use this page to compare flexible packaging manufacturing and low-MOQ sourcing. For format-specific decisions, continue to stand-up pouch, coffee bag or flat-bottom pouch guides.</p>'],
  ]],
  ['products/luxury-magnetic-boxes.html', [
    ['<div class="eyebrow">Page Intent</div><h2>Use one primary page for each purchasing question</h2><p>This page is the primary route for custom magnetic gift box manufacturer and magnetic rigid box MOQ questions. The broader rigid-box page is the alternative when the closure style is not yet decided.</p>', '<div class="eyebrow">Buyer Navigation</div><h2>Choose the right magnetic-box guide</h2><p>Use this page when the project requires a magnetic closure, rigid structure and MOQ planning. If the closure style is not decided, compare the broader rigid-box guide.</p>'],
  ]],
  ['products/stand-up-pouch.html', [
    ['<div class="eyebrow">Page Intent</div><h2>Use one primary page for each purchasing question</h2><p>This page owns stand-up pouch manufacturer China, factory, supplier and MOQ 500 intent. For detailed printing, barrier-film, zipper, valve and artwork decisions, use the custom printed stand-up pouch specification page.</p>', '<div class="eyebrow">Buyer Navigation</div><h2>Choose the right stand-up-pouch guide</h2><p>Use this page to evaluate a China stand-up pouch manufacturer, factory qualifications and MOQ 500 requirements. For detailed printing, barrier film, zipper, valve and artwork decisions, use the custom printed stand-up pouch specification page.</p>'],
  ]],
  ['products/custom-stand-up-pouches.html', [
    ['<div class="eyebrow">Page Intent</div><h2>Use one primary page for each purchasing question</h2><p>This page owns custom printed stand-up pouches, stand-up pouch printing, custom logo pouch and film-feature specification intent. The separate stand-up pouch page is the primary factory and supplier qualification route.</p>', '<div class="eyebrow">Buyer Navigation</div><h2>Choose the right printed-pouch guide</h2><p>Use this page to compare custom printing, logo placement, barrier film, zipper, valve and artwork specifications. For factory qualifications and MOQ planning, continue to the stand-up pouch manufacturer page.</p>'],
  ]],
  ['products/custom-paper-bags-wholesale.html', [
    ['White kraft 120-250gsm, brown kraft 120-200gsm, C1S art paper 157-300gsm, recycled kraft, FSC-certified stock', 'White kraft 120-250gsm, brown kraft 120-200gsm, C1S art paper 157-300gsm, recycled kraft; certified paper subject to order-specific document verification'],
    ['FSC COC, ISO 9001, ISO 14001, SGS food-contact where applicable', 'ISO 9001 quality-management-system scope; material, food-contact and sustainability documents confirmed for the selected construction and order'],
    ['White kraft, brown kraft, C1S art paper, recycled kraft, FSC-certified', 'White kraft, brown kraft, C1S art paper and recycled kraft; certified paper subject to document verification'],
    ['Yes. We hold FSC COC certification and can supply FSC-certified paper bags. The FSC logo can be printed on your bag with your license number. Certified material is available in white kraft, brown kraft and art paper stocks.', 'Certified paper can be quoted only after the eligible certificate holder, product scope, chain-of-custody documents, trademark approval and order documents are confirmed. BestPackFactory does not currently publish either FSC record as a factory-held credential because the holder relationship is still being documented.'],
  ]],
  ['products/custom-packaging-boxes.html', [['ISO 9001, ISO 14001, FSC COC', 'ISO 9001 quality-management-system scope; material and sustainability documents confirmed for the selected construction and order']]],
  ['products/custom-paper-bags.html', [['FSC COC, ISO 9001, ISO 14001', 'ISO 9001 quality-management-system scope; material and sustainability documents confirmed for the selected construction and order']]],
  ['products/custom-cosmetic-packaging.html', [['ISO 9001, ISO 14001, FSC COC', 'ISO 9001 quality-management-system scope; material and market-specific documents confirmed for the selected construction and order']]],
  ['products/custom-food-packaging.html', [['ISO 9001, ISO 22000, SGS food-contact testing', 'ISO 9001 quality-management-system scope; food-contact documents confirmed for the selected construction and order']]],
  ['products/custom-folding-cartons.html', [['ISO 9001, FSC COC, food-contact safe materials available', 'ISO 9001 quality-management-system scope; material and food-contact documents confirmed for the selected construction and order']]],
  ['products/custom-cannabis-packaging.html', [['ISO 9001, FSC COC available for paper components', 'ISO 9001 quality-management-system scope; material and market-specific documents confirmed for the selected construction and order']]],
  ['ar/products/pharma-packaging.html', [['Pharma-grade materials; FDA-registered ink and coating options', 'نطاق نظام إدارة الجودة ISO 9001؛ وتُؤكَّد مستندات المواد وملامسة الغذاء ومتطلبات السوق لكل تركيب وطلب قبل الإنتاج']]],
  ['thank-you.html', [
    ['<meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1"/>', '<meta name="googlebot" content="noindex, follow"/>'],
    ['<meta property="og:title" content="Custom Packaging FAQ | MOQ, Samples, Dieline | BestPackFactory"/>', '<meta property="og:title" content="Thank You | Inquiry Received | BestPackFactory"/>'],
    ['<meta name="twitter:title" content="Custom Packaging FAQ | MOQ, Samples, Dieline | BestPackFactory"/>', '<meta name="twitter:title" content="Thank You | Inquiry Received | BestPackFactory"/>'],
  ]],
]);

for (const file of await walk(contentRoot, '.html')) {
  const relative = path.relative(contentRoot, file).replaceAll('\\', '/');
  let html = await fs.readFile(file, 'utf8');
  const original = html;

  for (const [from, to] of globalReplacements) html = html.split(from).join(to);
  for (const [from, to] of fileReplacements.get(relative) || []) html = html.split(from).join(to);

  const canonical = canonicalFrom(html);
  html = html.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi, (whole, source) => {
    let data;
    try {
      data = JSON.parse(source);
    } catch {
      return whole;
    }
    let schemaChanged = false;
    if (relative === 'trust-profile.html' && data['@type'] === 'AboutPage' && data.about?.['@type'] === 'Organization') {
      data.dateModified = '2026-09-09';
      data.about.brand = [
        { '@type': 'Brand', name: 'BestPackFactory', url: 'https://www.bestpackfactory.com/' },
        { '@type': 'Brand', name: 'Packaging Factory Direct', url: 'https://www.packagingfactorydirect.com/' },
        { '@type': 'Brand', name: 'Colorful Print Pack', url: 'https://colorfulprintpack.com/' },
      ];
      schemaChanged = true;
    }
    const products = productNodes(data);
    if (products.length && canonical) {
      for (const product of products) {
        delete product.offers;
        product.url = canonical;
        product.mainEntityOfPage = canonical;
        product.manufacturer = {
          '@type': 'Organization',
          '@id': 'https://www.bestpackfactory.com/#organization',
          name: 'BestPackFactory',
        };
        const imageFix = schemaImageFixes.get(relative);
        if (imageFix) product.image = `https://www.bestpackfactory.com${imageFix}`;
      }
      schemaChanged = true;
    }
    const topLevelNodes = Array.isArray(data) ? data : (Array.isArray(data['@graph']) ? data['@graph'] : [data]);
    for (const service of topLevelNodes.filter((node) => hasType(node, 'Service'))) {
      if ('offers' in service) {
        delete service.offers;
        schemaChanged = true;
      }
    }
    if (!schemaChanged) return whole;
    const leading = source.match(/^\s*/)?.[0] || '';
    const trailing = source.match(/\s*$/)?.[0] || '';
    const formatted = source.trim().includes('\n') ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    return whole.replace(source, `${leading}${formatted}${trailing}`);
  });

  if (html !== original) {
    await fs.writeFile(file, html);
    changed.push(relative);
  }
}

const textFiles = [
  'scripts/apply-geo-phase1.mjs',
  'scripts/rewrite-homepage-faq.mjs',
  'scripts/rewrite-category-tiles.mjs',
  'scripts/add-b2b-decision-specs.cjs',
  'content-site/ai-rfq-intent-map.json',
];
for (const relative of textFiles) {
  const file = path.join(root, relative);
  let text = await fs.readFile(file, 'utf8');
  const original = text;
  for (const [from, to] of globalReplacements) text = text.split(from).join(to);
  text = text
    .replaceAll('This page owns stand-up pouch manufacturer China, factory, supplier and MOQ 500 intent.', 'This page helps buyers evaluate stand-up pouch manufacturers, factory qualifications and MOQ 500 requirements.')
    .replaceAll('This page owns custom printed stand-up pouches, stand-up pouch printing, custom logo pouch and film-feature specification intent.', 'This page helps buyers compare custom printed stand-up pouches, logo printing and film-feature specifications.')
    .replaceAll('be quoted by AI assistants', 'be understood by procurement systems')
    .replaceAll('Structured RFQ intent map for AI assistants and search engines that route B2B custom packaging buyers', 'Structured RFQ intent map that helps B2B custom packaging buyers navigate')
    .replaceAll('Use this GEO guide when an AI assistant needs a quick, structured answer about', 'Use this buyer guide for a concise, structured overview of');
  if (text !== original) {
    await fs.writeFile(file, text);
    changed.push(relative);
  }
}

console.log(`Updated ${changed.length} files.`);
for (const file of changed) console.log(file);
