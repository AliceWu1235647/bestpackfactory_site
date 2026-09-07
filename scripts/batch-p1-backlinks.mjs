// P1 step 2: inject orphan backlinks into hosts' related-resource-cluster UL only.
// Targets the <ul class="internal-links"> that appears AFTER the cluster marker —
// pages also carry a buyer-essentials UL above it.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd(), 'content-site/products');

function injectIntoCluster(html, orphanHref, orphanText) {
  const marker = html.indexOf('related-resource-cluster');
  if (marker === -1) throw new Error('no cluster marker');
  const tail = html.slice(marker);
  const ulRe = /(<ul class="internal-links">)([\s\S]*?)(<\/ul>)/;
  const m = tail.match(ulRe);
  if (!m) throw new Error('no cluster internal-links ul');
  if (m[2].includes(orphanHref)) return html; // already present
  const entry = `\n    <li><a href="${orphanHref}">${orphanText}</a></li>`;
  const fixed = tail.replace(ulRe, (_, open, body, close) => open + entry + body + close);
  return html.slice(0, marker) + fixed;
}

// backlinks: [hostFile, orphanHref, orphanText]
const backlinks = [
  ['cannabis-mylar-bags.html', '/products/cannabis-stand-up-pouches.html', 'Cannabis Stand Up Pouches'],
  ['child-resistant-cannabis-mylar-bags.html', '/products/cannabis-stand-up-pouches.html', 'Cannabis Stand Up Pouches'],
  ['smell-proof-mylar-bags.html', '/products/cannabis-stand-up-pouches.html', 'Cannabis Stand Up Pouches'],
  ['custom-floral-paper-gift-bags-ribbon-closure.html', '/products/cannabis-stand-up-pouches.html', 'Cannabis Stand Up Pouches'],
  ['paper-bags.html', '/products/custom-paper-bags-wholesale.html', 'Custom Paper Bags Wholesale'],
  ['bakery-paper-bags.html', '/products/custom-paper-bags-wholesale.html', 'Custom Paper Bags Wholesale'],
  ['custom-embossed-paper-shopping-bags-ribbon-handles.html', '/products/custom-paper-bags-wholesale.html', 'Custom Paper Bags Wholesale'],
  ['custom-boxes.html', '/products/custom-boxes-moq-500.html', 'Custom Boxes MOQ 500'],
  ['custom-packaging-boxes.html', '/products/custom-boxes-moq-500.html', 'Custom Boxes MOQ 500'],
  ['custom-folding-cartons.html', '/products/custom-boxes-moq-500.html', 'Custom Boxes MOQ 500'],
  ['luxury-magnetic-boxes.html', '/products/custom-boxes-moq-500.html', 'Custom Boxes MOQ 500'],
];

for (const [file, href, text] of backlinks) {
  const p = resolve(ROOT, file);
  const html = readFileSync(p, 'utf-8');
  const out = injectIntoCluster(html, href, text);
  if (out !== html) writeFileSync(p, out);
  console.log('done:', file);
}
