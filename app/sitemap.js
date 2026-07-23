import { listStaticProductSlugs } from '../lib/product-pages';
import { listStaticContentSlugs } from '../lib/content-pages';
import { SITE_URL } from '../lib/seo-utils';

export default async function sitemap() {
  const staticPages = [
    '/',
    '/products.html',
    '/about.html',
    '/contact.html',
    '/blog.html',
    '/news.html',
    '/whitepapers.html',
    '/trust-profile.html',
  ].map((url) => ({
    url: `${SITE_URL}${url}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  }));

  const productSlugs = listStaticProductSlugs();
  const productPages = productSlugs.map((slug) => ({
    url: `${SITE_URL}/products/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const blogPages = listStaticContentSlugs('blog').map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const newsPages = listStaticContentSlugs('news').map((slug) => ({
    url: `${SITE_URL}/news/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const unique = new Map();
  for (const entry of [...staticPages, ...productPages, ...blogPages, ...newsPages]) {
    unique.set(entry.url, entry);
  }
  return [...unique.values()];
}
