import fs from 'node:fs';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'content-site', 'products');

const FAQ_MAP = {
  '500g-flat-bottom-coffee-bags.html': [
    { q: 'What valve options are available for 500g coffee bags?', a: 'We offer one-way degassing valves that release CO₂ while blocking oxygen. Standard adhesive valves are placed 70 mm from the top seal; screw-in valves are available for premium lines.' },
    { q: 'Which barrier laminate preserves coffee freshness longest?', a: 'PET 12µm / AL 7µm / PE 80µm delivers OTR ≤ 0.5 cc/m²·day and targets 12+ months shelf life. Kraft-front structures with VMPET provide 6–9 months for shorter shelf-life roasts.' },
    { q: 'Can I order a 500 PCS trial before bulk production?', a: 'Yes. MOQ is 500 PCS per size and artwork. We produce a printed sample proof for your approval before starting the trial run.' },
  ],
  '250g-coffee-bags-with-valve.html': [
    { q: 'Where should the degassing valve be placed on a 250g bag?', a: 'For a 250g pouch the valve is typically placed 50–70 mm from the top seal, centered on the back panel. We adjust valve position in the dieline to avoid interfering with your artwork.' },
    { q: 'What zipper types work best for small coffee bags?', a: 'Press-to-close zipper (width 5–7 mm) is standard for 250g bags. Slider zipper gives an easier consumer experience but adds slightly to cost. Both maintain an airtight reseal.' },
    { q: 'Can the bag stand upright on a retail shelf?', a: 'Yes. Stand-up pouch with bottom gusset is the default format for 250g coffee bags. The gusset width is matched to your fill volume so the bag stays stable when full.' },
  ],
  '1kg-coffee-bean-bags.html': [
    { q: 'What material strength is needed for a 1 kg coffee bag?', a: 'We recommend PET 12µm / AL 7µm / PE 100µm or a thicker PE layer for 1 kg fill weight. The thicker sealant layer improves drop-test performance and bottom seal strength under load.' },
    { q: 'Can 1 kg bags use the same degassing valve as smaller sizes?', a: 'Yes, the same one-way valve works across sizes. For 1 kg whole-bean bags we recommend a slightly larger valve bore to handle the higher CO₂ output from more beans.' },
    { q: 'What is the typical lead time for 1 kg coffee bag production?', a: 'Dieline and artwork proof within 24 hours, physical samples in 5–7 working days, bulk production 20–30 days after sample approval. Rush orders may reduce bulk time by 5–7 days.' },
  ],
  'kraft-paper-coffee-bags.html': [
    { q: 'Does kraft paper alone provide enough moisture barrier for coffee?', a: 'No. Our kraft coffee bags use a kraft / AL / PE or kraft / VMPET / PE laminate inside, so the exterior has a natural kraft look while the inner layers provide a moisture and oxygen barrier.' },
    { q: 'Can I get a clear window on a kraft coffee bag?', a: 'Yes. We die-cut a window in the kraft layer and bond a transparent PET or OPP film behind it. Window shape and size are customized in the dieline.' },
    { q: 'Is the kraft coffee bag recyclable?', a: 'The outer kraft layer is paper-based, but the multi-layer laminate (kraft + aluminium + PE) is not widely recyclable. For a more sustainable option we offer kraft / PE mono-material pouches with reduced barrier life.' },
  ],
  'matte-black-coffee-bags.html': [
    { q: 'How is the matte black finish applied to the bag?', a: 'We reverse-print matte black ink on PET film with a matte lamination overcoat. This produces a uniform, fingerprint-resistant surface that holds up during shipping and shelf handling.' },
    { q: 'Can I add hot foil stamping or spot UV on a matte black bag?', a: 'Yes. Gold or silver hot foil stamping and spot gloss UV are popular on matte black bags for a premium contrast effect. Both can be applied to logos, text or border areas.' },
    { q: 'Will the matte surface affect barcode scanning?', a: 'No. We leave barcode and QR code areas in gloss or semi-gloss finish with sufficient contrast for reliable scanning. This is built into the dieline during prepress.' },
  ],
  'cannabis-flower-packaging-bags.html': [
    { q: 'What oxygen barrier preserves cannabis flower terpenes?', a: 'PET / AL 7µm / PE laminate with OTR ≤ 0.5 cc/m²·day preserves terpene and cannabinoid profiles. VMPET-based laminates offer moderate barrier at lower cost for shorter shelf-life flower.' },
    { q: 'Can you integrate a humidity-pack pocket inside the bag?', a: 'Yes. We can add an internal pocket or pouch insert sized for third-party humidity packs such as Boveda or Integra, while the bag itself delivers WVTR ≤ 0.5 g/m²·day.' },
    { q: 'What sizes are standard for cannabis flower bags?', a: 'Common sizes are 3.5 g (⅛ oz), 7 g (¼ oz), 14 g (½ oz) and 28 g (1 oz). All are custom-cut so we match the bag dimensions to your exact fill volume and dispensary shelf format.' },
  ],
  'child-resistant-cannabis-mylar-bags.html': [
    { q: 'What child-resistant mechanism do your mylar bags use?', a: 'A double-lock zipper requiring simultaneous push-and-slide action to open. This meets ASTM D3475-style testing standards. Certification documentation is available after structure selection.' },
    { q: 'Are the bags opaque enough for light-sensitive cannabis?', a: 'Yes. Aluminium foil or VMPET inner layers block 100% of visible light. Outer print in solid colours or matte black adds an additional opacity layer for dispensary compliance.' },
    { q: 'Can I order both child-resistant and non-CR bags in the same run?', a: 'Yes. CR and standard zipper pouches can share the same printed film if they use the same material and dimensions. Only the zipper fitment differs, so we run them as separate finishing batches.' },
  ],
  'cbd-gummies-packaging-bags.html': [
    { q: 'What barrier film prevents gummies from drying out?', a: 'PET / AL / PE laminate with WVTR ≤ 0.5 g/m²·day prevents moisture loss and keeps gummies soft. PET / VMPET / PE provides adequate moisture control at lower cost for shorter shelf-life products.' },
    { q: 'Can the bag be child-resistant and resealable?', a: 'Yes. We fit a child-resistant push-and-slide zipper that also functions as a resealable closure for daily use, meeting both compliance requirements and consumer convenience.' },
    { q: 'Do you support dosage labeling panels on the bag?', a: 'Yes. We reserve space in the dieline for per-serving CBD/THC content, nutrition facts, lot code, expiry date and QR code for certificate of analysis linking.' },
  ],
  'smell-proof-mylar-bags.html': [
    { q: 'How do you verify smell-proof performance?', a: 'Aluminium foil laminates achieve OTR ≤ 0.5 cc/m²·day, which blocks odour transfer. We verify seal integrity with a vacuum leak test and confirm there are no micro-pinholes in the barrier layer.' },
    { q: 'What is the difference between AL foil and VMPET for smell-proofing?', a: 'Aluminium foil (7–9 µm) provides a near-perfect gas barrier and is the strongest smell-proof option. VMPET (vacuum-metallized PET) is lighter and lower cost but has 10–50× higher OTR than true foil.' },
    { q: 'Can smell-proof bags have a transparent window?', a: 'True smell-proof performance requires an aluminium or metallized layer, so the bag is opaque. For partial visibility we offer a small die-cut window backed by clear barrier film, but this reduces the overall barrier rating.' },
  ],
  'protein-powder-stand-up-pouches.html': [
    { q: 'What moisture barrier prevents protein powder from clumping?', a: 'PET / AL / PE laminate with WVTR ≤ 0.5 g/m²·day is recommended for whey, casein and plant-based protein. The resealable zipper also needs an airtight seal to prevent moisture ingress after opening.' },
    { q: 'Can the pouch handle 1–5 kg fill weights?', a: 'Yes. For heavier fills (2 kg+) we increase the PE sealant layer thickness and use a wider bottom gusset to support the weight and keep the pouch standing upright on shelves.' },
    { q: 'Do you support scoop-friendly pouch openings?', a: 'Yes. We can widen the pouch mouth or add a built-in pour spout. The resealable zipper is positioned below the opening to keep the closure clean during scooping.' },
  ],
  'collagen-powder-packaging-pouches.html': [
    { q: 'Why is aluminium foil recommended for collagen powder?', a: 'Collagen peptides are hygroscopic and degrade with UV exposure. AL foil blocks 100% of light and delivers WVTR ≤ 0.5 g/m²·day, preventing clumping and potency loss over a 24-month target shelf life.' },
    { q: 'Can the pouch include both a tear notch and a resealable zipper?', a: 'Yes. A tear notch at the top provides the initial opening, and a press-to-close zipper below it lets consumers reseal the pouch after each use to maintain freshness.' },
    { q: 'What regulatory information can be printed on the pouch?', a: 'We reserve panels for nutrition facts, ingredient lists, allergen warnings, batch codes, expiry dates and QR codes. Layout follows FDA or EU labeling dimensions based on your target market.' },
  ],
  'vitamin-supplement-packaging-boxes.html': [
    { q: 'What board thickness is suitable for vitamin supplement boxes?', a: '300–350 gsm C1S or SBS board is standard for folding cartons holding 30–120 count bottles or blister packs. We adjust thickness based on carton size and insert weight.' },
    { q: 'Can the box include a tamper-evident seal?', a: 'Yes. Options include glue-dot closure, tuck-flap with perforated tear strip, and shrink-wrap band. Each prevents the box from being opened undetected before purchase.' },
    { q: 'Do you print with pharmaceutical-grade inks?', a: 'Yes. We use low-migration, low-odor inks for supplement and pharma cartons. Ink certificates and material safety data sheets are available on request for regulatory filing.' },
  ],
  'weight-loss-pill-packaging-boxes.html': [
    { q: 'What insert options secure blister packs inside the box?', a: 'Die-cut cardboard inserts, corrugated E-flute dividers and PET vacuum-formed trays are available. We custom-size the insert to your blister card dimensions for a snug fit.' },
    { q: 'Can the packaging include anti-counterfeit features?', a: 'Yes. We offer holographic foil, micro-text printing, serialized QR codes with authentication links and tamper-evident closures to protect your brand and consumers.' },
    { q: 'What finish looks premium for supplement boxes?', a: 'Matte lamination with spot gloss UV on the logo and product name is the most popular combination. Soft-touch lamination and gold foil stamping add a luxury tier for premium lines.' },
  ],
  'pharmaceutical-folding-cartons.html': [
    { q: 'Are your folding cartons compliant with pharmaceutical standards?', a: 'Yes. We print with low-migration inks, use pharma-grade board, and can meet EU Annex 13 GMP requirements for secondary packaging. Material certificates and batch traceability documents are available.' },
    { q: 'Can you add Braille text to the carton?', a: 'Yes. We emboss Braille dots on the carton surface per Marburg Medium standard. Braille placement is incorporated into the die-cut tooling and verified with a Braille height gauge.' },
    { q: 'What serialization options do you support?', a: 'Inkjet-printed serial numbers, 2D DataMatrix codes and QR codes for track-and-trace compliance. We can print variable data inline during production at up to 200 cartons per minute.' },
  ],
  'custom-pizza-boxes.html': [
    { q: 'Which corrugated flute is best for pizza boxes?', a: 'E flute (1.5 mm) gives a smooth print surface for single-pizza retail boxes. B flute (3.0 mm) offers better stacking strength for delivery stacks. E/B double-wall handles heavy or large-format pizzas.' },
    { q: 'How do you prevent grease from soaking through the box?', a: 'We apply PE coating (18 gsm), PLA coating (20 gsm) or water-based grease-resistant coating (6–10 gsm) to the food-contact side. Kit value 8+ is recommended for pizza to block oil transfer.' },
    { q: 'Can pizza boxes be printed with full-color branded artwork?', a: 'Yes. We print offset 1–6 colors with food-safe inks on the outer surface. Flexographic printing is also available for simpler designs at lower cost for high-volume orders.' },
  ],
  'bakery-paper-bags.html': [
    { q: 'What grease resistance level suits baked goods?', a: 'Kit value 6–8 is adequate for bread, pastries and cookies. For butter-heavy items like croissants we recommend Kit 10+ or a light PE coating on the food-contact side.' },
    { q: 'Can bakery bags include a window for product visibility?', a: 'Yes. We die-cut a window and bond food-grade PET or PLA transparent film behind it. Standard window shapes are oval and rectangular; custom shapes are available with new die tooling.' },
    { q: 'Are your bakery bags suitable for hot items fresh from the oven?', a: 'PE-coated bags handle temperatures up to 80 °C for short contact. For hotter items straight from the oven, we recommend uncoated kraft bags or bags with a heat-resistant water-based coating.' },
  ],
  'sandwich-packaging-boxes.html': [
    { q: 'What board is food-safe for direct sandwich contact?', a: 'Food-grade kraft board (250–300 gsm) with water-based grease-resistant coating or PE lamination on the inner face. We avoid direct ink contact on the food side.' },
    { q: 'Can the box include an anti-fog window?', a: 'Yes. An anti-fog PET or PLA window prevents condensation from fresh sandwiches from obscuring the view. Window shape and size are customized in the die-cut.' },
    { q: 'What closure style works best for sandwich boxes?', a: 'Tuck-top with tab lock is most common, allowing quick opening and secure closure. For grab-and-go retail, we also offer wedge-shaped boxes with a side label seal.' },
  ],
  'custom-tea-packaging-bags.html': [
    { q: 'What barrier structure best preserves tea aroma?', a: 'PET / AL / PE laminate offers the highest aroma and moisture barrier for 12+ months shelf life. For bags with a transparent window, PET / VMPET / PE provides moderate barrier with partial product visibility.' },
    { q: 'Do you produce individually wrapped tea bag sachets?', a: 'Yes. We produce nitrogen-flushed individual sachets in aluminium foil or VMPET film. These inner sachets fit inside an outer retail box, tin or stand-up pouch.' },
    { q: 'What closure types work best for loose-leaf tea pouches?', a: 'Resealable press-to-close zipper with tear notch is most popular. We also offer tin-tie closures for kraft paper bags and screw-cap options for premium loose-leaf lines.' },
  ],
  'wine-magnetic-gift-boxes.html': [
    { q: 'What magnetic closure strength is standard for wine gift boxes?', a: 'N35 neodymium magnets with 1.5–2.0 kg pull force per pair are standard. We use two magnet pairs on most wine boxes; larger formats may use three pairs for secure closure.' },
    { q: 'Can the box include a foam insert to protect the bottle?', a: 'Yes. EVA or polyurethane foam inserts are die-cut to fit standard 750 ml wine bottle profiles. Custom inserts for champagne, spirits or two-bottle gift sets are also available.' },
    { q: 'What surface finishes are popular for wine gift packaging?', a: 'Soft-touch matte lamination with gold or silver hot foil stamping on the brand name is the top choice. Embossed logos and velvet-flocked interiors add a premium unboxing experience.' },
  ],
  'luxury-retail-paper-bags.html': [
    { q: 'What paper weight gives a luxury feel for retail bags?', a: '200–250 gsm C2S art paper or 180–230 gsm kraft paper is standard for a sturdy, premium-feel bag. We reinforce the bottom and handle attachment points for items up to 3 kg.' },
    { q: 'What handle options are available?', a: 'Twisted paper rope, flat ribbon, cotton cord, grosgrain ribbon and die-cut handles are all available. Handle material, colour and attachment method are matched to your brand aesthetic.' },
    { q: 'Can I add a ribbon tie or magnetic flap to the bag?', a: 'Yes. Ribbon tie closures, magnetic snap flaps and adhesive dot seals are available for a finished look. These features work best on structured bags with a flat bottom gusset.' },
  ],
  'custom-cosmetic-packaging-boxes.html': [
    { q: 'What material gives the best unboxing experience for cosmetics?', a: '350 gsm C1S board with soft-touch lamination and spot UV or foil stamping creates a premium tactile contrast. For rigid boxes, 2 mm greyboard wrapped in art paper with embossing is the luxury standard.' },
    { q: 'Can you match my brand’s exact Pantone colour across items?', a: 'Yes. We do Pantone spot colour matching with ΔE ≤ 2.0 tolerance across boxes, inserts and sleeves. A printed colour proof set is supplied for approval before bulk production.' },
    { q: 'What insert options hold cosmetic products in place?', a: 'EVA foam, flocked plastic trays, die-cut cardboard dividers and satin ribbon pulls are available. Each insert is custom-shaped to your bottle, jar or tube dimensions.' },
  ],
  'pre-roll-packaging-boxes.html': [
    { q: 'Can pre-roll boxes include child-resistant features?', a: 'Yes. We offer push-and-turn lids, slide-lock mechanisms and magnetic closures with locking tabs designed to meet child-resistant testing requirements for cannabis packaging.' },
    { q: 'What insert options hold pre-rolls securely during shipping?', a: 'EVA foam inserts, die-cut cardboard dividers and vacuum-formed PET trays are available. Each is custom-shaped to your pre-roll diameter, length and count per box.' },
    { q: 'What box styles are most popular for pre-roll packaging?', a: 'Slide drawer boxes, hinged-lid tuck boxes and magnetic closure boxes are the top three styles. Drawer boxes with a ribbon pull give the cleanest premium unboxing experience.' },
  ],
  'roll-labels-for-automatic-labeling.html': [
    { q: 'What adhesive types are available for roll labels?', a: 'Permanent acrylic (general purpose), removable (promotional), freezer-grade (−40 °C) and high-tack (textured or curved surfaces). We recommend testing adhesion on your actual container before bulk production.' },
    { q: 'Are your labels compatible with high-speed labeling machines?', a: 'Yes. We supply labels on 76 mm (3″) core rolls with consistent liner tension and either gap sensing or black-mark registration for accurate application at up to 200 labels per minute.' },
    { q: 'What printing quality can I expect on roll labels?', a: 'Up to 10 colours in rotogravure with 175 LPI resolution and ΔE ≤ 2.0 colour accuracy. Variable data such as batch codes and sequential numbering can be added inline during production.' },
  ],
  'custom-printed-tape.html': [
    { q: 'What tape base materials are available?', a: 'BOPP (standard, clear or coloured), kraft paper (eco-friendly, recyclable), PVC (high adhesion on rough surfaces) and reinforced fiberglass tape. BOPP is most popular for branded shipping tape.' },
    { q: 'What print options are available for custom tape?', a: 'Flexographic printing in 1–4 colours for logos and text. For photographic or gradient designs, we offer gravure printing up to 8 colours. Repeat length is matched to your box circumference.' },
    { q: 'What custom widths and roll lengths can I order?', a: 'Standard widths are 48 mm and 72 mm. Custom widths from 36 mm to 150 mm are available. Roll lengths range from 50 m to 1,000 m per roll depending on packing line speed.' },
  ],
  'custom-printed-tissue-paper.html': [
    { q: 'What tissue paper weights do you offer?', a: '17 gsm (standard, semi-transparent), 22 gsm (mid-weight, popular for fashion retail) and 28 gsm (heavy, premium feel for luxury unboxing). 22 gsm is the best balance of quality and cost.' },
    { q: 'How many colours can be printed on tissue paper?', a: 'Flexographic printing in 1–3 spot colours is standard. Full CMYK is available for complex patterns but adds to cost. White ink on coloured tissue stock is also an option for inverted designs.' },
    { q: 'Is your printed tissue paper safe for wrapping clothing and food?', a: 'Yes. We use acid-free, soy-based inks safe for direct contact with garments, shoes and non-greasy food items. The tissue does not transfer colour or leave residue on wrapped products.' },
  ],
};

