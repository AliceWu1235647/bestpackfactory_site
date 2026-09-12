const REVIEWED_DATE = 'September 12, 2026';

const SAFE_METADATA_DESCRIPTIONS = {
  'products/cannabis-stand-up-pouches.html': 'Custom cannabis stand-up pouches with selectable barrier and closure options. Exact child-resistant evidence, material specification and market requirements must be confirmed per ordered configuration.',
  'products/cannabis-mylar-bags.html': 'Custom cannabis Mylar-style bags with selectable laminate and closure options. Barrier targets and child-resistant evidence must be verified for the exact ordered configuration.',
};

const COMPLIANCE_REPLACEMENTS = {
  'products/cannabis-stand-up-pouches.html': [
    ['Custom cannabis stand-up pouches with child-resistant zipper, smell-proof aluminium foil barrier and compliant labelling. MOQ 500 PCS.', 'Custom cannabis stand-up pouches with selectable barrier and closure options. Material performance, child-resistant evidence and labelling requirements are confirmed for the exact ordered configuration.'],
    ['OTR ≤ 0.5 cc/m²·day, WVTR ≤ 0.5 g/m²·day with aluminium foil laminate', 'Barrier targets and test evidence to be confirmed for the exact aluminium-foil laminate and intended use'],
    ['ASTM D3475-compliant child-resistant press-to-close zipper; double-lock and slider options available', 'Child-resistant closure options require test evidence that matches the exact ordered package and destination requirement'],
    ['Child-resistant zipper meets ASTM D3475 requirements.', 'Child-resistant options require evidence that matches the exact finished pouch and destination-market protocol; ASTM D3475 classification alone is not certification.'],
    ['Full-color rotogravure printing with dedicated compliance label panel for THC/CBD content, government warnings and batch tracking.', 'Custom printing can reserve buyer-approved panels for required warnings, symbols and variable data.'],
    ['ASTM D3475 child-resistant zipper, double-lock, slider', 'Child-resistant closure options; exact package test evidence required'],
    ['OTR ≤ 0.5 cc/m²·day, WVTR ≤ 0.5 g/m²·day', 'Project-specific barrier targets; confirm by report for the ordered laminate'],
    ['Yes. We offer ASTM D3475-compliant child-resistant zippers including double-lock and slider styles. The specific mechanism is confirmed during sampling. Certification documents are available after the zipper structure is selected.', 'Closure options include double-lock and slider styles. A finished pouch must be treated as child-resistant only when the applicable test evidence matches the exact ordered configuration and destination-market requirement.'],
    ['The aluminium foil layer (AL 7µm) in the PET/AL/PE laminate blocks terpene and volatile compound transmission. OTR is ≤ 0.5 cc/m²·day and WVTR ≤ 0.5 g/m²·day. The opaque structure also blocks UV light.', 'An opaque aluminium-foil laminate can be specified for light, aroma, oxygen and moisture protection. Set measurable project targets and match any report to the exact film structure, thickness, test method and intended use.'],
    ['Yes. We print compliant label panels with space for THC/CBD content, government warnings, universal symbols and batch tracking. Provide your state or market requirements and we will set up the label panel on the dieline.', 'We can reserve artwork panels for buyer-supplied warnings, symbols, content and batch information. The license holder or brand must approve the final package and label for the destination market.'],
  ],
  'products/cannabis-mylar-bags.html': [
    ['Cannabis mylar bags in a PET / aluminium foil / PE laminate, smell-proof to OTR ≤ 0.5 cc/m²·day, with an optional child-resistant zipper. MOQ 500 PCS.', 'Cannabis Mylar-style bags with selectable laminate and closure options. Barrier targets and child-resistant evidence must be confirmed for the exact ordered configuration.'],
    ['OTR ≤ 0.5 cc/m²·day and WVTR ≤ 0.5 g/m²·day for aluminum foil structure', 'Project-specific oxygen and moisture barrier targets; confirm by report for the exact aluminium-foil structure'],
  ],
};

const PAPER_QUANTITIES = [
  ['500 pcs', 'Pilot launch, premium short run or first production order', 'Tooling, plates, setup and hand-finishing are spread across fewer units; simplify finishes and keep one size where possible.'],
  ['1,000 pcs', 'Market validation with more room for finishes and inserts', 'Unit economics normally improve because setup is distributed across more finished pieces.'],
  ['2,000 pcs', 'Repeat retail or e-commerce program', 'Board yield, sheet imposition, packing method and freight carton utilization become important cost drivers.'],
  ['5,000 pcs+', 'Established repeat program', 'Offset printing and production tooling usually become more efficient; compare total landed cost, not unit price alone.'],
];

const FLEXIBLE_QUANTITIES = [
  ['500 pcs', 'Prototype or small launch where the selected construction supports a short run', 'Digital printing may avoid cylinder cost, but available films, inks, finishes and pouch formats can be narrower.'],
  ['1,000 pcs', 'Market test with a defined barrier and filling method', 'Confirm whether the quantity is per artwork, size and material structure—not the combined purchase order.'],
  ['2,000 pcs', 'Growing SKU with repeatable artwork and specifications', 'Film width, print method, zipper, valve, tear notch and inspection requirements influence the conversion cost.'],
  ['5,000 pcs+', 'Repeat production or multiple planned batches', 'Compare digital, plate-based and gravure routes using total setup, waste, cylinder/plate ownership and reorder terms.'],
];

