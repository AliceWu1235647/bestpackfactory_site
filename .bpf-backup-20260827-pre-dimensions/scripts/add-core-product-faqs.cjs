const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const products = {
  "custom-boxes.html": [
    ["What information is needed to quote custom boxes?", "Provide the internal box dimensions, product weight, box style, board preference, printing, finish, quantity and destination country."],
    ["Which board should buyers choose for custom boxes?", "Paperboard suits lighter retail cartons, while corrugated flute structures are selected for greater shipping and stacking strength. Final board grade depends on product weight and distribution conditions."],
    ["Should buyers approve a sample before box production?", "Yes. A sample should confirm fit, structure, artwork position and finish before mass production. Shipping cartons may also require packing and stacking checks."],
  ],
  "flexible-packaging.html": [
    ["How is a flexible packaging material structure selected?", "Selection starts with the product, filling process, target shelf life, barrier requirement, seal temperature and destination market. The final laminate or mono-material structure is confirmed per project."],
    ["Which pouch format should a buyer choose?", "Stand-up pouches suit shelf display, flat-bottom bags add stability, side-gusset bags support larger fills, and roll stock is intended for compatible automatic packing equipment."],
    ["What should be tested before flexible packaging production?", "Approve print color, dimensions, seal performance and filling compatibility. Product-specific barrier, migration or transport testing may also be required."],
  ],
  "coffee-bags.html": [
    ["When does a coffee bag need a degassing valve?", "Freshly roasted coffee can release gas after packing. Buyers should confirm roasting, resting and filling conditions before deciding whether a one-way valve is required."],
    ["What information is needed for a coffee bag quote?", "Send fill weight, finished dimensions, pouch style, valve and zipper requirements, material preference, artwork, quantity and destination country."],
    ["How should coffee bag samples be approved?", "Check bag capacity with the actual beans, valve position, zipper usability, seal area, print color and packed-carton performance before production."],
  ],
  "food-packaging.html": [
    ["What must buyers confirm for food packaging materials?", "Confirm the food type, direct or indirect contact layer, filling temperature, storage conditions, shelf-life target and destination market before selecting materials."],
    ["Are food-contact documents the same for every project?", "No. Available declarations and test reports depend on the exact material, coating, supplier and destination requirement. Buyers should provide their document checklist before sampling."],
    ["What should a food packaging sample test include?", "Use the actual product or a representative filling test to check odor, grease or moisture resistance, heat response, sealing, stacking and transport conditions."],
  ],
  "pet-food-bags.html": [
    ["How do buyers choose barrier for pet food bags?", "Barrier selection depends on fat content, aroma sensitivity, target shelf life, pack size and storage conditions. Oily products may need stronger oxygen and aroma protection."],
    ["Which structure works for larger pet food packs?", "Flat-bottom and side-gusset formats are often evaluated for larger fills because they provide usable volume and shelf stability. Handle, zipper and puncture requirements must be tested with the real fill weight."],
    ["What should be tested before pet food bag production?", "Confirm fill volume, drop resistance, seal and zipper strength, puncture behavior, print rub and export-carton packing with the intended product weight."],
  ],
  "pharma-packaging.html": [
    ["What must a pharma packaging buyer specify?", "Provide the product format, carton or container dimensions, artwork control process, coding area, tamper-evident requirement, quantity and destination-market document checklist."],
    ["Can compliance be assumed from a generic packaging page?", "No. Regulatory, testing and documentation requirements must be confirmed for the exact material, product use and destination market before ordering."],
    ["What should a pharma carton sample confirm?", "Check fit with the primary pack and leaflet, text readability, barcode or DataMatrix placement, glue areas, tamper features and packing-line compatibility."],
  ],
  "cannabis-mylar-bags.html": [
    ["Who confirms cannabis packaging legal requirements?", "The buyer must confirm labeling, child-resistance and other legal requirements with qualified advisers in the destination market before artwork and structure approval."],
    ["Is a child-resistant feature automatically certified?", "No. A closure or format must not be treated as certified unless the applicable test evidence is supplied for the exact specification being purchased."],
    ["What is needed to quote cannabis mylar bags?", "Send bag dimensions, fill weight, material and barrier preference, closure requirement, artwork and warning areas, quantity and destination market."],
  ],
  "luxury-magnetic-boxes.html": [
    ["What affects the cost of a magnetic rigid box?", "Finished size, wrapped board thickness, magnet arrangement, insert material, paper choice, printing, foil, embossing and order quantity all affect the quotation."],
    ["How should an insert be specified?", "Provide product dimensions, weight, orientation and presentation goal. Paperboard, molded pulp, foam or other inserts should be sampled with the actual product."],
    ["What should buyers approve on a magnetic box sample?", "Check closure alignment, hinge movement, wrapped edges, insert fit, foil or embossing position, color and export-carton protection."],
  ],
};

let changed = 0;
for (const [name, faqs] of Object.entries(products)) {
  const file = path.join(root, "content-site", "products", name);
  let html = fs.readFileSync(file, "utf8");
  if (/"@type"\s*:\s*"FAQPage"/.test(html)) continue;
  const visible = `<section class="section faq-section">
<div class="eyebrow">Buyer Questions</div><h2>Frequently Asked Questions</h2>
${faqs.map(([question, answer]) => `<h3>${question}</h3><p>${answer}</p>`).join("\n")}
</section>
`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  const chatIndex = html.indexOf('<div class="bpf-whatsapp-chat">');
  if (chatIndex < 0) throw new Error(`Chat marker not found: ${name}`);
  html = `${html.slice(0, chatIndex)}${visible}${html.slice(chatIndex)}`;
  html = html.replace(
    /<\/head>/i,
    `<script type="application/ld+json">${JSON.stringify(schema)}</script>\n</head>`
  );
  fs.writeFileSync(file, html);
  changed++;
}
console.log(JSON.stringify({ targeted: Object.keys(products).length, changed }, null, 2));
