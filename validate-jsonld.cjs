const fs = require('fs');
const path = require('path');

const builtRoot = path.join(process.cwd(), '.next', 'server', 'app');
const relativeFiles = [
  'index.html',
  path.join('products', 'custom-boxes.html'),
  path.join('blog', 'custom-packaging-supplier-comparison-guide.html'),
  path.join('blog', 'custom-packaging-rfq-parameter-guide.html'),
  path.join('blog', 'custom-packaging-format-decision-guide.html'),
  path.join('blog', 'custom-packaging-factory-direct-vs-trading-company-vs-marketplace-seller-guide.html'),
];
const files = relativeFiles.map(file => path.join(builtRoot, file)).filter(fs.existsSync);

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
