// Read-only SEO protection manifest builder.
// Crawls the LIVE production site (GET requests only) plus local sitemap/catalog
// data to snapshot every URL that must not be deleted, 404'd, noindexed,
// re-canonicalized, or have its title/H1 changed without approval.
//
// This script makes no writes to the site, repo content, or Vercel. It only
// produces guardrails/seo-protected-urls.json.
//
// GSC (Search Console) click/impression/backlink data is NOT available to this
// script — those fields are left null with dataSource: "pending-gsc-export"
// until a real export or API connection is provided. They are never fabricated.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.bestpackfactory.com';
const CONCURRENCY = 8;
const TIMEOUT_MS = 15000;

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function readText(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function parseSitemap(xml) {
  const urls = [];
  for (const match of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const block = match[1];
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] || null;
    const priority = block.match(/<priority>([^<]+)<\/priority>/)?.[1] || null;
    const hreflang = [...block.matchAll(/hreflang="([^"]+)"\s+href="([^"]+)"/g)]
      .map(([, lang, href]) => ({ lang, href }));
    if (loc) urls.push({ loc, lastmod, priority, hreflang });
  }
  return urls;
}

function categorize(loc) {
  const u = new URL(loc);
  const p = u.pathname;
  const localeMatch = p.match(/^\/(ar|de|es|fr|ja)(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : 'en';
  const rest = locale === 'en' ? p : p.replace(`/${locale}`, '') || '/';

  let category = 'other';
  let tier = 'standard';
  if (rest === '/' ) { category = 'homepage'; tier = 'critical'; }
  else if (rest.startsWith('/dielines')) { category = 'dieline'; tier = 'critical'; }
  else if (rest.startsWith('/products/')) { category = 'product'; tier = 'critical'; }
  else if (rest === '/products' || rest === '/products.html') { category = 'product-category-index'; tier = 'critical'; }
  else if (rest.startsWith('/blog/')) { category = 'blog'; tier = 'high'; }
  else if (rest.startsWith('/whitepapers/')) { category = 'whitepaper'; tier = 'high'; }
  else if (rest.startsWith('/authors/')) { category = 'author'; tier = 'high'; }
  else if (rest === '/about' || rest === '/about.html') { category = 'about'; tier = 'critical'; }
  else if (rest === '/contact' || rest === '/contact.html') { category = 'contact'; tier = 'critical'; }
  else if (rest === '/trust-profile' || rest === '/trust-profile.html') { category = 'certificates'; tier = 'critical'; }
  else if (rest.includes('buyer-answer-hub') || rest.includes('procurement-hub') || rest.includes('sourcing-hub')) { category = 'buyer-answer-hub'; tier = 'critical'; }
  else if (rest.startsWith('/industries')) { category = 'industry-hub'; tier = 'high'; }
  else if (rest.startsWith('/materials')) { category = 'materials-hub'; tier = 'high'; }
  else if (rest.startsWith('/finishes')) { category = 'finishes-hub'; tier = 'high'; }
  else if (rest.startsWith('/factory')) { category = 'factory'; tier = 'high'; }
  else if (rest.startsWith('/news/')) { category = 'news'; tier = 'standard'; }
  else if (rest.startsWith('/case-studies')) { category = 'case-studies'; tier = 'high'; }

  if (locale !== 'en' && (category === 'homepage' || category === 'product')) tier = 'critical';
  return { locale, category, tier };
}

function textStats(html) {
  const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const title = withoutScripts.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || null;
  const h1Matches = [...withoutScripts.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  const canonical = withoutScripts.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]
    || withoutScripts.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1] || null;
  const bodyText = withoutScripts.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = bodyText ? bodyText.split(' ').length : 0;
  const internalLinks = [...withoutScripts.matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi)]
    .map(m => m[1])
    .filter(href => href.startsWith('/') || href.includes('bestpackfactory.com')).length;
  const images = [...withoutScripts.matchAll(/<img\s+[^>]*src=["']([^"']+)["']/gi)].length;
  const jsonLdBlocks = [...withoutScripts.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const schemaTypes = new Set();
  for (const [, raw] of jsonLdBlocks) {
    try {
      const data = JSON.parse(raw);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        const graph = item['@graph'] || [item];
        for (const node of graph) {
          if (node && node['@type']) {
            const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
            for (const t of types) schemaTypes.add(t);
          }
        }
      }
    } catch { /* malformed JSON-LD is reported separately, not fatal to the crawl */ }
  }
  return { title, h1: h1Matches, canonical, wordCount, internalLinks, images, schemaTypes: [...schemaTypes], jsonLdBlockCount: jsonLdBlocks.length };
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { redirect: 'manual', signal: controller.signal, headers: { 'user-agent': 'BestPack-SEO-Guardrail-Audit/1.0' } });
    const status = res.status;
    const location = res.headers.get('location');
    const html = (status >= 200 && status < 300) ? await res.text() : '';
    return { status, location, html };
  } catch (err) {
    return { status: 0, error: String(err && err.message || err) };
  } finally {
    clearTimeout(timer);
  }
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function main() {
  const gitSha = git(['rev-parse', 'HEAD']);
  const branch = git(['branch', '--show-current']);
  const sitemap = parseSitemap(readText('public/sitemap.xml'));

  console.error(`Crawling ${sitemap.length} sitemap URLs from ${SITE} (concurrency ${CONCURRENCY})...`);

  const records = await mapLimit(sitemap, CONCURRENCY, async (entry, i) => {
    const target = new URL(entry.loc);
    const liveUrl = `${SITE}${target.pathname}${target.search}`;
    const { locale, category, tier } = categorize(entry.loc);
    const result = await fetchWithTimeout(liveUrl);
    if ((i + 1) % 50 === 0) console.error(`  ...${i + 1}/${sitemap.length}`);
    if (result.status === 0) {
      return {
        url: entry.loc, locale, category, protectionTier: tier,
        httpStatus: null, error: result.error,
        sitemapLastmod: entry.lastmod, sitemapPriority: entry.priority,
        hreflangCount: entry.hreflang.length,
      };
    }
    const stats = result.html ? textStats(result.html) : {};
    return {
      url: entry.loc, locale, category, protectionTier: tier,
      httpStatus: result.status,
      redirectLocation: result.location || null,
      sitemapLastmod: entry.lastmod, sitemapPriority: entry.priority,
      hreflangCount: entry.hreflang.length,
      title: stats.title ?? null,
      h1: stats.h1 ?? [],
      canonical: stats.canonical ?? null,
      selfReferencingCanonical: stats.canonical ? stats.canonical.replace(/\/$/, '') === entry.loc.replace(/\/$/, '') : null,
      wordCount: stats.wordCount ?? null,
      internalLinks: stats.internalLinks ?? null,
      images: stats.images ?? null,
      schemaTypes: stats.schemaTypes ?? [],
      jsonLdBlockCount: stats.jsonLdBlockCount ?? 0,
      // Not available without a Search Console connection — never fabricated.
      gscClicks28d: null,
      gscImpressions28d: null,
      hasExternalBacklink: null,
      dataSource: 'pending-gsc-export',
    };
  });

  const failed = records.filter(r => !r.httpStatus || r.httpStatus >= 400);
  const byTier = records.reduce((acc, r) => { acc[r.protectionTier] = (acc[r.protectionTier] || 0) + 1; return acc; }, {});
  const byCategory = records.reduce((acc, r) => { acc[r.category] = (acc[r.category] || 0) + 1; return acc; }, {});

  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    generatedFromGitSha: gitSha,
    generatedFromBranch: branch,
    siteUrl: SITE,
    notes: [
      'gscClicks28d, gscImpressions28d and hasExternalBacklink are placeholders pending a Google Search Console export or API connection.',
      'Treat every URL in this manifest as protected per guardrails/README-seo-protection.md until a human reviewer re-scopes it.',
    ],
    counts: {
      totalUrls: records.length,
      byTier,
      byCategory,
      httpFailures: failed.length,
    },
    urls: records,
  };

  fs.mkdirSync(path.join(root, 'guardrails'), { recursive: true });
  fs.writeFileSync(path.join(root, 'guardrails', 'seo-protected-urls.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.error(`Wrote guardrails/seo-protected-urls.json — ${records.length} URLs, ${failed.length} HTTP failures.`);
  if (failed.length) {
    console.error('HTTP failures:');
    for (const f of failed.slice(0, 30)) console.error(`  ${f.httpStatus ?? 'ERR'} ${f.url}`);
  }
}

main();
