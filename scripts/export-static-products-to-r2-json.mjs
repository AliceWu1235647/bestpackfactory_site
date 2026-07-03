import fs from 'fs';
import path from 'path';

const root = process.cwd();
const contentProducts = path.join(root, 'content-site', 'products');
const outDir = path.join(root, 'r2-seed', 'products');
fs.mkdirSync(outDir, { recursive: true });

function attr(html, regex) {
  const m = html.match(regex);
  return m ? m[1].trim().replace(/\s+/g, ' ') : '';
}

function meta(html, name) {
  const re1 = new RegExp(`<meta\\s+[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i');
  const re2 = new RegExp(`<meta\\s+[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["'][^>]*>`, 'i');
  return attr(html, re1) || attr(html, re2);
}

const products = [];
for (const file of fs.readdirSync(contentProducts).filter(f => f.endsWith('.html')).sort()) {
  const slug = file.replace(/\.html$/, '');
  const abs = path.join(contentProducts, file);
  const html = fs.readFileSync(abs, 'utf8');
  const title = attr(html, /<title[^>]*>([\s\S]*?)<\/title>/i) || slug.replace(/-/g, ' ');
  const description = meta(html, 'description') || 'Custom packaging product from BestPackFactory.';
  const keywords = (meta(html, 'keywords') || '').split(',').map(s => s.trim()).filter(Boolean);
  const product = {
    slug,
    title,
    seoTitle: title,
    metaDescription: description,
    description,
    keywords,
    canonical: `https://bestpackfactory.com/products/${slug}.html`,
    source: 'static-export',
    html
  };
  fs.writeFileSync(path.join(outDir, `${slug}.json`), JSON.stringify(product, null, 2));
  products.push({ slug, title, description, url: `/products/${slug}.html`, json: `/products/${slug}.json` });
}
fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify({ updatedAt: new Date().toISOString(), products }, null, 2));
console.log(`Exported ${products.length} products to ${outDir}`);
