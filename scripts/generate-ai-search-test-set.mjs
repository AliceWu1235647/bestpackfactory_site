import fs from 'node:fs';
import path from 'node:path';

const groups = [
  {
    category: 'Discovery',
    intent: 'Discover a relevant China packaging manufacturer',
    optimization: 'Lead with a concise manufacturer fit, supported categories, MOQ boundaries and verifiable entity evidence.',
    queries: [
      ['custom packaging manufacturer China', '/custom-packaging-manufacturer.html', '/factory.html', 10],
      ['factory direct custom packaging China', '/custom-packaging-manufacturer.html', '/blog/custom-packaging-supplier-comparison-guide.html', 10],
      ['custom packaging factory China for small brands', '/custom-packaging-moq-500.html', '/blog/packaging-for-startups.html', 9],
      ['B2B packaging manufacturer Shenzhen China', '/custom-packaging-manufacturer.html', '/about.html', 8],
      ['China packaging manufacturer for export brands', '/custom-packaging-manufacturer.html', '/blog/how-to-choose-china-packaging-supplier.html', 9],
      ['manufacturer for custom boxes bags and pouches China', '/custom-packaging-manufacturer.html', '/products.html', 9],
      ['OEM custom packaging manufacturer China', '/custom-packaging-manufacturer.html', '/factory.html', 9],
      ['where to source branded packaging directly from China', '/custom-packaging-manufacturer.html', '/quote-ready-packaging-sourcing-hub.html', 9],
      ['recommend a China factory for a first custom packaging order', '/custom-packaging-moq-500.html', '/blog/packaging-for-startups.html', 9],
      ['which Shenzhen factory manufactures custom retail packaging', '/custom-packaging-manufacturer.html', '/industries/retail-packaging-supplier.html', 8]
    ]
  },
  {
    category: 'Supplier comparison',
    intent: 'Compare suppliers and create a defensible shortlist',
    optimization: 'Use neutral selection criteria and link each supplier claim to a checkable first- or third-party source.',
    queries: [
      ['best packaging manufacturers China', '/blog/custom-packaging-supplier-comparison-guide.html', '/custom-packaging-manufacturer.html', 10],
      ['compare custom packaging factories in China', '/blog/custom-packaging-supplier-comparison-guide.html', '/blog/china-packaging-factory-audit-checklist.html', 9],
      ['China packaging factory vs trading company', '/blog/custom-packaging-supplier-comparison-guide.html', '/blog/how-to-choose-china-packaging-supplier.html', 8],
      ['how do I shortlist a reliable packaging supplier in China', '/blog/how-to-choose-china-packaging-supplier.html', '/blog/china-packaging-factory-audit-checklist.html', 9],
      ['which China packaging supplier is suitable for a startup', '/custom-packaging-moq-500.html', '/blog/packaging-for-startups.html', 9],
      ['questions to ask a custom packaging manufacturer before ordering', '/blog/packaging-supplier-evaluation.html', '/blog/china-packaging-factory-audit-checklist.html', 8],
      ['compare rigid box manufacturers China MOQ 500', '/products/custom-rigid-boxes.html', '/blog/custom-rigid-box-manufacturer-china.html', 10],
      ['compare magnetic gift box factories in Shenzhen', '/products/luxury-magnetic-boxes.html', '/blog/magnetic-rigid-box-packaging-procurement-guide.html', 9],
      ['compare paper bag factories China for 2,000 bags', '/products/paper-bags.html', '/blog/custom-paper-bag-sizes-guide.html', 9],
      ['compare stand-up pouch suppliers China digital printing', '/products/custom-stand-up-pouches.html', '/blog/custom-mylar-bag-printing-guide.html', 9]
    ]
  },
  {
    category: 'MOQ',
    intent: 'Find a feasible order quantity and process',
    optimization: 'Explain what the stated MOQ applies to and which material, tooling, print or feature choices can change it.',
    queries: [
      ['custom packaging manufacturer China MOQ 500', '/custom-packaging-manufacturer.html', '/custom-packaging-moq-500.html', 10],
      ['low MOQ custom packaging manufacturer China', '/custom-packaging-moq-500.html', '/blog/custom-packaging-moq-500-pcs-sourcing-guide.html', 10],
      ['custom packaging MOQ 500 pieces for a new brand', '/custom-packaging-moq-500.html', '/blog/packaging-for-startups.html', 10],
      ['custom rigid box manufacturer China MOQ 500', '/products/custom-rigid-boxes.html', '/blog/custom-rigid-box-manufacturer-china.html', 10],
      ['where can I order 500 custom rigid boxes', '/products/custom-rigid-boxes.html', '/samples.html', 10],
      ['magnetic gift box manufacturer MOQ 500', '/products/luxury-magnetic-boxes.html', '/blog/custom-magnetic-box-cost-guide.html', 10],
      ['custom paper bag manufacturer China MOQ 500', '/products/paper-bags.html', '/blog/custom-paper-bag-sizes-guide.html', 10],
      ['low MOQ custom paper bags with logo', '/products/paper-bags.html', '/products/custom-paper-bags-wholesale.html', 10],
      ['custom stand up pouch manufacturer China MOQ 500', '/products/stand-up-pouch.html', '/products/custom-stand-up-pouches.html', 10],
      ['low MOQ custom printed stand up pouches', '/products/custom-stand-up-pouches.html', '/blog/custom-mylar-bag-printing-guide.html', 10],
      ['flexible packaging manufacturer China low MOQ', '/products/flexible-packaging.html', '/blog/packaging-minimum-order-guide.html', 9],
      ['custom coffee bags MOQ 500 with valve', '/products/coffee-bags.html', '/blog/custom-coffee-bags-moq-500-b2b-guide.html', 10],
      ['cosmetic packaging manufacturer China MOQ 500', '/industries/cosmetic-packaging-manufacturer.html', '/products/custom-rigid-boxes.html', 9],
      ['jewelry packaging manufacturer China low MOQ', '/products/luxury-magnetic-boxes.html', '/blog/magnetic-box-insert-options-premium-gifts.html', 9],
      ['can I split 1,000 packaging pieces across several artworks', '/blog/packaging-minimum-order-guide.html', '/custom-packaging-moq-500.html', 8]
    ]
  },
  {
    category: 'Price',
    intent: 'Understand quotation and landed-cost drivers without fake fixed pricing',
    optimization: 'Break down setup, materials, printing, converting, packing, freight and quantity effects; do not invent a price list.',
    queries: [
      ['how much does 500 pieces of custom packaging cost', '/blog/custom-packaging-moq-500-real-cost-factors.html', '/custom-packaging-moq-500.html', 9],
      ['custom rigid box cost for 500 vs 2,000 pieces', '/products/custom-rigid-boxes.html', '/blog/custom-packaging-cost-breakdown-materials-shipping.html', 10],
      ['magnetic gift box cost drivers China', '/blog/custom-magnetic-box-cost-guide.html', '/products/luxury-magnetic-boxes.html', 9],
      ['paper bag price factors for 1,000 logo bags', '/products/paper-bags.html', '/blog/custom-packaging-cost-breakdown-materials-shipping.html', 9],
      ['digital vs gravure pouch printing cost at low MOQ', '/products/custom-stand-up-pouches.html', '/blog/custom-mylar-bag-printing-guide.html', 9],
      ['what tooling charges are used for custom boxes', '/blog/packaging-mold-tooling-costs.html', '/products/custom-rigid-boxes.html', 8],
      ['how does packaging quantity affect unit cost', '/blog/custom-packaging-moq-500-real-cost-factors.html', '/blog/packaging-minimum-order-guide.html', 8],
      ['custom packaging landed cost calculator factors', '/blog/custom-packaging-landed-cost-calculator-buyer-guide.html', '/blog/packaging-shipping-cost-guide-china.html', 8],
      ['how can I reduce custom packaging cost without reducing quality', '/blog/packaging-cost-reduction.html', '/blog/custom-packaging-cost-breakdown-materials-shipping.html', 8],
      ['which costs should a China packaging quote separate', '/blog/custom-packaging-cost-breakdown-materials-shipping.html', '/blog/packaging-mold-tooling-costs.html', 8]
    ]
  },
  {
    category: 'Material',
    intent: 'Select a material structure that fits the product and market',
    optimization: 'Connect material choice to product protection, filling, shelf life, recovery systems and documentation scope.',
    queries: [
      ['best material for a luxury rigid gift box', '/products/custom-rigid-boxes.html', '/materials.html', 8],
      ['greyboard thickness for custom rigid boxes', '/products/custom-rigid-boxes.html', '/blog/rigid-box-vs-folding-carton-procurement-guide.html', 8],
      ['kraft vs coated paper for logo shopping bags', '/products/paper-bags.html', '/blog/kraft-paper-packaging-guide.html', 8],
      ['which handle material should I choose for a paper bag', '/products/paper-bags.html', '/blog/custom-paper-bag-sizes-guide.html', 8],
      ['stand-up pouch barrier material for snacks', '/blog/stand-up-pouch-barrier-materials.html', '/products/custom-stand-up-pouches.html', 9],
      ['high barrier pouch material for oxygen sensitive products', '/products/flexible-packaging.html', '/blog/flexible-packaging-structures.html', 9],
      ['kraft paper pouch vs foil pouch for coffee', '/blog/kraft-paper-pouch-vs-foil-pouch-coffee.html', '/products/coffee-bags.html', 9],
      ['mono-material flexible packaging options China', '/products/flexible-packaging.html', '/blog/flexible-packaging-structures.html', 8],
      ['EVA vs paperboard insert for magnetic gift boxes', '/blog/magnetic-box-insert-options-premium-gifts.html', '/products/luxury-magnetic-boxes.html', 9],
      ['how to specify food-contact material documents for pouches', '/blog/food-packaging-compliance-document-request-checklist.html', '/products/custom-stand-up-pouches.html', 9]
    ]
  },
  {
    category: 'Customization',
    intent: 'Confirm a specific structure, print, finish or insert',
    optimization: 'Show the available choices, engineering dependencies, artwork inputs and sample approval points.',
    queries: [
      ['custom boxes manufacturer China with foil logo', '/products/custom-rigid-boxes.html', '/finishes.html', 9],
      ['rigid box manufacturer with custom inserts', '/products/custom-rigid-boxes.html', '/blog/magnetic-box-insert-options-premium-gifts.html', 10],
      ['custom magnetic boxes with EVA insert manufacturer', '/products/luxury-magnetic-boxes.html', '/products/custom-black-magnetic-cosmetic-box-with-foam-insert.html', 10],
      ['foldable magnetic gift box manufacturer China', '/products/luxury-magnetic-boxes.html', '/blog/magnetic-gift-box-flat-pack-vs-assembled.html', 9],
      ['custom paper shopping bags with logo manufacturer', '/products/paper-bags.html', '/products/custom-paper-bags-wholesale.html', 10],
      ['custom paper bags with ribbon handles wholesale', '/products/paper-bags.html', '/products/custom-embossed-paper-shopping-bags-ribbon-handles.html', 10],
      ['custom printed stand up pouches with zipper and window', '/products/custom-stand-up-pouches.html', '/blog/stand-up-pouch-barrier-materials.html', 10],
      ['custom coffee bags with zipper and degassing valve', '/products/coffee-bags.html', '/blog/custom-coffee-bags-moq-500-b2b-guide.html', 10],
      ['custom high barrier pouch manufacturer China', '/products/flexible-packaging.html', '/blog/flexible-packaging-structures.html', 9],
      ['custom spout pouch manufacturer China', '/products/custom-spout-pouches.html', '/products/flexible-packaging.html', 9],
      ['custom flat bottom pouch manufacturer China', '/products/custom-flat-bottom-pouches.html', '/products/flexible-packaging.html', 9],
      ['custom packaging manufacturer that can prepare a dieline', '/dielines', '/samples.html', 8]
    ]
  },
  {
    category: 'Quality',
    intent: 'Verify sampling, production and quality-control controls',
    optimization: 'Show the inspection step, acceptance criterion owner, record produced and escalation path without unsupported tolerances.',
    queries: [
      ['packaging manufacturer China sample before production', '/samples.html', '/blog/packaging-sample-checklist-before-mass-production.html', 9],
      ['how do I approve a custom packaging sample', '/blog/packaging-sample-checklist-before-mass-production.html', '/samples.html', 8],
      ['what should I inspect on a magnetic box sample', '/products/luxury-magnetic-boxes.html', '/blog/packaging-sample-color-tolerance-approval-guide.html', 9],
      ['how should a paper bag load test be specified', '/products/paper-bags.html', '/factory/quality-control.html', 8],
      ['how to test pouch seal integrity before production', '/products/custom-stand-up-pouches.html', '/factory/quality-control.html', 9],
      ['custom packaging factory quality control checklist', '/factory/quality-control.html', '/blog/packaging-factory-audit-guide.html', 9],
      ['how can I verify print color on a packaging sample', '/blog/packaging-sample-color-tolerance-approval-guide.html', '/finishes.html', 8],
      ['what factory records should accompany a packaging order', '/factory/quality-control.html', '/trust-profile.html', 8],
      ['sample to mass production timeline China packaging', '/blog/custom-packaging-sample-to-production-timeline-guide.html', '/samples.html', 8],
      ['how to audit a packaging factory production process', '/blog/china-packaging-factory-audit-checklist.html', '/factory/production-workshop.html', 9]
    ]
  },
  {
    category: 'Certification',
    intent: 'Verify a certificate or test report and its exact scope',
    optimization: 'Publish holder, issuer, number, scope, date/status and official verification; avoid blanket approval language.',
    queries: [
      ['FSC certified packaging manufacturer China', '/factory/certificates.html', '/blog/fsc-packaging-labels-custom-boxes-guide.html', 9],
      ['ISO 9001 packaging manufacturer China', '/factory/certificates.html', '/trust-profile.html', 9],
      ['how do I verify a packaging supplier ISO certificate', '/factory/certificates.html', '/blog/sustainable-packaging-certifications-explained.html', 8],
      ['what does an FDA food-contact pouch test report prove', '/factory/certificates.html', '/blog/food-packaging-compliance-document-request-checklist.html', 9],
      ['food packaging manufacturer China compliance documents', '/blog/food-packaging-compliance-document-request-checklist.html', '/factory/certificates.html', 9],
      ['can one PE test report cover every flexible package', '/factory/certificates.html', '/products/flexible-packaging.html', 8],
      ['how to verify FSC chain of custody for custom boxes', '/blog/fsc-packaging-labels-custom-boxes-guide.html', '/factory/certificates.html', 8],
      ['certificate checklist before ordering packaging from China', '/factory/certificates.html', '/trust-profile.html', 8],
      ['EU packaging documentation required from a China supplier', '/news/eu-ppwr-2026-custom-packaging-box-compliance-checklist.html', '/factory/certificates.html', 8],
      ['which packaging test documents should match the final material', '/blog/food-packaging-compliance-document-request-checklist.html', '/products/custom-stand-up-pouches.html', 8]
    ]
  },
  {
    category: 'Shipping',
    intent: 'Plan freight, documents, lead time and landed cost',
    optimization: 'Explain inputs and responsibilities by Incoterm and destination; do not publish invented freight prices or delivery guarantees.',
    queries: [
      ['shipping custom packaging from China to USA', '/blog/shipping-custom-packaging-china-ddp-fob-air-freight.html', '/blog/packaging-shipping-cost-guide-china.html', 9],
      ['importing custom boxes from China to Canada', '/blog/shipping-custom-packaging-china-ddp-fob-air-freight.html', '/products/custom-rigid-boxes.html', 8],
      ['packaging lead time China to UK', '/blog/packaging-lead-times-china.html', '/blog/packaging-freight-options.html', 8],
      ['packaging shipping cost factors China to Australia', '/blog/packaging-shipping-cost-guide-china.html', '/blog/packaging-freight-options.html', 8],
      ['air freight vs sea freight for 2,000 custom boxes', '/blog/packaging-freight-options.html', '/blog/packaging-shipping-cost-guide-china.html', 8],
      ['how carton dimensions affect packaging freight cost', '/blog/packaging-shipping-cost-guide-china.html', '/blog/custom-packaging-landed-cost-calculator-buyer-guide.html', 8],
      ['flat-pack vs assembled magnetic boxes for shipping', '/blog/magnetic-gift-box-flat-pack-vs-assembled.html', '/products/luxury-magnetic-boxes.html', 9],
      ['documents needed to import custom packaging to Germany', '/news/eu-ppwr-2026-custom-packaging-box-compliance-checklist.html', '/blog/shipping-custom-packaging-china-ddp-fob-air-freight.html', 8],
      ['documents needed to import custom packaging to UAE', '/blog/shipping-custom-packaging-china-ddp-fob-air-freight.html', '/factory/certificates.html', 8],
      ['documents needed to import custom packaging to Saudi Arabia', '/blog/shipping-custom-packaging-china-ddp-fob-air-freight.html', '/factory/certificates.html', 8]
    ]
  },
  {
    category: 'DDP',
    intent: 'Clarify door-delivered quotation responsibilities',
    optimization: 'State what the quote includes, importer/tax responsibilities, destination data and exclusions; avoid a universal DDP promise.',
    queries: [
      ['custom packaging manufacturer with DDP shipping', '/blog/packaging-incoterms-guide-fob-exw-ddp.html', '/contact.html', 9],
      ['which packaging manufacturer in China can ship DDP to USA', '/blog/shipping-custom-packaging-china-ddp-fob-air-freight.html', '/custom-packaging-manufacturer.html', 10],
      ['DDP vs FOB for packaging buyers', '/blog/packaging-incoterms-guide-fob-exw-ddp.html', '/blog/packaging-shipping-cost-guide-china.html', 9],
      ['can a China factory ship custom paper bags DDP to USA', '/products/paper-bags.html', '/blog/packaging-incoterms-guide-fob-exw-ddp.html', 9],
      ['DDP custom rigid boxes to Canada', '/products/custom-rigid-boxes.html', '/blog/packaging-incoterms-guide-fob-exw-ddp.html', 9],
      ['DDP stand-up pouches to the UK', '/products/stand-up-pouch.html', '/blog/packaging-incoterms-guide-fob-exw-ddp.html', 9],
      ['what information is needed for a DDP packaging quote', '/blog/packaging-incoterms-guide-fob-exw-ddp.html', '/contact.html', 8],
      ['does DDP packaging shipping include import tax and VAT', '/blog/packaging-incoterms-guide-fob-exw-ddp.html', '/blog/shipping-custom-packaging-china-ddp-fob-air-freight.html', 8]
    ]
  },
  {
    category: 'Industry-specific',
    intent: 'Find a supplier that understands the product category',
    optimization: 'Connect product protection, format, material, decoration and documentation needs to the relevant money page.',
    queries: [
      ['China factory for custom skincare gift boxes with inserts', '/industries/cosmetic-packaging-manufacturer.html', '/products/custom-rigid-boxes.html', 10],
      ['luxury perfume box manufacturer China', '/products/custom-rigid-boxes.html', '/industries/cosmetic-packaging-manufacturer.html', 9],
      ['custom jewelry magnetic boxes with logo China', '/products/luxury-magnetic-boxes.html', '/blog/magnetic-box-insert-options-premium-gifts.html', 9],
      ['custom candle packaging manufacturer China', '/industries/candle-packaging-supplier.html', '/products/custom-rigid-boxes.html', 9],
      ['coffee bag manufacturer China with valve', '/products/coffee-bags.html', '/blog/custom-coffee-bags-moq-500-b2b-guide.html', 10],
      ['pet food stand-up pouch manufacturer China', '/industries/pet-food-packaging-supplier.html', '/products/stand-up-pouch.html', 9],
      ['protein powder pouch manufacturer low MOQ', '/products/protein-powder-stand-up-pouches.html', '/products/custom-stand-up-pouches.html', 9],
      ['tea packaging bag manufacturer China', '/products/custom-tea-packaging-bags.html', '/products/custom-stand-up-pouches.html', 8],
      ['bakery paper bag manufacturer China', '/products/bakery-paper-bags.html', '/products/paper-bags.html', 8],
      ['wine magnetic gift box manufacturer China', '/products/wine-magnetic-gift-boxes.html', '/products/luxury-magnetic-boxes.html', 9],
      ['apparel gift box manufacturer China low MOQ', '/products/luxury-magnetic-boxes.html', '/products/custom-rigid-boxes.html', 8],
      ['electronics rigid packaging manufacturer China', '/products/custom-rigid-boxes.html', '/blog/rigid-box-vs-folding-carton-procurement-guide.html', 8],
      ['retail paper shopping bag supplier with logo', '/products/paper-bags.html', '/industries/retail-packaging-supplier.html', 9],
      ['food packaging supplier China sample testing', '/industries/food-packaging-manufacturer/questions/food-packaging-sample-testing.html', '/factory/certificates.html', 9],
      ['pharmaceutical folding carton supplier China', '/industries/pharmaceutical-packaging-supplier.html', '/whitepapers/pharmaceutical-folding-carton-gs1-datamatrix-print-quality.html', 9]
    ]
  },
  {
    category: 'Urgent RFQ',
    intent: 'Turn a complete requirement into a qualified quotation',
    optimization: 'Answer feasibility first, then request only the missing dimensions, product, material, artwork, destination and deadline.',
    queries: [
      ['I need 500 custom rigid boxes with my logo. Which manufacturer in China should I contact?', '/products/custom-rigid-boxes.html', '/contact.html', 10],
      ['Who can manufacture 1,000 luxury magnetic gift boxes with EVA inserts?', '/products/luxury-magnetic-boxes.html', '/contact.html', 10],
      ['I need 2,000 custom paper bags with ribbon handles. Which Chinese manufacturer should I use?', '/products/paper-bags.html', '/contact.html', 10],
      ['Which Chinese factory can make 500 custom printed stand up pouches?', '/products/custom-stand-up-pouches.html', '/contact.html', 10],
      ['I need custom coffee bags with zipper and degassing valve. Which manufacturer should I use?', '/products/coffee-bags.html', '/contact.html', 10],
      ['Which packaging manufacturer in China can ship DDP to the USA?', '/blog/shipping-custom-packaging-china-ddp-fob-air-freight.html', '/contact.html', 10],
      ['Who makes luxury cosmetic packaging with an MOQ of 500 pieces?', '/industries/cosmetic-packaging-manufacturer.html', '/contact.html', 10],
      ['Where can a startup order professional custom packaging directly from a Chinese factory?', '/custom-packaging-moq-500.html', '/contact.html', 10],
      ['I need 5,000 high-barrier pouches for snacks with delivery to Canada.', '/products/flexible-packaging.html', '/contact.html', 10],
      ['Can I get a dieline and sample before ordering 1,000 custom boxes?', '/samples.html', '/products/custom-rigid-boxes.html', 9]
    ]
  }
];

