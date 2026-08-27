const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'content-site', 'products', 'pet-bottles-candy-pharma.html');
let html = fs.readFileSync(file, 'utf8');

const title = 'PET Bottles for Candy & Pharma | MOQ 500 PCS | BestPackFactory';
const description = 'Custom PET bottles for candy, supplements and pharmaceutical packaging. Compare food-grade resin, capacities, neck finishes, closures, tamper evidence, labeling and leak testing from MOQ 500 PCS.';
const productName = 'PET Bottles for Candy and Pharmaceutical Packaging';
const properties = [
  ['Bottle resin', 'Food-grade PET resin with clear, amber or custom color options; final grade confirmed for the intended contents and destination market'],
  ['Capacity range', '30 ml, 60 ml, 100 ml, 150 ml, 250 ml, 500 ml and custom-mold capacities'],
  ['Neck finish', '18/410, 20/410, 24/410, 28/410 and wide-mouth options selected for cap and filling line compatibility'],
  ['Closure options', 'Screw cap, flip-top cap, induction-seal liner, tamper-evident band and child-resistant closure where required'],
  ['Candy use', 'Wide-mouth jars and bottles for gummies, mints and confectionery; moisture barrier and closure fit confirmed by packed-product testing'],
  ['Pharma and supplement use', 'Bottle, cap, liner, label area and documentation requirements confirmed against the destination market and product risk'],
  ['Labeling', 'Pressure-sensitive label panel or full-wrap shrink sleeve with barcode, lot code and expiry-date areas reserved'],
  ['Leak and torque testing', 'Cap torque, liner seal, inversion leak and transport vibration tests defined during sample approval'],
  ['Packing', 'Clean PE bag, divider grid and export carton options selected to reduce scratching and deformation'],
  ['RFQ data', 'Capacity, neck size, cap type, liner, product contents, filling method, label format, quantity and destination country']
];

html = html
  .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
  .replace(/<meta\s+content="[^"]*"\s+name="description"\s*\/>/i, `<meta content="${description}" name="description"/>`)
  .replace(/<meta\s+content="[^"]*"\s+name="keywords"\s*\/>/i, '<meta content="PET bottles for candy, pharmaceutical PET bottles, supplement bottles, tamper-evident bottles, custom PET packaging, MOQ 500 PCS" name="keywords"/>')
  .replace(/<h1>PET Bottles<\/h1>/i, `<h1>${productName}</h1>`)
  .replace(/<p>Plastic bottles for pharma and candy<\/p>/i, '<p>Custom PET bottles and jars for candy, gummies, supplements and pharmaceutical packaging, with closure, liner, labeling and testing options confirmed for each project.</p>')
  .replace(/<h2>PET Bottles — Engineering Summary<\/h2>/i, `<h2>${productName} — Engineering Summary</h2>`)
  .replace(/<li>PET Bottles is quoted as a B2B custom packaging project with MOQ 500 PCS\.<\/li>/i, `<li>${productName} is quoted as a B2B custom packaging project with MOQ 500 PCS.</li>`);

const jsonLdPattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
html = html.replace(jsonLdPattern, (tag, payload) => {
  let data;
  try {
    data = JSON.parse(payload.trim());
  } catch {
    return tag;
  }
  if (data?.['@type'] !== 'Product') return tag;
  data.name = productName;
  data.description = description;
  data.category = 'PET Bottles for Candy, Supplements & Pharmaceutical Packaging';
  data.additionalProperty = properties.map(([name, value]) => ({
    '@type': 'PropertyValue',
    name,
    value
  }));
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
});

const rows = properties
  .map(([name, value]) => `<tr><th>${name}</th><td>${value}</td></tr>`)
  .join('\n');
html = html.replace(
  /(<table class="technical-spec-table">\s*<tbody>)[\s\S]*?(<\/tbody>\s*<\/table>)/i,
  `$1${rows}\n<tr><th>MOQ</th><td>500 PCS per custom size and closure configuration</td></tr>\n<tr><th>RFQ data required</th><td>Capacity, neck size, cap, liner, contents, label format, quantity and destination country</td></tr>$2`
);

fs.writeFileSync(file, html, 'utf8');
console.log(file);
