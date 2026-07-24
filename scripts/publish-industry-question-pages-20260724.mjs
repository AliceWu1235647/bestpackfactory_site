import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const CONTENT_ROOT = path.join(ROOT, 'content-site');
const PUBLIC_ROOT = path.join(ROOT, 'public');
const SITE = 'https://www.bestpackfactory.com';
const PUBLISHED = '2026-07-24';
const INDEX_JSON = 'industry-question-index.json';
const LLMS_START = '## Industry Buyer Question Pages 2026-07-24';
const LLMS_END = '## End Industry Buyer Question Pages 2026-07-24';

const clusters = [
  {
    id: 'coffee-packaging-supplier',
    title: 'Coffee Packaging Supplier Buyer Questions',
    industry: 'coffee packaging',
    basePath: 'industries/coffee-packaging-supplier/questions',
    parent: '/industries/coffee-packaging-supplier.html',
    productType: 'custom coffee bags',
    commonMoq: '500 PCS per custom size and artwork',
    materials: 'kraft paper laminate, matte film, VMPET, aluminum foil, PE sealant, one-way degassing valve and zipper options',
    sampleFocus: 'bag size, shelf standing, valve position, zipper function, print color, seal strength and barcode scan',
    productLinks: [
      ['/products/coffee-bags.html', 'Coffee Bags'],
      ['/products/250g-coffee-bags-with-valve.html', '250g Coffee Bags With Valve'],
      ['/products/500g-flat-bottom-coffee-bags.html', '500g Flat Bottom Coffee Bags'],
      ['/products/kraft-paper-coffee-bags.html', 'Kraft Paper Coffee Bags']
    ],
    guideLinks: [
      ['/blog/coffee-bags-rfq-preparation-checklist.html', 'Custom Coffee Bags RFQ Checklist'],
      ['/blog/kraft-paper-pouch-vs-foil-pouch-coffee.html', 'Kraft vs Foil Coffee Pouch Guide'],
      ['/blog/flat-bottom-bag-vs-stand-up-pouch.html', 'Flat Bottom vs Stand Up Pouch Guide']
    ],
    questions: [
      ['custom-coffee-bag-moq-500', 'What is the MOQ for custom coffee bags?', 'MOQ usually applies per confirmed coffee bag size, material structure and artwork.', 'size, fill weight, artwork, valve, zipper and quantity tiers', 'confirm whether several coffee origins can share one bag size before quoting', 'comparing a valve bag quote against a non-valve bag quote'],
      ['250g-vs-500g-coffee-bag-size', 'How do buyers choose 250g vs 500g coffee bag size?', 'Coffee bag size should be based on fill weight, bean density, headspace, shelf display and co-packer filling method.', 'target fill weight, coffee form, gusset depth and shelf display needs', 'test real beans or grounds in the sample before approving bulk', 'choosing size from a photo without density or fill testing'],
      ['flat-bottom-vs-side-gusset-coffee-bags', 'Should coffee brands choose flat bottom or side gusset bags?', 'Flat bottom bags give stronger retail display while side gusset bags suit traditional coffee shelves and larger capacities.', 'bag style, fill weight, panel layout and carton packing', 'check standing stability and final carton volume', 'choosing a premium style without checking freight volume'],
      ['coffee-bag-valve-placement', 'Where should the one-way degassing valve go on a coffee bag?', 'Valve position should avoid seal zones, zipper interference, label areas and artwork elements while supporting degassing after roasting.', 'valve diameter, distance below top seal, front or back panel and roast timing', 'approve valve position on a physical sample', 'moving valve location after artwork is locked'],
      ['kraft-vs-foil-coffee-bag-material', 'Is kraft paper or foil better for coffee bags?', 'Kraft paper supports a natural brand look, while foil laminate provides stronger oxygen, moisture and aroma protection.', 'shelf-life target, outer appearance, inner barrier and sustainability message', 'compare material structures rather than only outside appearance', 'assuming kraft paper alone gives enough coffee barrier'],
      ['zipper-or-tin-tie-coffee-bags', 'Should coffee bags use zipper or tin tie closure?', 'Zippers are useful for resealing freshness after opening; tin ties support a classic coffee look but may not seal as strongly.', 'customer use case, bag style, fill weight and reseal expectation', 'open and close the sample repeatedly before approval', 'choosing closure style only by appearance'],
      ['matte-black-coffee-bag-cost', 'What affects matte black coffee bag cost?', 'Matte black coffee bag cost depends on film structure, ink coverage, finish, valve, zipper, bag size, quantity and freight volume.', 'matte finish type, Pantone black, surface scuff resistance and quantity tiers', 'check rub marks and fingerprint behavior on sample', 'forgetting that dark ink coverage can affect QC'],
      ['coffee-bag-barrier-otr-wvtr', 'What OTR and WVTR targets matter for coffee bags?', 'Coffee bags need oxygen and moisture barrier targets that match roast freshness, shelf life and distribution channel.', 'OTR, WVTR, foil or VMPET structure, valve and seal strength', 'ask whether the quoted laminate supports the desired shelf life', 'asking for best price without barrier targets'],
      ['coffee-bag-artwork-dieline-checklist', 'What should be checked on a coffee bag dieline?', 'Coffee bag dielines should protect bleed, safe text, valve area, zipper zone, gusset copy, barcode and roast-date label space.', 'final dieline, bleed, barcode size, QR code, valve and zipper locations', 'print a real-size proof before sample production', 'placing small text on gusset folds or seal zones'],
      ['compostable-coffee-bag-tradeoffs', 'Are compostable coffee bags right for roasted coffee?', 'Compostable coffee bags can support sustainability goals, but barrier, heat seal, shelf life and certification claims must be checked carefully.', 'compostability target, food-contact layer, barrier target and destination market', 'confirm documentation before making compostable claims', 'using eco claims before material proof is available'],
      ['coffee-bag-sample-approval', 'What should buyers approve on a coffee bag sample?', 'Buyers should approve size, valve, zipper, standing, seal, color, finish, barcode readability and carton packing before bulk production.', 'physical sample, artwork proof, product fit and shipping carton data', 'keep an approved sample as the QC standard', 'approving only by photo for a new bag structure'],
      ['private-label-coffee-bag-rfq', 'What should private label coffee brands send in an RFQ?', 'A private label coffee bag RFQ should include fill weight, bag style, material, valve, zipper, artwork status, SKU count and launch deadline.', 'all SKU names, common structure, variable artwork areas and quantity tiers', 'ask whether multiple SKUs can share one structure', 'quoting each flavor separately without a shared structure plan'],
      ['coffee-bag-printing-gravure-vs-digital', 'Should coffee bags use gravure or digital printing?', 'Gravure is efficient for repeatable larger runs, while digital printing can help shorter test runs and multi-SKU launches.', 'quantity, artwork count, color target and reorder plan', 'compare sample color and finish under real lighting', 'choosing printing method without reorder forecast'],
      ['coffee-bag-shelf-life-material', 'How does material affect coffee shelf life?', 'Coffee shelf life depends on oxygen barrier, moisture barrier, valve function, seal integrity, roast freshness and distribution time.', 'barrier material, valve, seal strength and warehouse conditions', 'test filled samples if shelf life is critical', 'thinking the valve alone protects freshness'],
      ['coffee-bag-valve-without-zipper', 'Can coffee bags use a valve without a zipper?', 'Yes, valve-only coffee bags can work for single-use or wholesale packs, but retail buyers often prefer resealable zipper options.', 'pack size, usage frequency, retail channel and closure expectation', 'test opening and reseal needs with the target customer use case', 'omitting zipper when consumers expect resealability'],
      ['coffee-subscription-packaging', 'What packaging works for coffee subscription brands?', 'Subscription coffee packaging should balance freshness, mailer fit, flat packing efficiency, barcode labels and unboxing brand experience.', 'bag size, mailer size, label area, valve and carton packing', 'test the bag inside the actual mailer box', 'designing the pouch without checking mailing dimensions'],
      ['coffee-bag-shipping-ddp-fob', 'How should buyers ship custom coffee bags from China?', 'Empty coffee bags can ship by express, air or sea depending on carton volume, deadline and reorder plan.', 'carton dimensions, gross weight, incoterm and arrival deadline', 'compare DDP, FOB, air and sea options before production finishes', 'assuming sample freight predicts bulk freight'],
      ['coffee-bag-pantone-color-match', 'Can custom coffee bags match Pantone colors?', 'Pantone matching is possible, but material surface, kraft base color, matte finish and printing process affect final appearance.', 'Pantone code, material surface, proof method and acceptable tolerance', 'approve color on the real material sample', 'checking color only on a phone screen'],
      ['coffee-label-vs-preprinted-pouch', 'Should coffee brands use labels or preprinted pouches?', 'Labels offer flexibility for many SKUs; preprinted pouches look more integrated and professional for stable designs.', 'SKU count, reorder volume, label area, artwork stability and budget', 'compare total labor and inventory cost, not only pouch price', 'using labels forever after the design is stable'],
      ['coffee-copacker-filling-requirements', 'What filling details should coffee co-packers confirm?', 'Co-packers should confirm bag opening, zipper position, heat seal area, valve location, fill weight and machine compatibility.', 'filling method, sealing width, bag mouth opening and machine speed', 'send samples to the co-packer before bulk production', 'approving a bag that the filling line cannot seal well']
    ]
  },
  {
    id: 'pet-food-packaging-supplier',
    title: 'Pet Food Packaging Supplier Buyer Questions',
    industry: 'pet food packaging',
    basePath: 'industries/pet-food-packaging-supplier/questions',
    parent: '/industries/pet-food-packaging-supplier.html',
    productType: 'custom pet food bags',
    commonMoq: '500 PCS per custom size and artwork',
    materials: 'PET/VMPET/PE, PET/AL/PE, NY/PE, kraft laminate, zipper, handle, flat bottom and side gusset options',
    sampleFocus: 'fill test, standing stability, zipper cycle, seal strength, puncture resistance, odor barrier and carton packing',
    productLinks: [
      ['/products/pet-food-bags.html', 'Pet Food Bags'],
      ['/products/dog-food-flat-bottom-bags.html', 'Dog Food Flat Bottom Bags'],
      ['/products/flexible-packaging.html', 'Flexible Packaging']
    ],
    guideLinks: [
      ['/blog/pet-food-bag-barrier-material-guide.html', 'Pet Food Bag Barrier Material Guide'],
      ['/industries/pet-food-packaging-supplier.html', 'Pet Food Packaging Supplier']
    ],
    questions: [
      ['pet-food-bag-moq-500', 'What is the MOQ for custom pet food bags?', 'MOQ normally starts at 500 PCS for one pet food bag size, material structure and artwork.', 'bag size, fill weight, material structure, zipper and quantity tiers', 'ask whether treat SKUs can share one pouch size', 'comparing different laminate thicknesses as if they are equal'],
      ['flat-bottom-dog-food-bag', 'When should dog food use a flat bottom bag?', 'Flat bottom bags are useful for heavier dog food because they stand well, hold more weight and provide large print panels.', 'fill weight, gusset, zipper, handle and shelf display', 'test filled standing and carton packing', 'choosing flat bottom without freight volume check'],
      ['oily-kibble-barrier-material', 'What barrier material is best for oily kibble?', 'Oily kibble needs stronger oxygen, moisture, aroma and oil resistance, often using VMPET or foil laminate structures.', 'oil level, shelf life, laminate layers and sealant thickness', 'test oil migration and odor retention on samples', 'using snack pouch material for oily pet food'],
      ['pet-treat-pouch-size', 'How do buyers choose pet treat pouch size?', 'Pet treat pouch size depends on treat shape, fill weight, headspace, zipper position and shelf display style.', 'treat dimensions, fill weight, pouch style and display need', 'fill the sample with real treats before approving size', 'choosing size only by net weight'],
      ['pet-food-zipper-strength', 'How strong should pet food bag zippers be?', 'Pet food zippers should support repeated opening, heavier product weight and powder or oil exposure without losing closure feel.', 'zipper width, bag weight, powder level and consumer use case', 'cycle-test the zipper with filled product', 'using a light zipper on heavy bags'],
      ['pet-food-bag-handle', 'Do heavy pet food bags need a handle?', 'Handles improve carrying experience for heavier pet food bags, but they add material, tooling and QC checks.', 'bag weight, handle style, punch position and carton packing', 'test handle strength under filled load', 'adding a handle without load testing'],
      ['kraft-pet-food-bags', 'Can pet food bags use kraft paper?', 'Kraft can create a natural look, but the inner laminate still needs barrier and seal strength for pet food shelf life.', 'outer kraft layer, inner barrier, oil level and food-contact layer', 'compare kraft laminate against foil laminate for shelf life', 'assuming kraft appearance means eco performance'],
      ['pet-food-aroma-barrier', 'How do pet food bags protect aroma?', 'Aroma protection comes from laminate barrier, seal integrity, zipper quality and correct carton storage.', 'aroma sensitivity, laminate structure, zipper and seal strength', 'store filled samples and check odor loss', 'thinking thickness alone defines aroma barrier'],
      ['pet-food-puncture-resistance', 'When is puncture resistance important for pet food?', 'Puncture resistance matters for hard kibble, sharp treats, larger weights and rough shipping conditions.', 'product shape, bag drop risk, nylon layer and carton packing', 'run filled drop and rub tests before bulk', 'ignoring product edges inside the pouch'],
      ['freeze-dried-pet-food-packaging', 'What packaging works for freeze-dried pet food?', 'Freeze-dried pet food needs moisture protection, gentle handling and enough stiffness to protect fragile pieces.', 'moisture barrier, pouch stiffness, zipper and fill method', 'test breakage after packing and shipping', 'using a weak moisture barrier for freeze-dried products'],
      ['cat-food-pouch-material', 'What material works for cat food pouches?', 'Cat food pouches depend on whether the product is dry food, treats, supplement powder or wet product; each needs a different sealant and barrier.', 'product type, oil or moisture level, filling condition and shelf life', 'confirm direct food contact and filling temperature', 'using one pouch structure for every cat food format'],
      ['pet-food-bag-drop-test', 'Should pet food bags be drop tested?', 'Filled drop testing is important for heavier bags because seals, gussets and corners can fail under real logistics stress.', 'fill weight, carton count, drop height and seal strength', 'test filled sample bags, not only empty samples', 'approving empty bags without filled testing'],
      ['pet-food-artwork-compliance', 'What should pet food artwork reserve space for?', 'Pet food artwork should reserve space for net weight, ingredients, feeding guide, barcode, batch code and market-specific claims.', 'label text, barcode, nutrition panel, batch area and language version', 'review final copy with the buyer compliance team', 'placing required text too close to seals or gussets'],
      ['recyclable-pet-food-pouches', 'Can pet food pouches be recyclable?', 'Recyclable pouch options may be possible, but barrier, zipper, stiffness and local recycling claims must be confirmed.', 'mono-material target, barrier need, zipper compatibility and claim documentation', 'confirm claim support before printing recycling marks', 'making recycling claims from appearance alone'],
      ['resealable-pet-treat-bags', 'Why do pet treat bags need resealable zippers?', 'Resealable zippers help maintain freshness and usability after opening, especially for treats consumed over time.', 'treat size, zipper height, opening width and consumer use pattern', 'check zipper feel after repeated use', 'using a zipper that traps crumbs or powder'],
      ['side-gusset-vs-flat-bottom-pet-food', 'Should pet food use side gusset or flat bottom bags?', 'Side gusset bags suit bulk formats, while flat bottom bags improve shelf display and panel branding for retail.', 'fill weight, shelf space, panel artwork and freight volume', 'compare both styles with carton data', 'choosing by look without landed-cost comparison'],
      ['bulk-pet-food-bag-shipping', 'How should buyers plan shipping for pet food bags?', 'Empty pet food bags can be bulky, so carton dimensions, gross weight and shipment method should be compared before production ends.', 'carton count, carton dimensions, incoterm and deadline', 'request DDP, FOB, air and sea options when timing matters', 'waiting until finished goods are packed to ask freight cost'],
      ['pet-supplement-pouch-barrier', 'What barrier do pet supplement pouches need?', 'Pet supplement pouches often need moisture protection, powder-proof zipper options and clean seal areas.', 'powder type, moisture sensitivity, zipper, sealant and scoop needs', 'test powder leakage and zipper contamination', 'using standard treat pouch specs for powder supplements'],
      ['matte-pet-food-bag-finish', 'Does matte finish affect pet food bag cost?', 'Matte finish can improve shelf appeal but may add scuff, fingerprint and color-control checks.', 'matte film type, ink coverage, rub resistance and carton packing', 'check rub marks on dark matte colors', 'ignoring surface handling marks'],
      ['pet-food-bag-rfq-template', 'What should a pet food bag RFQ include?', 'A pet food bag RFQ should include product type, fill weight, bag style, barrier target, zipper, handle, artwork, quantity and destination.', 'all SKU weights, material target, features and quantity tiers', 'ask for a sample and carton dimensions with the quote', 'requesting price from only a product photo']
    ]
  },
  {
    id: 'pharmaceutical-packaging-supplier',
    title: 'Pharma Folding Carton Buyer Questions',
    industry: 'pharma carton packaging',
    basePath: 'industries/pharmaceutical-packaging-supplier/questions',
    parent: '/industries/pharmaceutical-packaging-supplier.html',
    productType: 'pharma folding cartons',
    commonMoq: '500 PCS for qualified custom pharma carton RFQ projects',
    materials: 'SBS board, C1S board, ivory board, offset printing, varnish, tamper-evident structure, GS1 DataMatrix and batch-code panels',
    sampleFocus: 'carton fit, code readability, quiet zone, fold accuracy, glue strength, artwork version and carton count',
    productLinks: [
      ['/products/pharmaceutical-folding-cartons.html', 'Pharmaceutical Folding Cartons'],
      ['/products/gs1-pharma-packaging-boxes.html', 'GS1 Pharma Packaging Boxes'],
      ['/products/pharma-packaging.html', 'Pharma Packaging']
    ],
    guideLinks: [
      ['/blog/pharma-folding-carton-gs1-datamatrix-checklist.html', 'Pharma GS1 DataMatrix Checklist'],
      ['/blog/variable-data-pharma-packaging.html', 'Variable Data Pharma Packaging']
    ],
    questions: [
      ['pharma-folding-carton-moq-500', 'What is the MOQ for custom pharma folding cartons?', 'MOQ can start at 500 PCS for qualified custom pharma carton projects when size, board, artwork and compliance needs are clear.', 'carton size, board grade, artwork version and quantity tiers', 'confirm whether this is a pilot, validation or commercial run', 'quoting before regulatory text is final'],
      ['gs1-datamatrix-placement', 'Where should GS1 DataMatrix be placed on pharma cartons?', 'GS1 DataMatrix should be placed where quiet zone, contrast, flatness and scan access are protected.', 'code size, quiet zone, panel location and reflective finish', 'scan the code on the real sample', 'placing code near folds, glue flaps or foil'],
      ['barcode-verification-grade', 'What barcode verification grade should pharma cartons target?', 'The buyer should define the verification method and grade target before artwork approval and production.', 'target grade, verifier method, code size and print contrast', 'verify sample codes before mass printing', 'assuming visual clarity equals scanner grade'],
      ['pharma-carton-board-grade', 'How do buyers choose pharma carton board grade?', 'Board grade depends on product weight, blister or bottle fit, folding performance, print quality and destination requirements.', 'board GSM, caliper, stiffness and insert fit', 'test carton fit with the real product pack', 'choosing board only by lowest price'],
      ['tamper-evident-folding-cartons', 'When do pharma cartons need tamper-evident features?', 'Tamper-evident features depend on product risk, market rules and buyer quality requirements.', 'closure style, seal label, perforation or locking feature', 'approve opening and closing behavior on sample', 'adding tamper evidence after dieline approval'],
      ['batch-lot-expiry-panel', 'Where should batch, lot and expiry data go?', 'Batch, lot and expiry areas should be flat, readable and protected from folds, varnish glare and sealing zones.', 'human-readable area, variable print method and label space', 'test the final data area at real size', 'leaving batch area until the last artwork revision'],
      ['serialization-workflow-cartons', 'Who handles serialization on pharma cartons?', 'Serialization may be handled by the buyer, packaging supplier or a third-party system, and that decision affects artwork and QC flow.', 'data ownership, print location, verification and file transfer process', 'document the handoff before production', 'not defining who owns final code data'],
      ['blister-pack-carton-dimensions', 'How should blister pack dimensions be used for carton design?', 'Carton inner size should protect blister fit, insert clearance, leaflet space and shipping strength.', 'blister dimensions, count, leaflet, clearance and orientation', 'pack the real blister into the sample carton', 'using outer product size without inner clearance'],
      ['patient-leaflet-insert-carton', 'How do leaflets affect pharma carton structure?', 'Leaflets change inner clearance, closing behavior, carton bulge and pack-out process.', 'leaflet folded size, insert position and product orientation', 'test full pack-out with leaflet and product', 'approving carton empty without leaflet'],
      ['varnish-lamination-barcode-zone', 'Can varnish or lamination cover barcode zones?', 'Varnish and lamination can create glare or contrast issues, so barcode zones should be tested and often protected by layout clearance.', 'finish type, code location, contrast and verification target', 'scan sample codes under real conditions', 'placing high-gloss effects over code areas'],
      ['camera-inspection-pharma-cartons', 'When is camera inspection needed for pharma cartons?', 'Camera inspection is useful for variable data, serialization, mixed-version prevention and high-risk text or code checks.', 'inspection scope, pass/fail criteria and report needs', 'define what the camera must verify before production', 'adding inspection after printing starts'],
      ['pharma-artwork-revision-control', 'How should pharma carton artwork revisions be controlled?', 'Use locked file names, approval records and version control so old and new regulatory text are not mixed.', 'version number, approval owner, language and release date', 'freeze artwork before mass production', 'mixing old and new files in email threads'],
      ['anti-counterfeit-pharma-cartons', 'What anti-counterfeit options can pharma cartons use?', 'Options may include special inks, tamper seals, QR codes, serialization and controlled artwork features.', 'security goal, verification method and cost target', 'sample the feature with the final artwork', 'adding security features without a verification plan'],
      ['child-resistant-pharma-carton', 'Can folding cartons support child-resistant packaging needs?', 'Some projects may need child-resistant secondary packaging or closures, but requirements must be defined by the buyer and market.', 'target regulation, opening method and test expectations', 'confirm legal requirements before structure design', 'assuming a standard carton is child resistant'],
      ['small-text-readability-pharma', 'How small can text be on pharma cartons?', 'Small text must remain readable after printing, folding and finishing, especially for dosage, warnings and regulatory copy.', 'font size, contrast, paper surface and print method', 'review a real-size proof and printed sample', 'checking artwork zoomed on screen only'],
      ['pharma-carton-glue-strength', 'What glue details matter for pharma folding cartons?', 'Glue type, glue width, curing, fiber tear and carton opening behavior matter for safe pack-out and shipping.', 'glue flap width, board coating and pack-out process', 'test glue strength after sample conditioning', 'ignoring glue on coated or varnished surfaces'],
      ['pharma-carton-sample-approval', 'What should buyers approve on pharma carton samples?', 'Approve size, board, folding, glue, code readability, text, color, batch area, leaflet fit and carton packing.', 'full pack-out sample, barcode verification and artwork version', 'keep a signed sample standard for QC', 'approving a carton before code scan testing'],
      ['shipping-pharma-folding-cartons', 'How should pharma folding cartons be packed and shipped?', 'Flat cartons need clean export packing, moisture protection, carton labels and version control during shipping.', 'carton quantity, shipping marks, humidity risk and destination', 'confirm export carton size before freight quote', 'mixing artwork versions in the same export carton'],
      ['label-vs-printed-pharma-carton', 'Should buyers use labels or printed pharma cartons?', 'Labels can support late-stage variable data, while printed cartons give cleaner branding and controlled production when data is stable.', 'data variability, artwork stability, label area and validation process', 'compare operational risk, not only unit price', 'using labels to fix artwork that should be finalized'],
      ['pharma-carton-rfq-template', 'What should a pharma carton RFQ include?', 'A pharma carton RFQ should include carton size, board, artwork version, code requirements, verification target, quantity and sample approval workflow.', 'all regulatory copy, code rules, board grade and deadline', 'send code specifications before dieline release', 'asking for quote without code and revision requirements']
    ]
  },
  {
    id: 'food-packaging-manufacturer',
    title: 'Food-safe Packaging Buyer Questions',
    industry: 'food-safe packaging',
    basePath: 'industries/food-packaging-manufacturer/questions',
    parent: '/industries/food-packaging-manufacturer.html',
    productType: 'custom food packaging',
    commonMoq: '500 PCS per custom size and artwork',
    materials: 'SBS board, kraft paper, PE coating, PLA coating, water-based coating, PET/PE laminate, CPP sealant and grease-resistant paper',
    sampleFocus: 'food contact side, odor, grease resistance, moisture behavior, heat response, print rub, stacking and carton packing',
    productLinks: [
      ['/products/food-packaging.html', 'Food Packaging'],
      ['/products/burger-packaging-boxes.html', 'Burger Packaging Boxes'],
      ['/products/bakery-paper-bags.html', 'Bakery Paper Bags'],
      ['/products/fries-packaging-boxes.html', 'Fries Packaging Boxes']
    ],
    guideLinks: [
      ['/blog/food-safe-packaging-materials-buyer-guide.html', 'Food-safe Packaging Material Guide'],
      ['/industries/food-packaging-manufacturer.html', 'Food Packaging Manufacturer']
    ],
    questions: [
      ['choose-food-safe-packaging-material', 'How do buyers choose food-safe packaging material?', 'Food-safe material starts with the food type, contact layer, temperature, grease, moisture, shelf life and destination market.', 'food contact condition, coating, direct-contact layer and market needs', 'test samples with the real food', 'choosing by paper color instead of contact condition'],
      ['grease-resistant-burger-boxes', 'What material works for grease-resistant burger boxes?', 'Burger boxes often need paperboard with PE, PLA or water-based grease-resistant coating depending on oil level and service condition.', 'grease level, heat, coating type and box structure', 'test hot food contact and grease resistance', 'using uncoated board for oily food'],
      ['kraft-food-bag-direct-contact', 'Can kraft paper bags touch food directly?', 'Kraft food bags can be suitable only when the direct-contact side, coating and documentation match the food use.', 'food type, inner coating, odor and destination requirements', 'confirm food-contact side before printing', 'assuming every kraft paper is food safe'],
      ['pe-vs-pla-vs-water-based-coating', 'Should food packaging use PE, PLA or water-based coating?', 'PE is common and moisture resistant, PLA supports compostable positioning where documented, and water-based coatings can support grease resistance with different limits.', 'coating target, heat, moisture, compostability claim and disposal route', 'sample the coating with real food conditions', 'making compostable claims without proof'],
      ['hot-food-packaging-heat-resistance', 'What heat resistance should hot food packaging have?', 'Hot food packaging should be tested for heat exposure, grease, steam, deformation and odor under the real serving condition.', 'serving temperature, contact time, coating and stacking', 'fill with hot food during sample testing', 'approving room-temperature samples only'],
      ['bakery-paper-bag-material', 'What paper bag material works for bakery packaging?', 'Bakery bags may need kraft, glassine, grease-resistant paper, window film or coating depending on pastry oil and freshness needs.', 'bakery type, oil level, window, seal and shelf life', 'test with oily and dry bakery products', 'using one bag for every bakery product'],
      ['frozen-food-pouch-material', 'What material works for frozen food pouches?', 'Frozen food pouches need seal strength, puncture resistance, low-temperature behavior and moisture barrier.', 'freezing temperature, product shape, sealant and storage time', 'test filled samples after freezing', 'using ambient snack pouch specs for frozen food'],
      ['food-pouch-seal-strength', 'How much seal strength do food pouches need?', 'Food pouch seal strength depends on fill weight, product form, oil, moisture, filling temperature and shipping stress.', 'seal width, sealant layer, fill weight and leak risk', 'run filled leak and drop tests', 'checking seal only on an empty sample'],
      ['food-packaging-ink-safety', 'What should buyers know about ink on food packaging?', 'Ink should be kept away from direct food contact unless the process is designed for it, and low-odor or suitable ink systems may be required.', 'print side, food contact side, odor and migration concern', 'review print layout and contact surfaces', 'printing on a direct food-contact surface without review'],
      ['compostable-food-packaging-claims', 'Can food packaging claim compostable?', 'Compostable claims require suitable materials, documentation and market-specific disposal conditions.', 'material certificate, coating, ink, adhesive and destination market', 'confirm documents before printing claims', 'using green design as proof of compostability'],
      ['snack-moisture-barrier-packaging', 'What moisture barrier do snack packages need?', 'Snack packages need moisture barrier based on crispness, oil level, shelf life and distribution channel.', 'WVTR target, laminate, seal strength and shelf life', 'test packed snacks over the target storage period', 'choosing packaging only by bag thickness'],
      ['oil-resistant-fries-boxes', 'What coating works for fries boxes?', 'Fries boxes often need grease resistance, heat tolerance, ventilation and stiffness for takeaway use.', 'oil level, steam, coating type and carton stiffness', 'test with hot fries and real holding time', 'overlooking steam and condensation'],
      ['sauce-spout-pouch-material', 'What material works for sauce spout pouches?', 'Sauce spout pouches need seal strength, puncture resistance, spout fit, product compatibility and filling temperature review.', 'sauce acidity, filling temperature, spout size and sealant', 'test filled pouch leakage and cap torque', 'using dry pouch material for liquid sauce'],
      ['takeaway-packaging-stack-strength', 'How should takeaway packaging be tested for stacking?', 'Takeaway packaging should be tested for stacking, heat, grease, moisture and delivery handling.', 'stack height, food weight, coating and delivery time', 'simulate delivery stacking with filled packs', 'checking only the empty box appearance'],
      ['microwave-freezer-food-packaging', 'Can one food package be microwave and freezer safe?', 'A package can only make microwave or freezer claims when the material, coating and test conditions support those uses.', 'temperature range, time, food type and material documentation', 'validate claims before printing icons', 'adding microwave symbols without test support'],
      ['food-packaging-sample-testing', 'What should buyers test on food packaging samples?', 'Test odor, food fit, grease resistance, moisture behavior, heat response, stacking, barcode and carton packing.', 'real food, serving temperature, contact time and delivery method', 'run sample tests with actual food products', 'approving samples without food contact testing'],
      ['food-packaging-rfq-template', 'What should a food packaging RFQ include?', 'A food packaging RFQ should include food type, contact condition, size, material, coating, artwork, quantity, destination and deadline.', 'food type, coating, direct-contact layer, size and quantity tiers', 'send photos and food weight with the RFQ', 'asking for price without food-contact details'],
      ['food-packaging-export-documents', 'What documents may food packaging buyers request?', 'Buyers may request material, food-contact, coating or supplier documents depending on market and product risk.', 'destination market, contact layer and required documentation', 'ask document needs before sample approval', 'requesting documents after goods are finished'],
      ['food-box-carton-packing', 'How should food boxes be packed for export?', 'Food boxes need clean, dry export cartons, suitable stacking, moisture control and clear shipping marks.', 'carton quantity, carton size, gross weight and storage condition', 'confirm carton dimensions before freight quote', 'allowing cartons to deform under stacking'],
      ['food-safe-paperboard-gsm', 'What GSM is right for food-safe paperboard boxes?', 'Paperboard GSM depends on box size, food weight, coating, stacking and handling requirements.', 'board GSM, coating, box size and load test', 'test real filled boxes for stiffness', 'choosing GSM from another product without load testing']
    ]
  }
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function stripHtml(value = '') {
  return String(value || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function siteUrl(pathname) {
  return `${SITE}/${String(pathname || '').replace(/^\/+/, '')}`;
}

function routeFor(cluster, question) {
  return `${cluster.basePath}/${question[0]}.html`;
}

function hubRoute(cluster) {
  return `${cluster.basePath}/buyer-questions.html`;
}

function questionRecord(cluster, question) {
  const [slug, title, shortAnswer, mustConfirm, sampleAdvice, mistake] = question;
  const route = routeFor(cluster, question);
  return {
    slug,
    route,
    url: siteUrl(route),
    title,
    shortAnswer,
    mustConfirm,
    sampleAdvice,
    mistake,
    cluster
  };
}

function pageDescription(record) {
  return `${record.title} B2B procurement answer for ${record.cluster.productType}: MOQ, materials, samples, QC, RFQ details and related product links.`;
}

function jsonLdForQuestion(record) {
  const cluster = record.cluster;
  const faq = [
    {
      '@type': 'Question',
      name: record.title,
      acceptedAnswer: { '@type': 'Answer', text: record.shortAnswer }
    },
    {
      '@type': 'Question',
      name: `What should buyers confirm for ${cluster.productType}?`,
      acceptedAnswer: { '@type': 'Answer', text: `Buyers should confirm ${record.mustConfirm}, plus artwork status, destination country and target delivery date.` }
    },
    {
      '@type': 'Question',
      name: `Can BestPackFactory quote ${cluster.productType} from MOQ 500 PCS?`,
      acceptedAnswer: { '@type': 'Answer', text: `Yes. BestPackFactory supports ${cluster.productType} projects from ${cluster.commonMoq} when specifications are clear.` }
    }
  ];
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: record.title,
      description: pageDescription(record),
      url: record.url,
      isPartOf: { '@type': 'WebSite', name: 'BestPackFactory', url: `${SITE}/` },
      about: [
        { '@type': 'Thing', name: cluster.industry },
        { '@type': 'Thing', name: record.title },
        { '@type': 'Thing', name: 'custom packaging MOQ 500 PCS' }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: cluster.title, item: siteUrl(hubRoute(cluster)) },
        { '@type': 'ListItem', position: 3, name: record.title, item: record.url }
      ]
    }
  ].map(item => JSON.stringify(item));
}

