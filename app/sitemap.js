import fs from 'fs';
import path from 'path';
import { listStaticProductSlugs } from '../lib/product-pages';
import { listStaticContentSlugs } from '../lib/content-pages';
import { listLeadPageRoutes } from '../lib/lead-pages';
import { SITE_URL } from '../lib/seo-utils';

let sitemapLastmodCache = null;

function loadSitemapLastmods() {
  if (sitemapLastmodCache) return sitemapLastmodCache;
  sitemapLastmodCache = new Map();
  try {
    const xml = fs.readFileSync(path.join(process.cwd(), 'content-site', 'sitemap.xml'), 'utf8');
    const re = /<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g;
    let match;
    while ((match = re.exec(xml))) {
      const date = new Date(`${match[2]}T00:00:00.000Z`);
      if (!Number.isNaN(date.getTime())) {
        sitemapLastmodCache.set(match[1], date);
      }
    }
  } catch {
    // Keep sitemap generation available even if the static XML is missing locally.
  }
  return sitemapLastmodCache;
}

function stableLastModified(url, lastmods) {
  return lastmods.get(url) || new Date('2026-07-24T00:00:00.000Z');
}

export default async function sitemap() {
  const lastmods = loadSitemapLastmods();
  const staticPages = [
    '/',
    '/products.html',
    '/about.html',
    '/contact.html',
    '/blog.html',
    '/news.html',
    '/whitepapers.html',
    '/trust-profile.html',
    '/packaging-buyer-answer-hub.html',
  ].map((url) => ({
    url: `${SITE_URL}${url}`,
    lastModified: stableLastModified(`${SITE_URL}${url}`, lastmods),
    changeFrequency: 'daily',
    priority: 1.0,
  }));

  const productSlugs = listStaticProductSlugs();
  const productPages = productSlugs.map((slug) => ({
    url: `${SITE_URL}/products/${slug}`,
    lastModified: stableLastModified(`${SITE_URL}/products/${slug}`, lastmods),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const blogPages = listStaticContentSlugs('blog').map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: stableLastModified(`${SITE_URL}/blog/${slug}`, lastmods),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const newsPages = listStaticContentSlugs('news').map((slug) => ({
    url: `${SITE_URL}/news/${slug}`,
    lastModified: stableLastModified(`${SITE_URL}/news/${slug}`, lastmods),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const leadPages = listLeadPageRoutes().map((route) => ({
    url: `${SITE_URL}/${route}`,
    lastModified: stableLastModified(`${SITE_URL}/${route}`, lastmods),
    changeFrequency: 'weekly',
    priority: 0.75,
  }));

  const unique = new Map();
  for (const entry of [...staticPages, ...productPages, ...blogPages, ...newsPages, ...leadPages]) {
    unique.set(entry.url, entry);
  }
  return [...unique.values()];
}
