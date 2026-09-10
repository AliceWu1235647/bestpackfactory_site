import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const START = '<!-- GEO-PHASE1-20260908:START -->';
const END = '<!-- GEO-PHASE1-20260908:END -->';

const commonEvidenceLinks = [
  ['/trust-profile.html', 'Buyer verification profile'],
  ['/about.html', 'Legal identity and current factory address'],
  ['/factory.html', 'Factory and production overview'],
  ['/factory/certificates.html', 'Certificate and test-report scope'],
  ['/authors/lisa-wu.html', 'Lisa Wu packaging project profile'],
  ['/samples.html', 'Sampling and dieline process']
];

const pages = [
  {
    file: 'content-site/custom-packaging-manufacturer.html',
    quickTitle: 'Is this the right China packaging manufacturer for this RFQ?',
    quick: 'BestPackFactory is the trading brand of Shenzhen Color Printing Paper Packaging Co., Ltd., a Shenzhen, China B2B manufacturer established in 2016. It produces custom rigid and folding boxes, magnetic gift boxes, paper bags, printed stand-up pouches and other flexible packaging for brands ordering to specification. The published starting MOQ is 500 pieces per custom size and artwork, subject to the selected material, process and features. Buyers can specify dimensions, structure, material, print, finish, inserts and export packing. This service is intended for commercial orders rather than single retail packs. For a usable quotation, send the packaging type, dimensions, quantity, product weight, artwork status, required finish, destination country and target date.',
    decisionTitle: 'How order quantity changes a custom packaging quotation',
    quantities: [
      ['500 PCS', 'A practical starting point for a pilot or launch when the construction is feasible at this quantity. Compare simplified finishes and short-run print options; tooling and sampling are spread across fewer units.'],
      ['1,000 PCS', 'Fixed preparation costs are shared across more units. Buyers can compare an additional finish or insert option while keeping the first order manageable.'],
      ['2,000 PCS', 'More material and production choices may become economical. Ask for one specification quoted at two quantities so the cost drivers are visible.'],
      ['5,000 PCS+', 'Longer-run print and converting methods may reduce unit cost, but freight volume and inventory carrying cost become more important. Request carton dimensions and gross weight with the quote.']
    ],
    scope: 'This page is the primary route for buyers comparing a factory-direct China custom packaging manufacturer across boxes, bags and pouches. Product-specific engineering questions should continue to the relevant product page.',
    supports: [
      ['/blog/custom-packaging-supplier-comparison-guide.html', 'Factory, trading company or marketplace: supplier comparison'],
      ['/blog/custom-packaging-moq-500-pcs-sourcing-guide.html', 'How to plan a 500-piece custom packaging order'],
      ['/blog/custom-packaging-cost-breakdown-materials-shipping.html', 'Packaging cost drivers: material, process and freight'],
      ['/blog/custom-packaging-sample-to-production-timeline-guide.html', 'From dieline and sample to mass production'],
      ['/blog/china-packaging-factory-audit-checklist.html', 'China packaging factory audit checklist'],
      ['/blog/packaging-incoterms-guide-fob-exw-ddp.html', 'FOB, EXW and DDP for packaging buyers']
    ]
  },
  {
    file: 'content-site/products/custom-rigid-boxes.html',
    quickTitle: 'Can this factory quote 500 custom rigid boxes?',
    quick: 'BestPackFactory is a Shenzhen B2B packaging manufacturer operated by Shenzhen Color Printing Paper Packaging Co., Ltd. This page covers made-to-order rigid gift boxes for buyers sourcing 500 pieces or more per custom size and artwork. Structures can include lid-and-base, drawer, shoulder-neck, magnetic and foldable rigid boxes, with project-specific wrapping paper, printing, finishes and inserts. It is intended for brands, importers and procurement teams that need a sample-approved specification rather than stock retail boxes. For an RFQ, provide internal dimensions, product weight, quantity, preferred opening style, artwork status, finish and insert requirements, delivery country and target date.',
    decisionTitle: 'How quantity affects a rigid box quotation',
    quantities: [
      ['500 PCS', 'Suitable for a qualified launch or limited run. Structural work, cutting dies, print setup and sample preparation are distributed across fewer boxes, so simpler structures and finishes are worth comparing.'],
      ['1,000 PCS', 'Fixed setup costs are shared more efficiently. This quantity can make a custom insert or an additional finish easier to evaluate without committing to a large inventory.'],
      ['2,000 PCS', 'Material purchasing and production planning usually become more efficient. Request the same specification at 1,000 and 2,000 pieces to identify the real break point.'],
      ['5,000 PCS+', 'Unit economics may improve, while assembled-box freight volume can become a major landed-cost driver. Compare assembled and foldable structures where the presentation brief allows.']
    ],
    scope: 'This is the primary supplier page for custom rigid box manufacturer, rigid box factory and MOQ 500 sourcing questions. The magnetic-box page handles book-style magnetic closures in greater depth.',
    supports: [
      ['/blog/custom-rigid-box-manufacturer-china.html', 'How to source a custom rigid box manufacturer in China'],
      ['/blog/rigid-box-vs-folding-carton-procurement-guide.html', 'Rigid box or folding carton: procurement comparison'],
      ['/blog/packaging-mold-tooling-costs.html', 'How dies and tooling affect packaging cost'],
      ['/blog/flat-pack-vs-assembled-packaging.html', 'Flat-pack versus assembled packaging'],
      ['/blog/packaging-sample-checklist-before-mass-production.html', 'Sample approval checklist before production'],
      ['/blog/packaging-shipping-cost-guide-china.html', 'Shipping cost factors from China']
    ]
  },
  {
    file: 'content-site/products/luxury-magnetic-boxes.html',
    quickTitle: 'Can this factory manufacture 500 magnetic gift boxes?',
    quick: 'BestPackFactory is a Shenzhen B2B packaging manufacturer operated by Shenzhen Color Printing Paper Packaging Co., Ltd. It makes custom magnetic rigid boxes from a published starting MOQ of 500 pieces per size and artwork, subject to the approved structure and materials. Buyers can specify assembled or foldable construction, dimensions, wrapping paper, print, foil, embossing, ribbon and product inserts. This page is for cosmetics, jewelry, apparel, candles, corporate gifts and other premium products that need a custom presentation box rather than blank stock packaging. For a quotation, send product and box dimensions, product weight, quantity, preferred structure, artwork, finish, insert, destination and required date.',
    decisionTitle: 'How quantity affects a magnetic gift box quotation',
    quantities: [
      ['500 PCS', 'A starting point for a premium launch when the structure is feasible. Magnetic closure, wrapping, die cutting and sample preparation create fixed setup work, so compare essential finishes first.'],
      ['1,000 PCS', 'Setup costs are shared across more boxes. A custom insert or foil detail can be compared against a simpler control specification.'],
      ['2,000 PCS', 'Material ordering and hand-finishing workflow may become more efficient. Ask for carton packing data to evaluate the landed cost, not only the unit quote.'],
      ['5,000 PCS+', 'Longer-run economics can improve, but assembled magnetic boxes occupy substantial freight volume. A foldable magnetic structure may reduce volume when it meets the presentation and assembly brief.']
    ],
    scope: 'This page is the primary route for custom magnetic gift box manufacturer and magnetic rigid box MOQ questions. The broader rigid-box page is the alternative when the closure style is not yet decided.',
    supports: [
      ['/blog/how-to-choose-a-magnetic-gift-box.html', 'How to choose a magnetic gift box structure'],
      ['/blog/magnetic-box-insert-options-premium-gifts.html', 'Insert options for premium products'],
      ['/blog/magnetic-gift-box-flat-pack-vs-assembled.html', 'Foldable or assembled magnetic boxes'],
      ['/blog/custom-magnetic-box-cost-guide.html', 'Magnetic box cost drivers'],
      ['/blog/magnetic-rigid-box-packaging-procurement-guide.html', 'Magnetic rigid box procurement guide'],
      ['/blog/packaging-sample-color-tolerance-approval-guide.html', 'Color and finish approval on samples']
    ]
  },
  {
    file: 'content-site/products/paper-bags.html',
    quickTitle: 'Can this factory quote 500 custom paper bags with a logo?',
    quick: 'BestPackFactory is a Shenzhen B2B packaging manufacturer operated by Shenzhen Color Printing Paper Packaging Co., Ltd. It supplies custom paper shopping, gift and carrier bags from a published starting MOQ of 500 pieces per size and artwork, subject to paper, printing, handles and finishes. Buyers can specify width, height and gusset, kraft or coated paper, logo printing, lamination, foil, reinforcement and twisted-paper, rope or ribbon handles. This page is intended for retail, beauty, fashion, hospitality and product-launch orders, not single blank bags. For an RFQ, send finished size, packed product dimensions and weight, quantity, paper and handle preference, artwork, finish, destination and required date.',
    decisionTitle: 'How quantity affects a custom paper bag quotation',
    quantities: [
      ['500 PCS', 'Useful for a qualified launch or boutique run. Bag setup, print preparation, handle selection and sampling are shared across fewer pieces; a simpler paper and finish combination is worth comparing.'],
      ['1,000 PCS', 'Fixed preparation costs are distributed more efficiently. Buyers can compare ribbon or rope handles and one premium finish against a simpler specification.'],
      ['2,000 PCS', 'Paper purchasing and conversion planning may improve. Ask for the same dimensions and load requirement at two quantities to see whether the material or process changes.'],
      ['5,000 PCS+', 'Longer-run printing can improve unit economics. Carton volume, bag folding method and moisture protection during export become important landed-cost considerations.']
    ],
    scope: 'This is the primary supplier page for custom paper bag manufacturer China, logo paper bags, ribbon-handle bags and MOQ 500 purchasing questions.',
    supports: [
      ['/blog/custom-paper-bag-sizes-guide.html', 'How to specify paper bag width, height and gusset'],
      ['/blog/kraft-paper-packaging-guide.html', 'Kraft paper packaging selection guide'],
      ['/blog/fsc-packaging-labels-custom-boxes-guide.html', 'How to verify FSC claims before using a label'],
      ['/blog/packaging-for-retailers.html', 'Retail packaging planning for buyers'],
      ['/blog/custom-packaging-moq-500-real-cost-factors.html', 'Real cost factors at MOQ 500'],
      ['/blog/shipping-custom-packaging-china-ddp-fob-air-freight.html', 'DDP, FOB and air freight for custom packaging']
    ]
  },
  {
    file: 'content-site/products/stand-up-pouch.html',
    quickTitle: 'Is this the right page for a China stand-up pouch factory?',
    quick: 'BestPackFactory is a Shenzhen B2B packaging manufacturer operated by Shenzhen Color Printing Paper Packaging Co., Ltd. This page is the supplier-qualification route for buyers seeking custom stand-up pouches from a published starting MOQ of 500 pieces per size and artwork, subject to film, printing and features. Pouches can be specified by width, height and bottom gusset, product and fill weight, barrier need, zipper, valve, window, print and export packing. It is for brands and importers ordering to a production specification. For a factory quotation, send the product, ingredients where relevant, fill method, target shelf life, dimensions, quantity, artwork, destination market and required date.',
    decisionTitle: 'How quantity affects a stand-up pouch factory quote',
    quantities: [
      ['500 PCS', 'Short-run digital printing may be the practical comparison where the film and features are compatible. Sampling, setup and special components are spread across fewer pouches.'],
      ['1,000 PCS', 'A wider choice of standard films or features may be practical. Request one approved structure at two quantities so print setup and material minimums are clear.'],
      ['2,000 PCS', 'Conversion planning and material utilization can improve, but barrier and filling compatibility still take priority over unit price.'],
      ['5,000 PCS+', 'Longer-run printing may become more economical. Gravure feasibility depends on film, colors, cylinders and total volume; compare cylinder cost, repeat orders and inventory risk before choosing it.']
    ],
    scope: 'This page owns stand-up pouch manufacturer China, factory, supplier and MOQ 500 intent. For detailed printing, barrier-film, zipper, valve and artwork decisions, use the custom printed stand-up pouch specification page.',
    crossLink: ['/products/custom-stand-up-pouches.html', 'Open the custom printed stand-up pouch specification page'],
    supports: [
      ['/blog/stand-up-pouch-barrier-materials.html', 'Stand-up pouch barrier material guide'],
      ['/blog/flexible-packaging-structures.html', 'How flexible film structures are selected'],
      ['/blog/flat-bottom-bag-vs-stand-up-pouch.html', 'Flat-bottom bag versus stand-up pouch'],
      ['/blog/packaging-minimum-order-guide.html', 'Packaging minimum order guide'],
      ['/blog/packaging-sampling-process-guide.html', 'Packaging sampling process'],
      ['/blog/packaging-incoterms-guide-fob-exw-ddp.html', 'Packaging Incoterms for import buyers']
    ]
  },
  {
    file: 'content-site/products/custom-stand-up-pouches.html',
    quickTitle: 'What should a custom printed stand-up pouch buyer specify?',
    quick: 'BestPackFactory is a Shenzhen B2B packaging manufacturer operated by Shenzhen Color Printing Paper Packaging Co., Ltd. This page focuses on print-ready custom stand-up pouch specifications from a published starting MOQ of 500 pieces per size and artwork, subject to the selected film and features. Buyers can define dimensions, bottom gusset, barrier structure, zipper, valve, window, printing, finish and carton packing for coffee, snacks, pet food, powders and other reviewed applications. It is intended for commercial products with known filling and shelf-life requirements. For an RFQ, send the product, net weight, fill method, target shelf life, dimensions, quantity, artwork, features, destination market and required date.',
    decisionTitle: 'When digital or gravure printing may fit the pouch quantity',
    quantities: [
      ['500 PCS', 'Digital printing may suit a short qualified run when the required film, pouch size and features are available. It can avoid gravure cylinders, but the approved structure still controls feasibility.'],
      ['1,000 PCS', 'Digital remains useful for multiple artworks or a launch quantity. Compare color, repeat-order needs and film availability rather than selecting by quantity alone.'],
      ['2,000 PCS', 'The print method depends on total surface area, colors, film and repeat demand. Ask for both feasible methods if the specification sits near a supplier break point.'],
      ['5,000 PCS+', 'Gravure may become more economical for repeat volume, but cylinder charges and inventory risk must be included. Digital can still make sense for many SKUs or frequent artwork changes.']
    ],
    scope: 'This page owns custom printed stand-up pouches, stand-up pouch printing, custom logo pouch and film-feature specification intent. The separate stand-up pouch page is the primary factory and supplier qualification route.',
    crossLink: ['/products/stand-up-pouch.html', 'Open the stand-up pouch manufacturer and factory page'],
    supports: [
      ['/blog/custom-mylar-bag-printing-guide.html', 'Custom flexible pouch printing guide'],
      ['/blog/stand-up-pouch-barrier-materials.html', 'Barrier film selection for stand-up pouches'],
      ['/blog/flexible-packaging-structures.html', 'Flexible packaging structure guide'],
      ['/blog/packaging-sample-checklist-before-mass-production.html', 'What to approve on a packaging sample'],
      ['/blog/custom-packaging-cost-breakdown-materials-shipping.html', 'Material, setup and shipping cost drivers'],
      ['/blog/packaging-shipping-cost-guide-china.html', 'Packaging shipping cost factors']
    ]
  },
  {
    file: 'content-site/products/flexible-packaging.html',
    quickTitle: 'Is this the right China flexible packaging manufacturer for the project?',
    quick: 'BestPackFactory is a Shenzhen B2B packaging manufacturer operated by Shenzhen Color Printing Paper Packaging Co., Ltd. It supplies project-specific printed flexible packaging from a published starting MOQ of 500 pieces per custom size and artwork, subject to film structure, printing method and converting requirements. Buyers can specify stand-up, flat-bottom, side-gusset or flat pouches and compatible roll stock, with barrier layers, zipper, valve, spout, window, print and finish. This page is for brands and procurement teams with a defined product and filling process. For an RFQ, send product composition, net weight, fill and seal method, shelf-life target, dimensions, quantity, artwork, destination market and required date.',
    decisionTitle: 'How quantity and print setup affect flexible packaging cost',
    quantities: [
      ['500 PCS', 'A short-run option may be possible with digital printing and available film structures. Special films, valves, spouts or testing needs can move the practical minimum.'],
      ['1,000 PCS', 'Standard material availability and conversion planning may improve. Compare a simpler structure only if it still meets barrier, filling and distribution requirements.'],
      ['2,000 PCS', 'Material utilization and setup can become more efficient. Ask the supplier to separate print, cylinder or tooling charges from the converted-pouch quote.'],
      ['5,000 PCS+', 'Gravure or other longer-run methods may become economical depending on colors, web width and repeat demand. Include cylinder cost, freight, storage and artwork-change risk in the decision.']
    ],
    scope: 'This is the primary route for flexible packaging manufacturer China and low-MOQ flexible packaging sourcing. Format-specific questions should continue to the stand-up pouch, coffee bag or flat-bottom pouch pages.',
    supports: [
      ['/blog/flexible-packaging-structures.html', 'Flexible packaging structures and layer functions'],
      ['/blog/flexible-packaging-vs-rigid-packaging-b2b-guide.html', 'Flexible versus rigid packaging for B2B buyers'],
      ['/blog/stand-up-pouch-barrier-materials.html', 'Stand-up pouch barrier material guide'],
      ['/blog/kraft-paper-pouch-vs-foil-pouch-coffee.html', 'Kraft-look versus foil-laminate coffee pouches'],
      ['/blog/packaging-sample-checklist-before-mass-production.html', 'Flexible packaging sample approval checklist'],
      ['/blog/shipping-custom-packaging-china-ddp-fob-air-freight.html', 'Shipping custom packaging from China']
    ]
  }
];