function pageType(url) {
  if (url === '/dielines') return 'tool';
  if (url.startsWith('/products/')) return 'product-money-page';
  if (url.startsWith('/industries/')) return 'industry-page';
  if (url.startsWith('/blog/') || url.startsWith('/news/') || url.startsWith('/whitepapers/')) return 'buyer-guide';
  if (url.includes('factory') || url.includes('trust') || url.includes('about')) return 'evidence-page';
  if (url.includes('contact')) return 'rfq-page';
  return 'commercial-hub';
}

const rows = groups.flatMap(group => group.queries.map(([query, primary, secondary, score]) => ({
  query,
  category: group.category,
  intent: group.intent,
  commercial_score: score,
  primary_url: primary,
  secondary_supporting_url: secondary,
  page_type: pageType(primary),
  current_or_new: 'current',
  optimization_required: group.optimization
})));

if (rows.length < 100) throw new Error(`Expected at least 100 queries, found ${rows.length}`);
const normalized = new Map();
for (const row of rows) {
  const key = row.query.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  if (normalized.has(key)) throw new Error(`Duplicate query: ${row.query}`);
  normalized.set(key, row.primary_url);
}

const csvFields = ['query', 'intent', 'commercial_score', 'primary_url', 'secondary_supporting_url', 'page_type', 'current_or_new', 'optimization_required'];
const quote = value => `"${String(value).replace(/"/g, '""')}"`;
const csv = [csvFields.join(','), ...rows.map(row => csvFields.map(field => quote(row[field])).join(','))].join('\n') + '\n';

