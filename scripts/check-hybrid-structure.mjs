import fs from 'fs';
import path from 'path';

const requiredFiles = [
  'app/page.js', 'app/[...path]/page.js', 'app/products/[slug]/page.js', 'app/blog/[slug]/page.js', 'app/news/[slug]/page.js',
  'app/api/products-search/route.js', 'app/api/site-search/route.js', 'app/api/rfq/route.js', 'app/api/revalidate/route.js', 'app/api/r2-health/route.js',
  'app/r2-products-sitemap.xml/route.js', 'app/r2-blog-sitemap.xml/route.js', 'app/r2-news-sitemap.xml/route.js', 'app/sitemap-index.xml/route.js', 'app/site-structure.json/route.js',
  'lib/r2-products.js', 'lib/r2-content.js', 'lib/site-structure.js',
  'content-site/index.html', 'content-site/products.html', 'content-site/industries.html', 'content-site/materials.html', 'content-site/finishes.html', 'content-site/factory.html',
  'content-site/contact.html', 'content-site/blog.html', 'content-site/news.html',
  'content-site/products/custom-stand-up-pouches.html', 'content-site/products/custom-rigid-boxes.html', 'content-site/products/custom-coffee-bags.html',
  'content-site/materials/pet-pe-aluminum-film.html', 'content-site/factory/quality-control.html',
  'public/assets/hero/slide-01-one-stop.webp', 'public/assets/products/coffee-bags-01.webp', 'package-lock.json'
];

let errors = 0;
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(process.cwd(), file))) {
    console.error('Missing hybrid structure file:', file);
    errors++;
  }
}

const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
if (!packageJson.scripts?.build || !packageJson.scripts?.['check:codex']) {
  console.error('Missing required package scripts: build/check:codex');
  errors++;
}

const siteStructure = fs.readFileSync(path.join(process.cwd(), 'lib/site-structure.js'), 'utf8');
for (const phrase of ['static-first hybrid', '/api/rfq', 'staticProductCategoryHubs', 'detailIsrLayer']) {
  if (!siteStructure.includes(phrase)) {
    console.error('Missing site-structure phrase:', phrase);
    errors++;
  }
}

console.log(`Hybrid structure check errors: ${errors}`);
process.exit(errors ? 1 : 0);