function links(items) {
  return items.map(([href, text]) => `<li><a href="${href}">${text}</a></li>`).join('');
}

function quickModule(page) {
  const wordCount = page.quick.trim().split(/\s+/).length;
  if (wordCount < 80 || wordCount > 140) throw new Error(`${page.file}: quick answer is ${wordCount} words`);
  return `${START}\n<section class="section geo-buyer-quick-answer" data-geo-buyer-answer="20260908">\n<div class="ai-snapshot"><div class="eyebrow">Buyer Quick Answer</div><h2>${page.quickTitle}</h2><p>${page.quick}</p></div>\n</section>\n${END}`;
}

function decisionModule(page) {
  const quantityCards = page.quantities.map(([title, text]) => `<article class="whitepaper-card"><h3>${title}</h3><p>${text}</p></article>`).join('');
  const crossLink = page.crossLink ? `<p><a href="${page.crossLink[0]}">${page.crossLink[1]}</a>.</p>` : '';
  return `${START}\n<section class="section alt geo-quantity-guide" data-geo-quantity-guide="20260908">\n<div class="eyebrow">Quantity &amp; Cost Drivers</div><h2>${page.decisionTitle}</h2><p>No fixed price is stated because dimensions, materials, printing, finishes, tooling, packing and destination change the quotation. These quantity bands explain which setup costs and production choices a buyer should compare.</p><div class="whitepaper-grid">${quantityCards}</div>\n</section>\n<section class="section geo-intent-scope" data-geo-intent-scope="20260908">\n<div class="eyebrow">Page Intent</div><h2>Use one primary page for each purchasing question</h2><p>${page.scope}</p>${crossLink}\n</section>\n<section class="section alt geo-verification-links" data-geo-verification="20260908">\n<div class="eyebrow">Verification Before Deposit</div><h2>Evidence a packaging buyer can check</h2><p>Use the linked pages to review the disclosed legal identity, current production address, factory workflow, document scope, named sales contact and sample process. Certification or test-report evidence must be evaluated for the exact product, material, issuing body, scope and validity date; one report is not blanket approval for every package.</p><ul class="internal-links">${links(commonEvidenceLinks)}</ul>\n</section>\n<section class="section geo-supporting-answers" data-geo-supporting-answers="20260908">\n<div class="eyebrow">Supporting Buyer Answers</div><h2>Continue the procurement review</h2><ul class="internal-links">${links(page.supports)}</ul>\n</section>\n${END}`;
}