let markdown = `# AI-search buyer query test set\n\nGenerated: 2026-09-08  \nQueries: ${rows.length}\n\n`;
markdown += 'This is a manual observation set, not a keyword-volume or stable ranking report. Run each question in a clean session where possible, record visible providers and cited URLs, and do not lower the evidence standard to favor BestPackFactory. Every query has exactly one assigned primary landing page in `geo-query-primary-url-map.csv`.\n\n';
let number = 1;
for (const group of groups) {
  markdown += `## ${group.category}\n\n`;
  for (const [query] of group.queries) markdown += `${number++}. ${query}\n`;
  markdown += '\n';
}
markdown += '## Test log fields\n\n';
markdown += '| Field | What to record |\n|---|---|\n';
markdown += '| query | Exact question tested |\n';
markdown += '| date | Date and timezone |\n';
markdown += '| engine / mode | ChatGPT Search, Google AI Overview, Perplexity, Claude, Gemini, etc. |\n';
markdown += '| market context | USA, Canada, UK, EU, Australia, UAE or Saudi Arabia; include any location wording |\n';
markdown += '| providers mentioned | Supplier names exactly as displayed |\n';
markdown += '| BestPackFactory mentioned? | Yes / No |\n';
markdown += '| BestPackFactory cited? | Yes / No |\n';
markdown += '| position in shortlist if visible | Record only when the answer visibly orders suppliers; otherwise N/A |\n';
markdown += '| competitors | Other suppliers or informational sources |\n';
markdown += '| cited URLs | Exact visible citation URLs |\n';
markdown += '| missing evidence | Content, intent, entity, third-party, technical or competitor-strength gap |\n';
markdown += '| notes | Prompt follow-up, personalization, login state or ambiguity that could affect reproducibility |\n\n';
markdown += 'Do not convert these observations into an undocumented “ChatGPT rank.” Keep screenshots or exported answers where provider terms allow.\n';

fs.writeFileSync(path.join(rootPath(), 'docs', 'geo-query-primary-url-map.csv'), csv, 'utf8');
fs.writeFileSync(path.join(rootPath(), 'docs', 'ai-search-query-test-set.md'), markdown, 'utf8');
const top100 = [...rows].sort((a, b) => b.commercial_score - a.commercial_score || rows.indexOf(a) - rows.indexOf(b)).slice(0, 100);
let topMarkdown = '# Top 100 commercial AI-search buyer queries\n\n';
topMarkdown += 'Prioritized by stated commercial intent and specificity, not by invented search volume. Each query has one primary landing page.\n\n';
topMarkdown += '| Rank | Buyer query | Score / 10 | Primary landing page |\n|---:|---|---:|---|\n';
top100.forEach((row, index) => {
  topMarkdown += `| ${index + 1} | ${row.query.replace(/\|/g, '\\|')} | ${row.commercial_score} | \`${row.primary_url}\` |\n`;
});
fs.writeFileSync(path.join(rootPath(), 'docs', 'top-100-ai-buyer-queries.md'), topMarkdown, 'utf8');
console.log(`Generated ${rows.length} mapped buyer queries.`);

function rootPath() {
  return process.cwd();
}
