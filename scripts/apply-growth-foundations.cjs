const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content-site');
const SITE = 'https://www.bestpackfactory.com';
const MARKER = 'data-growth-discovery="20260813"';

const discovery = {
  'blog.html': {
    eyebrow: 'More Buyer Guides',
    heading: 'Additional Packaging Procurement Guides',
    description: 'Explore practical guides for material choice, MOQ, lead time, artwork, cost and shipping decisions.',
    tag: 'Buyer Guide',
    links: [
      'blog/custom-coffee-bags-buying-guide-materials-valves.html',
      'blog/custom-packaging-cost-breakdown-materials-shipping.html',
      'blog/custom-packaging-lead-time-guide.html',
      'blog/custom-packaging-moq-500-pcs-sourcing-guide.html',
      'blog/custom-packaging-moq-guide-for-b2b-buyers.html',
      'blog/how-to-choose-a-magnetic-gift-box.html',
      'blog/mylar-bags-barrier-materials-rfq-checklist.html',
      'blog/pet-food-packaging-buyer-guide.html',
      'blog/pet-food-packaging-trends-2025-b2b-guide.html',
      'blog/prepare-artwork-dielines-packaging-production-china.html',
      'blog/rigid-box-vs-folding-carton-procurement-guide.html',
      'blog/rigid-boxes-vs-folding-cartons-vs-mailer-boxes.html'
    ]
  },
  'news.html': {
    eyebrow: 'More Company Updates',
    heading: 'Factory Service and Buyer Support News',
    description: 'Read updates about low-MOQ support, sampling, RFQ guidance and one-stop packaging services.',
    tag: 'Factory News',
    links: [
      'news/bestpackfactory-expands-low-moq-support-global-buyers.html',
      'news/bestpackfactory-faster-sampling-dieline-support-update.html',
      'news/bestpackfactory-new-rfq-guidance-system-launch.html',
      'news/bestpackfactory-one-stop-packaging-solutions-update.html'
    ]
  },
  'whitepapers.html': {
    eyebrow: 'Technical Whitepapers',
    heading: 'Testing, Materials and Specification Guides',
    description: 'Use these technical references to prepare measurable packaging specifications and sample checks.',
    tag: 'Technical Guide',
    links: [
      'whitepapers/automatic-labeling-roll-label-specification-guide.html',
      'whitepapers/cannabis-child-resistant-smell-proof-packaging-guide.html',
      'whitepapers/coffee-bag-one-way-valve-material-structure-guide.html',
      'whitepapers/flexible-packaging-material-structure-barrier-guide.html',
      'whitepapers/how-to-choose-grease-resistant-burger-box-coating.html',
      'whitepapers/luxury-rigid-box-material-magnetic-closure-tolerance-guide.html',
      'whitepapers/medical-aesthetic-gs1-datamatrix-abrasion-proof-packaging.html',
      'whitepapers/paper-shopping-bag-gsm-handle-load-capacity-guide.html',
      'whitepapers/pet-food-flat-bottom-bag-barrier-seal-strength-guide.html',
      'whitepapers/pharmaceutical-folding-carton-gs1-datamatrix-print-quality.html'
    ]
  },
  'industries.html': {
    eyebrow: 'Industry Knowledge Hubs',
    heading: 'Industry Sourcing and Buyer-question Centers',
    description: 'Continue to focused industry supplier pages and quote-ready buyer question collections.',
    tag: 'Industry Hub',
    links: [
      'industries/coffee-packaging-supplier/questions/buyer-questions.html',
      'industries/cosmetic-packaging-manufacturer.html',
      'industries/food-packaging-manufacturer/questions/buyer-questions.html',
      'industries/luxury-gift-packaging-manufacturer.html',
      'industries/pet-food-packaging-supplier/questions/buyer-questions.html',
      'industries/pharmaceutical-packaging-supplier/questions/buyer-questions.html'
    ]
  }
};

function read(relative) {
  return fs.readFileSync(path.join(CONTENT, relative), 'utf8');
}

function write(relative, value) {
  fs.writeFileSync(path.join(CONTENT, relative), value, 'utf8');
}

function decodeEntities(value = '') {
  return String(value).replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
}

