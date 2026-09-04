// 65 of the 99 product pages shared one meta description, differing only by the
// product name spliced into a fixed sentence: "Source <Name> from MOQ 500 PCS with
// custom size, material, printing and finish options. Get sampling, QC and worldwide
// B2B shipping support." Several of those splices were also cut mid-phrase by whatever
// generated them, producing broken English that shipped straight into the SERP snippet
// — "Source Custom Retort Pouches for from MOQ 500 PCS", "Source PET Bottles for Candy
// and from MOQ 500 PCS", "Source Custom Black Foldable from MOQ 500 PCS".
//
// Every replacement below is written from that page's own specification table. Where a
// family of pages shares one table (all seven coffee pages, all seven takeaway-board
// pages, all six mylar pages, all six pharma-carton pages), the description is
// differentiated by the page's own subject — fill weight, closure, application — and
// grounded in a figure the table actually publishes, so no two pages read alike and
// none of them claims something the page does not already say.
//
// A deliberate omission: some pages carry a spec table borrowed from a sibling product
// (content-site/products/custom-tea-packaging-bags.html publishes the coffee table,
// including a row literally labelled "Coffee barrier target"). The tea description
// therefore cites only the rows that genuinely apply to tea — laminate and zipper — and
// does not mention the degassing valve, which is a coffee fitting. The mislabelled row
// is left as-is; retitling another page's table is a separate change.
//
// The same string is written to <meta name="description"> and to the Product JSON-LD
// "description" field, which carried the identical boilerplate and would otherwise
// contradict the head.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'content-site', 'products');
const apply = !process.argv.includes('--dry-run');

const BOILERPLATE = /^Source .* from MOQ 500 PCS with custom size, material, printing and finish options\./;

