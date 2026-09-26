/**
 * SEO Fix: Shorten overly long product page title tags
 *
 * Problem: Titles like "Custom Spout Pouches | Technical Specification | MOQ 500 PCS | BestPackFactory"
 * are 90-110 chars — Google truncates at ~60 chars on desktop, Semrush flags as warning.
 *
 * Fix: Remove "| Technical Specification" from product page titles.
 * This saves ~27 chars while keeping the commercial intent keywords.
 *
 * Usage: node scripts/fix-title-lengths.mjs
 * Safe: Only modifies <title> tags in content-site/products/ files.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsDir = path.join(__dirname, '..', 'content-site', 'products');

let fixed = 0;
let skipped = 0;

for (const name of fs.readdirSync(productsDir)) {
  if (!name.endsWith('.html')) continue;
  const fpath = path.join(productsDir, name);
  let content = fs.readFileSync(fpath, 'utf8');

  const titleMatch = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!titleMatch) { skipped++; continue; }

  const oldTitle = titleMatch[1].trim();
  if (oldTitle.length <= 70) { skipped++; continue; }

  // Remove "| Technical Specification" — adds nothing to search intent
  let newTitle = oldTitle
    .replace(/\s*\|\s*Technical Specification\s*/gi, ' | ')
    .replace(/\s*\|\s*\|\s*/g, ' | ')
    .trim()
    .replace(/\s*\|\s*$/, '');

  // If still over 70 chars, also trim verbose suffixes
  if (newTitle.length > 70) {
    newTitle = newTitle
      .replace(/\s*\|\s*MOQ 500 PCS\s*\|\s*BestPackFactory\s*$/, ' | BestPackFactory')
      .replace(/\s*\|\s*Custom Packaging\s*\|\s*BestPackFactory\s*$/, ' | BestPackFactory')
      .trim();
  }

  if (newTitle === oldTitle) { skipped++; continue; }

  const newContent = content.replace(titleMatch[0], `<title>${newTitle}</title>`);
  fs.writeFileSync(fpath, newContent, 'utf8');
  console.log(`FIXED [${oldTitle.length}→${newTitle.length}]  ${name}`);
  console.log(`  Old: ${oldTitle}`);
  console.log(`  New: ${newTitle}`);
  fixed++;
}

console.log(`\nDone: ${fixed} titles shortened, ${skipped} files skipped.`);
