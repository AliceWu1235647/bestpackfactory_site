import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'content-site');
const SKIP_LANGS = new Set(['ar', 'de', 'es', 'fr', 'ja']);

const longTitles = [];
const thinPages = [];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    if (fs.statSync(abs).isDirectory()) {
      walk(abs);
    } else if (name.endsWith('.html')) {
      const rel = path.relative(root, abs).replace(/\\/g, '/');
      const parts = rel.split('/');
      if (SKIP_LANGS.has(parts[0])) continue;

      const content = fs.readFileSync(abs, 'utf8');

      // Check title length
      const titleMatch = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (titleMatch) {
        const title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
        if (title.length > 70) {
          longTitles.push({ len: title.length, path: rel, title });
        }
      }

      // Check word count
      const body = content
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const words = body.split(' ').filter(w => w.length > 2).length;
      if (words < 200) {
        thinPages.push({ words, path: rel });
      }
    }
  }
}

walk(root);

console.log('\n=== TITLE TOO LONG (>70 chars) ===');
longTitles.sort((a, b) => b.len - a.len);
longTitles.forEach(r => {
  console.log(`${r.len}  ${r.path}`);
  console.log(`    ${r.title}`);
});

console.log('\n=== THIN PAGES (<200 words) ===');
thinPages.sort((a, b) => a.words - b.words);
thinPages.forEach(r => {
  console.log(`${r.words} words  ${r.path}`);
});

console.log(`\nSummary: ${longTitles.length} long titles, ${thinPages.length} thin pages`);
