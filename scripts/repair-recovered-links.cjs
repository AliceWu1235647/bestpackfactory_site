const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const report = JSON.parse(
  fs.readFileSync(path.join(root, "recovered-pages-report.json"), "utf8")
);
const recovered = report.recovered || report.success || [];
const productSlugs = [
  "250g-coffee-bags-with-valve",
  "500g-flat-bottom-coffee-bags",
  "1kg-coffee-bean-bags",
  "custom-boxes",
  "cannabis-mylar-bags",
  "flexible-packaging",
  "smell-proof-mylar-bags",
  "luxury-magnetic-boxes",
  "wine-magnetic-gift-boxes",
  "labels-stickers",
  "pet-bottles",
  "tin-boxes",
];

let changed = 0;
for (const item of recovered) {
  const pathname = typeof item === "string" ? new URL(item).pathname : item.pathname;
  const file = path.join(root, "content-site", pathname.replace(/^\/+/, ""));
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, "utf8");
  const before = html;

  html = html
    .replace(/\/favicon\.svg/g, "/favicon.ico")
    .replace(/\/products\/products\.html/g, "/products.html");

  for (const slug of productSlugs) {
    html = html.replace(
      new RegExp(`href=["']/${slug}\\.html`, "g"),
      `href="/products/${slug}.html`
    );
  }

  if (html !== before) {
    fs.writeFileSync(file, html);
    changed++;
  }
}

console.log(JSON.stringify({ scanned: recovered.length, changed }, null, 2));
