/**
 * fix-broken-external-links.mjs
 * Fixes Semrush "broken external links" warnings in blog HTML files by:
 * 1. ASTM store links (store.astm.org) - paid/gated, always 403 → remove href, keep anchor text
 * 2. Reddit links - posts get deleted → remove href, keep anchor text
 * 3. Malformed ISO CMS URLs (literal %20 in path or live/live double segment) → remove link entirely
 * 4. ISO standard links (iso.org/standard/) → add rel="nofollow" to prevent crawl penalty
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blogDir = path.join(root, 'content-site', 'blog');

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(abs));
    else if (entry.name.endsWith('.html')) files.push(abs);
  }
  return files;
}

let totalFiles = 0;
let totalChanges = 0;

for (const file of walk(blogDir)) {
  let html = fs.readFileSync(file, 'utf8');
  const before = html;

  // 1. ASTM store links → strip to plain text (keep anchor text, remove <a> tag)
  html = html.replace(/<a\s[^>]*href="https:\/\/store\.astm\.org[^"]*"[^>]*>([\s\S]*?)<\/a>/gi,
    (_, inner) => inner.trim());

  // 2. Reddit links → strip to plain text
  html = html.replace(/<a\s[^>]*href="https?:\/\/(www\.)?reddit\.com[^"]*"[^>]*>([\s\S]*?)<\/a>/gi,
    (_, _www, inner) => inner.trim());

  // 3. Malformed ISO CMS URLs with literal %20 in path → strip link
  html = html.replace(/<a\s[^>]*href="https:\/\/www\.iso\.org\/cms[^"]*%20[^"]*"[^>]*>([\s\S]*?)<\/a>/gi,
    (_, inner) => inner.trim());

  // 4. ISO CMS live/live double segment → strip link
  html = html.replace(/<a\s[^>]*href="https:\/\/www\.iso\.org\/cms\/live\/live\/[^"]*"[^>]*>([\s\S]*?)<\/a>/gi,
    (_, inner) => inner.trim());

  // 5. ISO standard links → add rel="nofollow" if not already present
  html = html.replace(/<a(\s[^>]*?)href="(https:\/\/www\.iso\.org\/standard\/[^"]+)"([^>]*)>/gi,
    (match, before, href, after) => {
      if (/rel\s*=/.test(before + after)) return match; // already has rel
      return `<a${before}href="${href}"${after} rel="nofollow">`;
    });

  if (html !== before) {
    fs.writeFileSync(file, html, 'utf8');
    const changes = (html !== before) ? 1 : 0;
    totalFiles++;
    totalChanges += changes;
    console.log('fixed:', path.relative(root, file));
  }
}

console.log(`\nDone: ${totalFiles} files modified`);
