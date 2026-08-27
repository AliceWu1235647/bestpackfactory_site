const fs = require('fs');

const files = [
  '.next/server/app/products/custom-boxes.html',
  '.next/server/app/blog/custom-packaging-material-selection-guide.html',
  '.next/server/app/blog/custom-packaging-supplier-comparison-guide.html'
];

function decodeHtmlEntities(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const blocks = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(html))) blocks.push(match[1].trim());
  if (!blocks.length) throw new Error(`No JSON-LD blocks found: ${file}`);
  const types = blocks.map((block) => {
    const parsed = JSON.parse(decodeHtmlEntities(block));
    return Array.isArray(parsed) ? parsed.map((item) => item['@type']).join('|') : parsed['@type'];
  });
  console.log(`BUILT_SCHEMA_OK ${file} :: ${types.join(', ')}`);
}