const DESCRIPTIONS = {
  // --- coffee and tea: MOPP/VMPET/PE and foil laminates, OTR ≤ 0.8, Ø9–12 mm valve ---
  '1kg-coffee-bean-bags.html':
    '1kg coffee bean bags in flat-bottom or side-gusset form, with a Ø9–12 mm one-way degassing valve and high-barrier film to OTR ≤ 0.8 cc/m²·day. MOQ 500 PCS.',
  '250g-coffee-bags-with-valve.html':
    '250g coffee bags with a one-way degassing valve set 35–55 mm below the top seal, a 6–8 mm press-to-close zipper and high-barrier laminate. MOQ 500 PCS.',
  '500g-flat-bottom-coffee-bags.html':
    '500g flat-bottom coffee bags with five printable panels, degassing valve, resealable zipper and side seals tested to ≥ 35 N / 15 mm. MOQ 500 PCS.',
  'coffee-bags.html':
    'Custom coffee bags in flat-bottom, side-gusset and stand-up formats for 250 g to 1 kg fills, with degassing valve and high-barrier laminate. MOQ 500 PCS.',
  'custom-coffee-bags.html':
    'Custom printed coffee bags specified around your fill weight, roast date and shelf-life target, with valve, zipper and kraft or matte film options. MOQ 500 PCS.',
  'kraft-paper-coffee-bags.html':
    'Kraft paper coffee bags on an 80gsm kraft / VMPET / PE laminate, so the outside stays natural kraft while the inside holds a high oxygen barrier. MOQ 500 PCS.',
  'matte-black-coffee-bags.html':
    'Matte black coffee bags in soft-touch matte BOPP with spot UV or hot foil logos, a one-way degassing valve and press-to-close zipper. MOQ 500 PCS.',
  'custom-tea-packaging-bags.html':
    'Custom tea packaging bags in stand-up, flat-bottom and side-gusset formats, with a resealable 6–8 mm zipper and barrier film that protects aroma. MOQ 500 PCS.',

  // --- takeaway board: 300gsm C1S / 350 SBS / 250–337 kraft, Kit 8+, Cobb60 ≤ 35 ---
  'bakery-donut-packaging-boxes.html':
    'Donut and bakery boxes on 300–350gsm food-grade board with window options and a grease-resistant coating held to Cobb60 ≤ 35 g/m². MOQ 500 PCS.',
  'bakery-paper-bags.html':
    'Bakery paper bags on food-grade kraft with grease-resistant coating and optional windows, sized for bread, pastries, cookies and counter service. MOQ 500 PCS.',
  'burger-packaging-boxes.html':
    'Burger boxes on 300gsm C1S or food-grade kraft board with a Kit 8+ grease-resistant coating and clamshell or tuck-top lock. MOQ 500 PCS.',
  'fried-chicken-packaging-boxes.html':
    'Fried chicken boxes and buckets on grease-resistant board with a Kit 8+ coating, built to stay rigid under hot, oily fills. MOQ 500 PCS.',
  'fries-packaging-boxes.html':
    'Fry cartons and scoops on 250–337gsm food-grade kraft with Kit 8+ grease resistance, in clip-together or pre-glued formats. MOQ 500 PCS.',
  'sandwich-packaging-boxes.html':
    'Sandwich and wrap boxes on food-grade board with window options and a grease-resistant coating rated to Cobb60 ≤ 35 g/m². MOQ 500 PCS.',
  'shawarma-packaging-boxes.html':
    'Shawarma and wrap boxes on 300gsm C1S or kraft board with grease-resistant coating, for hot sauced fills and takeaway transport. MOQ 500 PCS.',
  'custom-pizza-boxes.html':
    'Custom printed pizza boxes in corrugated E or B flute and kraft board, flexo or offset printed, with grease-resistant coating and vent options. MOQ 500 PCS.',
  'pizza-packaging-boxes.html':
    'Pizza packaging boxes on corrugated or 350gsm food-grade board, with grease-resistant coating and heat resistance to 80°C for 30 minutes. MOQ 500 PCS.',
  'custom-food-packaging.html':
    'Custom food packaging for bakery, takeaway and QSR brands, with board grade, coating, window and printing selected by food type and serving temperature.',

  // --- cannabis and mylar: PET/AL 7µm/PE, OTR ≤ 0.5, ASTM D3475-style CR zipper ---
  'cannabis-child-resistant-bags.html':
    'Child-resistant cannabis bags with an ASTM D3475-style double-lock zipper, aluminium foil barrier to OTR ≤ 0.5 cc/m²·day and opaque film. MOQ 500 PCS.',
  'cannabis-flower-packaging-bags.html':
    'Cannabis flower bags in smell-proof foil laminate with a resealable zipper and an opaque light barrier for light-sensitive product. MOQ 500 PCS.',
  'cannabis-mylar-bags.html':
    'Cannabis mylar bags in a PET / aluminium foil / PE laminate, smell-proof to OTR ≤ 0.5 cc/m²·day, with an optional child-resistant zipper. MOQ 500 PCS.',
  'cbd-gummies-packaging-bags.html':
    'CBD gummies pouches in foil mylar with a child-resistant zipper option and moisture barrier held to WVTR ≤ 0.5 g/m²·day. MOQ 500 PCS.',
  'child-resistant-cannabis-mylar-bags.html':
    'Child-resistant cannabis mylar bags with a 7–10 mm double-lock zipper and an opaque aluminium barrier layer. MOQ 500 PCS, certification document per structure.',
  'smell-proof-mylar-bags.html':
    'Smell-proof mylar bags in a PET / AL 7µm / PE structure holding both OTR and WVTR to ≤ 0.5, in matte, gloss or fully opaque finishes. MOQ 500 PCS.',
  'custom-cannabis-packaging.html':
    'Custom cannabis packaging across mylar bags, pre-roll boxes and jars, with child-resistant closure options and space reserved for state compliance panels.',

  // --- pharma cartons: 300–400gsm, 175 LPI, GS1 DataMatrix ECC200, ISO/IEC 15415 ---
  'gs1-pharma-packaging-boxes.html':
    'GS1-compliant pharma cartons carrying DataMatrix ECC200 codes at 0.30–0.50 mm module size, verified to ISO/IEC 15415 Grade A at print approval. MOQ 500 PCS.',
  'pharma-packaging.html':
    'Pharmaceutical cartons on 300–400gsm board, offset printed at 175 LPI to ±0.15 mm registration, with GS1 DataMatrix serialisation. MOQ 500 PCS.',
  'pharmaceutical-folding-cartons.html':
    'Pharmaceutical folding cartons on 0.42–0.58 mm caliper board, with DataMatrix codes that still verify at Grade B after folding and gluing. MOQ 500 PCS.',
  'pre-roll-packaging-boxes.html':
    'Pre-roll boxes on 300–400gsm ivory or SBS board, offset printed at 175 LPI, with areas reserved for compliance text and DataMatrix coding. MOQ 500 PCS.',
  'vitamin-supplement-packaging-boxes.html':
    'Vitamin and supplement cartons on 300gsm C1S or 400gsm ivory board, offset printed with barcode quiet zones held to ≥ 4X module width. MOQ 500 PCS.',
  'weight-loss-pill-packaging-boxes.html':
    'Weight-loss and diet pill cartons on 300–400gsm board, offset printed at 175 LPI, with barcodes verified to ISO/IEC 15415 at print approval. MOQ 500 PCS.',
  'custom-pharmaceutical-packaging.html':
    'Custom pharmaceutical packaging from folding cartons to serialised secondary packs, specified around your dose form, destination market and coding standard.',
  'medical-aesthetic-packaging-boxes.html':
    'Medical aesthetic packaging boxes as magnetic rigid boxes or folding cartons, with tamper-evident seals, serialised coding and a fit check on container count.',

  // --- rigid and gift boxes: 1200–1800gsm greyboard 1.8–2.8 mm, N35 magnets ---
  'custom-black-foldable-magnetic-gift-boxes-tissue-paper-stickers.html':
    'Black foldable magnetic gift boxes that ship flat, on 1200–1800gsm greyboard with black art paper wrap, printed tissue paper and sticker seals. MOQ 500 PCS.',
  'custom-cosmetic-packaging-boxes.html':
    'Cosmetic packaging boxes in magnetic, lift-off lid, drawer and book-style structures on 1.8–2.8 mm greyboard, with corner gaps held under 1.5 mm. MOQ 500 PCS.',
  'custom-luxury-gift-boxes-manufacturer-premium-rigid-gift-packaging.html':
    'Luxury rigid gift boxes on 1200–1800gsm greyboard with hot foil, embossed or spot UV logos and EVA, moulded pulp or satin-lined inserts. MOQ 500 PCS.',
  'wine-magnetic-gift-boxes.html':
    'Wine magnetic gift boxes on 1.8–2.8 mm greyboard with N35 magnets, single or twin bottle cavities and foil-stamped logos. MOQ 500 PCS.',
  'custom-cosmetic-packaging.html':
    'Custom cosmetic packaging across rigid boxes, folding cartons, tubes and labels, matched as one set to a single brand colour and finish standard.',
  'custom-packaging-boxes.html':
    'Custom packaging boxes in corrugated mailer, folding carton and rigid formats, with structure, board and finish chosen against product weight and shipping route.',
  'custom-boxes.html':
    'Custom boxes in E, B and BC flute, 3-ply or 5-ply, on 120–170gsm kraft liner to a 32 ECT export target, flexo or offset printed. MOQ 500 PCS.',
  'custom-folding-cartons.html':
    'Custom folding cartons in tuck-end, crash-lock and sleeve styles, with window patching, foil and coating options. Free dieline in 24 hours, MOQ 500 PCS.',

  // --- paper bags ---
  'luxury-retail-paper-bags.html':
    'Luxury retail paper bags on 190–300gsm card with cotton rope or ribbon handles rated ≥ 12 kgf per pair and a reinforced bottom board. MOQ 500 PCS.',
  'custom-paper-bags.html':
    'Custom paper bags for retail, gift and takeaway use in kraft or coated card, with rope, ribbon, twisted paper or die-cut handles. MOQ 500 PCS.',

  // --- labels ---
  'labels-stickers.html':
    'Labels and stickers on coated paper, BOPP, PET, silver PET or holographic face stock, with permanent, removable or −20°C freezer adhesive. MOQ 500 PCS.',
  'custom-labels-stickers.html':
    'Custom labels and stickers in roll, sheet and die-cut formats, with face stock, adhesive and finish selected for your surface and storage conditions.',
  'roll-labels-for-automatic-labeling.html':
    'Roll labels for automatic labelling on 76 mm cores with a 3 mm gap and matrix waste removed, wound to suit your applicator direction. MOQ 500 PCS.',

  // --- flexible film and pouches ---
  'flexible-packaging.html':
    'Flexible packaging in 90–160 µm laminates with metalised or foil barriers, holding OTR ≤ 1.5 cc/m²·day and heat seals at ≥ 35 N / 15 mm. MOQ 500 PCS.',
  'collagen-powder-packaging-pouches.html':
    'Collagen powder pouches in 90–160 µm laminate with a metalised moisture barrier to WVTR ≤ 1.2 g/m²·day and heat seals at ≥ 35 N / 15 mm. MOQ 500 PCS.',
  'protein-powder-stand-up-pouches.html':
    'Protein powder stand-up pouches in 90–160 µm laminate, gusseted to stand when filled, with an oxygen barrier held to OTR ≤ 1.5 cc/m²·day. MOQ 500 PCS.',
  'custom-compostable-stand-up-pouches.html':
    'Compostable stand-up pouches in kraft / NKME / PLA and NK / NKME / PBS structures, with a compostable zipper and seals at ≥ 25 N / 15 mm. MOQ 500 PCS.',
  'custom-flat-bottom-pouches.html':
    'Custom flat-bottom pouches with five printable panels and shelf stability when filled, plus zipper, valve and tear-notch options. MOQ 500 PCS.',
  'custom-retort-pouches-ready-meal-packaging.html':
    'Retort pouches for ready meals, sterilisable at 121–135°C for 30 to 60 minutes, with foil barrier, ≥ 15 N puncture resistance and ≥ 50 N / 15 mm seals.',
  'custom-spout-pouches-sauce-baby-food.html':
    'Spout pouches for sauce and baby food with 8.5–22 mm spouts in centre or corner position, liquid-tight seals at ≥ 40 N / 15 mm, from 50 ml to 2 L.',
  'custom-spout-pouches.html':
    'Custom spout pouches for liquids, purées and gels, with spout diameter, cap type and barrier film matched to your filling line. MOQ 500 PCS.',
  'custom-roll-stock-film-snack-protein-bar.html':
    'Roll stock film for snack and protein bar lines, 50–1000 mm wide with COF 0.20–0.35 for VFFS and HFFS machines and eye-mark registration. MOQ 500 PCS.',
  'pet-food-bags.html':
    'Pet food bags in 120–180 µm laminate with foil or metalised barrier for high-fat kibble, and seals at ≥ 45 N / 15 mm for heavy fills. MOQ 500 PCS.',

  // --- PET bottles ---
  'pet-bottles.html':
    'Food-grade PET bottles from 30 ml to 1000 ml in clear, amber, blue or custom colour, with 18/410 to 38 mm necks and 0.45–1.20 mm walls. MOQ 500 PCS.',
  'pet-bottles-candy-pharma.html':
    'PET bottles and wide-mouth jars for gummies, mints and tablets from 30 to 500 ml, with induction-seal liners, tamper-evident bands and CR closures.',

  // --- tinplate ---
  'tin-boxes.html':
    'Tinplate boxes at 0.23–0.28 mm in hinged, slip-lid, window, round and rectangular forms, CMYK offset printed with food-safe inner lacquer. MOQ 500 PCS.',

  // --- unboxing accessories: tissue 17/22/28gsm, tape 45–72 mm, ribbon 10–25 mm ---
  'custom-printed-tape.html':
    'Custom printed packaging tape in 45–72 mm widths on BOPP film, with a water-based acrylic adhesive at 18–22gsm coat weight. MOQ 500 PCS.',
  'custom-printed-tissue-paper.html':
    'Custom printed tissue paper in 17, 22 and 28gsm, flexo, silk screen or hot foil printed, with PMS spot colour held to ΔE ≤ 3.0. MOQ 500 PCS.',
  'custom-tissue-paper.html':
    'Custom tissue paper for unboxing and retail wrap, in kraft or white stock, printed with your logo in one to four colours. MOQ 500 PCS.',
  'tissue-paper-packaging.html':
    'Tissue paper, printed tape and ribbon supplied as one matched unboxing set, in 17–28gsm tissue and 10–25 mm polyester ribbon. MOQ 500 PCS.',
  'custom-ribbon.html':
    'Custom printed ribbon in 10–25 mm polyester, hot foil or silk screen printed with your logo, supplied on 100 yard rolls. MOQ 500 PCS.',

  // --- stationery ---
  'custom-pp-ring-binder-folders.html':
    'Custom PP ring binder folders in 600–1000 micron polypropylene, with 2, 3 or 4-ring mechanisms in A4, US Letter and European formats. MOQ 500 PCS.'
};

