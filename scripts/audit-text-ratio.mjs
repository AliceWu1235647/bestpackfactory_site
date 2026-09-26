import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'content-site');
const SKIP = new Set(['ar', 'de', 'es', 'fr', 'ja']);
const results = [];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    if (fs.statSync(abs).isDirectory()) {
      if (!SKIP.has(name)) walk(abs);
    } else if (name.endsWith('.html')) {
      const content = fs.readFileSync(abs, 'utf8');
      const htmlLen = content.length;
      const text = content
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ').trim();
      const ratio = Math.round(text.length / htmlLen * 100);
      const words = text.split(' ').filter(w => w.length > 2).length;
      if (ratio < 15) {
        results.push({ ratio, words, rel: path.relative(root, abs).replace(/\\/g, '/') });
      }
    }
  }
}

walk(root);
results.sort((a, b) => a.ratio - b.ratio);
results.slice(0, 25).forEach(r => console.log(`${r.ratio}%  ${r.words}w  ${r.rel}`));
console.log(`\nTotal low-ratio pages: ${results.length}`);
