import fs from 'node:fs';
import path from 'node:path';

const PRODUCTS_DIR = path.join(process.cwd(), 'content-site', 'products');

function extractFaqPairs(html) {
  const pairs = [];
  const pattern = /<p><strong>([^<]+\?)<\/strong><br\s*\/?>([^<]+)<\/p>/gi;
  for (const m of html.matchAll(pattern)) {
    const q = m[1].trim();
    const a = m[2].trim();
    if (q && a) pairs.push({ q, a });
  }
  return pairs;
}

let changed = 0;

for (const file of fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith('.html')).sort()) {
  const filePath = path.join(PRODUCTS_DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');

  if (html.includes('FAQPage')) continue;

  const pairs = extractFaqPairs(html);
  if (pairs.length === 0) continue;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pairs.map(p => ({
      '@type': 'Question',
      name: p.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: p.a
      }
    }))
  };

  const tag = `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`;
  html = html.replace('</body>', `${tag}\n</body>`);
  fs.writeFileSync(filePath, html);
  changed++;
  console.log(`ADDED FAQPage (${pairs.length} Q&A) → ${file}`);
}

console.log(`\n${changed} pages got FAQPage schema.`);