function escapeAttr(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

const files = fs.readdirSync(DIR).filter(name => name.endsWith('.html'));
const boilerplateFiles = files.filter(name => {
  const match = fs.readFileSync(path.join(DIR, name), 'utf8')
    .match(/<meta name="description" content="([^"]*)"/i);
  return match && BOILERPLATE.test(match[1]);
});

// Guard both directions: a page left on boilerplate is a silent miss, and a key that
// matches nothing means a page was renamed and the description would vanish.
const uncovered = boilerplateFiles.filter(name => !DESCRIPTIONS[name]);
const orphaned = Object.keys(DESCRIPTIONS).filter(name => !boilerplateFiles.includes(name));
if (uncovered.length) throw new Error(`boilerplate pages with no replacement: ${uncovered.join(', ')}`);
if (orphaned.length) throw new Error(`replacements matching no boilerplate page: ${orphaned.join(', ')}`);

const stats = { files: 0, metaRewritten: 0, jsonLdRewritten: 0, warnings: [] };

for (const name of boilerplateFiles) {
  const file = path.join(DIR, name);
  const original = fs.readFileSync(file, 'utf8');
  let html = original;
  const description = DESCRIPTIONS[name];

  if (description.length > 165) stats.warnings.push(`${name}: ${description.length} chars, may truncate in SERP`);

  const before = html;
  html = html.replace(
    /(<meta name="description" content=")([^"]*)(")/i,
    (_m, lead, _old, tail) => `${lead}${escapeAttr(description)}${tail}`
  );
  if (html !== before) stats.metaRewritten += 1;
  else stats.warnings.push(`${name}: meta description tag not found`);

  // The Product JSON-LD repeats the same string; leaving it would put the old
  // boilerplate back into every structured-data consumer.
  const blocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of blocks) {
    let parsed;
    try { parsed = JSON.parse(block[1].trim()); } catch { continue; }
    if (!parsed.description || !BOILERPLATE.test(parsed.description)) continue;
    parsed.description = description;
    const rendered = JSON.stringify(parsed, null, 2);
    html = html.replace(block[0], () => block[0].replace(block[1], () => `\n${rendered}\n`));
    stats.jsonLdRewritten += 1;
  }

  if (html !== original) {
    stats.files += 1;
    if (apply) fs.writeFileSync(file, html);
  }
}

// Uniqueness is the whole point of the change, so it is checked against every product
// page, not only the ones rewritten here.
if (apply) {
  const seen = new Map();
  for (const name of files) {
    const match = fs.readFileSync(path.join(DIR, name), 'utf8')
      .match(/<meta name="description" content="([^"]*)"/i);
    if (!match) continue;
    if (seen.has(match[1])) stats.warnings.push(`duplicate description: ${name} and ${seen.get(match[1])}`);
    else seen.set(match[1], name);
  }
  stats.distinctDescriptions = seen.size;
  stats.totalPages = files.length;
}

console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', ...stats }, null, 2));
