const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const report = JSON.parse(
  fs.readFileSync(path.join(root, "recovered-pages-report.json"), "utf8")
);
const recovered = report.recovered || report.success || [];
const sitemapFiles = [
  path.join(root, "public", "sitemap.xml"),
  path.join(root, "content-site", "sitemap.xml"),
];
const lastmod = new Date().toISOString().slice(0, 10);

for (const sitemapFile of sitemapFiles) {
  let xml = fs.readFileSync(sitemapFile, "utf8");
  const existing = new Set(
    [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
  );
  const additions = [];

  for (const item of recovered) {
    const pathname =
      typeof item === "string" ? new URL(item).pathname : item.pathname;
    const url = `https://www.bestpackfactory.com${pathname}`;
    if (existing.has(url)) continue;
    additions.push(
      `  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.65</priority>\n  </url>`
    );
    existing.add(url);
  }

  if (additions.length) {
    xml = xml.replace(/\s*<\/urlset>\s*$/, `\n${additions.join("\n")}\n</urlset>\n`);
    fs.writeFileSync(sitemapFile, xml);
  }
  console.log(`${path.relative(root, sitemapFile)}: ${existing.size} URLs`);
}
