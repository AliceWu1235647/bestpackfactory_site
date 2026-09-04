const fs = require('fs');
const path = require('path');

const productsDir = path.join(process.cwd(), 'content-site', 'products');
const jsonLdPattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

let filesChanged = 0;
let productsChanged = 0;

for (const name of fs.readdirSync(productsDir)) {
  if (!name.endsWith('.html')) continue;

  const file = path.join(productsDir, name);
  const original = fs.readFileSync(file, 'utf8');
  let changedInFile = 0;

  const updated = original.replace(jsonLdPattern, (tag, payload) => {
    let data;
    try {
      data = JSON.parse(payload.trim());
    } catch {
      return tag;
    }

    const nodes = Array.isArray(data) ? data : [data];
    for (const node of nodes) {
      if (!node || node['@type'] !== 'Product') continue;

      if (Object.prototype.hasOwnProperty.call(node, 'offers')) {
        delete node.offers;
        changedInFile += 1;
      }

      if (!node.mainEntityOfPage) {
        const slug = path.basename(name, '.html');
        node.mainEntityOfPage = `https://www.bestpackfactory.com/products/${slug}.html`;
        changedInFile += 1;
      }
    }

    return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
  });

  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    filesChanged += 1;
    productsChanged += changedInFile;
  }
}

console.log(JSON.stringify({ filesChanged, productsChanged }));
