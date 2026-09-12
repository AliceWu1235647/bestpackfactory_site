import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const sourcePath = "content-site/products.html";
const html = readFileSync(sourcePath, "utf8");
const before = execFileSync("git", ["show", `HEAD:${sourcePath}`], { encoding: "utf8" });
const failures = [];

const matches = (value, pattern) => [...value.matchAll(pattern)].map((match) => match[1]);
const count = (value, needle) => value.split(needle).length - 1;
const textOnly = (value) => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

for (const marker of [
  "PRODUCT_ENTITY_HUB_20260912_START",
  "PRODUCT_ENTITY_HUB_20260912_END",
  "PRODUCT_DECISION_LAYER_20260912_START",
  "PRODUCT_DECISION_LAYER_20260912_END",
]) {
  if (count(html, marker) !== 1) failures.push(`${sourcePath}: marker ${marker} is missing or duplicated`);
}

const quickAnswer = html.match(/data-product-hub="buyer-quick-answer"[\s\S]*?<p>([\s\S]*?)<\/p>/i)?.[1] ?? "";
const quickAnswerWords = textOnly(quickAnswer).split(/\s+/).filter(Boolean).length;
if (quickAnswerWords < 80 || quickAnswerWords > 140) {
  failures.push(`${sourcePath}: buyer quick answer has ${quickAnswerWords} words; expected 80-140`);
}

const expectedFamilies = [
  "custom-boxes",
  "rigid-luxury",
  "flexible",
  "food-specialty",
  "bags-accessories",
  "containers",
];
const families = matches(html, /data-product-family="([^"]+)"/g);
if (JSON.stringify(families) !== JSON.stringify(expectedFamilies)) {
  failures.push(`${sourcePath}: expected the six approved product families in the approved order`);
}

const comparisonBlock = html.match(/<table[^>]+data-product-comparison="seven-formats"[\s\S]*?<\/table>/i)?.[0] ?? "";
const comparisonRows = count(comparisonBlock, "<tr>") - 1;
if (comparisonRows !== 7) failures.push(`${sourcePath}: expected 7 product comparison rows, found ${comparisonRows}`);

const cardPattern = /<article class="product-card[^"]*"[\s\S]*?<a href="([^"]+)"[\s\S]*?<img[^>]+src="([^"]+)"/g;
const baselineCards = [...before.matchAll(cardPattern)].map((match) => `${match[1]}|${match[2]}`);
const currentCards = [...html.matchAll(cardPattern)].map((match) => `${match[1]}|${match[2]}`);
if (baselineCards.length !== 97) failures.push(`${sourcePath}: protected baseline product-card count is ${baselineCards.length}, expected 97`);
if (JSON.stringify(currentCards) !== JSON.stringify(baselineCards)) {
  failures.push(`${sourcePath}: existing product-card URL/image sequence changed`);
}
if (count(html, "products-grid-fixed") !== count(before, "products-grid-fixed")) {
  failures.push(`${sourcePath}: protected 4-column product grid marker changed`);
}

for (const href of matches(
  html.match(/PRODUCT_ENTITY_HUB_20260912_START[\s\S]*?PRODUCT_DECISION_LAYER_20260912_END/)?.[0] ?? "",
  /href="(\/[^"]+)"/g,
)) {
  if (href === "/dielines") continue;
  const localPath = `content-site${href}`;
  if (!existsSync(localPath)) failures.push(`${sourcePath}: new internal link does not resolve to a source page: ${href}`);
}

const aiIndexes = ["content-site/ai-index.json", "public/ai-index.json"];
for (const file of aiIndexes) {
  const parsed = JSON.parse(readFileSync(file, "utf8"));
  const hub = parsed.product_family_hub;
  if (hub?.primary_url !== "https://www.bestpackfactory.com/products.html") {
    failures.push(`${file}: product_family_hub primary_url is missing or incorrect`);
  }
  if (!Array.isArray(hub?.families) || hub.families.length !== 6) {
    failures.push(`${file}: product_family_hub must describe exactly six families`);
  }
}

for (const file of ["content-site/llms.txt", "public/llms.txt"]) {
  const value = readFileSync(file, "utf8").toLowerCase();
  if (!value.includes("product family hub") || !value.includes("products.html")) {
    failures.push(`${file}: machine-readable product family hub summary is missing`);
  }
}

if (failures.length) {
  console.error("Product entity hub check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Product entity hub check passed: ${families.length} families, ${comparisonRows} comparison rows, ${currentCards.length} protected product cards, ${quickAnswerWords}-word buyer answer.`,
);