for (const page of pages) {
  const absolute = path.join(root, page.file);
  let html = fs.readFileSync(absolute, 'utf8');
  if (html.includes('data-geo-buyer-answer="20260908"') || html.includes('data-geo-quantity-guide="20260908"')) {
    console.log(`Skipped ${page.file}; phase-one module already exists`);
    continue;
  }
  const mainStart = html.indexOf('<main');
  const h1Start = html.indexOf('<h1');
  const contentStart = mainStart >= 0 ? mainStart : html.lastIndexOf('<section', h1Start);
  if (contentStart < 0 || h1Start < 0) throw new Error(`${page.file}: page content start not found`);
  const heroEnd = html.indexOf('</section>', h1Start);
  if (heroEnd < 0) throw new Error(`${page.file}: first section end not found`);
  const afterHero = heroEnd + '</section>'.length;
  html = `${html.slice(0, afterHero)}\n${quickModule(page)}${html.slice(afterHero)}`;
  const fallbackEnds = [
    html.indexOf('<footer', afterHero),
    html.indexOf('<div class="bpf-whatsapp-chat"', afterHero),
    html.indexOf('<section class="buyer-essentials"', afterHero),
    html.indexOf('</body>', afterHero)
  ].filter(index => index >= 0);
  const contentEnd = mainStart >= 0 ? html.indexOf('</main>', afterHero) : Math.min(...fallbackEnds);
  if (contentEnd < 0) throw new Error(`${page.file}: page content end not found`);
  html = `${html.slice(0, contentEnd)}${decisionModule(page)}\n${html.slice(contentEnd)}`;
  fs.writeFileSync(absolute, html, 'utf8');
  console.log(`Enhanced ${page.file}`);
}
