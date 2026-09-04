// Dieline catalogue: geometry + real factory specs + SEO metadata per template.
// Every entry links back to the matching product page so dieline traffic feeds
// the existing RFQ funnel instead of dead-ending on a download.

import { tuckEndCarton, sleeve, pillowBox } from './templates-cartons.js';
import { mailerBox, trayBox, magneticRigidBox, paperBag } from './templates-boxes.js';
import { standUpPouch, flatBottomPouch, flatPouch } from './templates-flexible.js';

export const GENERATORS = {
  tuckEndCarton, sleeve, pillowBox, mailerBox, trayBox, magneticRigidBox,
  paperBag, standUpPouch, flatBottomPouch, flatPouch
};

const F = (key, label, def, min, max, step = 1, unit = 'mm') =>
  ({ key, label, default: def, min, max, step, unit });
const BOOL = (key, label, def = false) => ({ key, label, default: def, type: 'bool' });

const POUCH_SEALS = [
  F('seal', 'Side seal width', 8, 5, 15, 0.5),
  F('topSeal', 'Top seal width', 10, 6, 20, 0.5)
];

export const CATEGORIES = [
  { id: 'coffee', name: 'Coffee Bag Templates', blurb: 'Valve-ready pouch layouts for roasters.' },
  { id: 'pouch', name: 'Pouch & Mylar Bag Templates', blurb: 'Stand-up, flat-bottom and child-resistant film layouts.' },
  { id: 'rigid', name: 'Rigid & Magnetic Box Templates', blurb: 'Greyboard structure plus wrap turn-in.' },
  { id: 'carton', name: 'Folding Carton Templates', blurb: 'Tuck end, sleeve and pillow box blanks.' },
  { id: 'shipping', name: 'Shipping & Mailer Templates', blurb: 'Corrugated mailers with board compensation.' },
  { id: 'bag', name: 'Paper Bag & Tray Templates', blurb: 'Gusseted bags and display trays.' }
];

