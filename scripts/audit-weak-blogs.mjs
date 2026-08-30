// 审计:映射覆盖 vs 磁盘实际注入;并列出仍弱链的博客是否在映射中。
import fs from 'fs';
import map from './product-to-blog-map.mjs';

const PROD_DIR = 'content-site/products';
const BLOG_DIR = 'content-site/blog';

const products = fs.readdirSync(PROD_DIR).filter(f => f.endsWith('.html'));
const blogs = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.html'));

const weak = [
  'candle-packaging-materials-guide','china-packaging-factory-audit-checklist',
  'custom-folding-carton-printing-guide','custom-packaging-for-subscription-boxes',
  'flat-pack-vs-assembled-packaging','how-to-reduce-packaging-weight',
  'luxury-candle-packaging','packaging-cost-reduction','packaging-factory-audit-guide',
  'packaging-for-baby-products','packaging-for-electronics-esd',
  'packaging-for-perfume-fragrance','packaging-incoterms-guide-fob-exw-ddp',
  'packaging-minimum-order-guide','packaging-payment-terms-guide',
  'perfume-packaging-design','pet-food-packaging-requirements',
  'rigid-box-vs-folding-carton','subscription-box-packaging',
  'tea-coffee-packaging-trends','wine-spirits-packaging-guide',
];

// 磁盘上每个博客实际被产品页链接的次数
const diskHits = {}; // slug -> count
for (const p of products) {
  const html = fs.readFileSync(`${PROD_DIR}/${p}`, 'utf8');
  const re = /href="\/blog\/([^"#]+?)\.html"/gi;
  let m;
  while ((m = re.exec(html))) {
    diskHits[m[1]] = (diskHits[m[1]] || 0) + 1;
  }
}

console.log('=== Weak blogs: in-map reference vs disk injection ===');
for (const w of weak) {
  // 映射中出现的次数
  let inMap = 0;
  for (const [prod, entries] of Object.entries(map)) {
    for (const [slug] of entries) if (slug === w) inMap++;
  }
  const disk = diskHits[w] || 0;
  console.log(`${w.padEnd(45)} map=${inMap}  disk=${disk}`);
}
