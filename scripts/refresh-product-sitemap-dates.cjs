const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const date = new Date().toISOString().slice(0, 10);
const sitemapFiles = [
  path.join(root, "public", "sitemap.xml"),
  path.join(root, "content-site", "sitemap.xml"),
];

for (const file of sitemapFiles) {
  let xml = fs.readFileSync(file, "utf8");
  let changed = 0;
  xml = xml.replace(
    /(<url>\s*<loc>https:\/\/www\.bestpackfactory\.com\/products\/[^<]+\.html<\/loc>[\s\S]*?<lastmod>)[^<]+(<\/lastmod>)/g,
    (_, start, end) => {
      changed++;
      return `${start}${date}${end}`;
    }
  );
  fs.writeFileSync(file, xml);
  console.log(`${path.relative(root, file)}: refreshed ${changed} product URLs`);
}
