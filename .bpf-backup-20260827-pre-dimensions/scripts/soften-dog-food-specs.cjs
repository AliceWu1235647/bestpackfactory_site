const fs = require("fs");
const path = require("path");

const file = path.resolve(
  __dirname,
  "..",
  "content-site",
  "products",
  "dog-food-flat-bottom-bags.html"
);
let html = fs.readFileSync(file, "utf8");
const replacements = {
  "Recommended material structure":
    "Project-specific laminate or mono-material option selected from product, barrier, sealing and destination requirements",
  "Total laminate thickness":
    "Confirmed after fill-weight, puncture, seal and handling tests",
  "Oxygen barrier OTR":
    "Target agreed from product fat content, aroma sensitivity and required shelf life; test method confirmed per project",
  "Moisture barrier WVTR":
    "Target agreed from product moisture sensitivity, storage conditions and required shelf life",
  "Seal strength":
    "Acceptance target established during filled-sample and production approval",
  "Zipper type":
    "Press-to-close or slider options selected and tested against intended fill weight",
  "Puncture resistance target":
    "Confirmed with representative kibble or product during sample testing",
  "Drop test":
    "Filled-pouch drop protocol agreed from pack weight, distribution route and carton packing",
  "Color tolerance":
    "Compared with the approved proof or signed color standard",
  "Dimension tolerance":
    "Confirmed on the approved specification and production sample",
  "Quality inspection":
    "Inspection scope and acceptance criteria agreed in the purchase specification",
};

let count = 0;
for (const [label, value] of Object.entries(replacements)) {
  const pattern = new RegExp(
    `<tr><th>${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</th><td>[\\s\\S]*?</td></tr>`
  );
  if (pattern.test(html)) {
    html = html.replace(pattern, `<tr><th>${label}</th><td>${value}</td></tr>`);
    count++;
  }
}
fs.writeFileSync(file, html);
console.log(JSON.stringify({ replacedRows: count }, null, 2));