function relatedLinksHtml(cluster) {
  const links = [...cluster.productLinks, ...cluster.guideLinks, [cluster.parent, `${cluster.industry} hub`]];
  return links
    .map(([href, label]) => `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`)
    .join('');
}

function questionPageHtml(record) {
  const cluster = record.cluster;
  const description = pageDescription(record);
  const jsonLd = jsonLdForQuestion(record).map(json => `<script type="application/ld+json">${json}</script>`).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width,initial-scale=1" name="viewport"/>
<title>${escapeHtml(record.title)} | BestPackFactory</title>
<meta content="${escapeHtml(description)}" name="description"/>
<meta content="${escapeHtml(`${record.title}, ${cluster.industry}, ${cluster.productType}, MOQ 500 PCS, RFQ checklist`)}" name="keywords"/>
<link href="${record.url}" rel="canonical"/>
<link href="../../../../css/style.css?v=20260722_products4" rel="stylesheet"/>
<link rel="alternate" type="text/plain" href="${SITE}/llms.txt" title="BestPackFactory LLM summary"/>
<link rel="alternate" type="application/json" href="${SITE}/industry-question-index.json" title="BestPackFactory industry question index"/>
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"/>
<meta property="og:type" content="article"/>
<meta property="og:site_name" content="BestPackFactory"/>
<meta property="og:title" content="${escapeHtml(record.title)}"/>
<meta property="og:description" content="${escapeHtml(description)}"/>
<meta property="og:url" content="${record.url}"/>
<meta property="og:image" content="${SITE}/assets/hero/slide-01-one-stop.webp"/>
${jsonLd}
</head>
<body>
<div class="topbar"><div>Custom Packaging Manufacturer | MOQ 500 PCS | Free Design | Fast Delivery Worldwide</div><div>Email: lisa@colorprintingpackage.com &nbsp; | &nbsp; WhatsApp: +86 158 8653 0985</div></div>
<header class="header"><div class="header-inner"><a class="logo" href="/index.html"><img alt="BestPackFactory" decoding="async" loading="lazy" src="/assets/logo/bestpackfactory-logo.svg?v=1.2" width="270" height="60"/></a><form action="/products.html" class="search" data-product-search="true" method="get" role="search"><input aria-label="Search custom packaging products" autocomplete="off" name="q" placeholder="Search products: coffee bags, pet food, pharma, cannabis..."/><button type="submit">Search</button></form><nav class="nav"><a href="/index.html">Home</a><a href="/products.html">Products</a><a href="/about.html">About Us</a><a href="/blog.html">Blog</a><a href="/news.html">News</a><a href="/whitepapers.html">Whitepapers</a><a href="/contact.html">Contact</a></nav><a class="btn" href="/contact.html">Get Quote</a></div></header>
<main class="section article-detail geo-article">
<div class="eyebrow">${escapeHtml(cluster.industry)} | Buyer Question | Updated 2026</div>
<h1>${escapeHtml(record.title)}</h1>
<p class="tech-note">${escapeHtml(description)}</p>
<section class="ai-snapshot quick-answer-box"><h2>Quick Answer</h2><p>${escapeHtml(record.shortAnswer)}</p></section>
<section class="tech-spec-section geo-table-block"><h2>Buyer Parameter Table</h2><div class="spec-scroll"><table class="technical-spec-table"><tbody>
<tr><th>Industry</th><td>${escapeHtml(cluster.industry)}</td></tr>
<tr><th>Product scope</th><td>${escapeHtml(cluster.productType)}</td></tr>
<tr><th>Typical MOQ</th><td>${escapeHtml(cluster.commonMoq)}</td></tr>
<tr><th>Materials and features</th><td>${escapeHtml(cluster.materials)}</td></tr>
<tr><th>Must confirm</th><td>${escapeHtml(record.mustConfirm)}</td></tr>
</tbody></table></div></section>
<section><h2>What buyers should decide first</h2><p>${escapeHtml(record.shortAnswer)} For a reliable quote, the buyer should define ${escapeHtml(record.mustConfirm)} before comparing suppliers or approving a sample.</p><p>BestPackFactory treats this as a B2B RFQ question, not a retail checkout item. The factory quote depends on size, material, printing, finish, quantity, carton packing and destination country.</p></section>
<section><h2>Material, sample and QC points</h2><p>For ${escapeHtml(cluster.productType)}, common material and feature choices include ${escapeHtml(cluster.materials)}. The safest sample approval checks ${escapeHtml(cluster.sampleFocus)}.</p><p>${escapeHtml(record.sampleAdvice)} This keeps the project tied to real production behavior instead of only a mockup or reference photo.</p></section>
<section class="rfq-checklist"><h2>RFQ Checklist</h2><ol>
<li>Send product type, dimensions, fill weight or capacity, and target use case.</li>
<li>Confirm ${escapeHtml(record.mustConfirm)}.</li>
<li>Share artwork status, logo files, barcode or QR code needs, and language versions.</li>
<li>Request 500, 1000 and 3000 PCS tiers when comparing launch and reorder cost.</li>
<li>Ask for sample time, bulk lead time, packed carton dimensions and shipping options.</li>
</ol></section>
<section class="rfq-checklist"><h2>Common Mistake To Avoid</h2><p>${escapeHtml(record.mistake)}. This usually creates misleading price comparison or sample changes later.</p></section>
<section class="faq-block"><h2>FAQ</h2>
<details><summary>${escapeHtml(record.title)}</summary><p>${escapeHtml(record.shortAnswer)}</p></details>
<details><summary>What should buyers confirm for ${escapeHtml(cluster.productType)}?</summary><p>Buyers should confirm ${escapeHtml(record.mustConfirm)}, plus artwork status, destination country and target delivery date.</p></details>
<details><summary>Can BestPackFactory quote this from MOQ 500 PCS?</summary><p>Yes. BestPackFactory supports ${escapeHtml(cluster.productType)} projects from ${escapeHtml(cluster.commonMoq)} when specifications are clear.</p></details>
</section>
<section class="rfq-template-box"><h2>Request a factory quote</h2><p>Send size, quantity, material, artwork status, finish requirements, destination country and target deadline. BestPackFactory will review the RFQ and help with dieline, sampling, production, QC and export shipping.</p><div class="rfq-actions"><a class="btn" href="/contact.html">Request Factory Quote</a><a class="btn light" href="https://wa.me/8615886530985?text=Hello%20BestPackFactory%2C%20I%20need%20a%20custom%20packaging%20quote." rel="noopener" target="_blank">Chat on WhatsApp</a></div></section>
<section><h2>Related Product and Buyer Guides</h2><ul class="internal-links">${relatedLinksHtml(cluster)}</ul></section>
</main>
<footer class="footer"><div><h3>BestPackFactory</h3><p>B2B custom packaging manufacturer for boxes, bags, labels, bottles, tins and printing.</p><p><div class="contact-line-beautified"><span>Lisa Wu</span><span>lisa@colorprintingpackage.com</span><span>WhatsApp +86 158 8653 0985</span></div></p></div><div><h3>Products</h3><a href="/products.html">All Products</a><a href="/products/flexible-packaging.html">Flexible Packaging</a><a href="/products/food-packaging.html">Food Packaging</a></div><div><h3>Inquiry</h3><a href="/contact.html">Request Quote</a><a href="mailto:lisa@colorprintingpackage.com">Email Lisa</a></div></footer>
<div class="bpf-whatsapp-chat"><div class="bpf-whatsapp-chat__head">Need Custom Packaging?</div><div class="bpf-whatsapp-chat__body"><strong>MOQ 500 PCS | Fast Factory Quote</strong><p>Click below to contact us quickly by WhatsApp or email.</p><a class="bpf-whatsapp-chat__btn bpf-whatsapp-chat__btn--wa" href="https://wa.me/8615886530985?text=Hello%20BestPackFactory%2C%20I%20need%20a%20custom%20packaging%20quote." rel="noopener" target="_blank">Chat on WhatsApp</a><a class="bpf-whatsapp-chat__btn bpf-whatsapp-chat__btn--mail" href="mailto:lisa@colorprintingpackage.com?subject=Packaging Inquiry&body=Hello Lisa, I need custom packaging.">Email Inquiry</a><span class="bpf-whatsapp-chat__email">lisa@colorprintingpackage.com</span></div></div>
<script defer="" src="/js/main.js"></script>
</body>
</html>
`;
}

function hubJsonLd(cluster, records) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: cluster.title,
    itemListElement: records.map((record, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: record.title,
      url: record.url
    }))
  });
}

function hubHtml(cluster, records) {
  const cards = records.map(record => `<article class="whitepaper-card"><span class="tag">${escapeHtml(cluster.industry)} | Buyer Question</span><h3><a href="/${escapeHtml(record.route)}">${escapeHtml(record.title)}</a></h3><p>${escapeHtml(record.shortAnswer)}</p><a class="text-link" href="/${escapeHtml(record.route)}">Read answer</a></article>`).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width,initial-scale=1" name="viewport"/>
<title>${escapeHtml(cluster.title)} | BestPackFactory</title>
<meta content="Procurement question hub for ${escapeHtml(cluster.industry)} buyers with 20 RFQ-focused answers, product links, sample checks and MOQ 500 PCS factory quote guidance." name="description"/>
<link href="${siteUrl(hubRoute(cluster))}" rel="canonical"/>
<link href="../../../css/style.css?v=20260722_products4" rel="stylesheet"/>
<link rel="alternate" type="application/json" href="${SITE}/${INDEX_JSON}" title="BestPackFactory industry question index"/>
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"/>
<script type="application/ld+json">${hubJsonLd(cluster, records)}</script>
</head>
<body>
<div class="topbar"><div>Custom Packaging Manufacturer | MOQ 500 PCS | Free Design | Fast Delivery Worldwide</div><div>Email: lisa@colorprintingpackage.com &nbsp; | &nbsp; WhatsApp: +86 158 8653 0985</div></div>
<header class="header"><div class="header-inner"><a class="logo" href="/index.html"><img alt="BestPackFactory" decoding="async" loading="lazy" src="/assets/logo/bestpackfactory-logo.svg?v=1.2" width="270" height="60"/></a><nav class="nav"><a href="/index.html">Home</a><a href="/products.html">Products</a><a href="/about.html">About Us</a><a href="/blog.html">Blog</a><a href="/news.html">News</a><a href="/whitepapers.html">Whitepapers</a><a href="/contact.html">Contact</a></nav><a class="btn" href="/contact.html">Get Quote</a></div></header>
<main>
<section class="section whitepaper-hero"><div class="eyebrow">Industry Buyer Questions</div><h1>${escapeHtml(cluster.title)}</h1><p>Twenty high-intent procurement answers for ${escapeHtml(cluster.industry)} buyers. Each page includes quick answer, RFQ checklist, sample checks, related products and structured data.</p></section>
<section class="section"><div class="section-head"><div><div class="eyebrow">Question Cluster</div><h2>Buyer Questions With Quote-ready Answers</h2><p>Built for Google indexing and AI retrieval: clear URLs, visible content, internal links and structured data.</p></div></div><div class="whitepaper-grid">${cards}</div></section>
<section class="section alt"><div class="eyebrow">Related</div><h2>Product and Guide Links</h2><ul class="internal-links">${relatedLinksHtml(cluster)}</ul></section>
</main>
<footer class="footer"><div><h3>BestPackFactory</h3><p>B2B custom packaging manufacturer for boxes, bags, labels, bottles, tins and printing.</p></div><div><h3>Products</h3><a href="/products.html">All Products</a><a href="/products/flexible-packaging.html">Flexible Packaging</a></div><div><h3>Inquiry</h3><a href="/contact.html">Request Quote</a></div></footer>
<script defer="" src="/js/main.js"></script>
</body>
</html>
`;
}

