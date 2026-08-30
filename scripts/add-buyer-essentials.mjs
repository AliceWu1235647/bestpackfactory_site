// 在英文产品页的「Related packaging buyer resources」section 之前插入统一的
// 「Buyer essentials」采购决策清单块,每页 7 篇普适性采购决策博客交叉链接。
// 幂等:块带 data-buyer-essentials="20260830" 标记;已含则跳过。
// 运行:node scripts/add-buyer-essentials.mjs

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PROD_DIR = path.join(ROOT, 'content-site', 'products');
const BLOG_DIR = path.join(ROOT, 'content-site', 'blog');
const MARK = 'data-buyer-essentials="20260830"';

const ESSENTIALS = [
  ['how-to-choose-china-packaging-supplier', 'How to Choose a China Packaging Supplier'],
  ['custom-packaging-supplier-comparison-guide', 'Factory vs Trading Company vs Marketplace Seller'],
  ['custom-packaging-moq-500-pcs-sourcing-guide', 'Custom Packaging MOQ 500 pcs'],
  ['custom-packaging-cost-breakdown-materials-shipping', 'Packaging Cost Breakdown: Materials & Shipping'],
  ['custom-packaging-sample-to-production-timeline-guide', 'Sample to Mass Production Timeline'],
  ['chinese-packaging-supplier-payment-terms', 'Chinese Supplier Payment Terms'],
  ['packaging-shipping-cost-guide-china', 'Shipping Cost from China'],
];

// 校验博客 slug 存在
const blogSet = new Set(fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.html')));
const bad = ESSENTIALS.filter(([slug]) => !blogSet.has(slug + '.html'));
if (bad.length) {
  console.error('[FAIL] Missing blog slugs: ' + bad.map(b => b[0]).join(', '));
  process.exit(1);
}

const block = (ess) =>
  '<section class="buyer-essentials" data-buyer-essentials="20260830">' +
  '<h2>Buyer Essentials: Ordering Custom Packaging from China</h2>' +
  '<p>Before you send an RFQ, work through these seven sourcing decisions so your quote, MOQ and lead time are realistic.</p>' +
  '<ul class="internal-links">' +
  ess.map(([slug, anchor]) =>
    `<li data-xlink="blog"><a href="/blog/${slug}.html">${anchor}</a></li>`
  ).join('') +
  '</ul></section>';

let modified = 0, skipped = 0, noAnchor = 0;
const files = fs.readdirSync(PROD_DIR).filter(f => f.endsWith('.html'));
for (const f of files) {
  const file = path.join(PROD_DIR, f);
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes(MARK)) { skipped++; continue; }

  const anchor = 'Related packaging buyer resources';
  const idx = html.indexOf(anchor);
  if (idx < 0) { noAnchor++; continue; }

  const insertAt = html.lastIndexOf('<section', idx);
  const before = html.slice(0, insertAt);
  const rest = html.slice(insertAt);
  html = before + block(ESSENTIALS) + rest;
  fs.writeFileSync(file, html, 'utf8');
  modified++;
}

console.log(`\n[DONE] Buyer essentials inserted: ${modified} pages, ${skipped} already present, ${noAnchor} without anchor.`);
