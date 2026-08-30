const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "content-site");

function update(file, transform) {
  const before = fs.readFileSync(file, "utf8");
  const after = transform(before);
  if (after === before) throw new Error(`No changes applied to ${file}`);
  fs.writeFileSync(file, after);
  console.log(`Updated ${path.relative(root, file)}`);
}

update(path.join(root, "products.html"), (html) =>
  html
    .replace(
      /<title>Custom Packaging Products[\s\S]*?<\/title>/,
      "<title>Custom Packaging Products | MOQ 500 PCS | BestPackFactory</title>"
    )
    .replace(
      /<meta content="Browse 60\+ custom packaging products:[^"]*" name="description"\/>/,
      '<meta content="Compare 70+ custom packaging products for B2B sourcing, including boxes, pouches, coffee bags, pet food bags, labels and bottles. MOQ starts at 500 PCS." name="description"/>'
    )
    .replace(
      /<meta property="og:title" content="[^"]*"\/>/,
      '<meta property="og:title" content="Custom Packaging Products | MOQ 500 PCS | BestPackFactory"/>'
    )
    .replace(
      /<meta property="og:description" content="[^"]*"\/>/,
      '<meta property="og:description" content="Compare 70+ custom packaging products for B2B sourcing, including boxes, pouches, coffee bags, pet food bags, labels and bottles."/>'
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*"\/>/,
      '<meta name="twitter:title" content="Custom Packaging Products | MOQ 500 PCS | BestPackFactory"/>'
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*"\/>/,
      '<meta name="twitter:description" content="Compare 70+ custom packaging products for B2B sourcing, including boxes, pouches, coffee bags, pet food bags, labels and bottles."/>'
    )
    .replace("<h2>B2B Custom Packaging Products</h2>", "<h1>B2B Custom Packaging Products</h1>")
    .replace(
      "<p>No retail prices. Every product is OEM/customize and RFQ based.</p>",
      "<p>Compare custom boxes, flexible pouches, coffee and pet food bags, labels, bottles and specialty packaging. Products are quoted by specification and quantity; standard custom projects begin at MOQ 500 PCS.</p>"
    )
);

update(path.join(root, "products", "dog-food-flat-bottom-bags.html"), (html) => {
  const description =
    "Custom dog food flat bottom bags for pet brands. Compare fill weight, barrier, zipper, handle, artwork and drop-test requirements from MOQ 500 PCS.";
  html = html.replace(
    /<meta name="description" content="[^"]*"\/>/,
    `<meta name="description" content="${description}"/>`
  );
  html = html.replace(
    /<meta content="[^"]*" name="keywords"\/>/,
    '<meta content="dog food flat bottom bags, pet food packaging manufacturer, custom dog food bags, zipper pet food pouches, MOQ 500 PCS" name="keywords"/>'
  );
  html = html.replace(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    (block, raw) => {
      const data = JSON.parse(raw);
      data.description = description;
      data.category = "Pet Food Packaging";
      data.additionalProperty = [
        { "@type": "PropertyValue", name: "Bag style", value: "Flat-bottom pouch with project-specific zipper, handle and gusset options" },
        { "@type": "PropertyValue", name: "Material selection", value: "Confirmed from product fat content, aroma, target shelf life, fill weight and storage conditions" },
        { "@type": "PropertyValue", name: "Sample testing", value: "Fill-volume, seal, zipper, puncture, drop and packed-carton checks defined per project" },
        { "@type": "PropertyValue", name: "Artwork", value: "Print-ready artwork with barcode, lot-code and required information areas identified" },
        { "@type": "PropertyValue", name: "MOQ", value: "500 PCS per custom size and artwork" },
      ];
      return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
    }
  );
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      ["What information is needed to quote dog food flat bottom bags?", "Provide fill weight, product dimensions or target bag size, fat and aroma considerations, shelf-life target, zipper and handle requirements, artwork, quantity and destination country."],
      ["Why use a flat bottom bag for dog food?", "A flat bottom structure provides a broad base and multiple printable panels. Suitability depends on the intended fill weight, shelf presentation, filling method and transport testing."],
      ["What should be tested before production?", "Approve fill volume, seal and zipper performance, puncture resistance, handle usability where applicable, print rub, drop behavior and export-carton packing with the intended product."],
    ].map(([name, text]) => ({
      "@type": "Question",
      name,
      acceptedAnswer: { "@type": "Answer", text },
    })),
  };
  html = html.replace(
    "</head>",
    `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>\n</head>`
  );
  html = html
    .replace("<h2>Dog Food Flat Bottom Bags</h2>", "<h1>Dog Food Flat Bottom Bags</h1>")
    .replace(
      "<p>Custom dog food flat bottom bags with zipper, handle and high barrier material options.</p>",
      "<p>Custom dog food flat bottom bags combine a stable base with front, back, side-gusset and bottom panels for branding. Buyers should select the structure from the actual fill weight, kibble shape, fat and aroma profile, shelf-life target, zipper use and transport conditions.</p>"
    )
    .replace(
      /<p>BestPackFactory supplies this product[\s\S]*?<\/p>/,
      "<p>BestPackFactory supports B2B pet food packaging projects from MOQ 500 PCS. Final materials and test criteria are confirmed during sampling with the intended product rather than assigned from a generic bag specification.</p>"
    )
    .replace(
      /<h3>FAQ<\/h3>[\s\S]*?<a class="btn"/,
      '<h3>Flat-bottom bag sourcing focus</h3><p>For a comparable quotation, provide the intended dog food weight, product density, desired zipper or slider, carrying feature, target shelf life, artwork status and packed-carton requirements.</p><a class="btn"'
    );
  const section = `<section class="section">
<div class="eyebrow">Pet Food Packaging Manufacturer Checklist</div>
<h2>What pet food brands should confirm</h2>
<div class="spec-scroll"><table class="technical-spec-table"><tbody>
<tr><th>Product</th><td>Dry kibble, freeze-dried food, treats or supplement; include fat, aroma and sharp-edge considerations</td></tr>
<tr><th>Pack format</th><td>Flat bottom, quad seal or stand-up pouch selected from fill weight, shelf display and filling method</td></tr>
<tr><th>Closure</th><td>Press-to-close zipper, slider, handle or other feature tested with the intended pack weight</td></tr>
<tr><th>Approval</th><td>Filled sample checks for volume, seals, zipper, puncture, drop behavior and carton packing</td></tr>
</tbody></table></div>
<p>For broader sourcing guidance, visit the <a href="/industries/pet-food-packaging-supplier.html">pet food packaging supplier hub</a> or compare the complete <a href="/products/pet-food-bags.html">pet food bag range</a>.</p>
</section>
<section class="section faq-section">
<div class="eyebrow">Buyer Questions</div><h2>Dog food bag FAQ</h2>
<h3>What information is needed to quote dog food flat bottom bags?</h3><p>Provide fill weight, product dimensions or target bag size, fat and aroma considerations, shelf-life target, zipper and handle requirements, artwork, quantity and destination country.</p>
<h3>Why use a flat bottom bag for dog food?</h3><p>A flat bottom structure provides a broad base and multiple printable panels. Suitability depends on the intended fill weight, shelf presentation, filling method and transport testing.</p>
<h3>What should be tested before production?</h3><p>Approve fill volume, seal and zipper performance, puncture resistance, handle usability where applicable, print rub, drop behavior and export-carton packing with the intended product.</p>
</section>
`;
  return html.replace('<div class="bpf-whatsapp-chat">', `${section}<div class="bpf-whatsapp-chat">`);
});
