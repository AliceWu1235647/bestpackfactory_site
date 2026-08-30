import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  createSitemapIndexXml,
  latestXmlLastmod,
  REQUIRED_SITEMAPS
} from '../lib/sitemap-index.js';

const publicSitemap = fs.readFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), 'utf8');
const lastmod = latestXmlLastmod(publicSitemap);

assert.match(lastmod, /^\d{4}-\d{2}-\d{2}$/, 'The static sitemap must expose a valid latest lastmod date.');

const xml = createSitemapIndexXml({
  base: 'https://www.bestpackfactory.com',
  lastmod
});

assert.equal((xml.match(/<sitemap>/g) || []).length, REQUIRED_SITEMAPS.length);
assert.equal((xml.match(/<lastmod>/g) || []).length, REQUIRED_SITEMAPS.length);

for (const sitemapPath of REQUIRED_SITEMAPS) {
  assert.ok(xml.includes(`<loc>https://www.bestpackfactory.com${sitemapPath}</loc>`));
}

console.log(`Sitemap index check passed: ${REQUIRED_SITEMAPS.length} child sitemaps, lastmod ${lastmod}.`);