function writePages() {
  const allRecords = [];
  for (const cluster of clusters) {
    const records = cluster.questions.map(question => questionRecord(cluster, question));
    allRecords.push(...records);
    ensureDir(path.join(CONTENT_ROOT, cluster.basePath));
    for (const record of records) {
      fs.writeFileSync(path.join(CONTENT_ROOT, record.route), questionPageHtml(record), 'utf8');
    }
    fs.writeFileSync(path.join(CONTENT_ROOT, hubRoute(cluster)), hubHtml(cluster, records), 'utf8');
  }
  return allRecords;
}

function industryQuestionIndex(allRecords) {
  return {
    site: 'BestPackFactory',
    type: 'Industry buyer question index',
    purpose: 'Machine-readable index of industry-specific procurement question pages for SEO, GEO and AI search retrieval.',
    last_updated: PUBLISHED,
    count: allRecords.length,
    clusters: clusters.map(cluster => ({
      id: cluster.id,
      title: cluster.title,
      industry: cluster.industry,
      hub_url: siteUrl(hubRoute(cluster)),
      parent_url: siteUrl(cluster.parent),
      product_type: cluster.productType,
      common_moq: cluster.commonMoq,
      questions: cluster.questions.map(question => {
        const record = questionRecord(cluster, question);
        return {
          title: record.title,
          intent: `${cluster.industry} ${record.slug.replace(/-/g, ' ')}`,
          url: record.url,
          short_answer: record.shortAnswer,
          must_confirm: record.mustConfirm
        };
      })
    }))
  };
}

