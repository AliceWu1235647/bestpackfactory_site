import fs from 'node:fs';
import path from 'node:path';

const PRODUCTS_DIR = path.join(process.cwd(), 'content-site', 'products');

const FLEXIBLE = [
  '1kg-coffee-bean-bags.html', '250g-coffee-bags-with-valve.html',
  '500g-flat-bottom-coffee-bags.html', 'bakery-paper-bags.html',
  'cannabis-child-resistant-bags.html', 'cannabis-flower-packaging-bags.html',
  'cannabis-mylar-bags.html', 'cbd-gummies-packaging-bags.html',
  'child-resistant-cannabis-mylar-bags.html', 'coffee-bags.html',
  'collagen-powder-packaging-pouches.html', 'custom-tea-packaging-bags.html',
  'flexible-packaging.html', 'kraft-paper-coffee-bags.html',
  'luxury-retail-paper-bags.html', 'matte-black-coffee-bags.html',
  'pet-food-bags.html', 'protein-powder-stand-up-pouches.html',
  'smell-proof-mylar-bags.html',
];

const PAPER_BOXES = [
  'bakery-donut-packaging-boxes.html', 'burger-packaging-boxes.html',
  'custom-boxes.html', 'custom-cosmetic-packaging-boxes.html',
  'fried-chicken-packaging-boxes.html', 'fries-packaging-boxes.html',
  'gs1-pharma-packaging-boxes.html', 'pharma-packaging.html',
  'pharmaceutical-folding-cartons.html', 'pre-roll-packaging-boxes.html',
  'sandwich-packaging-boxes.html', 'shawarma-packaging-boxes.html',
  'vitamin-supplement-packaging-boxes.html', 'weight-loss-pill-packaging-boxes.html',
  'wine-magnetic-gift-boxes.html',
];

const CORRUGATED = [
  'custom-pizza-boxes.html', 'pizza-packaging-boxes.html',
];

const LABELS = [
  'labels-stickers.html', 'roll-labels-for-automatic-labeling.html',
  'custom-printed-tape.html',
];

const TIN = ['tin-boxes.html'];
const BOTTLES = ['pet-bottles.html'];
const TISSUE = ['custom-printed-tissue-paper.html', 'tissue-paper-packaging.html'];

const TOLERANCE_MAP = new Map();
for (const f of FLEXIBLE) TOLERANCE_MAP.set(f, '±2 mm for flexible packaging');
for (const f of PAPER_BOXES) TOLERANCE_MAP.set(f, '±1.5 mm for paper boxes');
for (const f of CORRUGATED) TOLERANCE_MAP.set(f, '±2 mm for corrugated board');
for (const f of LABELS) TOLERANCE_MAP.set(f, '±0.5 mm for die-cut labels and tape');
for (const f of TIN) TOLERANCE_MAP.set(f, '±0.3 mm for tinplate');
for (const f of BOTTLES) TOLERANCE_MAP.set(f, '±1 mm for blow-molded bottles');
for (const f of TISSUE) TOLERANCE_MAP.set(f, '±1 mm for tissue paper products');

const BOILERPLATE_RE = /±2 mm for flexible packaging; ±1\.5 mm for paper boxes(?:\s+unless stated)?/g;

let changed = 0;
let dupMoqFixed = 0;

for (const file of fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith('.html'))) {
  const filePath = path.join(PRODUCTS_DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');
  let fileChanged = false;

  if (BOILERPLATE_RE.test(html)) {
    BOILERPLATE_RE.lastIndex = 0;
    const replacement = TOLERANCE_MAP.get(file);
    if (replacement) {
      html = html.replace(BOILERPLATE_RE, replacement);
      fileChanged = true;
    }
  }

  // Fix duplicate MOQ rows in tin-boxes.html
  if (file === 'tin-boxes.html') {
    const dupPattern = /<tr><th>MOQ<\/th><td>500 PCS for existing mold; custom mold MOQ confirmed by size<\/td><\/tr>\s*<tr><th>RFQ data<\/th><td>[^<]+<\/td><\/tr>\s*<tr><th>MOQ<\/th><td>500 PCS per custom size \/ artwork<\/td><\/tr>/;
    if (dupPattern.test(html)) {
      html = html.replace(dupPattern, '<tr><th>MOQ</th><td>500 PCS for existing mold; custom mold MOQ confirmed by size</td></tr>');
      fileChanged = true;
      dupMoqFixed++;
    }
  }

  if (fileChanged) {
    fs.writeFileSync(filePath, html);
    changed++;
    const tol = TOLERANCE_MAP.get(file) || '(no mapping)';
    console.log(`FIXED ${file} → ${tol}`);
  }
}

console.log(`\n${changed} files updated, ${dupMoqFixed} duplicate MOQ rows removed.`);
