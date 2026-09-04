// 在英文产品页的「Related packaging buyer resources」区块按语义追加相关博客交叉链接。
// - 已有 <ul class="internal-links"> 的页:在其后追加新的 <li data-xlink="blog">。
// - 无该区块的页:插入完整 section。
// - 幂等:按每个已注入的 blog slug 去重,已注入的跳过,只追加缺失的;重复运行安全。
// 运行:node scripts/add-product-blog-links.mjs

import fs from 'fs';
import path from 'path';
import map from './product-to-blog-map.mjs';

const ROOT = process.cwd();
const PROD_DIR = path.join(ROOT, 'content-site', 'products');
const BLOG_DIR = path.join(ROOT, 'content-site', 'blog');

function fail(msg) { console.error('\n[FAIL] ' + msg); process.exitCode = 1; }

// ---- 1. 校验:blog slug 都存在 ----
const existingBlogs = new Set(
  fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.html'))
);
const badBlog = [];
for (const [prod, links] of Object.entries(map)) {
  if (!links || !links.length) { badBlog.push(`${prod}: empty mapping`); continue; }
  for (const [slug] of links) {
    if (!existingBlogs.has(slug + '.html')) badBlog.push(`${prod} -> missing blog ${slug}`);
  }
}
if (badBlog.length) fail('Blog slug validation:\n  ' + badBlog.join('\n  '));

// ---- 2. 校验:产品 slug 都在磁盘上 ----
const existingProducts = new Set(
  fs.readdirSync(PROD_DIR).filter((f) => f.endsWith('.html'))
);
const badProd = Object.keys(map).filter((p) => !existingProducts.has(p));
if (badProd.length) fail('Product slug validation:\n  ' + badProd.join('\n  '));

if (process.exitCode) process.exit(1);

// ---- 3. 应用(按 slug 去重,且只针对「Related resources」区块) ----
let touched = 0, newSection = 0, unchanged = 0;
for (const [prod, links] of Object.entries(map)) {
  const file = path.join(PROD_DIR, prod);
  let html = fs.readFileSync(file, 'utf8');

  // 只处理「Related packaging buyer resources」所在 section 的 ul。
  // 定位到 anchor 之后遇到的第一个 <ul class="internal-links">，
  // 避开 Buyer Essentials 等其它区块(它们有自己的 ul)。
  const anchor = 'Related packaging buyer resources';
  const anchorIdx = html.indexOf(anchor);
  if (anchorIdx < 0) {
    // 无该区块:不注入,避免误入其它 blocks
    continue;
  }

  // 已注入的 slug 集合:仅统计 anchor 之后、该 section 内的 blog li
  const sectionStart = anchorIdx;
  const injected = new Set();
  const sectionSlice = html.slice(sectionStart);
  const sectionEnd = sectionSlice.indexOf('</section>');
  const within = sectionEnd >= 0 ? sectionSlice.slice(0, sectionEnd) : sectionSlice;
  const allBlogRe = /<li data-xlink="blog"><a href="\/blog\/([^"]+)\.html">[\s\S]*?<\/a><\/li>/g;
  let bm;
  while ((bm = allBlogRe.exec(within))) injected.add(bm[1]);

  const toAdd = links.filter(([slug]) => !injected.has(slug));
  if (!toAdd.length) { unchanged++; continue; }

  const blogLi = toAdd
    .map(([slug, anchorText]) =>
      `<li data-xlink="blog"><a href="/blog/${slug}.html">${anchorText}</a></li>`
    )
    .join('');

  // 在 anchor 所在 section 的 ul 中追加:取 anchor 之后第一个 ul
  const afterAnchor = html.slice(sectionStart);
  const ulRe = /<ul class="internal-links">/i;
  const ulMatch = afterAnchor.match(ulRe);
  if (ulMatch) {
    const ulIdx = sectionStart + ulMatch.index;
    const endRe = /<\/ul>/i;
    const endMatch = afterAnchor.slice(ulMatch.index).match(endRe);
    const closeIdx = ulIdx + (endMatch ? endMatch.index + '</ul>'.length : 0);
    html = html.slice(0, closeIdx) + blogLi + html.slice(closeIdx);
  } else {
    // 有 anchor 但无 ul:在 anchor 后插入完整 ul
    // 找到 h2 之后的位置插入
    const pMatch = /<\/h2>/i.exec(html.slice(sectionStart));
    const insertIdx = sectionStart + (pMatch ? pMatch.index + '</h2>'.length : 0);
    html = html.slice(0, insertIdx) +
      `<ul class="internal-links">${blogLi}</ul>` +
      html.slice(insertIdx);
    newSection++;
  }

  fs.writeFileSync(file, html, 'utf8');
  touched++;
}

console.log(`\n[DONE] Product pages updated: ${touched}, new ul sections: ${newSection}, unchanged (already injected): ${unchanged}.`);
