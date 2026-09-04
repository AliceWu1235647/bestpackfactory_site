const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const reportPath = path.join(root, "recovered-pages-report.json");
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const urls = report.recovered || report.success || [];

let changed = 0;
for (const item of urls) {
  const pathname = typeof item === "string" ? new URL(item).pathname : item.pathname;
  const relative = pathname.replace(/^\/+/, "");
  const file = path.join(root, "content-site", relative);
  if (!fs.existsSync(file)) continue;

  let html = fs.readFileSync(file, "utf8");
  const before = html;

  html = html
    .replace(/<link\b[^>]*href=["'][^"']*\/_next\/[^"']*["'][^>]*>/gi, "")
    .replace(/<script\b[^>]*src=["'][^"']*\/_next\/[^"']*["'][^>]*>\s*<\/script>/gi, "")
    .replace(/<script\b[^>]*>\s*\(?self\.__next[\s\S]*?<\/script>/gi, "")
    .replace(/<div hidden="">[\s\S]*?<!--\/\$--><\/div>/i, "")
    .replace(/Common Mistake To Avoid/g, "Common Mistake to Avoid")
    .replace(
      /ask document needs before sample approval This keeps the project tied instead of only a mockup or reference photo\./gi,
      "Confirm documentation requirements before sample approval. This keeps the project tied to the destination market, contact layer and actual production conditions rather than only a mockup or reference photo."
    )
    .replace(
      /requesting documents after goods are finished\. This usually creates/gi,
      "Requesting documents only after goods are finished can create"
    );

  // Keep one BreadcrumbList when historical output contains duplicate breadcrumb schemas.
  let breadcrumbSeen = false;
  html = html.replace(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi,
    (block, json) => {
      try {
        const data = JSON.parse(json);
        if (data && data["@type"] === "BreadcrumbList") {
          if (breadcrumbSeen) return "";
          breadcrumbSeen = true;
        }
        if (data && data["@type"] === "Product") {
          if (data.offers && !data.offers.price && !data.offers.lowPrice) {
            delete data.offers;
          }
          data.mainEntityOfPage = data.url;
          return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
        }
      } catch {
        // Keep malformed blocks for the validator to report explicitly.
      }
      return block;
    }
  );

  html = html.replace(
    /\/assets\/products\/medical-aesthetic-packaging-boxes-01\.(?:webp|avif)/g,
    "/assets/products/pharma-packaging-01.webp"
  );

  if (html !== before) {
    fs.writeFileSync(file, html);
    changed++;
  }
}

console.log(JSON.stringify({ scanned: urls.length, changed }, null, 2));
