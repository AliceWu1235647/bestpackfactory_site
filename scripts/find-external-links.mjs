import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'content-site');
const SKIP_LANGS = new Set(['ar', 'de', 'es', 'fr', 'ja']);
const extLinks = new Map();

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    if (fs.statSync(abs).isDirectory()) {
      const part = path.basename(abs);
      if (SKIP_LANGS.has(part)) continue;
      walk(abs);
      continue;
    }
    if (!name.endsWith('.html')) continue;
    const content = fs.readFileSync(abs, 'utf8');
    const re = /href=["'](https?:\/\/(?!www\.bestpackfactory\.com)[^"'#? ]+)["']/gi;
    let m;
    while ((m = re.exec(content))) {
      const url = m[1];
      const domainMatch = url.match(/^https?:\/\/([^/]+)/);
      const domain = domainMatch ? domainMatch[1] : '';
      if (!extLinks.has(domain)) extLinks.set(domain, { count: 0, urls: new Set() });
      const entry = extLinks.get(domain);
      entry.count++;
      entry.urls.add(url);
    }
  }
}

walk(root);

const sorted = [...extLinks.entries()].sort((a, b) => b[1].count - a[1].count);
console.log('Top external domains linked:');
sorted.slice(0, 25).forEach(([d, e]) => {
  console.log(`${String(e.count).padStart(4)}  ${d}`);
  [...e.urls].slice(0, 3).forEach(u => console.log(`          ${u}`));
});
console.log(`\nTotal unique external domains: ${sorted.length}`);
console.log(`Total unique external URLs: ${sorted.reduce((s, [, e]) => s + e.urls.size, 0)}`);
