import { listStaticProductSlugs } from '../lib/product-pages';
import fs from 'fs';
import path from 'path';

export default async function sitemap() {
  const baseUrl = 'https://bestpackfactory.com';

  // 1. Static Core Pages
  const staticPages = [
    '',
    '/products.html',
    '/about.html',
    '/contact.html',
    '/blog.html',
    '/news.html',
    '/whitepapers.html',
  ].map((url) => ({
    url: `${baseUrl}${url}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  }));

  // 2. Product Detail Pages (ISR)
  const productSlugs = listStaticProductSlugs();
  const productPages = productSlugs.map((slug) => ({
    url: `${baseUrl}/products/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. Blog & News (Physical scan)
  const getFiles = (dir) => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) return [];
    return fs.readdirSync(fullPath).filter(f => f.endsWith('.html'));
  };

  const blogPages = getFiles('blog').map(f => ({
    url: `${baseUrl}/blog/${f}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...blogPages];
}
