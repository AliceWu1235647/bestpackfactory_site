// 把 round3 三元组合并进主映射文件 product-to-blog-map.mjs(去重、按产品分组),并重写该文件。
import fs from 'fs';
import base from './product-to-blog-map.mjs';
import { ROUND3 } from './round3-map.mjs';

// 合并:base 已按产品分组。用 Map<product, Map<slug, anchor>>
const merged = new Map();
for (const [prod, entries] of Object.entries(base)) {
  if (!merged.has(prod)) merged.set(prod, new Map());
  for (const [slug, anchor] of entries) if (slug) merged.get(prod).set(slug, anchor);
}
for (const [prod, slug, anchor] of ROUND3) {
  if (!merged.has(prod)) merged.set(prod, new Map());
  if (!merged.get(prod).has(slug)) merged.get(prod).set(slug, anchor);
}

// 校验博客 slug 真实存在
const blogSet = new Set(fs.readdirSync('content-site/blog').filter(f => f.endsWith('.html')));
const bad = [];
const prodSet = new Set(fs.readdirSync('content-site/products').filter(f => f.endsWith('.html')));
for (const [prod, entries] of merged) {
  if (!prodSet.has(prod)) bad.push(`bad product: ${prod}`);
  for (const [slug] of entries) if (!blogSet.has(slug + '.html')) bad.push(`${prod} -> bad blog: ${slug}`);
}
if (bad.length) { console.error('[FAIL]\n' + bad.join('\n')); process.exit(1); }

let out = '// 产品页 → 相关博客交叉链接映射(合并去重版,自动生成)\n';
out += '// 键 = content-site/products/ 下实际存在的 slug;值 = [blogSlug, 锚文本] 数组。\n';
out += 'export default {\n';
for (const [prod, entries] of merged) {
  out += '  ' + JSON.stringify(prod) + ': [\n';
  for (const [slug, anchor] of entries) out += '    [' + JSON.stringify(slug) + ', ' + JSON.stringify(anchor) + '],\n';
  out += '  ],\n';
}
out += '};\n';
fs.writeFileSync('scripts/product-to-blog-map.mjs', out);

let total = 0, min = 1e9, max = 0, empty = 0;
for (const [p, e] of merged) {
  total += e.size; min = Math.min(min, e.size); max = Math.max(max, e.size); if (!e.size) empty++;
}
console.log(`merged map: ${merged.size} products, ${total} blog links, min/max per product = ${min}/${max}, empty=${empty}`);
