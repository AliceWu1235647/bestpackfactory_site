import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import contentDates from './content-dates.json' with { type: 'json' };

const CONTENT_ROOT = path.join(process.cwd(), 'content-site');

/**
 * Vercel's build image checks files out with a fixed filesystem timestamp
 * (currently 2018-10-20). Falling back to `stat().mtime` therefore advertised
 * every product and guide page as last modified in 2018, which tells search
 * engines and AI crawlers the catalogue is stale. Use the real authoring date
 * from git first, then mtime only when git cannot answer.
 */
function gitCommitDate(file) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%ad', '--date=short', '--', file], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 5000
    }).trim();
    return sitemapDate(out);
  } catch {
    return '';
  }
}

/**
 * Authoring dates frozen at build time by scripts/generate-sitemap.mjs.
 * Imported statically rather than read at runtime: Vercel's serverless bundle
 * does not include arbitrary repo files, so a readFileSync lookup silently
 * returned nothing and every product fell back to the build timestamp.
 */
function knownContentDate(file) {
  const key = path.relative(CONTENT_ROOT, file).replaceAll('\\', '/');
  return sitemapDate(contentDates[key]);
}

export function sitemapDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function htmlLastModified(html, file) {
  const candidates = [
    ...[...html.matchAll(/["']dateModified["']\s*:\s*["']([^"']+)["']/gi)].map(match => sitemapDate(match[1])),
    ...[...html.matchAll(/<meta\s+[^>]*(?:property|name)=["']article:modified_time["'][^>]*content=["']([^"']+)["'][^>]*>/gi)].map(match => sitemapDate(match[1])),
    ...[...html.matchAll(/["']datePublished["']\s*:\s*["']([^"']+)["']/gi)].map(match => sitemapDate(match[1]))
  ].filter(Boolean).sort();
  if (candidates.length) return candidates[candidates.length - 1];
  return knownContentDate(file) || gitCommitDate(file) || sitemapDate(fs.statSync(file).mtime);
}

export function localHtmlSlugs(section) {
  return localHtmlEntries(section).map(entry => entry.slug);
}

export function localHtmlEntries(section) {
  const directory = path.join(CONTENT_ROOT, section);
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
    .map(entry => {
      const file = path.join(directory, entry.name);
      const html = fs.readFileSync(file, 'utf8');
      return {
        slug: entry.name.replace(/\.html$/i, ''),
        lastmod: htmlLastModified(html, file)
      };
    })
    .filter(entry => entry.slug)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function sitemapItemDate(item) {
  if (!item || typeof item !== 'object') return '';
  return sitemapDate(
    item.dateModified ||
    item.updatedAt ||
    item.updated_at ||
    item.lastModified ||
    item.lastmod ||
    item.modified ||
    item.datePublished ||
    item.publishedAt ||
    item.published_at
  );
}

export function mergeSlugs(...groups) {
  return [...new Set(groups.flat().filter(Boolean))].sort();
}

export function mergeSitemapEntries(...groups) {
  const merged = new Map();
  for (const value of groups.flat()) {
    const entry = typeof value === 'string' ? { slug: value, lastmod: '' } : value;
    const slug = String(entry?.slug || '').trim();
    if (!slug) continue;
    const lastmod = sitemapDate(entry?.lastmod);
    const existing = merged.get(slug);
    if (!existing || lastmod > existing.lastmod) merged.set(slug, { slug, lastmod });
  }
  return [...merged.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}
