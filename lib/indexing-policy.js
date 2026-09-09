// URLs in this file stay public and crawlable, but they are not all suitable
// for Google's web-page index. Keep the rules central so sitemap generation,
// response headers and regression checks cannot drift apart.

export const REDIRECTED_PRODUCT_SLUGS = new Set([
  'custom-food-packaging',
  'custom-paper-bags'
]);

export const MACHINE_RESOURCE_PATHS = [
  '/ai-index.json',
  '/ai-intent-clusters.json',
  '/ai-products-feed.json',
  '/ai-rfq-intent-map.json',
  '/ai-sitemap.xml',
  '/faq-feed.json',
  '/feed.xml',
  '/geo-answer-guide.json',
  '/llms.txt',
  '/product-feed.json',
  '/site-structure.json'
];
