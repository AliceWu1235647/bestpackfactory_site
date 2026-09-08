import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contentRoot = path.join(root, 'content-site');
const outputPath = path.join(root, 'docs', 'url-inventory-20260908.csv');
const siteUrl = 'https://www.bestpackfactory.com';

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function decodeEntities(value = '') {
  return String(value)
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function tagText(html, tag) {
  const match = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return decodeEntities(match?.[1]?.replace(/<[^>]+>/g, ' ') || '');
}

function attrFromTag(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'));
  return decodeEntities(match?.[2] || '');
}

function firstTagByAttr(html, tagName, attrName, attrValue) {
  return (html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) || [])
    .find((tag) => new RegExp(`\\b${attrName}\\s*=\\s*["']${attrValue}["']`, 'i').test(tag)) || '';
}

function schemaTypes(value, found = new Set()) {
  if (Array.isArray(value)) {
    value.forEach((item) => schemaTypes(item, found));
    return found;
  }
  if (!value || typeof value !== 'object') return found;
  const type = value['@type'];
  if (Array.isArray(type)) type.forEach((item) => found.add(String(item)));
  else if (type) found.add(String(type));
  Object.values(value).forEach((item) => schemaTypes(item, found));
  return found;
}

function routeFor(relativePath) {
  if (relativePath === 'index.html') return '/';
  if (/^(?:ar|de|es|fr|ja)\/index\.html$/.test(relativePath)) {
    return `/${relativePath.replace(/\/index\.html$/, '')}`;
  }
  return `/${relativePath}`;
}

function pageType(relativePath) {
  if (relativePath === 'index.html') return 'homepage';
  if (/^(?:ar|de|es|fr|ja)\//.test(relativePath)) return 'locale_mirror';
  if (relativePath.includes('/questions/')) return 'buyer_answer';
  if (relativePath.startsWith('products/')) return 'product_or_category';
  if (relativePath.startsWith('industries/')) return 'industry';
  if (relativePath.startsWith('blog/')) return 'blog';
  if (relativePath.startsWith('news/')) return 'news';
  if (relativePath.startsWith('materials/')) return 'material';
  if (relativePath.startsWith('finishes/')) return 'finish';
  if (relativePath === 'factory/certificates.html') return 'certificates';
  if (relativePath.startsWith('factory/')) return 'factory';
  if (relativePath.startsWith('authors/')) return 'author';
  if (relativePath === 'about.html') return 'about';
  if (relativePath === 'contact.html') return 'contact_rfq';
  if (relativePath === 'faq.html') return 'faq';
  if (relativePath === 'case-studies.html') return 'case_study_hub';
  if (/rfq|quote-ready|procurement|buyer-answer/.test(relativePath)) return 'buyer_rfq_hub';
  if (relativePath === 'products.html' || relativePath.endsWith('ies.html') || relativePath === 'materials.html' || relativePath === 'finishes.html') return 'category_hub';
  return 'other';
}

function csv(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

const redirectedLegacy = new Set([
  'products/custom-food-packaging.html',
  'products/custom-paper-bags.html',
]);

const rows = walk(contentRoot)
  .filter((file) => file.endsWith('.html'))
  .map((file) => {
    const relativePath = path.relative(contentRoot, file).replace(/\\/g, '/');
    const html = fs.readFileSync(file, 'utf8');
    const canonicalTag = firstTagByAttr(html, 'link', 'rel', 'canonical');
    const descriptionTag = firstTagByAttr(html, 'meta', 'name', 'description');
    const robotsTag = firstTagByAttr(html, 'meta', 'name', 'robots');
    const hreflangCount = (html.match(/<link\b[^>]*\bhreflang\s*=/gi) || []).length;
    const jsonErrors = [];
    const foundTypes = new Set();
    for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
      try { schemaTypes(JSON.parse(match[1].trim()), foundTypes); }
      catch (error) { jsonErrors.push(error.message); }
    }
    const route = routeFor(relativePath);
    return {
      route,
      absolute_url: `${siteUrl}${route}`,
      source_file: `content-site/${relativePath}`,
      page_type: pageType(relativePath),
      route_status: redirectedLegacy.has(relativePath) ? 'legacy_redirect_source' : 'public',
      title: tagText(html, 'title'),
      h1: tagText(html, 'h1'),
      h1_count: (html.match(/<h1\b/gi) || []).length,
      meta_description: attrFromTag(descriptionTag, 'content'),
      canonical: attrFromTag(canonicalTag, 'href'),
      meta_robots: attrFromTag(robotsTag, 'content'),
      hreflang_count: hreflangCount,
      schema_types: [...foundTypes].sort().join('|'),
      schema_json_errors: jsonErrors.join('|'),
      internal_link_count: (html.match(/<a\b[^>]*\bhref\s*=/gi) || []).length,
      static_html_present: 'yes',
    };
  })
  .sort((a, b) => a.route.localeCompare(b.route));

rows.push({
  route: '/dielines',
  absolute_url: `${siteUrl}/dielines`,
  source_file: 'app/dielines/page.js',
  page_type: 'dieline_hub',
  route_status: 'public',
  title: 'generated by Next.js metadata',
  h1: 'generated by React route',
  h1_count: 1,
  meta_description: 'generated by Next.js metadata',
  canonical: `${siteUrl}/dielines`,
  meta_robots: 'index,follow',
  hreflang_count: 0,
  schema_types: 'WebApplication|FAQPage',
  schema_json_errors: '',
  internal_link_count: 'dynamic',
  static_html_present: 'SSR/SSG output',
});

const headers = Object.keys(rows[0]);
const output = [headers.map(csv).join(','), ...rows.map((row) => headers.map((header) => csv(row[header])).join(','))].join('\n');
fs.writeFileSync(outputPath, `${output}\n`, 'utf8');
console.log(JSON.stringify({ outputPath, rows: rows.length, htmlRows: rows.length - 1 }, null, 2));