function writeIndex(allRecords) {
  const json = JSON.stringify(industryQuestionIndex(allRecords), null, 2);
  fs.writeFileSync(path.join(CONTENT_ROOT, INDEX_JSON), json, 'utf8');
  fs.writeFileSync(path.join(PUBLIC_ROOT, INDEX_JSON), json, 'utf8');
}

function upsertBlock(text, start, end, block) {
  const re = new RegExp(`${start}[\\s\\S]*?${end}`);
  return re.test(text) ? text.replace(re, block) : `${text.trim()}\n\n${block}\n`;
}

function updateLlms(allRecords) {
  const file = path.join(CONTENT_ROOT, 'llms.txt');
  let text = fs.readFileSync(file, 'utf8');
  const clusterLines = clusters.map(cluster => `- ${cluster.title}: ${siteUrl(hubRoute(cluster))}`).join('\n');
  const block = `${LLMS_START}

BestPackFactory publishes industry-specific buyer question pages for SEO, GEO and AI search retrieval:
${clusterLines}

Machine-readable index: ${SITE}/${INDEX_JSON}
Total industry question pages in this cluster: ${allRecords.length}

${LLMS_END}`;
  text = upsertBlock(text, LLMS_START, LLMS_END, block);
  fs.writeFileSync(file, text, 'utf8');
  fs.copyFileSync(file, path.join(PUBLIC_ROOT, 'llms.txt'));
}