function escapeHtml(value = '') {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function titleOf(html) {
  return decodeEntities(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/\s+/g, ' ').trim();
}

function descriptionOf(html) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (!/\bname\s*=\s*["']description["']/i.test(tag)) continue;
    return decodeEntities(tag.match(/\bcontent\s*=\s*(["'])([\s\S]*?)\1/i)?.[2] || '').replace(/\s+/g, ' ').trim();
  }
  return '';
}

function h1Of(html) {
  return decodeEntities(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function labelFor(relative) {
  const html = read(relative);
  const title = h1Of(html) || titleOf(html).split('|')[0].trim();
  return { title, description: descriptionOf(html) };
}

function discoverySection(config) {
  const cards = config.links.map(relative => {
    const item = labelFor(relative);
    return `<article class="whitepaper-card"><span class="tag">${escapeHtml(config.tag)}</span><h3><a href="/${escapeHtml(relative)}">${escapeHtml(item.title)}</a></h3><p>${escapeHtml(item.description)}</p><a class="text-link" href="/${escapeHtml(relative)}">Read resource &rarr;</a></article>`;
  }).join('');
  return `\n<section class="section" ${MARKER}><div class="section-head"><div><div class="eyebrow">${escapeHtml(config.eyebrow)}</div><h2>${escapeHtml(config.heading)}</h2><p>${escapeHtml(config.description)}</p></div></div><div class="whitepaper-grid">${cards}</div></section>\n`;
}

function addDiscoverySections() {
  let changed = 0;
  for (const [relative, config] of Object.entries(discovery)) {
    let html = read(relative);
    if (html.includes(MARKER)) continue;
    html = html.replace(/<footer\b/i, `${discoverySection(config)}<footer`);
    write(relative, html);
    changed += 1;
  }
  let about = read('about.html');
  if (!about.includes('data-manufacturer-discovery="20260813"')) {
    const section = '\n<section class="section" data-manufacturer-discovery="20260813"><div class="eyebrow">Factory Overview</div><h2>Custom Packaging Manufacturing Capabilities</h2><p>Review the <a class="text-link" href="/custom-packaging-manufacturer.html">custom packaging manufacturer overview</a> for factory workflow, materials, sampling, quality control and export support.</p></section>\n';
    about = about.replace(/<footer\b/i, `${section}<footer`);
    write('about.html', about);
    changed += 1;
  }
  return changed;
}

function addWhitepapersToSitemap() {
  const relative = 'sitemap.xml';
  let xml = read(relative);
  let added = 0;
  for (const page of discovery['whitepapers.html'].links) {
    const url = `${SITE}/${page}`;
    if (xml.includes(`<loc>${url}</loc>`)) continue;
    const node = `  <url><loc>${url}</loc><lastmod>2026-08-13</lastmod><changefreq>monthly</changefreq><priority>0.78</priority></url>\n`;
    xml = xml.replace('</urlset>', `${node}</urlset>`);
    added += 1;
  }
  write(relative, xml);
  return added;
}

function walkHtml(dir, output = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(absolute, output);
    else if (entry.name.endsWith('.html')) output.push(absolute);
  }
  return output;
}

function imageSource(tag) {
  return decodeEntities(tag.match(/\bsrc\s*=\s*(["'])([\s\S]*?)\1/i)?.[2] || '');
}

function localImageFile(src, htmlFile) {
  if (!src || /^data:/i.test(src)) return null;
  try {
    const route = path.relative(CONTENT, htmlFile).replace(/\\/g, '/');
    const base = route === 'index.html' ? `${SITE}/` : `${SITE}/${route}`;
    const url = new URL(src, base);
    if (!/(?:^|\.)bestpackfactory\.com$/i.test(url.hostname)) return null;
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const absolute = path.join(CONTENT, relative);
    return absolute.startsWith(CONTENT) && fs.existsSync(absolute) ? absolute : null;
  } catch {
    return null;
  }
}

const dimensionCache = new Map();
async function imageDimensions(file) {
  if (dimensionCache.has(file)) return dimensionCache.get(file);
  let dimensions = null;
  if (/\.svg$/i.test(file)) {
    const svg = fs.readFileSync(file, 'utf8');
    const width = Number(svg.match(/<svg\b[^>]*\bwidth=["']([0-9.]+)/i)?.[1]);
    const height = Number(svg.match(/<svg\b[^>]*\bheight=["']([0-9.]+)/i)?.[1]);
    if (width > 0 && height > 0) dimensions = { width: Math.round(width), height: Math.round(height) };
  } else {
    const metadata = await sharp(file).metadata();
    if (metadata.width && metadata.height) dimensions = { width: metadata.width, height: metadata.height };
  }
  dimensionCache.set(file, dimensions);
  return dimensions;
}

function isProtectedImagePage(file) {
  const relative = path.relative(CONTENT, file).replace(/\\/g, '/');
  return relative === 'index.html' || relative === 'products.html' || relative.startsWith('products/');
}

async function addImageDimensions() {
  let imagesChanged = 0;
  let pagesChanged = 0;
  const unresolved = [];
  for (const file of walkHtml(CONTENT).filter(item => !isProtectedImagePage(item))) {
    const original = fs.readFileSync(file, 'utf8');
    let updated = original;
    const replacements = [];
    for (const match of original.matchAll(/<img\b[^>]*>/gi)) {
      const tag = match[0];
      if (/\bwidth\s*=/i.test(tag) || /\bheight\s*=/i.test(tag)) continue;
      const src = imageSource(tag);
      const imageFile = localImageFile(src, file);
      if (!imageFile) {
        unresolved.push({ page: path.relative(CONTENT, file).replace(/\\/g, '/'), src });
        continue;
      }
      const dimensions = await imageDimensions(imageFile);
      if (!dimensions) {
        unresolved.push({ page: path.relative(CONTENT, file).replace(/\\/g, '/'), src });
        continue;
      }
      const closing = /\/>$/.test(tag) ? '/>' : '>';
      const next = tag.replace(/\s*\/?>$/, ` width="${dimensions.width}" height="${dimensions.height}"${closing}`);
      replacements.push({ start: match.index, end: match.index + tag.length, next });
    }
    for (const replacement of replacements.reverse()) {
      updated = updated.slice(0, replacement.start) + replacement.next + updated.slice(replacement.end);
      imagesChanged += 1;
    }
    if (updated !== original) {
      fs.writeFileSync(file, updated, 'utf8');
      pagesChanged += 1;
    }
  }
  return { imagesChanged, pagesChanged, unresolved };
}

function verify() {
  const failures = [];
  for (const [hub, config] of Object.entries(discovery)) {
    const html = read(hub);
    if (!html.includes(MARKER)) failures.push(`${hub}: discovery section missing`);
    for (const link of config.links) if (!html.includes(`href="/${link}"`)) failures.push(`${hub}: missing ${link}`);
  }
  if (!read('about.html').includes('href="/custom-packaging-manufacturer.html"')) failures.push('about.html: manufacturer link missing');
  const sitemap = read('sitemap.xml');
  for (const link of discovery['whitepapers.html'].links) if (!sitemap.includes(`<loc>${SITE}/${link}</loc>`)) failures.push(`sitemap: missing ${link}`);
  const references = [
    ['public/robots.txt', 'image-sitemap.xml'],
    ['content-site/robots.txt', 'image-sitemap.xml'],
    ['content-site/sitemap-index.xml', 'image-sitemap.xml'],
    ['app/sitemap-index.xml/route.js', "'/image-sitemap.xml'"]
  ];
  for (const [file, needle] of references) {
    if (!fs.readFileSync(path.join(ROOT, file), 'utf8').includes(needle)) failures.push(`${file}: image sitemap reference missing`);
  }
  if (!fs.existsSync(path.join(ROOT, 'app', 'image-sitemap.xml', 'route.js'))) failures.push('image sitemap route missing');
  if (failures.length) throw new Error(failures.join('\n'));
  return {
    discoveryHubs: Object.keys(discovery).length,
    discoveryLinks: Object.values(discovery).reduce((sum, item) => sum + item.links.length, 0) + 1,
    sitemapWhitepapers: discovery['whitepapers.html'].links.length
  };
}

async function main() {
  const mode = process.argv[2] || '--verify';
  if (mode === '--apply') {
    const discoveryHubsChanged = addDiscoverySections();
    const sitemapUrlsAdded = addWhitepapersToSitemap();
    const dimensions = await addImageDimensions();
    const verified = verify();
    console.log(JSON.stringify({ discoveryHubsChanged, sitemapUrlsAdded, dimensions, verified }, null, 2));
    return;
  }
  if (mode === '--verify') {
    console.log(JSON.stringify(verify(), null, 2));
    return;
  }
  throw new Error(`Unknown mode: ${mode}`);
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
