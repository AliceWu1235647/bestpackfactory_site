const fs = require('fs');

const files = [
  'C:\\Users\\Administrator\\AccioWork\\2026-07-17-07-39-20\\bestpackfactory_site\\.next\\server\\app\\index.html',
  'C:\\Users\\Administrator\\AccioWork\\2026-07-17-07-39-20\\bestpackfactory_site\\.next\\server\\app\\products\\custom-boxes.html.html',
  'C:\\Users\\Administrator\\AccioWork\\2026-07-17-07-39-20\\bestpackfactory_site\\.next\\server\\app\\blog\\custom-packaging-supplier-comparison-guide.html.html',
  'C:\\Users\\Administrator\\AccioWork\\2026-07-17-07-39-20\\bestpackfactory_site\\.next\\server\\app\\blog\\custom-packaging-rfq-parameter-guide.html.html',
  'C:\\Users\\Administrator\\AccioWork\\2026-07-17-07-39-20\\bestpackfactory_site\\.next\\server\\app\\blog\\custom-packaging-format-decision-guide.html.html',
  'C:\\Users\\Administrator\\AccioWork\\2026-07-17-07-39-20\\bestpackfactory_site\\.next\\server\\app\\blog\\custom-packaging-factory-direct-vs-trading-company-vs-marketplace-seller-guide.html.html',
];

const scriptRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
let failed = false;

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const blocks = [];
  scriptRe.lastIndex = 0;
  let match;
  while ((match = scriptRe.exec(html)) !== null) {
    blocks.push(match[1].trim());
  }

  const types = [];
  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        types.push(item && item['@type'] ? item['@type'] : 'unknown');
      }
    } catch (error) {
      failed = true;
      console.log('FAIL', file, error.message);
    }
  }

  console.log((blocks.length ? 'OK' : 'NO_JSONLD'), file, `blocks=${blocks.length}`, `types=${types.join('|')}`);
}

process.exit(failed ? 1 : 0);