function updateAiIndex(allRecords) {
  const file = path.join(CONTENT_ROOT, 'ai-index.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.industry_buyer_question_index_20260724 = {
    machine_readable_json: `${SITE}/${INDEX_JSON}`,
    total_question_pages: allRecords.length,
    cluster_hubs: clusters.map(cluster => ({
      industry: cluster.industry,
      hub_url: siteUrl(hubRoute(cluster)),
      question_count: cluster.questions.length
    })),
    sample_questions: allRecords.slice(0, 12).map(record => ({
      title: record.title,
      url: record.url,
      quick_answer: record.shortAnswer
    }))
  };
  data.last_updated = PUBLISHED;
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  fs.copyFileSync(file, path.join(PUBLIC_ROOT, 'ai-index.json'));
}

function updateRobots() {
  for (const root of [CONTENT_ROOT, PUBLIC_ROOT]) {
    const file = path.join(root, 'robots.txt');
    let text = fs.readFileSync(file, 'utf8');
    const line = `Allow: /${INDEX_JSON}`;
    if (!text.includes(line)) {
      text = text.replace('Allow: /buyer-answer-index.json', `Allow: /buyer-answer-index.json\n${line}`);
    }
    fs.writeFileSync(file, text, 'utf8');
  }
}

function parseExistingSitemap(file) {
  if (!fs.existsSync(file)) return new Map();
  const xml = fs.readFileSync(file, 'utf8');
  const map = new Map();
  const re = /<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<changefreq>([^<]+)<\/changefreq>\s*<priority>([^<]+)<\/priority>\s*<\/url>/g;
  let match;
  while ((match = re.exec(xml))) {
    map.set(match[1], { lastmod: match[2], changefreq: match[3], priority: match[4] });
  }
  return map;
}

