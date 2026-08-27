import fs from 'fs';
import path from 'path';

const CONTENT_ROOT = path.join(process.cwd(), 'content-site');
const SITE_URL = 'https://www.bestpackfactory.com';

function walkHtml(dir, output = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(absolute, output);
    else if (entry.name.endsWith('.html')) output.push(absolute);
  }
  return output;
}

function decodeEntities(value = '') {
  return String(value).replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'");
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'));
  return match ? decodeEntities(match[2].trim()) : '';
}

function metaContent(html, property) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (attribute(tag, 'property').toLowerCase() === property.toLowerCase()) return attribute(tag, 'content');
  }
  return '';
}

function canonicalUrl(html, file) {
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    if (attribute(tag, 'rel').toLowerCase() === 'canonical') {
      return attribute(tag, 'href').replace(/^https:\/\/bestpackfactory\.com/i, SITE_URL);
    }
  }
  const relative = path.relative(CONTENT_ROOT, file).replace(/\\/g, '/');
  return relative === 'index.html' ? `${SITE_URL}/` : `${SITE_URL}/${relative}`;
}

function normalizedImageUrl(value, pageUrl) {
  if (!value || /^data:/i.test(value)) return '';
  try {
    const url = new URL(value, pageUrl);
    if (!/(?:^|\.)bestpackfactory\.com$/i.test(url.hostname)) return '';
    url.protocol = 'https:';
    url.hostname = 'www.bestpackfactory.com';
    url.hash = '';
    url.search = '';
    if (/\/(?:logo|icons?)\//i.test(url.pathname) || /favicon/i.test(url.pathname)) return '';
    return url.toString();
  } catch {
    return '';
  }
}

function escapeXml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export function buildImageSitemap() {
  const entries = [];
  for (const file of walkHtml(CONTENT_ROOT).sort()) {
    const html = fs.readFileSync(file, 'utf8');
    const canonical = canonicalUrl(html, file);
    const images = new Set();
    const ogImage = normalizedImageUrl(metaContent(html, 'og:image'), canonical);
    if (ogImage) images.add(ogImage);
    for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
      const image = normalizedImageUrl(attribute(tag, 'src'), canonical);
      if (image) images.add(image);
      if (images.size >= 20) break;
    }
    if (!images.size) continue;
    const imageNodes = [...images].map(image => `    <image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`).join('\n');
    entries.push(`  <url>\n    <loc>${escapeXml(canonical)}</loc>\n${imageNodes}\n  </url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${entries.join('\n')}\n</urlset>`;
}
