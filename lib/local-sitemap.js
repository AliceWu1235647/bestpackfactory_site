import fs from 'fs';
import path from 'path';

const CONTENT_ROOT = path.join(process.cwd(), 'content-site');

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
  return sitemapDate(fs.statSync(file).mtime);
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
