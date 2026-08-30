const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "content-site");
const files = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) walk(file);
    else if (name.endsWith(".html")) files.push(file);
  }
}
walk(root);

const patterns = ["鈥?", "鈽?", "脳", "卤", "鈮?", "馃", "鉁?", "螖E"];
const mojibake = Object.fromEntries(patterns.map((pattern) => [pattern, 0]));
const products = [];
const titles = new Map();
const descriptions = new Map();

for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  for (const pattern of patterns) {
    mojibake[pattern] += html.split(pattern).length - 1;
  }
  const title = (html.match(/<title>(.*?)<\/title>/is) || [])[1] || "";
  const description =
    (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) ||
      html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i) ||
      [])[1] || "";
  if (title) titles.set(title, [...(titles.get(title) || []), file]);
  if (description)
    descriptions.set(description, [...(descriptions.get(description) || []), file]);

  if (file.includes(`${path.sep}products${path.sep}`)) {
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&\w+;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    products.push({
      file: path.relative(root, file),
      words: text ? text.split(" ").length : 0,
      titleLength: title.length,
      descriptionLength: description.length,
      faq: /"@type"\s*:\s*"FAQPage"/.test(html),
      product: /"@type"\s*:\s*"Product"/.test(html),
    });
  }
}

const duplicates = (map) =>
  [...map.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([value, list]) => ({
      value,
      count: list.length,
      files: list.map((file) => path.relative(root, file)),
    }));

console.log(
  JSON.stringify(
    {
      htmlFiles: files.length,
      mojibake,
      duplicateTitles: duplicates(titles).length,
      duplicateTitleDetails: duplicates(titles),
      duplicateDescriptions: duplicates(descriptions).length,
      productPages: products.length,
      productUnder300Words: products.filter((x) => x.words < 300).length,
      productBadTitleLength: products.filter(
        (x) => x.titleLength < 30 || x.titleLength > 65
      ).length,
      productBadDescriptionLength: products.filter(
        (x) => x.descriptionLength < 100 || x.descriptionLength > 170
      ).length,
      productWithoutFaqSchema: products.filter((x) => !x.faq).length,
      productWithoutProductSchema: products.filter((x) => !x.product).length,
      thinnestProducts: products.sort((a, b) => a.words - b.words).slice(0, 20),
    },
    null,
    2
  )
);
