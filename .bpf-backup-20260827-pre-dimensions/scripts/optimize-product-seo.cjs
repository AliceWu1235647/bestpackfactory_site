const fs = require("fs");
const path = require("path");

const productsDir = path.resolve(__dirname, "..", "content-site", "products");
const files = fs
  .readdirSync(productsDir)
  .filter((name) => name.endsWith(".html"))
  .map((name) => path.join(productsDir, name));

const decode = (value) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

function compactName(name, max = 25) {
  let value = name
    .replace(/\s*\|\s*.*$/g, "")
    .replace(/\bManufacturer\b/gi, "")
    .replace(/\bFactory Direct\b/gi, "")
    .replace(/\bPremium\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (value.length <= max) return value;
  const words = value.split(" ");
  value = "";
  for (const word of words) {
    const next = value ? `${value} ${word}` : word;
    if (next.length > max) break;
    value = next;
  }
  return value || name.slice(0, max).trim();
}

let changed = 0;
for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  const heading =
    (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
      html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) ||
      [])[1] || path.basename(file, ".html").replace(/-/g, " ");
  const fullName = decode(heading);
  const slug = path.basename(file);
  const titleNameOverrides = {
    "cannabis-child-resistant-bags.html": "Cannabis CR Pouches",
    "child-resistant-cannabis-mylar-bags.html": "Child Resistant Mylar Bags",
    "custom-cosmetic-packaging-boxes.html": "Cosmetic Packaging Boxes",
    "custom-cosmetic-packaging.html": "Custom Cosmetic Packaging",
  };
  const shortName = titleNameOverrides[slug] || compactName(fullName);
  const title = `${shortName} | MOQ 500 PCS | BestPackFactory`;
  let description = `Source ${fullName} from MOQ 500 PCS with custom size, material, printing and finish options. Get sampling, QC and worldwide B2B shipping support.`;
  if (description.length > 165) {
    description = `Source ${shortName} from MOQ 500 PCS with custom size, material, printing and finish options. Get sampling, QC and worldwide B2B shipping support.`;
  }

  html = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
    .replace(
      /<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i,
      `<meta name="description" content="${description}"/>`
    )
    .replace(
      /<meta\b(?=[^>]*\bproperty=["']og:title["'])[^>]*>/i,
      `<meta property="og:title" content="${title}"/>`
    )
    .replace(
      /<meta\b(?=[^>]*\bproperty=["']og:description["'])[^>]*>/i,
      `<meta property="og:description" content="${description}"/>`
    )
    .replace(
      /<meta\b(?=[^>]*\bname=["']twitter:title["'])[^>]*>/i,
      `<meta name="twitter:title" content="${title}"/>`
    )
    .replace(
      /<meta\b(?=[^>]*\bname=["']twitter:description["'])[^>]*>/i,
      `<meta name="twitter:description" content="${description}"/>`
    );

  html = html.replace(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi,
    (block, raw) => {
      try {
        const data = JSON.parse(raw);
        if (!["Product", "WebPage", "CollectionPage"].includes(data["@type"])) {
          return block;
        }
        if (data["@type"] === "Product") data.description = description;
        if (data["@type"] === "WebPage" || data["@type"] === "CollectionPage") {
          data.name = title;
          data.description = description;
        }
        return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
      } catch {
        return block;
      }
    }
  );

  if (html !== before) {
    fs.writeFileSync(file, html);
    changed++;
  }
}

console.log(JSON.stringify({ scanned: files.length, changed }, null, 2));