const GENERIC_HTML_RE = /<p><strong>Can I print my own logo\?<\/strong><br\s*\/?>Yes\. We support custom logo printing, CMYK, Pantone color matching and surface finishes\.<\/p>\s*<p><strong>What is the MOQ\?<\/strong><br\s*\/?>The MOQ for custom production is 500 PCS\.<\/p>\s*<p><strong>How do I get a quote\?<\/strong><br\s*\/?>Send product type, size, material, artwork, quantity and delivery country by email or WhatsApp\.<\/p>/;

const GENERIC_SCHEMA_RE = /<script type="application\/ld\+json">\s*\{[^<]*"@type"\s*:\s*"FAQPage"[^<]*\}<\/script>/;

let changed = 0;
let errors = 0;

for (const [file, faqs] of Object.entries(FAQ_MAP)) {
  const filePath = path.join(DIR, file);
  if (!fs.existsSync(filePath)) {
    console.error(`SKIP (not found): ${file}`);
    errors++;
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // Build new HTML FAQ block
  const newHtml = faqs
    .map(f => `<p><strong>${f.q}</strong><br/>${f.a}</p>`)
    .join('\n');

  // Build new FAQPage JSON-LD
  const newSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };
  const newSchemaTag = `<script type="application/ld+json">${JSON.stringify(newSchema)}</script>`;

  // Replace HTML FAQ
  if (GENERIC_HTML_RE.test(html)) {
    html = html.replace(GENERIC_HTML_RE, newHtml);
  } else {
    console.error(`WARN (HTML FAQ not matched): ${file}`);
  }

  // Replace FAQPage JSON-LD
  if (GENERIC_SCHEMA_RE.test(html)) {
    html = html.replace(GENERIC_SCHEMA_RE, newSchemaTag);
  } else {
    console.error(`WARN (FAQPage schema not matched): ${file}`);
  }

  fs.writeFileSync(filePath, html);
  changed++;
  console.log(`REPLACED FAQ → ${file}`);
}

console.log(`\n${changed} files updated, ${errors} errors.`);
