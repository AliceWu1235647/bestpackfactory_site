import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, '..', 'content-site', 'products.html');

let html = fs.readFileSync(file, 'utf8');

// Remove Alibaba CDN dns-prefetch and preconnect
html = html.replace('<link rel="dns-prefetch" href="//sc02.alicdn.com"/>\n', '');
html = html.replace('<link rel="preconnect" href="https://sc02.alicdn.com" crossorigin/>', '');

// Replace Alibaba CDN img src with local assets
const replacements = [
  ['https://sc02.alicdn.com/kf/H78bad36b45c34ee0a62ffa69d234cb27C.png', 'assets/products/custom-spout-pouches-sauce-baby-food-01.webp'],
  ['https://sc02.alicdn.com/kf/H5d3fc2f4c2464a61b46521c37cfd01bbB.png', 'assets/products/custom-compostable-stand-up-pouches-01.webp'],
  ['https://sc02.alicdn.com/kf/Hc4a7bc2525aa4ffcbbbfdfd11b0c560be.png', 'assets/products/custom-retort-pouches-ready-meal-packaging-01.webp'],
  ['https://sc02.alicdn.com/kf/H9de6ba89a70e433586e49df6865fecc7z.png', 'assets/products/custom-roll-stock-film-snack-protein-bar-01.webp'],
  ['https://sc02.alicdn.com/kf/H2d234bedbdec4fc5b8e5a5693fe9d853y.png', 'assets/products/custom-shrink-sleeve-labels-bottles-cans-01.webp'],
  ['https://sc02.alicdn.com/kf/Hbd9d80e06b684eecacf08ece9d95bab2P.png', 'assets/products/custom-pp-ring-binder-folders-01.webp'],
  ['https://sc02.alicdn.com/kf/Hf8aed687639a40abbb5a465c2da80942Q.jpg', 'assets/products/luxury-magnetic-boxes-01.webp'],
  ['https://sc02.alicdn.com/kf/H319a19040719405da2da32f2b48aba73I.jpg', 'assets/products/luxury-magnetic-boxes-01.webp'],
];

for (const [from, to] of replacements) {
  const count = (html.split(from)).length - 1;
  html = html.split(from).join(to);
  console.log(`Replaced ${count}x: ...${from.slice(-30)} → ${to}`);
}

fs.writeFileSync(file, html, 'utf8');
console.log('\nDone: products.html updated.');