const HUBS = {
  'custom-packaging-manufacturer.html': {
    name: 'Custom packaging manufacturer in China',
    quick: 'BestPackFactory is the export-facing brand of Shenzhen Color Printing Paper Packaging Co., Ltd., established on April 5, 2016, with production at Huixin Zhichuang Park, 108 Huarong Road, Longhua District, Shenzhen, China. The factory develops custom paper boxes, rigid gift boxes, paper bags, printed tissue and flexible pouches for B2B buyers. A 500-piece starting quantity is available for many custom projects, subject to structure, material, artwork and print method. Buyers should send the product dimensions, order quantity, destination, artwork status and any material or compliance requirements so the team can confirm feasibility rather than issue a generic quote.',
    intro: 'Use this page for broad factory selection and multi-format custom packaging projects. Product-specific pages below remain the primary technical references for each construction.',
    rows: [
      ['Buyer fit', 'Startups, established brands, distributors and procurement teams sourcing boxes, bags, tissue or flexible packaging from one China production partner.'],
      ['Customizable scope', 'Dimensions, structure, paper or film construction, printing, surface finish, inserts, handles, closures and export packing—subject to production review.'],
      ['Quote inputs', 'Product dimensions, quantity per SKU, material or performance target, artwork, destination, required delivery date and applicable market requirements.'],
      ['Supplier verification', 'Match the legal entity, factory address, sample approval, material specifications, quality checkpoints and payment beneficiary before paying a deposit.'],
    ],
    evidence: [
      'Request a written specification that identifies structure, dimensions, tolerances, material, printing, finish and packing—not only a product photo.',
      'Approve a physical or production-representative sample before mass production and retain the approved reference.',
      'Treat certificates and test reports as scope-specific evidence: verify the company, material, sample description, test method, issue date and intended use.',
    ],
    supporting: [
      ['/products/custom-packaging-boxes.html', 'Paper packaging boxes'],
      ['/products/custom-rigid-boxes.html', 'Custom rigid boxes'],
      ['/products/paper-bags.html', 'Custom paper bags'],
      ['/products/stand-up-pouch.html', 'Stand-up pouches'],
      ['/factory.html', 'Factory information'],
      ['/factory/quality-control.html', 'Quality-control process'],
    ],
    dielines: [
      ['/dielines', 'Free packaging dieline library'],
      ['/dielines/tuck-end-box-dieline', 'Tuck-end carton dieline'],
      ['/dielines/paper-bag-dieline', 'Paper bag dieline'],
      ['/dielines/stand-up-pouch-dieline', 'Stand-up pouch dieline'],
    ],
    questions: [
      ['Can a buyer start at 500 pieces?', 'Many listed custom projects can start at 500 pieces, but the confirmed MOQ is per size, artwork and construction. Complex materials or production methods may require a different minimum.'],
      ['What should be verified before paying a deposit?', 'Verify the legal supplier identity, beneficiary, factory address, written specification, approved sample, quality plan, delivery term and the exact scope of any certificate or test report.'],
      ['Can different packaging formats be quoted together?', 'Yes. Send one RFQ table with quantity, size and material requirements for each SKU so feasibility, consolidation and shipping can be evaluated together.'],
    ],
    quantity: PAPER_QUANTITIES,
  },

  'products/custom-packaging-boxes.html': {
    name: 'Paper box and packaging box manufacturer in China',
    quick: 'This is the primary sourcing page for custom printed paperboard packaging boxes—not heavy corrugated shipping cartons. BestPackFactory manufactures folding cartons and related paper packaging in Shenzhen for retail, cosmetics, food, gifts and other B2B applications. Buyers can specify dimensions, paperboard grade, print colors, coating, foil, embossing, window, insert and packing method. A typical starting quantity is 500 pieces when the selected construction and print process support it. For a usable quotation, send the internal product size, packed weight, quantity per artwork, destination, artwork file and any food-contact or market-specific documentation requirement.',
    intro: 'The key buying decision is not simply “paper box.” It is the combination of board, structure, printing, finish and the product-protection requirement.',
    rows: [
      ['Primary constructions', 'Straight-tuck, reverse-tuck, auto-lock bottom, crash-lock bottom, sleeve and other folding-carton structures after dieline review.'],
      ['Material decision', 'Select paperboard grade and caliper from product weight, stiffness, print surface, recycled-content requirement and packing-line behavior.'],
      ['Print and finish', 'Offset or suitable short-run printing; matte/gloss coating, foil, embossing, spot effects, windows and inserts where feasible.'],
      ['Engineering input', 'Provide product size, packed weight, orientation, closure method, shelf/display goal, packing process and transport conditions.'],
    ],
    evidence: [
      'Ask for the flat dieline and finished internal dimensions so artwork and product fit can be checked against the same drawing.',
      'Approve color, barcode quiet zone, crease direction, glue area and critical tolerances on the sample.',
      'For direct food contact, specify the exact contact layer, food type and conditions of use; a generic “food grade” statement is not enough.',
    ],
    supporting: [
      ['/products/custom-folding-cartons.html', 'Folding-carton options'],
      ['/products/custom-boxes.html', 'Corrugated and shipping box options'],
      ['/blog/rigid-box-vs-folding-carton-procurement-guide.html', 'Rigid box vs folding carton guide'],
      ['/factory/quality-control.html', 'Quality-control process'],
    ],
    dielines: [
      ['/dielines/tuck-end-box-dieline', 'Tuck-end box dieline'],
      ['/dielines/gable-top-box-dieline', 'Gable-top box dieline'],
      ['/dielines/sleeve-dieline', 'Sleeve box dieline'],
    ],
    questions: [
      ['Is this page for rigid boxes or corrugated boxes?', 'No. This page is primarily for printed paperboard folding cartons. Use the rigid-box center for setup boxes and the corrugated-box page for shipping protection.'],
      ['What determines paper-box price?', 'Board grade and yield, size, printing, surface finish, tooling, insert complexity, assembly, packing and quantity per artwork are the main drivers.'],
      ['What file should a buyer approve?', 'Approve the final dieline with dimensions, cut/fold/glue layers and the imposed artwork proof, then confirm the physical sample against that revision.'],
    ],
    quantity: PAPER_QUANTITIES,
  },

  'products/custom-rigid-boxes.html': {
    name: 'Custom rigid box manufacturer in China',
    quick: 'BestPackFactory manufactures custom rigid paperboard boxes in Shenzhen for brands that need a stronger presentation structure than a folding carton. Common projects include lift-off-lid, magnetic-closure, drawer and hinged rigid boxes with paper wrap and optional paperboard, foam or molded inserts. The site supports a typical 500-piece starting point for suitable custom configurations; final MOQ depends on size, wrap, finish, insert and assembly. Buyers should provide the product dimensions and weight, preferred opening style, quantity per artwork, finish references, insert-retention requirement and shipping destination before comparing quotations.',
    intro: 'Use this page as the primary rigid-box manufacturing center. Magnetic gift boxes and luxury gift boxes are supporting sub-intents with their own narrower pages.',
    rows: [
      ['Structure choice', 'Lift-off lid for classic presentation; magnetic closure for reveal and repeat opening; drawer for a sleeve-and-tray experience; hinged formats for controlled presentation.'],
      ['Board and wrap', 'Specify finished strength, edge appearance, wrap paper, color consistency and whether the box ships assembled or flat where the structure permits.'],
      ['Insert engineering', 'Product weight, center of gravity, drop risk, removal experience and cosmetic sensitivity determine paperboard, foam or molded insert selection.'],
      ['Critical inspection', 'Finished dimensions, squareness, wrap alignment, corner finish, magnet position, glue cleanliness, insert fit and appearance under agreed lighting.'],
    ],
    evidence: [
      'Request a dimensioned white sample before decorated sampling when fit and insert retention are critical.',
      'Compare assembled and collapsible structures using landed volume, labor, crease durability and presentation—not freight alone.',
      'Keep the signed sample, approved artwork and written tolerance sheet as the production-control reference.',
    ],
    supporting: [
      ['/products/custom-luxury-gift-boxes-manufacturer-premium-rigid-gift-packaging.html', 'Luxury gift box manufacturing'],
      ['/products/luxury-magnetic-boxes.html', 'Magnetic-closure boxes'],
      ['/blog/rigid-boxes-vs-folding-cartons-vs-mailer-boxes.html', 'Structure comparison guide'],
      ['/samples.html', 'Sampling options'],
    ],
    dielines: [
      ['/dielines/magnetic-rigid-box-dieline', 'Magnetic rigid box dieline'],
      ['/dielines/two-piece-gift-box-dieline', 'Two-piece rigid box dieline'],
      ['/dielines/wine-bottle-box-dieline', 'Rigid wine box dieline'],
    ],
    questions: [
      ['Where can I order 500 custom rigid boxes?', 'A 500-piece starting point is available for suitable configurations shown on this site. Send size, structure, insert, finish, artwork and destination for confirmation per SKU.'],
      ['Which rigid-box dimension matters most?', 'The inside usable dimensions must fit the product and insert. The outside dimensions then affect wrap yield, master-carton size and shipping volume.'],
      ['Should I choose a paperboard or foam insert?', 'Choose by product weight, protection, removal experience, appearance and market requirements. A physical fit sample is the safest way to decide.'],
    ],
    quantity: PAPER_QUANTITIES,
  },

  'products/custom-luxury-gift-boxes-manufacturer-premium-rigid-gift-packaging.html': {
    name: 'Luxury gift box and paper gift box manufacturer in China',
    quick: 'This is the primary page for premium paper gift boxes where presentation, opening sequence, wrap quality and insert fit matter as much as containment. BestPackFactory develops custom rigid gift boxes in Shenzhen with selectable structures, paper wraps, printing, foil, embossing, ribbons, magnetic closures and fitted inserts. A typical starting point is 500 pieces for suitable configurations, confirmed per size and artwork. Buyers should send product dimensions and weight, reference images, preferred structure, quantity, finish priorities, insert requirements, destination and launch date so the quote can distinguish essential features from optional decoration.',
    intro: 'Luxury is an engineering brief, not a material label. The box must balance brand presentation, repeatable finishing, product protection and landed shipping volume.',
    rows: [
      ['Presentation brief', 'Define the reveal sequence, product orientation, unboxing priority, color target and which surfaces must remain mark-free.'],
      ['Premium finishes', 'Foil, embossing/debossing, textured or specialty wrap, ribbons and spot effects require artwork and process feasibility review.'],
      ['Insert fit', 'Specify exposed product areas, pull points, accessory wells, movement allowance and acceptable compression.'],
      ['Shipping format', 'Compare assembled, collapsible and nested options only where the required structure supports them; request master-carton dimensions for landed-cost comparison.'],
    ],
    evidence: [
      'Use a decorated sample for critical color, foil, embossing, wrap seams and insert fit; a digital render cannot approve production workmanship.',
      'Mark the approved sample with the artwork revision and date so later changes are traceable.',
      'Ask for pre-shipment inspection criteria and packing photos that match the agreed presentation surfaces and master-carton plan.',
    ],
    supporting: [
      ['/products/custom-rigid-boxes.html', 'Rigid-box engineering center'],
      ['/products/luxury-magnetic-boxes.html', 'Magnetic gift boxes'],
      ['/industries/luxury-gift-packaging-manufacturer.html', 'Luxury gift packaging by application'],
      ['/blog/luxury-gift-box-packaging-guide.html', 'Luxury gift box buyer guide'],
    ],
    dielines: [
      ['/dielines/magnetic-rigid-box-dieline', 'Magnetic gift box dieline'],
      ['/dielines/two-piece-gift-box-dieline', 'Two-piece gift box dieline'],
      ['/dielines/wine-bottle-box-dieline', 'Rigid wine gift box dieline'],
    ],
    questions: [
      ['What makes a gift box “luxury”?', 'Consistent wrap and corners, controlled opening, precise insert fit, disciplined finishing and an intentional presentation sequence matter more than simply adding foil.'],
      ['Can a luxury gift box start at 500 pieces?', 'Suitable configurations can start at 500 pieces, but the confirmed MOQ is per size, artwork and finish combination.'],
      ['How should finish quality be approved?', 'Approve physical samples for color, foil, embossing, texture and wrap alignment, with agreed inspection limits for visible defects.'],
    ],
    quantity: PAPER_QUANTITIES,
  },

  'products/paper-bags.html': {
    name: 'Custom paper bag manufacturer in China',
    quick: 'BestPackFactory manufactures custom printed paper shopping and gift bags in Shenzhen for retail, cosmetics, apparel, events and product sets. Buyers can specify finished dimensions, paper grade, print, lamination or coating, foil, embossing, handle material, handle length, reinforcement and packing method. A typical 500-piece starting quantity is available for suitable custom paper-bag projects and is confirmed per size and artwork. For a comparable quote, send the bag width × gusset × height, expected carry weight, quantity, handle preference, artwork, surface finish, destination and any paper-source or market requirement.',
    intro: 'Use this page as the primary manufacturer page for both paper shopping bags and gift paper bags. Supporting pages cover wholesale, retail-luxury and application-specific options.',
    rows: [
      ['Dimension order', 'Quote finished width × side gusset × height and state whether dimensions are internal or external.'],
      ['Paper selection', 'Select paper grade and weight from bag size, carry load, print appearance, fold behavior and sustainability requirement.'],
      ['Handle system', 'Ribbon, rope, twisted paper or flat paper handles require agreed length, color, fixing method and top reinforcement.'],
      ['Performance checks', 'Confirm handle pull, base reinforcement, glue areas, fold quality, rub resistance and packed-carton protection.'],
    ],
    evidence: [
      'Supply the intended carry weight and product dimensions; visual style alone is not enough to engineer the handle and reinforcement.',
      'Approve handle color, length and attachment on a physical sample, including how the bag feels when loaded.',
      'If FSC or recycled-content evidence is required, identify the exact claim and document needed before material is ordered.',
    ],
    supporting: [
      ['/products/custom-paper-bags.html', 'Custom paper bag options'],
      ['/products/custom-paper-bags-wholesale.html', 'Wholesale paper bags'],
      ['/products/luxury-retail-paper-bags.html', 'Luxury retail paper bags'],
      ['/blog/custom-paper-bag-sizes-guide.html', 'Paper bag sizing guide'],
    ],
    dielines: [
      ['/dielines/paper-bag-dieline', 'Paper bag dieline generator'],
    ],
    questions: [
      ['Can I order 2,000 paper bags with ribbon handles?', 'Yes, subject to size, paper, artwork and ribbon specification. Send the loaded product weight and required handle length so reinforcement can be reviewed.'],
      ['What is the MOQ for custom paper bags?', 'The site supports a typical 500-piece starting point for suitable projects, confirmed per size and artwork.'],
      ['What should a paper-bag RFQ include?', 'Include width × gusset × height, carry weight, paper preference, handle type and length, print/finish, quantity per design, destination and delivery date.'],
    ],
    quantity: PAPER_QUANTITIES,
  },

  'products/stand-up-pouch.html': {
    name: 'Stand-up pouch manufacturer in China',
    quick: 'This is the primary manufacturing page for stand-up pouches, while the separate custom-printed stand-up pouch page focuses on artwork and print customization. BestPackFactory develops pouches in Shenzhen with selectable dimensions, film structures, zipper, tear notch, hang hole, window and optional valve where the intended product and filling process support them. Some custom projects can start at 500 pieces, but MOQ must be confirmed per size, artwork, material structure and print method. Buyers should provide product type, fill weight, shelf-life target, barrier need, filling temperature, sealing equipment, quantity and destination before a film structure is proposed.',
    intro: 'Pouch selection should start with the packed product and process. A visually similar laminate may perform differently under oxygen, moisture, aroma, oil, heat or puncture exposure.',
    rows: [
      ['Use conditions', 'Product composition, fill temperature, target shelf life, storage, transport and opening/reclosure behavior.'],
      ['Barrier definition', 'Specify oxygen, moisture, aroma, light, grease and puncture priorities; request project targets instead of a generic “high barrier” claim.'],
      ['Closure options', 'Press-to-close zipper, tear notch, hang hole, window and valve are selected only after material and process compatibility review.'],
      ['Seal validation', 'Agree seal width, sealing window, leak or burst method, drop/transport need and acceptance criteria for the exact pouch construction.'],
    ],
    evidence: [
      'Request a material specification that lists every laminate layer and total thickness rather than accepting “Mylar” as a complete construction.',
      'Test samples with the actual product and filling/sealing process before approving mass production.',
      'Confirm cylinder or plate ownership, re-order terms and allowable artwork changes when comparing print methods.',
    ],
    supporting: [
      ['/products/custom-stand-up-pouches.html', 'Custom printed stand-up pouches'],
      ['/products/flexible-packaging.html', 'Flexible packaging manufacturer center'],
      ['/blog/stand-up-pouch-barrier-materials.html', 'Barrier material guide'],
      ['/blog/flat-bottom-bag-vs-stand-up-pouch.html', 'Pouch structure comparison'],
    ],
    dielines: [
      ['/dielines/stand-up-pouch-dieline', 'Stand-up pouch dieline'],
      ['/dielines/coffee-bag-250g-valve-dieline', 'Coffee pouch dieline'],
      ['/dielines/mylar-bag-dieline', 'Mylar-style pouch dieline'],
    ],
    questions: [
      ['Can a China factory make 500 custom printed stand-up pouches?', 'Some listed configurations can start at 500 pieces when the short-run print route and selected material support it. Confirm MOQ per size and artwork.'],
      ['How do I choose a pouch barrier?', 'Provide product type, shelf life, filling and storage conditions, then set measurable oxygen/moisture or functional targets where needed.'],
      ['Is “Mylar” a complete material specification?', 'No. It is commonly used as a market term. A production specification should identify the actual laminate layers, thickness, sealant and performance requirements.'],
    ],
    quantity: FLEXIBLE_QUANTITIES,
  },

  'products/flexible-packaging.html': {
    name: 'Flexible packaging and pouch manufacturer in China',
    quick: 'Use this page for broad flexible-packaging supplier evaluation across stand-up, flat-bottom, side-gusset, three-side-seal and other converted pouch formats. BestPackFactory supports custom dimensions, laminate structures, printing and functional features from Shenzhen. A 500-piece starting point is possible for selected short-run configurations; production MOQ varies by pouch format, material, print route, size and artwork. Buyers should send the packed product, fill weight, shelf-life target, barrier priorities, filling and sealing process, quantity per SKU, destination and applicable food-contact or market documentation requirement before comparing manufacturers.',
    intro: 'The primary decision is the complete material-and-process system: film layers, printing, conversion, closure, sealing and the product’s real distribution environment.',
    rows: [
      ['Pouch format', 'Stand-up, flat-bottom, side-gusset or three-side-seal based on shelf presentation, fill weight, machine handling and packing efficiency.'],
      ['Material construction', 'Document each film layer, thickness, barrier function, print layer, sealant and any recyclability or disposal claim.'],
      ['Print-route decision', 'Digital may suit shorter runs; plate or cylinder processes may suit repeat volume. Compare color control, setup ownership and reorder economics.'],
      ['Quality plan', 'Define dimensions, seal integrity, zipper/valve function, print registration, appearance, odor and applicable migration or performance evidence.'],
    ],
    evidence: [
      'Ask for a signed material specification and traceable lot information for the approved structure.',
      'Validate filled-package performance, not only empty-bag appearance, under realistic filling, sealing, storage and transport conditions.',
      'Confirm whether sustainability claims apply to the complete laminate and the target market’s collection/recycling system.',
    ],
    supporting: [
      ['/products/stand-up-pouch.html', 'Stand-up pouch manufacturer'],
      ['/products/custom-stand-up-pouches.html', 'Custom printed pouch options'],
      ['/products/cannabis-mylar-bags.html', 'Cannabis Mylar bag sourcing'],
      ['/industries/food-packaging-manufacturer.html', 'Food packaging manufacturer center'],
    ],
    dielines: [
      ['/dielines/stand-up-pouch-dieline', 'Stand-up pouch dieline'],
      ['/dielines/coffee-bag-500g-flat-bottom-dieline', 'Flat-bottom bag dieline'],
      ['/dielines/sachet-stick-pack-dieline', 'Sachet and stick-pack dieline'],
    ],
    questions: [
      ['What evidence should a flexible-packaging supplier provide?', 'Request the layer structure, total thickness, intended conditions of use, relevant declarations or test reports, approved sample and agreed seal/performance checks.'],
      ['Which print method is best for a low MOQ?', 'Digital printing can reduce setup for selected short runs, but the correct choice depends on film availability, finish, color requirement and reorder plan.'],
      ['How should suppliers be compared?', 'Compare the same material structure, pouch dimensions, features, print coverage, quantity per SKU, inspection plan and Incoterm—not headline unit price.'],
    ],
    quantity: FLEXIBLE_QUANTITIES,
  },

  'products/custom-printed-tissue-paper.html': {
    name: 'Custom printed tissue paper manufacturer in China',
    quick: 'This is the primary manufacturer page for branded wrapping tissue used inside gift, retail, apparel, cosmetic and e-commerce packaging. BestPackFactory produces custom printed tissue paper in Shenzhen with buyer-selected sheet size, paper weight, base color, artwork repeat, print color and packing method, subject to production review. A typical starting quantity is 500 pieces for suitable projects, but MOQ is confirmed by sheet size, artwork, ink coverage and packing. Buyers should send the flat sheet dimensions, paper weight or hand-feel target, number of print colors, repeat artwork, quantity, fold/pack requirement and shipping destination.',
    intro: 'Tissue-paper quality depends on more than GSM. Opacity, softness, print show-through, ink coverage, fold direction, sheet count and packing protection all affect the finished result.',
    rows: [
      ['Sheet specification', 'Finished length × width, paper weight, base color, sheet count per pack and whether sheets are supplied flat or folded.'],
      ['Artwork repeat', 'Logo size, repeat spacing, rotation, print colors, bleed and acceptable registration tolerance.'],
      ['Print behavior', 'Evaluate show-through, rub, offsetting, pinholes and how heavy ink coverage changes softness and appearance.'],
      ['Packing control', 'Agree fold size, count tolerance, inner protection, carton quantity and humidity protection for export transit.'],
    ],
    evidence: [
      'Approve the repeat layout at actual size; a screen preview can hide scale and spacing problems.',
      'Review a physical printed sample for hand feel, opacity, ink appearance and rub before production.',
      'Specify whether recycled-content, FSC or direct-food-contact evidence is required; these are different claims and must be documented separately.',
    ],
    supporting: [
      ['/products/custom-tissue-paper.html', 'Custom tissue paper options'],
      ['/products/tissue-paper-packaging.html', 'Tissue paper packaging uses'],
      ['/blog/custom-printed-tissue-paper-guide.html', 'Printed tissue paper buyer guide'],
      ['/products/paper-bags.html', 'Coordinated paper bags'],
    ],
    dielines: [
      ['/dielines', 'Free packaging dieline library'],
    ],
    questions: [
      ['What information is needed for a tissue-paper quote?', 'Send flat sheet size, paper weight or feel, base color, print colors, repeat artwork, quantity, folding and packing requirements, destination and deadline.'],
      ['Does higher ink coverage affect tissue?', 'Yes. Heavy coverage can change softness, show-through, drying and rub behavior, so a physical sample should be approved.'],
      ['Can tissue paper match a paper bag or gift box?', 'The components can be developed as one presentation system, but color appearance varies by substrate and should be approved with physical samples.'],
    ],
    quantity: PAPER_QUANTITIES,
  },

  'products/cannabis-stand-up-pouches.html': {
    name: 'Cannabis and marijuana stand-up pouch manufacturer',
    quick: 'This page is the primary sourcing center for cannabis or marijuana stand-up pouches. BestPackFactory can develop custom pouch dimensions, laminate structures, printing, zipper, tear notch and child-resistant closure options in Shenzhen, but regulatory suitability is not automatic. It depends on the exact finished package, tested closure configuration, product, label and sales jurisdiction. Buyers must provide the destination market, product form, fill weight, required child-resistant or tamper-evident function, barrier target, label area, quantity and documentation requirement. A typical 500-piece starting point is available only for suitable configurations and must be confirmed per size, artwork and material.',
    intro: 'Cannabis packaging is a regulated finished-package decision. ASTM D3475 classifies child-resistant package types; it is not, by itself, proof that a specific supplied pouch passed a protocol.',
    rows: [
      ['Jurisdiction first', 'State/province/country, product form and sales channel determine the applicable packaging and labeling rules.'],
      ['Child-resistant evidence', 'Request the exact package/closure test report or certificate, laboratory, protocol, tested dimensions and confirmation that the ordered configuration matches.'],
      ['Barrier and odor', 'Set product-specific oxygen, moisture, light and aroma targets; require the final laminate structure and relevant performance evidence.'],
      ['Label and graphics', 'Reserve the required legal panels, symbols, warnings, variable data and quiet zones before approving decorative artwork.'],
    ],
    evidence: [
      'Do not accept “child-resistant zipper” as proof for every finished pouch size and laminate; match the order to the tested configuration.',
      'Ask the brand’s legal or compliance reviewer to approve the final package and label for the destination market.',
      'Keep the material specification, compliance evidence, approved artwork and lot/inspection records together for traceability.',
    ],
    supporting: [
      ['/products/cannabis-mylar-bags.html', 'Cannabis Mylar bags'],
      ['/products/cannabis-child-resistant-bags.html', 'Child-resistant bag options'],
      ['/products/stand-up-pouch.html', 'General stand-up pouch manufacturing'],
      ['/factory/quality-control.html', 'Quality-control process'],
    ],
    dielines: [
      ['/dielines/child-resistant-pouch-dieline', 'Child-resistant pouch dieline'],
      ['/dielines/mylar-bag-dieline', 'Mylar-style pouch dieline'],
      ['/dielines/stand-up-pouch-dieline', 'Stand-up pouch dieline'],
    ],
    sources: [
      ['Health Canada cannabis packaging and labelling guide', 'https://www.canada.ca/en/health-canada/services/cannabis-regulations-licensed-producers/packaging-labelling-guide-cannabis-products.html'],
      ['California Department of Cannabis Control: child-resistant packaging', 'https://www.cannabis.ca.gov/licensees/cannaconnect-compliance-hub/packaging/child-resistant-packaging-crp/'],
      ['U.S. CPSC child-resistant packaging guidance', 'https://www.cpsc.gov/Regulations-Laws--Standards/Statutes/Poison-Prevention-Packaging-Act'],
    ],
    questions: [
      ['Does an ASTM D3475 reference prove a pouch is child-resistant?', 'No. ASTM D3475 is a classification standard. Ask for evidence tied to the exact finished package and the applicable protocol required by the destination market.'],
      ['Can the factory decide whether my label is legal?', 'The supplier can reserve print areas and manufacture approved artwork, but the license holder or brand remains responsible for jurisdiction-specific package and label compliance.'],
      ['What should be in a cannabis pouch RFQ?', 'Include jurisdiction, product form, fill weight, size, barrier targets, closure and tamper requirements, label panels, quantity, destination and required evidence.'],
    ],
    quantity: FLEXIBLE_QUANTITIES,
  },

  'products/cannabis-mylar-bags.html': {
    name: 'Cannabis Mylar bags and weed Mylar pouch manufacturer',
    quick: 'This page is the primary manufacturer page for the buyer terms “cannabis Mylar bags” and “weed Mylar pouches.” In production, “Mylar bag” is not a complete material specification: the RFQ must identify the actual laminate layers, total thickness, sealant, closure, barrier targets and intended product. BestPackFactory can customize pouch size, printing, zipper, tear notch, hang hole and selected child-resistant options in Shenzhen. Buyers must provide the destination jurisdiction, product form, fill weight, shelf-life target, odor/light/moisture priorities, quantity and required test evidence. A 500-piece starting point applies only to suitable confirmed configurations.',
    intro: 'This page separates a common market name from the production specification a buyer needs. Compliance and performance belong to the exact material-and-closure system, not the word “Mylar.”',
    rows: [
      ['Material definition', 'List the actual film layers, gauge or total thickness, print layer, barrier layer and sealant layer.'],
      ['Product protection', 'Define aroma retention, odor control, light exclusion, moisture/oxygen targets, puncture risk and expected shelf life.'],
      ['Closure system', 'Standard zipper and child-resistant closure are different purchase specifications; verify the exact evidence required for the latter.'],
      ['Manufacturing controls', 'Confirm finished dimensions, seal width, zipper position, tear behavior, print registration, odor and filled-package testing.'],
    ],
    evidence: [
      'Match any barrier report to the tested film structure, thickness and method; do not transfer a value from a different laminate.',
      'Match child-resistant evidence to the exact pouch configuration and destination requirement.',
      'Approve the final legal artwork separately from the structural sample, then control both revisions in the purchase order.',
    ],
    supporting: [
      ['/products/cannabis-stand-up-pouches.html', 'Cannabis stand-up pouch center'],
      ['/products/cannabis-child-resistant-bags.html', 'Child-resistant cannabis bags'],
      ['/products/flexible-packaging.html', 'Flexible packaging manufacturer center'],
      ['/products/stand-up-pouch.html', 'Stand-up pouch engineering'],
    ],
    dielines: [
      ['/dielines/mylar-bag-dieline', 'Mylar-style bag dieline'],
      ['/dielines/child-resistant-pouch-dieline', 'Child-resistant pouch dieline'],
    ],
    sources: [
      ['Health Canada cannabis packaging and labelling guide', 'https://www.canada.ca/en/health-canada/services/cannabis-regulations-licensed-producers/packaging-labelling-guide-cannabis-products.html'],
      ['California Department of Cannabis Control: child-resistant packaging', 'https://www.cannabis.ca.gov/licensees/cannaconnect-compliance-hub/packaging/child-resistant-packaging-crp/'],
    ],
    questions: [
      ['Is a Mylar bag one standard material?', 'No. “Mylar bag” is a market term. Request the complete laminate construction, total thickness, sealant and performance requirements.'],
      ['Are all cannabis Mylar bags child-resistant?', 'No. Child resistance depends on the exact finished package and tested closure configuration, plus the rule in the destination market.'],
      ['What should I send for a weed pouch quote?', 'Send jurisdiction, product form, fill weight, size, quantity per artwork, barrier and closure needs, label panels, destination and required compliance evidence.'],
    ],
    quantity: FLEXIBLE_QUANTITIES,
  },

  'industries/food-packaging-manufacturer.html': {
    name: 'Food packaging manufacturer in China',
    quick: 'This is the primary supplier-evaluation page for custom food packaging, including paperboard boxes, paper bags and flexible pouches. BestPackFactory manufactures in Shenzhen, but food-contact suitability must be confirmed for the exact material, food type, contact conditions and destination market. A test report for one PE sample cannot prove every laminate, ink, adhesive, coating or finished package is compliant. Buyers should provide the food type, direct or indirect contact, fill and storage temperature, shelf-life target, barrier need, filling/sealing process, quantity, destination and exact declaration or test report required before material selection and quotation.',
    intro: 'Food packaging procurement starts with intended use and regulatory scope. Structure, food-contact layer, inks/adhesives, time-temperature conditions and supporting documents must refer to the same project.',
    rows: [
      ['Intended use', 'Food type, direct/indirect contact, contact duration, filling temperature, reheating/freezing, storage and distribution conditions.'],
      ['Material specification', 'Paperboard/coating or every laminate layer, ink and adhesive system, total thickness and functional barrier where applicable.'],
      ['Performance plan', 'Grease/moisture/oxygen barrier, seal integrity, migration need, odor/taint, compression and transport testing for the intended use.'],
      ['Documentation scope', 'Supplier declaration, test report, sample identity, standard/regulation, laboratory, issue date and exact limitations or conditions of use.'],
    ],
    evidence: [
      'For U.S. PE food-contact applications, review the exact resin/article and conditions against applicable FDA rules such as 21 CFR 177.1520; the citation is not a blanket product approval.',
      'For the EU, align the finished food-contact material with Regulation (EC) 1935/2004 and applicable specific measures and GMP requirements; packaging-waste obligations are a separate workstream.',
      'Run project-specific supplier and legal review because material rules, labeling and extended-producer-responsibility duties vary by market and use.',
    ],
    supporting: [
      ['/products/food-packaging.html', 'Food packaging products'],
      ['/products/custom-food-packaging.html', 'Custom food packaging'],
      ['/products/flexible-packaging.html', 'Flexible food pouches'],
      ['/blog/food-packaging-compliance-document-request-checklist.html', 'Compliance document checklist'],
      ['/factory/certificates.html', 'Available company and product evidence'],
    ],
    dielines: [
      ['/dielines/stand-up-pouch-dieline', 'Stand-up food pouch dieline'],
      ['/dielines/gable-top-box-dieline', 'Gable food box dieline'],
      ['/dielines/coffee-bag-250g-valve-dieline', 'Coffee bag dieline'],
    ],
    sources: [
      ['eCFR: 21 CFR 177.1520 Olefin polymers', 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-177/subpart-B/section-177.1520'],
      ['EU Regulation (EC) 1935/2004 on food-contact materials', 'https://eur-lex.europa.eu/eli/reg/2004/1935/oj/eng'],
      ['EU Regulation (EC) 2023/2006 on food-contact GMP', 'https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A32006R2023'],
      ['EU Regulation (EU) 2025/40 on packaging and packaging waste', 'https://eur-lex.europa.eu/eli/reg/2025/40/oj/eng'],
    ],
    questions: [
      ['Does one FDA report cover every food pouch?', 'No. A report applies to the identified sample, material, test method and conditions. Match the report to the ordered construction and intended use.'],
      ['What should a food-packaging RFQ include?', 'Include food type, contact type, temperature and duration, shelf life, barrier, filling/sealing process, size, quantity, destination and required documents.'],
      ['Are food-contact rules and PPWR the same?', 'No. Food-contact safety and EU packaging/waste obligations are related procurement workstreams but have different legal requirements and evidence.'],
    ],
    quantity: FLEXIBLE_QUANTITIES,
  },
};

const SUPPORTING_TO_PRIMARY = {
  'products/custom-folding-cartons.html': ['/products/custom-packaging-boxes.html', 'Paper box manufacturer sourcing center'],
  'products/custom-boxes.html': ['/products/custom-packaging-boxes.html', 'Paper packaging box sourcing center'],
  'products/luxury-magnetic-boxes.html': ['/products/custom-rigid-boxes.html', 'Rigid box manufacturer sourcing center'],
  'industries/luxury-gift-packaging-manufacturer.html': ['/products/custom-luxury-gift-boxes-manufacturer-premium-rigid-gift-packaging.html', 'Luxury gift box manufacturer sourcing center'],
  'products/custom-paper-bags.html': ['/products/paper-bags.html', 'Paper bag manufacturer sourcing center'],
  'products/custom-paper-bags-wholesale.html': ['/products/paper-bags.html', 'Paper bag manufacturer sourcing center'],
  'products/luxury-retail-paper-bags.html': ['/products/paper-bags.html', 'Paper bag manufacturer sourcing center'],
  'products/custom-stand-up-pouches.html': ['/products/stand-up-pouch.html', 'Stand-up pouch manufacturer sourcing center'],
  'products/custom-compostable-stand-up-pouches.html': ['/products/stand-up-pouch.html', 'Stand-up pouch manufacturer sourcing center'],
  'products/custom-tissue-paper.html': ['/products/custom-printed-tissue-paper.html', 'Printed tissue paper manufacturer sourcing center'],
  'products/tissue-paper-packaging.html': ['/products/custom-printed-tissue-paper.html', 'Printed tissue paper manufacturer sourcing center'],
  'products/cannabis-child-resistant-bags.html': ['/products/cannabis-stand-up-pouches.html', 'Cannabis stand-up pouch sourcing center'],
  'products/food-packaging.html': ['/industries/food-packaging-manufacturer.html', 'Food packaging manufacturer sourcing center'],
  'products/custom-food-packaging.html': ['/industries/food-packaging-manufacturer.html', 'Food packaging manufacturer sourcing center'],
  'industries/food-packaging.html': ['/industries/food-packaging-manufacturer.html', 'Food packaging manufacturer sourcing center'],
};

function normalizeRoute(route = '') {
  return String(route).replace(/^\/+/, '').replace(/\\/g, '/');
}

function links(items = []) {
  return items.map(([href, label]) => `<li><a class="text-link" href="${href}">${label}</a></li>`).join('');
}

function quickAnswer(hub) {
  return `<section class="section" data-bpf-authority-quick-answer="true"><div class="ai-snapshot"><h2>Buyer quick answer</h2><p>${hub.quick}</p></div></section>`;
}

function decisionRows(rows = []) {
  return rows.map(([label, value]) => `<tr><th scope="row">${label}</th><td>${value}</td></tr>`).join('');
}

function quantityRows(rows = []) {
  return rows.map(([volume, fit, driver]) => `<tr><th scope="row">${volume}</th><td>${fit}</td><td>${driver}</td></tr>`).join('');
}

function faqItems(items = []) {
  return items.map(([question, answer]) => `<div class="rfq-checklist"><h3>${question}</h3><p>${answer}</p></div>`).join('');
}

function sourcesBlock(items = []) {
  if (!items.length) return '';
  return `<div class="rfq-checklist"><h3>Primary regulatory references</h3><p>These official sources help buyers identify questions to verify. They do not certify any BestPackFactory product or replace market-specific legal review.</p><ul>${items.map(([label, href]) => `<li><a class="text-link" href="${href}" rel="noopener noreferrer" target="_blank">${label}</a></li>`).join('')}</ul></div>`;
}

function fullAuthoritySection(hub) {
  return `<section class="section alt" data-bpf-commercial-authority-hub="true">
    <div class="section-head"><div><h2>${hub.name}: buyer decision center</h2><p>${hub.intro}</p></div></div>
    <h3>What to compare in a supplier quotation</h3>
    <div class="spec-scroll"><table class="technical-spec-table"><tbody>${decisionRows(hub.rows)}</tbody></table></div>
    <h3 style="margin-top:32px">Quantity planning without invented price promises</h3>
    <p class="tech-note">The bands below explain process economics; they are not fixed-price offers. Final MOQ and cost are confirmed per size, artwork, material, finish, packing and delivery term.</p>
    <div class="spec-scroll"><table class="technical-spec-table"><thead><tr><th>Quantity</th><th>Typical buying use</th><th>Why cost changes</th></tr></thead><tbody>${quantityRows(hub.quantity)}</tbody></table></div>
    <div class="rfq-checklist"><h3>Evidence to request before production</h3><ol>${hub.evidence.map(item => `<li>${item}</li>`).join('')}</ol></div>
    ${sourcesBlock(hub.sources)}
    <h3 style="margin-top:32px">Free dielines and related sourcing pages</h3>
    <ul class="internal-links">${links(hub.dielines)}${links(hub.supporting)}</ul>
    <h3 style="margin-top:32px">Buyer questions</h3>
    ${faqItems(hub.questions)}
    <p class="tech-note">Reviewed ${REVIEWED_DATE} for B2B sourcing clarity. Manufacturer identity: Shenzhen Color Printing Paper Packaging Co., Ltd.; production address: Huixin Zhichuang Park, 108 Huarong Road, Longhua District, Shenzhen, China. Product feasibility and documentary scope are confirmed against the final written specification.</p>
  </section>`;
}

function supportingLink(primary) {
  const [href, label] = primary;
  return `<section class="section alt" data-bpf-primary-authority-link="true"><div class="ai-snapshot"><h2>Primary manufacturer sourcing guide</h2><p>This page covers a specific product or application. For supplier qualification, MOQ planning, specifications, evidence and RFQ requirements, use the <a class="text-link" href="${href}">${label}</a>.</p></div></section>`;
}

function insertAfterFirstSection(body, html) {
  const match = body.match(/<\/section>/i);
  if (!match || match.index == null) return `${html}${body}`;
  const end = match.index + match[0].length;
  return `${body.slice(0, end)}${html}${body.slice(end)}`;
}

function insertBeforePageChrome(body, html) {
  const boundary = body.search(/<div\b[^>]*class=["'][^"']*bpf-whatsapp-chat|<footer\b|<script\b/i);
  if (boundary < 0) return `${body}${html}`;
  return `${body.slice(0, boundary)}${html}${body.slice(boundary)}`;
}

export function injectCommercialAuthorityHub(body = '', route = '') {
  const normalized = normalizeRoute(route);
  if (!body) return body;
  const correctedBody = (COMPLIANCE_REPLACEMENTS[normalized] || []).reduce(
    (result, [from, to]) => result.split(from).join(to),
    body,
  );
  if (correctedBody.includes('data-bpf-commercial-authority-hub=') || correctedBody.includes('data-bpf-primary-authority-link=')) return correctedBody;
  const hub = HUBS[normalized];
  if (hub) {
    const withQuickAnswer = insertAfterFirstSection(correctedBody, quickAnswer(hub));
    return insertBeforePageChrome(withQuickAnswer, fullAuthoritySection(hub));
  }
  const primary = SUPPORTING_TO_PRIMARY[normalized];
  return primary ? insertBeforePageChrome(correctedBody, supportingLink(primary)) : correctedBody;
}

export function commercialAuthorityMetadata(metadata = {}, route = '') {
  const description = SAFE_METADATA_DESCRIPTIONS[normalizeRoute(route)];
  if (!description) return metadata;
  return {
    ...metadata,
    description,
    openGraph: metadata.openGraph ? { ...metadata.openGraph, description } : metadata.openGraph,
    twitter: metadata.twitter ? { ...metadata.twitter, description } : metadata.twitter,
  };
}

export function normalizeCommercialAuthorityJsonLd(jsonLd = [], route = '') {
  const replacements = COMPLIANCE_REPLACEMENTS[normalizeRoute(route)] || [];
  if (!replacements.length) return jsonLd;
  return jsonLd.map(json => replacements.reduce((result, [from, to]) => result.split(from).join(to), json));
}

export const COMMERCIAL_AUTHORITY_ROUTES = Object.freeze(Object.keys(HUBS));
export const COMMERCIAL_AUTHORITY_SUPPORTING_ROUTES = Object.freeze(Object.keys(SUPPORTING_TO_PRIMARY));
