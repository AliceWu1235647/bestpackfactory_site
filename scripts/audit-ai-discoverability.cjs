const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'content-site');
const requiredBots = [
  'Googlebot',
  'Googlebot-Image',
  'Google-Extended',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User'
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function robotsMissing(relativePath) {
  const value = read(relativePath);
  return requiredBots.filter(bot => !new RegExp(`User-agent:\\s*${bot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[\\r\\n]+Allow:\\s*\\/`, 'i').test(value));
}

const sourceProducts = fs.readdirSync(path.join(CONTENT, 'products'))
  .filter(name => name.endsWith('.html'))
  .map(name => `products/${name}`)
  .sort();
const aiIndex = JSON.parse(read('public/ai-index.json'));
const indexedProducts = new Set((aiIndex.products || []).map(item => String(item.url || '').replace(/^\/+/, '')));
const missingProducts = sourceProducts.filter(url => !indexedProducts.has(url));
const llms = read('public/llms.txt');
const aiSitemap = read('public/ai-sitemap.xml');
const sitemapIndex = read('app/sitemap-index.xml/route.js');
const layout = read('app/layout.js');
const staticPages = read('lib/static-pages.js');

const report = {
  sourceProducts: sourceProducts.length,
  aiIndexProducts: indexedProducts.size,
  missingProducts,
  missingBots: {
    public: robotsMissing('public/robots.txt'),
    source: robotsMissing('content-site/robots.txt')
  },
  discovery: {
    llmsLinksFeed: /https:\/\/www\.bestpackfactory\.com\/feed\.xml/.test(llms),
    aiSitemapLinksFeed: /<loc>https:\/\/www\.bestpackfactory\.com\/feed\.xml<\/loc>/.test(aiSitemap),
    sitemapIndexLinksAiSitemap: /['"]\/ai-sitemap\.xml['"]/.test(sitemapIndex),
    sitemapIndexLinksFeed: /['"]\/feed\.xml['"]/.test(sitemapIndex),
    layoutLinksLlms: /rel="alternate"[^>]+href="\/llms\.txt"/.test(layout),
    layoutLinksAiIndex: /rel="alternate"[^>]+href="\/ai-index\.json"/.test(layout),
    layoutLinksFeed: /rel="alternate"[^>]+href="\/feed\.xml"/.test(layout),
    metadataExportsRobots: /robots:\s*robotsFromHtml\(html\)/.test(staticPages)
  }
};

const failures = [
  missingProducts.length,
  report.missingBots.public.length,
  report.missingBots.source.length,
  ...Object.values(report.discovery).map(value => value ? 0 : 1)
].reduce((sum, value) => sum + value, 0);

console.log(JSON.stringify({ ...report, failures }, null, 2));
if (failures) process.exit(1);
