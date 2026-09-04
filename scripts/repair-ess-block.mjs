// 一次性修复:把误置入「Buyer Essentials」section 的 data-xlink="blog" <li>
// 全部移到「Related packaging buyer resources」所在 section 的 <ul class="internal-links">。
// 修复后 Buyer Essentials 只保留 7 条决策链接;产品-博客链统一落在 Related resources。
import fs from 'fs';
import path from 'path';
import map from './product-to-blog-map.mjs';

const PROD_DIR = 'content-site/products';
const ESS_MARK = 'data-buyer-essentials="20260830"';
const ESS_SLUGS = new Set([
  'how-to-choose-china-packaging-supplier',
  'custom-packaging-supplier-comparison-guide',
  'custom-packaging-moq-500-pcs-sourcing-guide',
  'custom-packaging-cost-breakdown-materials-shipping',
  'custom-packaging-sample-to-production-timeline-guide',
  'chinese-packaging-supplier-payment-terms',
  'packaging-shipping-cost-guide-china',
]);

let moved = 0;
for (const [prod] of Object.entries(map)) {
  const file = path.join(PROD_DIR, prod);
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes(ESS_MARK)) continue;

  // 1. 从 Buyer Essentials 的 ul 里移除所有非 essentials 的 data-xlink blog li
  const essStart = html.indexOf(ESS_MARK);
  // 找当前 section 的起始(向前找 <section)
  const secStart = html.lastIndexOf('<section', essStart);
  const secEnd = html.indexOf('</section>', essStart);
  if (secStart < 0 || secEnd < 0) continue;
  const essBlock = html.slice(secStart, secEnd);

  // 收集该块内的 blog li
  const liRe = /<li data-xlink="blog"><a href="\/blog\/([^"]+)\.html"[^>]*>[\s\S]*?<\/a><\/li>/g;
  const found = [];
  let m;
  while ((m = liRe.exec(essBlock))) {
    const slug = m[1];
    if (ESS_SLUGS.has(slug)) continue; // 保留 essentials
    found.push(m[0]);
  }
  if (!found.length) continue;

  const cleanedBlock = essBlock.replace(/<li data-xlink="blog">[\s\S]*?<\/li>/g, (item) => {
    const slugRe = /href="\/blog\/([^"]+)\.html"/;
    const s = (item.match(slugRe) || [])[1];
    return s && ESS_SLUGS.has(s) ? item : '';
  });

  // 把清理后的 block 写回
  html = html.slice(0, secStart) + cleanedBlock + html.slice(secEnd);

  // 2. 把移除的 items 追加到 Related resources 的 ul
  const anchor = 'Related packaging buyer resources';
  const aIdx = html.indexOf(anchor);
  if (aIdx < 0) continue;
  const after = html.slice(aIdx);
  const ulIdx = after.indexOf('<ul class="internal-links">');
  if (ulIdx < 0) continue;
  const absUl = aIdx + ulIdx;
  const ulOpenEnd = absUl + '<ul class="internal-links">'.length;
  const closeIdx = html.indexOf('</ul>', ulOpenEnd);
  if (closeIdx < 0) continue;

  const inject = found.join('');
  html = html.slice(0, closeIdx) + inject + html.slice(closeIdx);

  fs.writeFileSync(file, html, 'utf8');
  moved += found.length;
}

console.log(`[DONE] Repaired: moved ${moved} misplaced blog links into Related resources blocks.`);
