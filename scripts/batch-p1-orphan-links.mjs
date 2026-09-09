// P1: internal links for 3 orphan keyword pages.
// 1) append a related-resource-cluster section to each orphan's body (before </footer>)
// 2) inject an <li> pointing at each orphan into semantically related host pages' clusters
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd(), 'content-site/products');
const CLUSTER_ATTR = 'data-internal-link-cluster="20260907_p1"';

const li = (href, text, xlink) =>
  `\n    <li${xlink ? ` data-xlink="${xlink}"` : ''}><a href="${href}">${text}</a></li>`;

// anchor inserted right before the footer close tag
function appendCluster(html, links) {
  const section =
    `\n<section class="section related-resource-cluster" ${CLUSTER_ATTR}><div class="section-head"><div><div class="eyebrow">Continue your research</div>` +
    `<h2>Related packaging buyer resources</h2><p>Use these closely related guides to compare specifications, prepare an RFQ and choose the right packaging path.</p>` +
    `</div></div><ul class="internal-links">${links.join('')}\n  </ul></section>`;
  const idx = html.lastIndexOf('</footer>');
  if (idx === -1) throw new Error('no </footer>');
  return html.slice(0, idx) + section + html.slice(idx);
}

// insert an <li> for `orphanHref`/`orphanText` into the first internal-links <ul> of a holder page
function injectIntoCluster(html, orphanHref, orphanText) {
  const ulRe = /(<ul class="internal-links">)([\s\S]*?)(<\/ul>)/;
  const m = html.match(ulRe);
  if (!m) throw new Error('no internal-links ul');
  if (m[2].includes(orphanHref)) return html; // already present
  const li = `\n    <li><a href="${orphanHref}">${orphanText}</a></li>`;
  return html.replace(ulRe, (_, open, body, close) => open + li + body + close);
}

function edit(file, fn) {
  const p = resolve(ROOT, file);
  const out = fn(readFileSync(p, 'utf-8'));
  if (out !== readFileSync(p, 'utf-8').toString()) {
    writeFileSync(p, out);
  }
  return p;
}

// ---- Step 1: give each orphan its own cluster ----
const orphans = {
  'cannabis-stand-up-pouches.html': [
    li('/products/cannabis-mylar-bags.html', 'Cannabis Mylar Bags'),
    li('/products/child-resistant-cannabis-mylar-bags.html', 'Child Resistant Cannabis Mylar Bags'),
    li('/products/smell-proof-mylar-bags.html', 'Smell Proof Mylar Bags'),
    li('/products/custom-cannabis-packaging.html', 'Custom Cannabis Packaging'),
    li('/products/cannabis-flower-packaging-bags.html', 'Cannabis Flower Packaging Bags'),
    li('/blog/cannabis-mylar-bags-b2b-sourcing-guide.html', 'Cannabis Mylar Bags B2B Guide', 'blog'),
    li('/blog/cannabis-packaging-compliance.html', 'Cannabis Packaging Compliance', 'blog'),
  ],
  'custom-paper-bags-wholesale.html': [
    li('/products/paper-bags.html', 'Paper Bags'),
    li('/products/paper-bags.html', 'Custom Paper Bags'),
    li('/products/bakery-paper-bags.html', 'Bakery Paper Bags'),
    li('/products/luxury-retail-paper-bags.html', 'Luxury Retail Paper Bags'),
    li('/products/custom-embossed-paper-shopping-bags-ribbon-handles.html', 'Embroidered Shopping Bags with Ribbon Handles'),
    li('/blog/custom-paper-bag-sizes-guide.html', 'Custom Paper Bag Sizes Guide', 'blog'),
    li('/blog/kraft-paper-packaging-guide.html', 'Kraft Paper Packaging Guide', 'blog'),
  ],
  'custom-boxes-moq-500.html': [
    li('/products/custom-boxes.html', 'Custom Boxes'),
    li('/products/custom-packaging-boxes.html', 'Custom Packaging Boxes'),
    li('/products/custom-folding-cartons.html', 'Custom Folding Cartons'),
    li('/products/luxury-magnetic-boxes.html', 'Luxury Magnetic Boxes'),
    li('/products/custom-luxury-gift-boxes-manufacturer-premium-rigid-gift-packaging.html', 'Luxury Rigid Gift Boxes'),
    li('/blog/custom-packaging-moq-500-pcs-sourcing-guide.html', 'Custom Packaging MOQ 500 pcs', 'blog'),
    li('/blog/custom-mailer-box-design-guide.html', 'Custom Mailer Box Design Guide', 'blog'),
  ],
};

// ---- Step 2: inject orphan links into related hosts' existing clusters ----
const backlinks = [
  // cannabis-stand-up-pouches
  ['cannabis-mylar-bags.html', '/products/cannabis-stand-up-pouches.html', 'Cannabis Stand Up Pouches'],
  ['child-resistant-cannabis-mylar-bags.html', '/products/cannabis-stand-up-pouches.html', 'Cannabis Stand Up Pouches'],
  ['smell-proof-mylar-bags.html', '/products/cannabis-stand-up-pouches.html', 'Cannabis Stand Up Pouches'],
  ['custom-floral-paper-gift-bags-ribbon-closure.html', '/products/cannabis-stand-up-pouches.html', 'Cannabis Stand Up Pouches'],
  // custom-paper-bags-wholesale
  ['paper-bags.html', '/products/custom-paper-bags-wholesale.html', 'Custom Paper Bags Wholesale'],
  ['bakery-paper-bags.html', '/products/custom-paper-bags-wholesale.html', 'Custom Paper Bags Wholesale'],
  ['custom-embossed-paper-shopping-bags-ribbon-handles.html', '/products/custom-paper-bags-wholesale.html', 'Custom Paper Bags Wholesale'],
  // custom-boxes-moq-500
  ['custom-boxes.html', '/products/custom-boxes-moq-500.html', 'Custom Boxes MOQ 500'],
  ['custom-packaging-boxes.html', '/products/custom-boxes-moq-500.html', 'Custom Boxes MOQ 500'],
  ['custom-folding-cartons.html', '/products/custom-boxes-moq-500.html', 'Custom Boxes MOQ 500'],
  ['luxury-magnetic-boxes.html', '/products/custom-boxes-moq-500.html', 'Custom Boxes MOQ 500'],
];

const touched = new Set();
for (const [file, links] of Object.entries(orphans)) {
  const p = edit(file, h => appendCluster(h, links));
  touched.add(p);
}
for (const [file, href, text] of backlinks) {
  const p = edit(file, h => injectIntoCluster(h, href, text));
  touched.add(p);
}

console.log('Touched files:', touched.size);
for (const t of touched) console.log(' -', t);