function htmlRoutes() {
  const routes = [];
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(abs);
      else if (entry.isFile() && entry.name.endsWith('.html')) routes.push(path.relative(CONTENT_ROOT, abs).replace(/\\/g, '/'));
    }
  };
  walk(CONTENT_ROOT);
  const leadSource = fs.readFileSync(path.join(ROOT, 'lib', 'lead-pages.js'), 'utf8');
  const leadRoutes = [...leadSource.matchAll(/\broute:\s*'([^']+\.html)'/g)].map(match => match[1]);
  return [...new Set([...routes, ...leadRoutes])].sort();
}

function priorityForRoute(route) {
  if (route === 'index.html') return '1.00';
  if (['products.html', 'blog.html', 'contact.html'].includes(route)) return '0.95';
  if (route.includes('/questions/')) return '0.74';
  if (route.startsWith('products/')) return '0.85';
  if (route.startsWith('blog/')) return '0.82';
  if (route.startsWith('news/')) return '0.70';
  if (route.startsWith('industries/')) return '0.76';
  if (route.includes('procurement') || route.includes('manufacturer') || route.includes('rfq') || route.includes('moq')) return '0.78';
  return '0.60';
}

function updateSitemap(newRoutes) {
  const existing = parseExistingSitemap(path.join(CONTENT_ROOT, 'sitemap.xml'));
  const newLocs = new Set(newRoutes.map(route => siteUrl(route)));
  const lines = htmlRoutes().map(route => {
    const loc = route === 'index.html' ? `${SITE}/` : siteUrl(route);
    const old = existing.get(loc);
    const lastmod = newLocs.has(loc) ? PUBLISHED : old?.lastmod || PUBLISHED;
    return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${old?.changefreq || 'weekly'}</changefreq><priority>${old?.priority || priorityForRoute(route)}</priority></url>`;
  }).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${lines}\n</urlset>\n`;
  fs.writeFileSync(path.join(CONTENT_ROOT, 'sitemap.xml'), xml, 'utf8');
  fs.writeFileSync(path.join(PUBLIC_ROOT, 'sitemap.xml'), xml, 'utf8');
}

function updateBrandProfile(allRecords) {
  const file = path.join(PUBLIC_ROOT, 'brand-profile.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.canonical_resources = {
    ...(data.canonical_resources || {}),
    industry_question_index: `${SITE}/${INDEX_JSON}`
  };
  data.industry_question_hubs = clusters.map(cluster => ({
    industry: cluster.industry,
    hub_url: siteUrl(hubRoute(cluster)),
    question_count: cluster.questions.length
  }));
  data.ai_retrieval_summary = {
    ...(data.ai_retrieval_summary || {}),
    industry_question_index: `${SITE}/${INDEX_JSON}`,
    industry_question_page_count: allRecords.length
  };
  data.last_updated = PUBLISHED;
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

const allRecords = writePages();
writeIndex(allRecords);
updateLlms(allRecords);
updateAiIndex(allRecords);
updateRobots();
updateSitemap(allRecords.map(record => record.route).concat(clusters.map(hubRoute)));
updateBrandProfile(allRecords);

console.log(`Published ${allRecords.length} industry buyer question pages.`);
console.log(`Published ${clusters.length} industry buyer question hubs.`);
console.log(`Published ${SITE}/${INDEX_JSON}`);