export const DIELINES = [
  {
    slug: 'coffee-bag-250g-valve-dieline',
    name: '250g Coffee Bag Dieline (with Degassing Valve)',
    category: 'coffee',
    generator: 'standUpPouch',
    intro: 'Stand-up coffee pouch layout for a 250 g whole-bean fill, with the degassing valve mount, resealable zipper and laser tear notch positioned to production tolerance.',
    fields: [
      F('width', 'Face width', 130, 60, 260),
      F('height', 'Face height', 225, 100, 420),
      F('gusset', 'Bottom gusset depth', 80, 30, 140),
      ...POUCH_SEALS,
      F('valveDia', 'Valve diameter', 20, 12, 30, 1),
      BOOL('valve', 'Degassing valve', true),
      BOOL('zipper', 'Resealable zipper', true)
    ],
    presets: [
      { name: '250 g whole bean', values: { width: 130, height: 225, gusset: 80 }, note: 'Most common specialty roaster size.' },
      { name: '250 g ground', values: { width: 120, height: 210, gusset: 70 }, note: 'Ground coffee packs denser, so the bag runs smaller.' },
      { name: '340 g / 12 oz', values: { width: 135, height: 240, gusset: 85 }, note: 'US retail 12 oz standard.' },
      { name: '125 g sample', values: { width: 110, height: 190, gusset: 65 }, note: 'Single-origin tasting packs.' },
      { name: '200 g retail', values: { width: 125, height: 215, gusset: 75 }, note: 'EU standard retail size.' },
      { name: '500 g whole bean', values: { width: 150, height: 270, gusset: 95 }, note: 'Bulk home brewing.' },
      { name: '1 kg wholesale', values: { width: 170, height: 320, gusset: 110 }, note: 'Cafe and restaurant supply.' },
      { name: '100 g specialty', values: { width: 105, height: 180, gusset: 60 }, note: 'Micro-lot and competition coffee.' },
      { name: '454 g / 1 lb', values: { width: 145, height: 260, gusset: 90 }, note: 'US pound bag standard.' },
      { name: '2 kg bulk', values: { width: 190, height: 360, gusset: 125 }, note: 'Commercial roaster supply.' }
    ],
    materials: [
      'Kraft / PE with foil barrier — matte natural look, 12 month shelf life',
      'PET / ALU / PE — highest oxygen barrier, best for single origin',
      'Recyclable PE mono-material — store-drop-off recyclable, slightly lower barrier'
    ],
    notes: [
      'Keep artwork 15 mm clear of the valve mount; the valve is welded after printing.',
      'The bottom gusset centre line is the deepest crease — never place a barcode across it.',
      'Zipper sits below the top seal, so allow 25 mm of dead space at the top of the face.'
    ],
    relatedProduct: '/products/250g-coffee-bags-with-valve.html',
    relatedLabel: '250g Coffee Bags with Valve',
    seoDescription: 'Free 250g coffee bag dieline with degassing valve. Valve mount, zipper and tear-notch at production tolerance. 10 preset sizes from 100g specialty to 2kg commercial. PDF, DXF, AI, SVG.',
    keywords: ['250g coffee bag dieline', 'coffee pouch template', 'coffee bag with valve template', 'doypack dieline pdf']
  },
  {
    slug: 'coffee-bag-500g-flat-bottom-dieline',
    name: '500g Flat Bottom Coffee Bag Dieline',
    category: 'coffee',
    generator: 'flatBottomPouch',
    intro: 'Eight-panel flat-bottom (box pouch) layout for 500 g coffee. Squared shoulders give you two extra printable side panels, which is why premium roasters choose it over a doypack.',
    fields: [
      F('width', 'Face width', 140, 70, 280),
      F('height', 'Face height', 250, 120, 450),
      F('gusset', 'Side gusset depth', 90, 40, 160),
      ...POUCH_SEALS,
      F('valveDia', 'Valve diameter', 20, 12, 30, 1),
      BOOL('valve', 'Degassing valve', true)
    ],
    presets: [
      { name: '500 g flat bottom', values: { width: 140, height: 250, gusset: 90 }, note: 'Standard 500 g retail brick.' },
      { name: '340 g flat bottom', values: { width: 120, height: 210, gusset: 75 }, note: 'Shelf-friendly 12 oz format.' },
      { name: '1 kg flat bottom', values: { width: 180, height: 320, gusset: 110 }, note: 'Wholesale and cafe supply.' },
      { name: '250 g flat bottom', values: { width: 120, height: 220, gusset: 80 }, note: 'Premium single-origin retail.' },
      { name: '750 g flat bottom', values: { width: 160, height: 290, gusset: 100 }, note: 'Family pack size.' },
      { name: '2 kg commercial', values: { width: 200, height: 360, gusset: 130 }, note: 'Restaurant and office supply.' },
      { name: '150 g trial', values: { width: 105, height: 190, gusset: 70 }, note: 'Subscription trial packs.' },
      { name: '454 g / 1 lb', values: { width: 135, height: 245, gusset: 85 }, note: 'US pound standard.' },
      { name: '3 kg bulk', values: { width: 220, height: 400, gusset: 145 }, note: 'Commercial roaster bulk.' },
      { name: '200 g specialty', values: { width: 115, height: 205, gusset: 75 }, note: 'Competition and micro-lot.' }
    ],
    materials: [
      'Kraft / ALU / PE — rigid shoulders, premium hand feel',
      'Matte PET / ALU / PE — best print result for full-bleed artwork',
      'Compostable kraft / PLA — certified home compostable, 9 month shelf life'
    ],
    notes: [
      'Side gusset centre creases fold inward; artwork that crosses them will visually break.',
      'The bottom panel is printable but ships face-down — treat it as a legal-copy area.',
      'Flat-bottom bags need a wider top seal than doypacks, keep 10 mm minimum.'
    ],
    relatedProduct: '/products/500g-flat-bottom-coffee-bags.html',
    relatedLabel: '500g Flat Bottom Coffee Bags',
    seoDescription: 'Free 500g flat-bottom coffee bag dieline. Eight-panel box-pouch layout with two extra printable side panels. 10 preset sizes from 150g trial to 3kg commercial. PDF, DXF, AI, SVG.',
    keywords: ['500g coffee bag dieline', 'flat bottom pouch template', 'box pouch dieline', 'quad seal bag template']
  },
  {
    slug: 'mylar-bag-dieline',
    name: 'Mylar Bag Dieline (3-Side Seal)',
    category: 'pouch',
    generator: 'flatPouch',
    intro: 'Three-side-seal flat mylar layout with zipper, tear notch and optional hang hole. Works for edibles, gummies, sample sachets and dry goods.',
    fields: [
      F('width', 'Face width', 100, 40, 260),
      F('height', 'Face height', 150, 60, 360),
      ...POUCH_SEALS,
      BOOL('hangHole', 'Hang hole', false),
      BOOL('childResistant', 'Child-resistant slider', false)
    ],
    presets: [
      { name: '3.5 g eighth', values: { width: 90, height: 130 }, note: 'Cannabis eighth, most common single unit.' },
      { name: '28 g ounce', values: { width: 130, height: 200 }, note: 'Ounce bag with room for a compliance panel.' },
      { name: 'Gummy pouch', values: { width: 110, height: 160, hangHole: true }, note: 'Peg-hook retail display.' },
      { name: '7 g quarter', values: { width: 100, height: 150 }, note: 'Quarter ounce single purchase.' },
      { name: '14 g half ounce', values: { width: 115, height: 175 }, note: 'Half ounce retail pack.' },
      { name: '56 g / 2 oz', values: { width: 145, height: 220 }, note: 'Multi-purchase bulk size.' },
      { name: '100 g edibles', values: { width: 120, height: 180, hangHole: true }, note: 'Retail edible multi-pack.' },
      { name: '5 g sample', values: { width: 85, height: 120 }, note: 'Single-serve sample sachet.' },
      { name: '10 g trial', values: { width: 95, height: 140 }, note: 'Product trial size.' },
      { name: '50 g snack', values: { width: 110, height: 170 }, note: 'Single-serve snack pouch.' },
      { name: '250 g bulk', values: { width: 150, height: 240 }, note: 'Bulk dry goods storage.' }
    ],
    materials: [
      'PET / ALU / PE 100 micron — full light block, odour proof',
      'Matte black mylar — premium finish, hides product',
      'Clear front / foil back — shows product while keeping a barrier'
    ],
    notes: [
      'Tear notch must sit above the zipper or the bag cannot reseal.',
      'Hang hole needs 12 mm of clear seal around it, keep artwork out.',
      'Regulated markets require a fixed compliance panel — reserve it before designing.'
    ],
    relatedProduct: '/products/cannabis-mylar-bags.html',
    relatedLabel: 'Custom Mylar Bags',
    seoDescription: 'Free mylar bag dieline (3-side seal). 11 preset sizes: 3.5g eighth, 7g quarter, 14g half oz, 28g ounce, 100g edibles, 250g bulk. No sign-up. PDF, DXF, AI, SVG.',
    keywords: ['mylar bag dieline', 'mylar bag template pdf', 'flat pouch dieline', '3 side seal bag template']
  },
  {
    slug: 'child-resistant-pouch-dieline',
    name: 'Child-Resistant Pouch Dieline',
    category: 'pouch',
    generator: 'flatPouch',
    intro: 'Flat pouch layout with a certified child-resistant press-to-close slider. Sized for regulated edibles and gummies where CPSC 16 CFR 1700.20 applies.',
    fields: [
      F('width', 'Face width', 110, 50, 240),
      F('height', 'Face height', 165, 70, 340),
      ...POUCH_SEALS,
      BOOL('childResistant', 'Child-resistant slider', true),
      BOOL('hangHole', 'Hang hole', false)
    ],
    presets: [
      { name: 'Edibles 10-pack', values: { width: 110, height: 165 }, note: 'Fits a 10-count gummy tray.' },
      { name: 'Small CR pouch', values: { width: 90, height: 130 }, note: 'Single-serve compliant pack.' },
      { name: 'Large CR pouch', values: { width: 140, height: 200 }, note: 'Multi-unit or bulk edible.' },
      { name: 'Edibles 5-pack', values: { width: 95, height: 145 }, note: 'Five-count gummy retail.' },
      { name: 'Edibles 20-pack', values: { width: 130, height: 190 }, note: 'Twenty-count bulk pack.' },
      { name: 'Chocolate bar CR', values: { width: 105, height: 175 }, note: 'Single chocolate bar.' },
      { name: 'Mints / lozenges', values: { width: 85, height: 125 }, note: 'Breath mints and lozenges.' },
      { name: 'Capsule 30-count', values: { width: 100, height: 155 }, note: 'Thirty capsule bottle pack.' },
      { name: 'Tincture bottle CR', values: { width: 95, height: 170 }, note: 'Single tincture bottle.' },
      { name: 'Vape cartridge 2-pack', values: { width: 90, height: 140 }, note: 'Two-cartridge retail.' },
      { name: 'Pre-roll 3-pack CR', values: { width: 115, height: 180 }, note: 'Three pre-rolled joints.' }
    ],
    materials: [
      'PET / ALU / PE with CR slider — certified child resistant, senior friendly',
      'Matte white PE mono — recyclable structure with CR closure',
      'Opaque black mylar — full light block for cannabinoid stability'
    ],
    notes: [
      'CR closures are wider than standard zippers, so add 6 mm of top clearance.',
      'Certification covers the closure plus the film — do not swap materials after testing.',
      'Warning text has a legal minimum size; reserve that block before laying out artwork.'
    ],
    relatedProduct: '/products/cannabis-child-resistant-bags.html',
    relatedLabel: 'Child-Resistant Cannabis Bags',
    seoDescription: 'Free child-resistant pouch dieline. CPSC 16 CFR 1700.20 CR slider. 11 presets: gummy packs, vape cartridges, pre-rolls, chocolate bars, tinctures. PDF, DXF, AI, SVG.',
    keywords: ['child resistant pouch dieline', 'CR bag template', 'child resistant mylar template', 'edibles pouch dieline']
  },
  {
    slug: 'stand-up-pouch-dieline',
    name: 'Stand-Up Pouch Dieline (Doypack)',
    category: 'pouch',
    generator: 'standUpPouch',
    intro: 'General-purpose doypack layout with bottom gusset, zipper and notch. Use it for protein powder, pet treats, snacks and supplements.',
    fields: [
      F('width', 'Face width', 140, 60, 280),
      F('height', 'Face height', 200, 90, 400),
      F('gusset', 'Bottom gusset depth', 80, 30, 150),
      ...POUCH_SEALS,
      BOOL('zipper', 'Resealable zipper', true),
      BOOL('valve', 'Degassing valve', false),
      F('valveDia', 'Valve diameter', 20, 12, 30, 1)
    ],
    presets: [
      { name: '500 g powder', values: { width: 140, height: 200, gusset: 80 }, note: 'Protein and collagen powders.' },
      { name: '1 kg pet food', values: { width: 180, height: 280, gusset: 100 }, note: 'Pet treat and dry food refill.' },
      { name: 'Snack pouch', values: { width: 120, height: 170, gusset: 60 }, note: 'Single-retail snack size.' },
      { name: '250 g supplement', values: { width: 120, height: 180, gusset: 70 }, note: 'Powdered supplement retail.' },
      { name: '750 g protein', values: { width: 160, height: 240, gusset: 90 }, note: 'Standard protein powder tub.' },
      { name: '2 kg bulk powder', values: { width: 200, height: 320, gusset: 115 }, note: 'Bulk supplement and meal replacement.' },
      { name: '100 g tea', values: { width: 100, height: 160, gusset: 55 }, note: 'Loose leaf tea retail.' },
      { name: '200 g nuts', values: { width: 130, height: 190, gusset: 75 }, note: 'Roasted nuts and trail mix.' },
      { name: '3 kg pet food bulk', values: { width: 220, height: 340, gusset: 130 }, note: 'Large breed pet food.' },
      { name: '150 g snack mix', values: { width: 115, height: 175, gusset: 65 }, note: 'Granola and snack mixes.' },
      { name: '5 kg commercial', values: { width: 250, height: 380, gusset: 150 }, note: 'Food service bulk packs.' }
    ],
    materials: [
      'PET / PE clear — shows product, lowest cost',
      'Kraft / PE with window — natural look for clean-label brands',
      'PET / ALU / PE — moisture and oxygen barrier for powders'
    ],
    notes: [
      'Powders settle, so specify fill height at 80 % of face height.',
      'A pouch that must stand on shelf needs a gusset of at least 40 % of face width.',
      'Zipper adds cost per unit but roughly doubles perceived value on shelf.'
    ],
    relatedProduct: '/products/custom-stand-up-pouches.html',
    relatedLabel: 'Custom Stand-Up Pouches',
    seoDescription: 'Free stand-up doypack dieline. 11 preset sizes for protein powder, pet food, snacks and supplements — from 100g tea to 5kg commercial. PDF, DXF, AI, SVG. No sign-up.',
    keywords: ['stand up pouch dieline', 'doypack template', 'stand up pouch template pdf', 'gusset pouch dieline']
  },
  {
    slug: 'magnetic-rigid-box-dieline',
    name: 'Magnetic Rigid Box Dieline (Greyboard + Wrap)',
    category: 'rigid',
    generator: 'magneticRigidBox',
    intro: 'A magnetic gift box is two drawings, not one: the greyboard structure and the wrap sheet with its turn-in margin. Both are generated here, with magnet positions marked.',
    fields: [
      F('length', 'Inner length', 240, 80, 500),
      F('width', 'Inner width', 180, 60, 400),
      F('height', 'Inner height', 60, 20, 200),
      F('thickness', 'Greyboard thickness', 2, 1, 3, 0.5),
      F('turnIn', 'Wrap turn-in margin', 15, 10, 25),
      F('magnetDia', 'Magnet diameter', 10, 6, 18, 1)
    ],
    presets: [
      { name: 'A4 gift box', values: { length: 240, width: 180, height: 60 }, note: 'Fits printed collateral and apparel.' },
      { name: 'Cosmetic set', values: { length: 200, width: 150, height: 50 }, note: 'Skincare kit with foam insert.' },
      { name: 'Jewellery box', values: { length: 120, width: 90, height: 40 }, note: 'Velvet-lined small format.' },
      { name: 'Shoe box', values: { length: 330, width: 210, height: 120 }, note: 'Sneakers and luxury footwear.' },
      { name: 'Watch box', values: { length: 180, width: 110, height: 70 }, note: 'Single watch with pillow insert.' },
      { name: 'Phone case box', values: { length: 160, width: 90, height: 50 }, note: 'Smartphone accessories.' },
      { name: 'Perfume gift box', values: { length: 150, width: 100, height: 80 }, note: 'Fragrance bottle with insert.' },
      { name: 'Candle gift box', values: { length: 110, width: 110, height: 90 }, note: 'Vessel candle square format.' },
      { name: 'Lingerie box', values: { length: 280, width: 200, height: 70 }, note: 'Apparel and intimate goods.' },
      { name: 'Tech accessory box', values: { length: 200, width: 140, height: 60 }, note: 'Earbuds and chargers.' },
      { name: 'A5 document box', values: { length: 210, width: 150, height: 50 }, note: 'Business documents and cards.' }
    ],
    materials: [
      '1200 gsm greyboard + 157 gsm art paper wrap — the industry default',
      'Greyboard + soft-touch laminate — matte premium feel, shows fingerprints less',
      'Greyboard + textured fine linen paper — no lamination needed, tactile finish'
    ],
    notes: [
      'The wrap sheet is larger than the greyboard by the turn-in on every edge — artwork must bleed to that line or you will see white at the corners.',
      'Hinge gaps equal board thickness plus 0.5 mm, otherwise the lid binds.',
      'Magnets are inserted between board layers, so keep foil and embossing away from those positions.'
    ],
    relatedProduct: '/products/luxury-magnetic-boxes.html',
    relatedLabel: 'Luxury Magnetic Boxes',
    seoDescription: 'Free magnetic rigid box dieline. Generates greyboard structure and wrap sheet separately, with magnet positions marked. 11 presets from jewellery box to shoe box. PDF, DXF, AI, SVG.',
    keywords: ['magnetic box dieline', 'rigid box template', 'magnetic gift box dieline pdf', 'greyboard box template']
  },
  {
    slug: 'tuck-end-box-dieline',
    name: 'Tuck End Box Dieline (Reverse & Straight)',
    category: 'carton',
    generator: 'tuckEndCarton',
    intro: 'The workhorse folding carton. Reverse tuck nests tighter on the sheet and costs less; straight tuck looks cleaner from the front. Switch between them below.',
    fields: [
      F('length', 'Length (front panel)', 90, 25, 400),
      F('width', 'Width (depth)', 40, 15, 300),
      F('height', 'Height', 150, 30, 500),
      F('thickness', 'Board thickness', 0.4, 0.3, 1.5, 0.05),
      BOOL('straight', 'Straight tuck end', false)
    ],
    presets: [
      { name: 'Cosmetic carton', values: { length: 60, width: 60, height: 150 }, note: 'Serum and dropper bottles.' },
      { name: 'Supplement box', values: { length: 90, width: 40, height: 150 }, note: 'Blister packs and sachets.' },
      { name: 'Candle box', values: { length: 80, width: 80, height: 100 }, note: 'Vessel candles with an insert.' },
      { name: 'Lipstick box', values: { length: 40, width: 40, height: 120 }, note: 'Single lipstick retail.' },
      { name: 'Perfume sample', values: { length: 50, width: 30, height: 100 }, note: 'Fragrance vial carton.' },
      { name: 'Pharma blister', values: { length: 100, width: 50, height: 130 }, note: 'Blister pack medication.' },
      { name: 'Tea box', values: { length: 70, width: 50, height: 110 }, note: 'Tea bag sachets retail.' },
      { name: 'Toothpaste box', values: { length: 170, width: 50, height: 50 }, note: 'Standard toothpaste tube.' },
      { name: 'Vitamin bottle', values: { length: 70, width: 70, height: 140 }, note: 'Supplement bottle 60-count.' },
      { name: 'Soap bar box', values: { length: 90, width: 60, height: 70 }, note: 'Single soap bar retail.' },
      { name: 'Essential oil', values: { length: 50, width: 50, height: 130 }, note: 'Essential oil bottle carton.' }
    ],
    materials: [
      '350 gsm SBS folding box board — bright white, best print surface',
      '350 gsm kraft board — natural, ideal for clean-label brands',
      '400 gsm board with matte lamination — added rigidity for heavier fills'
    ],
    notes: [
      'Tuck depth is set slightly under the box depth so the flap clears the panel.',
      'Dust flaps are tapered to avoid catching on the tuck during automated closing.',
      'Reverse tuck is cheaper per unit; straight tuck hides the seam on the display face.'
    ],
    relatedProduct: '/products/custom-cosmetic-packaging-boxes.html',
    relatedLabel: 'Custom Cosmetic Packaging Boxes',
    seoDescription: 'Free tuck-end carton dieline. Switchable reverse and straight tuck. 11 presets: cosmetic serum, lipstick, toothpaste, supplement, tea, soap bar, essential oil and more. PDF, DXF, AI, SVG.',
    keywords: ['tuck end box dieline', 'reverse tuck end template', 'folding carton dieline', 'straight tuck end box template']
  },
  {
    slug: 'mailer-box-dieline',
    name: 'Mailer Box Dieline (Roll End Tuck Front)',
    category: 'shipping',
    generator: 'mailerBox',
    intro: 'Corrugated e-commerce mailer with real board-thickness compensation applied to every crease. Skip that compensation and the box will not close — this is the most common reason a mailer dieline fails on press.',
    fields: [
      F('length', 'Inner length', 250, 80, 600),
      F('width', 'Inner width', 200, 60, 500),
      F('height', 'Inner height', 80, 20, 300),
      F('thickness', 'Board thickness', 3, 1, 7, 0.5)
    ],
    presets: [
      { name: 'Apparel mailer', values: { length: 320, width: 240, height: 80 }, note: 'Folded garments and knitwear.' },
      { name: 'Subscription box', values: { length: 250, width: 200, height: 80 }, note: 'Standard monthly box footprint.' },
      { name: 'Small parcel', values: { length: 180, width: 130, height: 60 }, note: 'Accessories and small goods.' },
      { name: 'Book mailer', values: { length: 240, width: 170, height: 50 }, note: 'Hardcover and paperback books.' },
      { name: 'Shoe mailer', values: { length: 350, width: 220, height: 130 }, note: 'Sneakers and footwear shipping.' },
      { name: 'Cosmetic mailer', values: { length: 200, width: 150, height: 70 }, note: 'Skincare and beauty kits.' },
      { name: 'Tech accessory', values: { length: 160, width: 120, height: 50 }, note: 'Cables and phone cases.' },
      { name: 'Jewelry mailer', values: { length: 140, width: 100, height: 40 }, note: 'Jewelry and small luxury items.' },
      { name: 'Document mailer', values: { length: 310, width: 230, height: 30 }, note: 'A4 documents flat pack.' },
      { name: 'Toy mailer', values: { length: 280, width: 200, height: 100 }, note: 'Retail toys and games.' },
      { name: 'Large apparel', values: { length: 380, width: 280, height: 100 }, note: 'Jackets and bulky garments.' }
    ],
    materials: [
      'E-flute 1.5 mm — best print surface, light parcels',
      'B-flute 3 mm — the standard e-commerce compromise',
      'BE double wall 4.5 mm — heavy or fragile shipments'
    ],
    notes: [
      'Board allowance is applied automatically from the thickness you enter.',
      'E-flute takes litho-quality print; B-flute is better protection but coarser.',
      'Interlocking side wings mean no glue and no tape on assembly.'
    ],
    relatedProduct: '/products/custom-boxes.html',
    relatedLabel: 'Custom Shipping Boxes',
    seoDescription: 'Free corrugated mailer box dieline. Board-thickness compensation applied automatically. 11 presets: subscription box, apparel, shoe, jewelry, toy, cosmetic, book mailer. PDF, DXF, AI, SVG.',
    keywords: ['mailer box dieline', 'roll end tuck front template', 'corrugated mailer dieline', 'shipping box template dxf']
  },
  {
    slug: 'paper-bag-dieline',
    name: 'Paper Bag Dieline (Flat Bottom, Gusseted)',
    category: 'bag',
    generator: 'paperBag',
    intro: 'Flat-bottom retail bag with side gussets, a turn-over top hem and the side seam allowance marked. Handle punch positions sit inside the hem.',
    fields: [
      F('length', 'Front width', 260, 80, 500),
      F('width', 'Side gusset', 120, 40, 250),
      F('height', 'Bag height', 320, 100, 600),
      F('hem', 'Top hem', 30, 15, 60)
    ],
    presets: [
      { name: 'Retail shopper', values: { length: 260, width: 120, height: 320 }, note: 'Apparel and boutique retail.' },
      { name: 'Boutique small', values: { length: 180, width: 90, height: 230 }, note: 'Cosmetics and accessories.' },
      { name: 'Wine bag', values: { length: 110, width: 110, height: 360 }, note: 'Single bottle with rope handles.' },
      { name: 'Grocery bag', values: { length: 320, width: 170, height: 380 }, note: 'Supermarket and grocery retail.' },
      { name: 'Gift bag small', values: { length: 160, width: 80, height: 200 }, note: 'Small gifts and jewelry.' },
      { name: 'Gift bag medium', values: { length: 240, width: 100, height: 280 }, note: 'Medium gift items.' },
      { name: 'Gift bag large', values: { length: 320, width: 130, height: 400 }, note: 'Large gift boxes.' },
      { name: 'Bakery bag', values: { length: 200, width: 100, height: 240 }, note: 'Bread and pastries.' },
      { name: 'Jewelry bag', values: { length: 140, width: 70, height: 180 }, note: 'Jewelry boxes and small luxury.' },
      { name: 'Double wine bag', values: { length: 220, width: 110, height: 360 }, note: 'Two-bottle wine carrier.' },
      { name: 'Shoe bag', values: { length: 300, width: 150, height: 360 }, note: 'Shoe boxes and footwear.' }
    ],
    materials: [
      '170 gsm white kraft — clean print surface, rope handles',
      '210 gsm brown kraft — natural, high tear strength',
      'Art paper with matte laminate — luxury retail, ribbon handles'
    ],
    notes: [
      'The top hem doubles the paper where handles attach — never skip it.',
      'Artwork crossing the side gusset creases will fold out of alignment.',
      'Rope handles need the hem at 30 mm minimum; ribbon can go to 20 mm.'
    ],
    relatedProduct: '/products/paper-bags.html',
    relatedLabel: 'Custom Paper Bags',
    seoDescription: 'Free gusseted paper bag dieline. Flat bottom with side gussets, top hem and handle punch positions. 11 presets: retail shopper, grocery, gift bag, bakery, wine, shoe bag. PDF, DXF, AI, SVG.',
    keywords: ['paper bag dieline', 'shopping bag template', 'gusseted paper bag dieline pdf', 'kraft bag template']
  },
  {
    slug: 'display-tray-dieline',
    name: 'Display Tray Dieline (Locking Corners)',
    category: 'bag',
    generator: 'trayBox',
    intro: 'Open tray with corner ears that lock behind the side walls. Used for bakery, counter display and as the base of two-piece boxes.',
    fields: [
      F('length', 'Inner length', 200, 60, 500),
      F('width', 'Inner width', 150, 50, 400),
      F('height', 'Wall height', 40, 10, 150),
      F('thickness', 'Board thickness', 1.5, 0.3, 4, 0.1)
    ],
    presets: [
      { name: 'Bakery tray', values: { length: 200, width: 150, height: 40 }, note: 'Pastries and donuts.' },
      { name: 'Counter display', values: { length: 240, width: 180, height: 60 }, note: 'Retail point of sale.' },
      { name: 'Box base', values: { length: 160, width: 120, height: 35 }, note: 'Base for a lift-off lid box.' },
      { name: 'Donut tray', values: { length: 280, width: 280, height: 50 }, note: 'Dozen donut display.' },
      { name: 'Cupcake tray 6', values: { length: 240, width: 160, height: 45 }, note: 'Six-count cupcake tray.' },
      { name: 'Cupcake tray 12', values: { length: 320, width: 240, height: 45 }, note: 'Twelve-count cupcake tray.' },
      { name: 'Sandwich tray', values: { length: 300, width: 200, height: 35 }, note: 'Deli sandwiches and wraps.' },
      { name: 'Sushi tray', values: { length: 260, width: 180, height: 30 }, note: 'Sushi and sashimi retail.' },
      { name: 'Cookie tray', values: { length: 220, width: 160, height: 40 }, note: 'Cookies and baked goods.' },
      { name: 'Sample tray', values: { length: 140, width: 100, height: 25 }, note: 'Product samples and tastings.' },
      { name: 'Retail display large', values: { length: 300, width: 220, height: 80 }, note: 'Large retail merchandise.' }
    ],
    materials: [
      '400 gsm folding box board — clean tray for food contact',
      'E-flute corrugated — stronger walls for heavier display',
      'Greaseproof-lined board — direct contact with bakery items'
    ],
    notes: [
      'Corner ears fold inward first, then the side wall traps them.',
      'Food contact requires a food-grade coating — specify it on the RFQ.',
      'Walls above 60 mm need corrugated or the tray will bow.'
    ],
    relatedProduct: '/products/bakery-donut-packaging-boxes.html',
    relatedLabel: 'Bakery Packaging Boxes',
    seoDescription: 'Free display tray dieline with locking corners. 11 presets: bakery tray, donut tray, cupcake tray (6 and 12-count), sandwich tray, sushi tray, retail display. PDF, DXF, AI, SVG.',
    keywords: ['tray dieline', 'display tray template', 'bakery tray dieline', 'open tray box template']
  },
  {
    slug: 'sleeve-dieline',
    name: 'Box Sleeve Dieline',
    category: 'carton',
    generator: 'sleeve',
    intro: 'Open-ended sleeve or belly band that wraps an inner tray or rigid box. The cheapest way to add full-colour branding over a plain base.',
    fields: [
      F('length', 'Box length', 200, 40, 500),
      F('width', 'Box width', 150, 30, 400),
      F('height', 'Sleeve height', 60, 15, 300),
      F('thickness', 'Board thickness', 0.4, 0.3, 2, 0.05)
    ],
    presets: [
      { name: 'Rigid box sleeve', values: { length: 200, width: 150, height: 60 }, note: 'Wraps a two-piece gift box.' },
      { name: 'Belly band', values: { length: 200, width: 150, height: 40 }, note: 'Narrow band, lower cost.' },
      { name: 'Full sleeve', values: { length: 160, width: 120, height: 100 }, note: 'Covers most of the inner box.' },
      { name: 'Cosmetic sleeve', values: { length: 180, width: 130, height: 50 }, note: 'Cosmetic box wrapper.' },
      { name: 'Book belly band', values: { length: 220, width: 150, height: 35 }, note: 'Hardcover book band.' },
      { name: 'Candle sleeve', values: { length: 110, width: 110, height: 80 }, note: 'Candle jar sleeve.' },
      { name: 'Shoe box sleeve', values: { length: 330, width: 210, height: 70 }, note: 'Luxury footwear sleeve.' },
      { name: 'Watch box sleeve', values: { length: 180, width: 110, height: 50 }, note: 'Watch presentation sleeve.' },
      { name: 'Phone case sleeve', values: { length: 160, width: 90, height: 45 }, note: 'Tech accessory sleeve.' },
      { name: 'Perfume sleeve', values: { length: 150, width: 100, height: 70 }, note: 'Fragrance box sleeve.' },
      { name: 'Jewelry sleeve', values: { length: 120, width: 90, height: 35 }, note: 'Jewelry box band.' }
    ],
    materials: [
      '300 gsm art board — full-colour print, gloss or matte laminate',
      '300 gsm kraft — natural look with one-colour print',
      'Board with spot UV — highlights logo over a matte field'
    ],
    notes: [
      'Sleeve inner dimensions add board thickness on every wrapped face.',
      'Too tight and the sleeve tears on removal, too loose and it slides off — 0.5 mm clearance works.',
      'A sleeve lets you keep one stock base and change artwork per SKU.'
    ],
    relatedProduct: '/products/custom-rigid-boxes.html',
    relatedLabel: 'Custom Rigid Boxes',
    seoDescription: 'Free box sleeve and belly band dieline. 11 presets: rigid box sleeve, cosmetic wrapper, book belly band, candle sleeve, shoe box sleeve, watch sleeve, phone case sleeve. PDF, DXF, AI, SVG.',
    keywords: ['box sleeve dieline', 'belly band template', 'sleeve packaging dieline', 'sleeve box template pdf']
  },
  {
    slug: 'pillow-box-dieline',
    name: 'Pillow Box Dieline',
    category: 'carton',
    generator: 'pillowBox',
    intro: 'Curved-end pillow box for favours, jewellery and small gifts. Ships flat and needs no glue on assembly.',
    fields: [
      F('length', 'Width', 120, 40, 300),
      F('width', 'Depth', 40, 15, 120),
      F('height', 'Height', 90, 30, 250)
    ],
    presets: [
      { name: 'Favour box', values: { length: 120, width: 40, height: 90 }, note: 'Wedding and event favours.' },
      { name: 'Jewellery pillow', values: { length: 90, width: 30, height: 70 }, note: 'Necklaces and bracelets.' },
      { name: 'Scarf box', values: { length: 200, width: 60, height: 140 }, note: 'Soft goods and accessories.' },
      { name: 'Soap box', values: { length: 100, width: 35, height: 75 }, note: 'Handmade soap bars.' },
      { name: 'Chocolate box', values: { length: 140, width: 50, height: 100 }, note: 'Artisan chocolate bars.' },
      { name: 'Candy box small', values: { length: 80, width: 30, height: 60 }, note: 'Single candy or truffle.' },
      { name: 'Tea gift box', values: { length: 150, width: 45, height: 110 }, note: 'Tea sachet gift packs.' },
      { name: 'USB drive box', values: { length: 70, width: 25, height: 50 }, note: 'USB drives and tech gifts.' },
      { name: 'Lip balm box', values: { length: 60, width: 25, height: 55 }, note: 'Single lip balm tube.' },
      { name: 'Pen gift box', values: { length: 160, width: 40, height: 45 }, note: 'Premium pen packaging.' },
      { name: 'Cookie box', values: { length: 110, width: 40, height: 85 }, note: 'Single cookie or macaron.' }
    ],
    materials: [
      '300 gsm art board — holds the curve cleanly',
      '300 gsm kraft — rustic favour look',
      'Board with foil stamp — premium event packaging'
    ],
    notes: [
      'The curved closure only holds if depth stays under half the width.',
      'Foil across the curve can crack — keep stamping on the flat faces.',
      'No glue needed, which makes this the cheapest small gift format.'
    ],
    relatedProduct: '/products/custom-boxes.html',
    relatedLabel: 'Custom Gift Boxes',
    seoDescription: 'Free pillow box dieline. No-glue curved-end format. 11 presets: favour box, jewellery, soap, chocolate bar, tea gift, lip balm, pen gift, cookie box. PDF, DXF, AI, SVG.',
    keywords: ['pillow box dieline', 'pillow box template pdf', 'curved end box template', 'favour box dieline']
  },
  {
    slug: 'two-piece-gift-box-dieline',
    name: 'Two-Piece Rigid Gift Box Dieline (Lid & Base)',
    category: 'rigid',
    generator: 'trayBox',
    intro: 'Separate lid and base tray layout for the classic two-piece gift box. Run the generator twice — once for the base depth, once adding 3–5 mm clearance for the lid. Used for apparel, confectionery, cosmetics and luxury retail.',
    seoDescription: 'Free two-piece rigid gift box dieline. Lid and base tray layout with locking corners. 10 presets from jewellery to shirt boxes. PDF, DXF, AI, SVG. No sign-up.',
    fields: [
      F('length', 'Inner length', 200, 60, 600),
      F('width', 'Inner width', 150, 50, 500),
      F('height', 'Wall height', 50, 15, 200),
      F('thickness', 'Board thickness', 1.5, 0.3, 4, 0.1)
    ],
    presets: [
      { name: 'Cosmetic gift set', values: { length: 200, width: 150, height: 50 }, note: 'Skincare and beauty kit with foam insert.' },
      { name: 'Shirt box', values: { length: 350, width: 250, height: 60 }, note: 'Folded dress shirt or knitwear.' },
      { name: 'Chocolate box', values: { length: 180, width: 130, height: 35 }, note: 'Single-layer chocolate truffles.' },
      { name: 'Jewellery small', values: { length: 100, width: 80, height: 40 }, note: 'Rings and earrings.' },
      { name: 'Jewellery large', values: { length: 180, width: 120, height: 50 }, note: 'Necklaces and bracelets.' },
      { name: 'Shoe box', values: { length: 320, width: 185, height: 120 }, note: 'Standard adult shoe box.' },
      { name: 'Scarf box', values: { length: 280, width: 200, height: 55 }, note: 'Folded scarves and accessories.' },
      { name: 'Candle box deep', values: { length: 130, width: 130, height: 100 }, note: 'Large pillar or vessel candle.' },
      { name: 'Stationery set', values: { length: 240, width: 170, height: 45 }, note: 'A5 notebooks and pen sets.' },
      { name: 'Tech gift box', values: { length: 220, width: 160, height: 60 }, note: 'Earbuds, chargers and accessories.' }
    ],
    materials: [
      '1200 gsm greyboard + 157 gsm art paper — department store standard',
      'Greyboard + soft-touch laminate — premium feel, resists handling marks',
      'Greyboard + specialty linen or silk paper — natural finish, no lamination needed'
    ],
    notes: [
      'Set lid height to half the base height unless the lid must fully cap the side walls.',
      'Add 3 mm to lid length and width for clearance; 5 mm for a loose drop lid.',
      'Ribbon, magnet or elastic closure is fitted at the factory — the dieline shows board structure only.'
    ],
    relatedProduct: '/products/luxury-magnetic-boxes.html',
    relatedLabel: 'Custom Rigid Gift Boxes',
    keywords: ['two piece gift box dieline', 'lift off lid box template', 'rigid box base dieline', 'gift box tray template pdf']
  },
  {
    slug: 'wine-bottle-box-dieline',
    name: 'Wine Bottle Box Dieline (Single & Double)',
    category: 'rigid',
    generator: 'trayBox',
    seoDescription: 'Free wine bottle box dieline. Single and double bottle layouts with internal divider. 10 presets: Bordeaux, Champagne, Magnum, sparkling, spirit bottle and more. PDF, DXF, AI, SVG.',
    intro: 'Tall rigid carton for single or double wine or spirit bottles, with the internal divider marked. The bottle sits in a formed base insert; the lid slides over or lifts off.',
    fields: [
      F('length', 'Inner length', 100, 70, 260),
      F('width', 'Inner width', 100, 70, 260),
      F('height', 'Inner height', 350, 200, 500),
      F('thickness', 'Board thickness', 1.5, 0.3, 4, 0.1)
    ],
    presets: [
      { name: 'Bordeaux single', values: { length: 100, width: 100, height: 350 }, note: 'Standard Bordeaux/Burgundy 750 ml.' },
      { name: 'Champagne single', values: { length: 110, width: 110, height: 380 }, note: 'Champagne bottle with wider shoulder.' },
      { name: 'Magnum single', values: { length: 130, width: 130, height: 420 }, note: '1.5 L magnum format.' },
      { name: 'Spirit bottle', values: { length: 105, width: 105, height: 340 }, note: 'Whisky and gin 700 ml.' },
      { name: 'Double Bordeaux', values: { length: 230, width: 105, height: 350 }, note: 'Two standard bottles side by side.' },
      { name: 'Double Champagne', values: { length: 250, width: 115, height: 380 }, note: 'Two Champagne bottles.' },
      { name: 'Sparkling wine', values: { length: 115, width: 115, height: 390 }, note: 'Prosecco and Cava format.' },
      { name: 'Gift set (bottle + glass)', values: { length: 160, width: 110, height: 360 }, note: 'Bottle plus stemware in one box.' },
      { name: 'Half bottle (375 ml)', values: { length: 90, width: 90, height: 290 }, note: 'Dessert wine and half bottles.' },
      { name: 'Liqueur bottle', values: { length: 95, width: 95, height: 300 }, note: 'Narrower liqueur and cordial formats.' }
    ],
    materials: [
      '1200 gsm greyboard + 157 gsm art paper — wine gift box standard',
      'Greyboard + soft-touch laminate — premium hand feel for retail gifting',
      'Greyboard + textured paper with foil stamp — prestige formats'
    ],
    notes: [
      'Internal divider height should sit at 70 % of the bottle height to keep it stable.',
      'The base insert is a separate flat-cut piece — it glues in after the box is formed.',
      'For double boxes, a central divider panel keeps bottles from touching in transit.'
    ],
    relatedProduct: '/products/luxury-magnetic-boxes.html',
    relatedLabel: 'Custom Luxury Boxes',
    keywords: ['wine box dieline', 'wine bottle box template', 'wine gift box dieline pdf', 'bottle packaging dieline']
  },
  {
    slug: 'gable-top-box-dieline',
    name: 'Gable Top Box Dieline (Carry Handle)',
    category: 'carton',
    generator: 'tuckEndCarton',
    seoDescription: 'Free gable top box dieline with carry handle. 10 presets: bakery takeaway, popcorn, candy, party favour, meal kit, juice carton and more. PDF, DXF, AI, SVG. No sign-up.',
    intro: 'Classic gable-top takeaway carton with a die-cut carry handle formed from the folded roof panels. Used for bakery, popcorn, party favours and meal kits. The handle locks flat for stacking and pops up on use.',
    fields: [
      F('length', 'Base length', 110, 60, 300),
      F('width', 'Base width', 80, 50, 200),
      F('height', 'Body height', 160, 80, 320),
      F('thickness', 'Board thickness', 0.4, 0.3, 1.5, 0.05)
    ],
    presets: [
      { name: 'Bakery small', values: { length: 110, width: 80, height: 160 }, note: 'Muffins and cupcakes (2-count).' },
      { name: 'Bakery large', values: { length: 160, width: 120, height: 220 }, note: 'Slices, pastries (4–6 count).' },
      { name: 'Popcorn small', values: { length: 90, width: 70, height: 150 }, note: 'Single-serve cinema size.' },
      { name: 'Popcorn large', values: { length: 130, width: 100, height: 200 }, note: 'Sharing or combo-meal size.' },
      { name: 'Party favour', values: { length: 95, width: 75, height: 145 }, note: 'Candy and small gift giveaways.' },
      { name: 'Meal kit', values: { length: 200, width: 150, height: 240 }, note: 'Takeaway meal box with sauce pots.' },
      { name: 'Juice carton', values: { length: 70, width: 55, height: 180 }, note: 'Single-serve 250 ml juice.' },
      { name: 'Chinese takeaway', values: { length: 100, width: 85, height: 170 }, note: 'Classic noodle/rice box format.' },
      { name: 'Cookie pack', values: { length: 150, width: 100, height: 180 }, note: 'Six-count cookies and biscuits.' },
      { name: 'Christmas favour', values: { length: 85, width: 65, height: 130 }, note: 'Seasonal small gift box.' }
    ],
    materials: [
      '350 gsm SBS coated — food-safe surface, high print clarity',
      '300 gsm kraft — natural look for bakery and artisan food',
      'White SBS with PE coating — moisture-resistant for wet food items'
    ],
    notes: [
      'The handle is cut from the top gable fold — artwork crossing it will tear on first use.',
      'Gable roofs need a 3–5 mm tongue-and-slot lock for tamper evidence.',
      'Board under 350 gsm will buckle when the handle is used to carry a full box.'
    ],
    relatedProduct: '/products/bakery-donut-packaging-boxes.html',
    relatedLabel: 'Bakery Packaging Boxes',
    keywords: ['gable box dieline', 'gable top box template', 'carry handle box dieline', 'bakery box template pdf']
  },
  {
    slug: 'roll-end-tray-dieline',
    name: 'Roll End Tray & Lid (Crash-Lock Base)',
    category: 'shipping',
    generator: 'trayBox',
    seoDescription: 'Free roll-end tray and lid dieline with crash-lock base. 10 presets: retail shelf tray, shipper lid, book tray, board game box, tech product box and more. PDF, DXF, AI, SVG.',
    intro: 'Two-piece corrugated tray and roll-end lid with a crash-lock base that snaps open without gluing. Faster to assemble than a mailer box and widely used for retail shelf-ready trays and transit outers.',
    fields: [
      F('length', 'Inner length', 250, 80, 600),
      F('width', 'Inner width', 180, 60, 500),
      F('height', 'Tray height', 60, 20, 250),
      F('thickness', 'Board thickness', 3, 1, 7, 0.5)
    ],
    presets: [
      { name: 'Shelf-ready tray', values: { length: 360, width: 260, height: 80 }, note: 'Six-unit shelf display with perforated front.' },
      { name: 'Retail shipper', values: { length: 300, width: 200, height: 100 }, note: 'Outer transit box for retail.' },
      { name: 'Book tray', values: { length: 240, width: 180, height: 50 }, note: 'Hardcover single-title shipper.' },
      { name: 'Board game box', values: { length: 290, width: 290, height: 60 }, note: 'Standard board game tray.' },
      { name: 'Tech product box', values: { length: 220, width: 160, height: 70 }, note: 'Electronics retail secondary pack.' },
      { name: 'Wine outer', values: { length: 320, width: 110, height: 360 }, note: 'Single-bottle shipper with divider.' },
      { name: 'Subscription outer', values: { length: 280, width: 220, height: 120 }, note: 'Monthly box outer shipper.' },
      { name: 'Food tray', values: { length: 260, width: 180, height: 40 }, note: 'Ambient food retail tray.' },
      { name: 'Cosmetic display', values: { length: 300, width: 200, height: 60 }, note: 'Counter display tray.' },
      { name: 'Tool box', values: { length: 350, width: 250, height: 90 }, note: 'Hardware and tool retail pack.' }
    ],
    materials: [
      'B-flute 3 mm — standard retail and transit corrugated',
      'E-flute 1.5 mm — printed shelf-ready trays, litho-quality surface',
      'BC double-wall 6 mm — heavy or fragile transit outers'
    ],
    notes: [
      'Crash-lock base snaps flat — leave 2 mm clearance at the base corners or it will bind.',
      'Shelf-ready trays need a perforated tear-away front — mark it on the dieline before cutting.',
      'Lid depth is usually 20–25 % of tray height; too shallow and it falls off, too deep and it is hard to remove.'
    ],
    relatedProduct: '/products/custom-boxes.html',
    relatedLabel: 'Custom Shipping Boxes',
    keywords: ['roll end tray dieline', 'crash lock base box template', 'shelf ready tray dieline', 'tray and lid box template pdf']
  },
  {
    slug: 'sachet-stick-pack-dieline',
    name: 'Sachet & Stick Pack Dieline (3-Side & 4-Side Seal)',
    category: 'pouch',
    generator: 'flatPouch',
    seoDescription: 'Free sachet and stick pack dieline. 3-side and 4-side seal layouts. 10 presets: single-serve coffee, sugar sachet, supplement powder, sauce packet, honey stick and more. PDF, DXF, AI, SVG.',
    intro: 'Small flat sachet and narrow stick-pack layouts with 3-side or 4-side seals. Used for single-serve coffee, condiments, supplements, cosmetic samples and pharmaceutical powders.',
    fields: [
      F('width', 'Face width', 70, 20, 200),
      F('height', 'Face height', 100, 30, 300),
      ...POUCH_SEALS,
      BOOL('hangHole', 'Hang hole', false)
    ],
    presets: [
      { name: 'Stick pack coffee', values: { width: 30, height: 120 }, note: '2 g instant coffee or creamer stick.' },
      { name: 'Sugar sachet', values: { width: 60, height: 40 }, note: 'Standard 4 g restaurant sachet.' },
      { name: 'Supplement powder', values: { width: 70, height: 110 }, note: 'Single-serve 10 g powder sachet.' },
      { name: 'Sauce packet', values: { width: 80, height: 55 }, note: 'Condiment and dipping sauce.' },
      { name: 'Honey stick', values: { width: 25, height: 140 }, note: '7 g honey stick pack.' },
      { name: 'Cosmetic sample', values: { width: 65, height: 90 }, note: 'Serum and lotion sachet.' },
      { name: 'Pharma powder', values: { width: 55, height: 95 }, note: 'ORS and supplement powder.' },
      { name: 'Tea sachet', values: { width: 70, height: 80 }, note: 'Single-serve loose leaf tea.' },
      { name: 'Salt & pepper', values: { width: 50, height: 35 }, note: 'Catering condiment sachet.' },
      { name: 'Protein shot', values: { width: 40, height: 130 }, note: 'Liquid protein stick pack.' }
    ],
    materials: [
      'PET / ALU / PE 70 micron — barrier sachet for powders and liquids',
      'OPP / PE clear — low-cost sachet for dry goods',
      'Kraft / PE — natural look for food and cosmetic samples'
    ],
    notes: [
      'Stick packs need a tear notch at both top corners; sachets need one at one side only.',
      'Minimum seal width 5 mm; go to 8 mm for wet fills.',
      'Artwork area is tiny — keep it to a logo, flavour colour and one key claim.'
    ],
    relatedProduct: '/products/custom-stand-up-pouches.html',
    relatedLabel: 'Custom Flexible Pouches',
    keywords: ['sachet dieline', 'stick pack template', 'sachet packaging template pdf', 'single serve packet dieline']
  }
];

export const getDieline = slug => DIELINES.find(d => d.slug === slug) || null;
export const listSlugs = () => DIELINES.map(d => d.slug);
export const byCategory = id => DIELINES.filter(d => d.category === id);

export function defaultParams(entry) {
  const out = {};
  for (const f of entry.fields) out[f.key] = f.default;
  return out;
}
