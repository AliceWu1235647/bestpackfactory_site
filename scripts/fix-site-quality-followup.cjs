const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'content-site');
const SITE = 'https://www.bestpackfactory.com';
const DEFAULT_IMAGE = `${SITE}/assets/hero/slide-01-one-stop.webp`;
const BASELINE_FILE = path.join(ROOT, 'scripts', '.followup-baseline-20260813.json');
const VERIFIED_REMOTE_DIMENSIONS = {
  'https://sc02.alicdn.com/kf/Hf8aed687639a40abbb5a465c2da80942Q.jpg': { width: 1254, height: 1254 },
  'https://sc02.alicdn.com/kf/Hbd9d80e06b684eecacf08ece9d95bab2P.png': { width: 1254, height: 1254 }
};

const TITLE_OVERRIDES = {
  'about.html': 'About BestPackFactory | B2B Packaging Manufacturer',
  'custom-packaging-manufacturer.html': 'Custom Packaging Manufacturer | MOQ 500 PCS',
  'custom-packaging-moq-500.html': 'Custom Packaging MOQ 500 PCS | Factory Direct',
  'custom-packaging-rfq-template.html': 'Custom Packaging RFQ Template | Factory Quote',
  'factory/exhibition.html': 'Packaging Exhibitions & Buyer Meetings | BestPackFactory',
  'factory.html': 'Packaging Factory & Quality Control | BestPackFactory',
  'finishes.html': 'Packaging Finishes: Foil, Spot UV, Embossing & More',
  'industries/luxury-gift-packaging-manufacturer.html': 'Luxury Gift Packaging Manufacturer | MOQ 500 PCS',
  'materials/pet-pe-aluminum-film.html': 'PET, PE & Aluminum Flexible Packaging Materials',
  'materials.html': 'Packaging Materials: Paper, Board & Flexible Films',
  'news.html': 'Packaging News & Factory Updates | BestPackFactory',
  'quote-ready-packaging-sourcing-hub.html': 'Custom Packaging Sourcing Hub | MOQ 500 PCS',
  'whitepapers/automatic-labeling-roll-label-specification-guide.html': 'Automatic Labeling Roll Label Specification Guide',
  'whitepapers/cannabis-child-resistant-smell-proof-packaging-guide.html': 'Child-Resistant Cannabis Packaging Guide',
  'whitepapers/coffee-bag-one-way-valve-material-structure-guide.html': 'Coffee Bag Valve & Material Structure Guide',
  'whitepapers/flexible-packaging-material-structure-barrier-guide.html': 'Flexible Packaging Barrier Structure Guide',
  'whitepapers/how-to-choose-grease-resistant-burger-box-coating.html': 'Grease-Resistant Burger Box Coating Guide',
  'whitepapers/luxury-rigid-box-material-magnetic-closure-tolerance-guide.html': 'Luxury Rigid Box Material & Closure Guide',
  'whitepapers/medical-aesthetic-gs1-datamatrix-abrasion-proof-packaging.html': 'Medical Packaging: Prevent GS1 DataMatrix Abrasion',
  'whitepapers/paper-shopping-bag-gsm-handle-load-capacity-guide.html': 'Paper Bag GSM, Handle & Load Capacity Guide',
  'whitepapers/pet-food-flat-bottom-bag-barrier-seal-strength-guide.html': 'Pet Food Bag Barrier & Seal Strength Guide',
  'whitepapers/pharmaceutical-folding-carton-gs1-datamatrix-print-quality.html': 'Pharma Carton GS1 DataMatrix Print Quality Guide',
  'industries/pharmaceutical-packaging-supplier/questions/barcode-verification-grade.html': 'What barcode grade should pharma cartons target?',
  'industries/pharmaceutical-packaging-supplier/questions/blister-pack-carton-dimensions.html': 'How do blister dimensions guide carton design?'
};

const SOURCES = {
  quality: {
    heading: 'Verification method and acceptance evidence',
    method: 'Record the approved sample revision, packed condition, lot size, inspection level, defect classes, acceptance limit, conditioning, equipment and pass/fail rule before inspection.',
    sources: [
      {
        label: 'ISO 2859-1:2026',
        url: 'https://www.iso.org/standard/85464.html',
        note: 'defines AQL-indexed sampling schemes and acceptance or rejection rules for lot-by-lot inspection.'
      },
      {
        label: 'ASTM D5276-19(2023)',
        url: 'https://store.astm.org/d5276-19.html',
        note: 'covers free-fall drop testing of loaded boxes, cylindrical containers, bags and sacks as packed systems.'
      }
    ],
    limitation: 'These standards define repeatable methods, not a passing result for a BestPackFactory order. Release decisions require a project-specific inspection or test report tied to the approved sample and production lot.'
  },
  barrier: {
    heading: 'Barrier and seal verification method',
    method: 'Specify the final laminate, specimen count, conditioning, temperature and humidity, test method, equipment, units and acceptance limits before comparing barrier or seal results.',
    sources: [
      {
        label: 'ISO 2528:2017',
        url: 'https://www.iso.org/standard/72382.html',
        note: 'specifies a gravimetric method for water-vapour transmission rate and states important sensitivity and material limits for that method.'
      },
      {
        label: 'ASTM F88/F88M-23',
        url: 'https://store.astm.org/f0088_f0088m-23.html',
        note: 'measures flexible-barrier seal strength and requires the support technique to remain consistent within a test series.'
      }
    ],
    limitation: 'A material name or generic target is not a batch result. Buyers should require a report for the final printed laminate that identifies the method, conditions, specimen preparation, results and acceptance limit.'
  },
  food: {
    heading: 'Food-contact verification method and sources',
    method: 'Build a material-and-use matrix for every food-contact layer, supplier, thickness, food type, contact time, temperature and destination market, then match declarations or migration reports to that exact use.',
    sources: [
      {
        label: 'U.S. FDA food-contact substance guidance',
        url: 'https://www.fda.gov/food/food-ingredients-packaging/packaging-food-contact-substances-fcs',
        note: 'describes the U.S. regulatory routes for substances intended to contact food.'
      },
      {
        label: 'EU Regulation (EC) No 1935/2004',
        url: 'https://eur-lex.europa.eu/eli/reg/2004/1935/2021-03-27/eng',
        note: 'is the official European Union framework for materials and articles intended to contact food.'
      }
    ],
    limitation: 'No generic “food grade” statement proves compliance in every market. The importer or food business must verify the exact material structure and intended use against destination-market requirements.'
  },
  print: {
    heading: 'Print and color verification method',
    method: 'Record the approved physical reference, substrate, ink and print process, finish, viewing condition, instrument geometry, illuminant and observer, color-difference formula, measurement locations and acceptance limit.',
    sources: [
      {
        label: 'ISO 3664:2025',
        url: 'https://www.iso.org/standard/83759.html',
        note: 'specifies viewing conditions for critical comparison of prints and reference objects.'
      },
      {
        label: 'International Color Consortium Profile Registry',
        url: 'https://registry.color.org/profile-registry/',
        note: 'links registered profiles to standard printing conditions and public characterization data sets.'
      }
    ],
    limitation: 'A color value without the formula, instrument conditions, substrate and reference is incomplete. Final approval should use the agreed proof or physical sample and a project-specific measurement record.'
  },
  pharma: {
    heading: 'Barcode and variable-data verification method',
    method: 'Verify encoded data and print quality on the final printed carton. Record symbol content, X-dimension, quiet zone, location, verifier model, calibration status, aperture, illumination, angle and complete grade notation.',
    sources: [
      {
        label: 'GS1 DataMatrix Guideline',
        url: 'https://ref.gs1.org/guidelines/datamatrix/',
        note: 'provides official GS1 implementation guidance for encoding, printing, reading and symbol quality.'
      },
      {
        label: 'ISO/IEC 15415:2024',
        url: 'https://www.iso.org/standard/76876.html',
        note: 'defines measurement and grading methods for two-dimensional barcode symbols.'
      }
    ],
    limitation: 'A target grade is not evidence that an untested production lot passes. The final report must identify the printed sample, verifier settings, individual results and the market or buyer acceptance rule.'
  },
  logistics: {
    heading: 'Shipping and landed-cost verification method',
    method: 'Record the packed outer dimensions, gross weight, carton count, pallet plan, route, service, Incoterms rule and included or excluded charges, then compare quotes on the same basis.',
    sources: [
      {
        label: 'ICC Incoterms® 2020',
        url: 'https://iccwbo.org/business-solutions/incoterms-rules/incoterms-2020/',
        note: 'allocates costs, risks and obligations between buyer and seller under 11 official trade rules.'
      },
      {
        label: 'UPS package dimensions and weight guide',
        url: 'https://www.ups.com/us/en/support/shipping-support/shipping-dimensions-weight',
        note: 'explains measurement, dimensional weight and carrier size or weight constraints.'
      }
    ],
    limitation: 'Carrier rules, divisors, surcharges and rates can change by service and contract. A page example is not a freight quote; the final landed cost must use current packed data and a dated carrier or forwarder quotation.'
  },
  childResistant: {
    heading: 'Child-resistant packaging verification method',
    method: 'Define the regulated product, market, final filled package, closure instructions and required child and adult protocols before testing; retain the complete protocol report and sample identity.',
    sources: [
      {
        label: 'U.S. CPSC Special Packaging FAQs',
        url: 'https://www.cpsc.gov/FAQ/Special-Packaging-PPPA-FAQs',
        note: 'summarizes the PPPA purpose and the child-resistant and senior-friendly test framework in 16 CFR part 1700.'
      },
      {
        label: 'ASTM D3475-20',
        url: 'https://store.astm.org/d3475-20.html',
        note: 'classifies child-resistant package types but explicitly says listing is not proof that a specific package passed the required protocol.'
      }
    ],
    limitation: 'A zipper, closure type or ASTM classification alone is not certification. Compliance depends on the final package, regulated product, destination rules and a valid protocol report.'
  },
  ai: {
    heading: 'AI-search evidence and verification method',
    method: 'Track a fixed set of buyer questions by engine, date, market and signed-in state; record whether the brand or URL is cited, its answer position and referral traffic, then compare the same prompts over time.',
    sources: [
      {
        label: 'Google Search Central: AI features and your website',
        url: 'https://developers.google.com/search/docs/appearance/ai-features',
        note: 'states that existing SEO fundamentals remain relevant and that pages must be indexed and eligible for a Search snippet to appear as supporting links.'
      },
      {
        label: 'GEO: Generative Engine Optimization research paper',
        url: 'https://arxiv.org/abs/2311.09735',
        note: 'introduces GEO and a benchmark for measuring source visibility in generative-engine responses.'
      }
    ],
    limitation: 'Citation visibility varies by query, engine and date. These sources support the measurement method; they do not guarantee that a page will be cited or ranked by any AI system.'
  }
};

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function write(rel, value) {
  fs.writeFileSync(path.join(ROOT, rel), value, 'utf8');
}

function sha(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function listFiles(dir, predicate = () => true) {
  const output = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) output.push(...listFiles(full, predicate));
    else if (predicate(full)) output.push(full);
  }
  return output.sort();
}

function listHtml(relDir) {
  const dir = path.join(ROOT, relDir);
  return listFiles(dir, (file) => file.endsWith('.html')).map((file) => path.relative(ROOT, file).replace(/\\/g, '/'));
}

function htmlDecode(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, '&quot;');
}

function stripText(html) {
  return html
    .replace(/<head\b[\s\S]*?<\/head>/i, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tagText(html, tag) {
  return htmlDecode((html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1] || '').replace(/<[^>]+>/g, '').trim());
}

function canonicalOf(html) {
  return html.match(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*href=["']([^"']+)/i)?.[1]
    || html.match(/<link\b(?=[^>]*href=["']([^"']+)["'])(?=[^>]*rel=["']canonical["'])[^>]*>/i)?.[1]
    || '';
}

function titleOf(html) {
  return htmlDecode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '');
}

function chatBlock(html) {
  return html.match(/<div class="bpf-whatsapp-chat">[\s\S]*?<\/div><\/div>/i)?.[0] || '';
}

function authorBlock(html) {
  return html.match(/<div class="content-author-meta"[^>]*data-content-author="lisa-wu"[\s\S]*?<\/div>/i)?.[0] || '';
}

function imageSignature(html) {
  const values = [];
  for (const match of html.matchAll(/<(?:img|source)\b[^>]*>/gi)) {
    const tag = match[0];
    const src = tag.match(/\bsrc=["']([^"']+)/i)?.[1] || '';
    const srcset = tag.match(/\bsrcset=["']([^"']+)/i)?.[1] || '';
    values.push(`${src}|${srcset}`);
  }
  return values;
}

function sitemapUrls() {
  const output = {};
  for (const file of listFiles(CONTENT, (name) => /sitemap.*\.xml$/i.test(path.basename(name)))) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    output[rel] = [...fs.readFileSync(file, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  }
  for (const file of listFiles(path.join(ROOT, 'public'), (name) => /sitemap.*\.xml$/i.test(path.basename(name)))) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    output[rel] = [...fs.readFileSync(file, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  }
  return output;
}

function captureBaseline() {
  const protectedFiles = [
    'content-site/index.html',
    'app/page.js',
    'content-site/css/style.css',
    'public/css/style.css',
    ...listFiles(path.join(CONTENT, 'js'), () => true).map((file) => path.relative(ROOT, file).replace(/\\/g, '/')),
    ...listFiles(path.join(ROOT, 'public', 'js'), () => true).map((file) => path.relative(ROOT, file).replace(/\\/g, '/'))
  ].filter((rel) => fs.existsSync(path.join(ROOT, rel)));
  const products = {};
  for (const rel of listHtml('content-site/products')) {
    const html = read(rel);
    products[rel] = {
      title: titleOf(html),
      canonical: canonicalOf(html),
      h1: tagText(html, 'h1'),
      images: imageSignature(html),
      visibleTextHash: sha(stripText(html)),
      chatHash: sha(chatBlock(html))
    };
  }
  const articles = {};
  for (const rel of [...listHtml('content-site/blog'), ...listHtml('content-site/news')]) {
    const html = read(rel);
    articles[rel] = {
      title: titleOf(html),
      canonical: canonicalOf(html),
      h1: tagText(html, 'h1'),
      images: imageSignature(html),
      chatHash: sha(chatBlock(html)),
      authorHash: sha(authorBlock(html))
    };
  }
  const assetHashes = {};
  for (const file of listFiles(path.join(CONTENT, 'assets'), () => true)) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    assetHashes[rel] = sha(fs.readFileSync(file));
  }
  const baseline = {
    createdAt: new Date().toISOString(),
    protectedFiles: Object.fromEntries(protectedFiles.map((rel) => [rel, sha(read(rel))])),
    homepageImages: imageSignature(read('content-site/index.html')),
    products,
    articles,
    assetHashes,
    sitemapUrls: sitemapUrls()
  };
  fs.writeFileSync(BASELINE_FILE, `${JSON.stringify(baseline, null, 2)}\n`, 'utf8');
  return baseline;
}

function loadBaseline() {
  if (!fs.existsSync(BASELINE_FILE)) throw new Error(`Baseline missing: ${BASELINE_FILE}`);
  return JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
}

function metaValue(html, key) {
  const tag = html.match(new RegExp(`<meta\\b(?=[^>]*(?:property|name)=["']${key.replace(':', '\\:')}["'])[^>]*>`, 'i'))?.[0];
  return tag?.match(/content=["']([^"']*)/i)?.[1] || '';
}

function setMeta(html, kind, key, value) {
  const matcher = new RegExp(`<meta\\b(?=[^>]*${kind}=["']${key.replace(':', '\\:')}["'])[^>]*>`, 'i');
  const tag = `<meta ${kind}="${key}" content="${escapeAttr(value)}"/>`;
  return matcher.test(html) ? html.replace(matcher, tag) : html.replace('</head>', `${tag}\n</head>`);
}

function absoluteUrl(value, canonical) {
  try {
    return new URL(value, canonical).href;
  } catch {
    return DEFAULT_IMAGE;
  }
}

function schemaImages(html) {
  const output = [];
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(match[1]);
      const visit = (item) => {
        if (Array.isArray(item)) return item.forEach(visit);
        if (!item || typeof item !== 'object') return;
        if (item.image) {
          const values = Array.isArray(item.image) ? item.image : [item.image];
          for (const value of values) {
            const url = typeof value === 'string' ? value : value?.url;
            if (url) output.push(url);
          }
        }
        Object.values(item).forEach(visit);
      };
      visit(data);
    } catch {}
  }
  return output;
}

function bestOgImage(html, canonical) {
  const current = metaValue(html, 'og:image');
  if (current) return absoluteUrl(current, canonical);
  for (const image of schemaImages(html)) {
    if (!/\/logo\//i.test(image)) return absoluteUrl(image, canonical);
  }
  for (const match of html.matchAll(/<img\b[^>]*src=["']([^"']+)/gi)) {
    if (!/\/logo\//i.test(match[1])) return absoluteUrl(match[1], canonical);
  }
  return DEFAULT_IMAGE;
}

function shortTitle(rel, current) {
  if (TITLE_OVERRIDES[rel]) return TITLE_OVERRIDES[rel];
  if (/^industries\/.+\/questions\//.test(rel)) return current.replace(/ \| BestPackFactory$/, '');
  if (/^industries\//.test(rel)) return current.replace(/ \| Custom B2B Packaging Manufacturer$/, ' | B2B Packaging Guide');
  return current;
}

function updateLongTitles() {
  let changed = 0;
  const seen = new Map();
  for (const rel of listHtml('content-site')) {
    const shortRel = rel.replace(/^content-site\//, '');
    if (shortRel === 'index.html' || /^products\//.test(shortRel) || /^(blog|news)\//.test(shortRel)) continue;
    let html = read(rel);
    const current = titleOf(html);
    const next = shortTitle(shortRel, current);
    if ([...next].length > 60) throw new Error(`${shortRel}: title still exceeds 60 characters (${[...next].length}): ${next}`);
    const key = next.toLowerCase();
    if (seen.has(key)) throw new Error(`Duplicate shortened title: ${next} (${seen.get(key)}, ${shortRel})`);
    seen.set(key, shortRel);
    if (next === current) continue;
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(next)}</title>`);
    if (metaValue(html, 'og:title')) html = setMeta(html, 'property', 'og:title', next);
    if (metaValue(html, 'twitter:title')) html = setMeta(html, 'name', 'twitter:title', next);
    write(rel, html);
    changed += 1;
  }
  return changed;
}

function addMissingOgImages() {
  let changed = 0;
  for (const rel of listHtml('content-site')) {
    if (rel === 'content-site/index.html') continue;
    let html = read(rel);
    if (metaValue(html, 'og:image')) continue;
    const canonical = canonicalOf(html);
    if (!canonical) throw new Error(`${rel}: cannot add OG image without canonical URL`);
    const image = bestOgImage(html, canonical);
    html = setMeta(html, 'property', 'og:image', image);
    html = setMeta(html, 'name', 'twitter:card', 'summary_large_image');
    html = setMeta(html, 'name', 'twitter:image', image);
    write(rel, html);
    changed += 1;
  }
  return changed;
}

function localImagePath(src, pageRel) {
  const clean = src.split('?')[0].split('#')[0];
  if (/^https?:\/\//i.test(clean)) {
    const url = new URL(clean);
    if (!/(^|\.)bestpackfactory\.com$/i.test(url.hostname)) return '';
    return path.join(CONTENT, decodeURIComponent(url.pathname).replace(/^\/+/, ''));
  }
  if (clean.startsWith('/')) return path.join(CONTENT, clean.replace(/^\/+/, ''));
  return path.resolve(path.dirname(path.join(ROOT, pageRel)), clean);
}

async function reserveProductImageSpace() {
  let changed = 0;
  for (const rel of listHtml('content-site/products')) {
    let html = read(rel);
    let galleryStart = html.search(/<div\b[^>]*class=["'][^"']*\bgallery\b[^"']*["'][^>]*>/i);
    if (galleryStart < 0) galleryStart = Math.max(0, html.search(/<h1\b/i));
    const after = html.slice(galleryStart);
    const match = [...after.matchAll(/<img\b[^>]*>/gi)].find((candidate) => !/\/logo\//i.test(candidate[0]));
    if (!match) throw new Error(`${rel}: first gallery image missing`);
    const oldTag = match[0];
    const src = oldTag.match(/\bsrc=["']([^"']+)/i)?.[1];
    if (!src) throw new Error(`${rel}: first gallery image src missing`);
    const file = localImagePath(src, rel);
    const existingWidth = Number(oldTag.match(/\bwidth=["'](\d+)/i)?.[1] || 0);
    const existingHeight = Number(oldTag.match(/\bheight=["'](\d+)/i)?.[1] || 0);
    const metadata = file && fs.existsSync(file)
      ? await sharp(file).metadata()
      : VERIFIED_REMOTE_DIMENSIONS[src] || { width: existingWidth, height: existingHeight };
    if (!metadata.width || !metadata.height) throw new Error(`${rel}: cannot read dimensions for ${src}`);
    let newTag = oldTag
      .replace(/\swidth=["'][^"']*["']/i, '')
      .replace(/\sheight=["'][^"']*["']/i, '')
      .replace(/\sloading=["'][^"']*["']/i, '')
      .replace(/\sfetchpriority=["'][^"']*["']/i, '');
    const styleMatch = newTag.match(/\sstyle=["']([^"']*)["']/i);
    const cleanStyle = (styleMatch?.[1] || '')
      .replace(/(?:^|;)\s*aspect-ratio\s*:[^;]*/gi, '')
      .replace(/^;+|;+$/g, '')
      .trim();
    const ratioStyle = `${cleanStyle ? `${cleanStyle};` : ''}aspect-ratio:${metadata.width} / ${metadata.height} !important`;
    newTag = styleMatch
      ? newTag.replace(styleMatch[0], ` style="${ratioStyle}"`)
      : newTag.replace(/\/>$/, ` style="${ratioStyle}"/>`);
    newTag = newTag.replace(/\/>$/, ` width="${metadata.width}" height="${metadata.height}" loading="eager" fetchpriority="high"/>`);
    if (newTag !== oldTag) {
      const absoluteIndex = galleryStart + match.index;
      html = `${html.slice(0, absoluteIndex)}${newTag}${html.slice(absoluteIndex + oldTag.length)}`;
      write(rel, html);
      changed += 1;
    }
  }
  return changed;
}

function evidenceKind(rel, title) {
  const value = `${rel} ${title}`.toLowerCase();
  if (/geo-|ai search|generative/.test(value)) return 'ai';
  if (/cannabis|child-resistant|child resistant|\bcr\b/.test(value)) return 'childResistant';
  if (/pharma|datamatrix|barcode|variable.data|serialization|batch.lot.expiry/.test(value)) return 'pharma';
  if (/shipping|logistics|landed.cost|dimensional.weight|\bddp\b|\bfob\b|air.freight/.test(value)) return 'logistics';
  if (/food.safe|food.packaging.compliance|compliance.document/.test(value)) return 'food';
  if (/artwork|dieline|color|colour|pantone|printing|print |label|winding|finish/.test(value)) return 'print';
  if (/coffee|pet.food|pouch|flexible|mylar|barrier|foil|kraft|bag.material|degassing|valve|seal/.test(value)) return 'barrier';
  return 'quality';
}

function topicOf(html) {
  return tagText(html, 'h1') || titleOf(html);
}

function evidenceBlock(kind, topic, isNews) {
  const data = SOURCES[kind];
  const id = `verification-evidence-${kind.toLowerCase()}`;
  const newsLimit = isNews
    ? ' This page is a first-party BestPackFactory company update; the external sources validate the referenced method or industry context, not the company-specific announcement.'
    : '';
  return `<section class="content-evidence" data-followup-evidence="${kind}" aria-labelledby="${id}"><h2 id="${id}">${data.heading}</h2><p><strong>Method for ${escapeHtml(topic)}:</strong> ${data.method}</p><ul>${data.sources.map((source) => `<li><a href="${source.url}" rel="noopener noreferrer">${source.label}</a> ${source.note}</li>`).join('')}</ul><p class="evidence-limit"><strong>Evidence limit:</strong> ${data.limitation}${newsLimit}</p></section>`;
}

function insertEvidence(html, block, rel) {
  const cta = '<p style="margin-top:40px;">';
  if (html.includes(cta)) return html.replace(cta, `${block}\n${cta}`);
  const faqBlock = '<section class="faq-block">';
  if (html.includes(faqBlock)) return html.replace(faqBlock, `${block}\n${faqBlock}`);
  const faqSection = '<section class="faq-section"';
  const faqIndex = html.indexOf(faqSection);
  if (faqIndex >= 0) {
    const closeIndex = html.lastIndexOf('</section>', faqIndex);
    if (closeIndex >= 0) return `${html.slice(0, closeIndex)}${block}\n${html.slice(closeIndex)}`;
  }
  for (const anchor of ['<h2>Related product pages</h2>', '<section><h2>Sources and further reading</h2>']) {
    if (html.includes(anchor)) return html.replace(anchor, `${block}\n${anchor}`);
  }
  const contentClose = html.indexOf('</main>') >= 0 ? html.indexOf('</main>') : html.indexOf('</body>');
  if (contentClose < 0) throw new Error(`${rel}: cannot insert evidence because no content closing tag was found`);
  const articleClose = html.lastIndexOf('</article>', contentClose);
  if (articleClose >= 0) return `${html.slice(0, articleClose)}${block}\n${html.slice(articleClose)}`;
  const sectionClose = html.lastIndexOf('</section>', contentClose);
  if (sectionClose >= 0) return `${html.slice(0, sectionClose)}${block}\n${html.slice(sectionClose)}`;
  throw new Error(`${rel}: cannot find a safe evidence insertion anchor`);
}

function ensureEvidenceSourceDomains(html, kind) {
  const match = html.match(/<section\b[^>]*class=["'][^"']*content-evidence[^"']*["'][^>]*>[\s\S]*?<\/section>/i);
  if (!match) return html;
  let section = match[0];
  const present = new Set();
  for (const link of section.matchAll(/<a\b[^>]*href=["'](https?:\/\/[^"']+)/gi)) {
    try { present.add(new URL(link[1]).hostname.replace(/^www\./, '')); } catch {}
  }
  const missing = SOURCES[kind].sources.filter((source) => {
    const host = new URL(source.url).hostname.replace(/^www\./, '');
    return ![...present].some((value) => value === host || value.endsWith(`.${host}`) || host.endsWith(`.${value}`));
  });
  if (!missing.length) return html;
  const additions = missing.map((source) => `<li><a href="${source.url}" rel="noopener noreferrer">${source.label}</a> ${source.note}</li>`).join('');
  section = section.replace('</ul>', `${additions}</ul>`);
  return html.replace(match[0], section);
}

function mergeArticleCitations(html, urls, rel) {
  let articleFound = false;
  let parseErrors = 0;
  const output = html.replace(/(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (full, open, raw, close) => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      parseErrors += 1;
      return full;
    }
    const visit = (item) => {
      if (Array.isArray(item)) return item.forEach(visit);
      if (!item || typeof item !== 'object') return;
      const types = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
      if (types.some((type) => ['Article', 'BlogPosting', 'NewsArticle'].includes(type))) {
        articleFound = true;
        const current = Array.isArray(item.citation) ? item.citation : item.citation ? [item.citation] : [];
        item.citation = [...new Set([...current, ...urls])];
      }
      Object.values(item).forEach(visit);
    };
    visit(data);
    return `${open}${JSON.stringify(data)}${close}`;
  });
  if (parseErrors) throw new Error(`${rel}: ${parseErrors} JSON-LD parse error(s)`);
  if (!articleFound) throw new Error(`${rel}: Article JSON-LD missing`);
  return output;
}

function addArticleEvidence() {
  let visibleAdded = 0;
  let schemaUpdated = 0;
  for (const rel of [...listHtml('content-site/blog'), ...listHtml('content-site/news')]) {
    let html = read(rel);
    const topic = topicOf(html);
    const kind = evidenceKind(rel, topic);
    const sourceUrls = SOURCES[kind].sources.map((source) => source.url);
    const beforeSchema = html;
    html = mergeArticleCitations(html, sourceUrls, rel);
    if (html !== beforeSchema) schemaUpdated += 1;
    if (!/class=["'][^"']*content-evidence/i.test(html)) {
      html = insertEvidence(html, evidenceBlock(kind, topic, rel.startsWith('content-site/news/')), rel);
      visibleAdded += 1;
    } else {
      html = ensureEvidenceSourceDomains(html, kind);
    }
    write(rel, html);
  }
  return { visibleAdded, schemaUpdated };
}

function assertSame(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(message);
}

function verifyBaselineConstraints(baseline) {
  for (const [rel, expected] of Object.entries(baseline.protectedFiles)) {
    if (sha(read(rel)) !== expected) throw new Error(`Protected file changed: ${rel}`);
  }
  assertSame(imageSignature(read('content-site/index.html')), baseline.homepageImages, 'Homepage image references changed');
  for (const [rel, expected] of Object.entries(baseline.products)) {
    const html = read(rel);
    assertSame(titleOf(html), expected.title, `${rel}: product title changed`);
    assertSame(canonicalOf(html), expected.canonical, `${rel}: product canonical changed`);
    assertSame(tagText(html, 'h1'), expected.h1, `${rel}: product H1 changed`);
    assertSame(imageSignature(html), expected.images, `${rel}: product image references changed`);
    assertSame(sha(stripText(html)), expected.visibleTextHash, `${rel}: product visible text changed`);
    assertSame(sha(chatBlock(html)), expected.chatHash, `${rel}: product chat box changed`);
  }
  for (const [rel, expected] of Object.entries(baseline.articles)) {
    const html = read(rel);
    assertSame(titleOf(html), expected.title, `${rel}: article title changed`);
    assertSame(canonicalOf(html), expected.canonical, `${rel}: article canonical changed`);
    assertSame(tagText(html, 'h1'), expected.h1, `${rel}: article H1 changed`);
    assertSame(imageSignature(html), expected.images, `${rel}: article image references changed`);
    assertSame(sha(chatBlock(html)), expected.chatHash, `${rel}: article chat box changed`);
    assertSame(sha(authorBlock(html)), expected.authorHash, `${rel}: article author block changed`);
  }
  for (const [rel, expected] of Object.entries(baseline.assetHashes)) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full) || sha(fs.readFileSync(full)) !== expected) throw new Error(`Image asset changed: ${rel}`);
  }
  const currentSitemaps = sitemapUrls();
  for (const [rel, urls] of Object.entries(baseline.sitemapUrls)) {
    const currentUrls = new Set(currentSitemaps[rel] || []);
    for (const url of urls) {
      if (!currentUrls.has(url)) throw new Error(`Protected sitemap URL removed: ${rel} -> ${url}`);
    }
  }
}

function auditResults() {
  const all = listHtml('content-site');
  const overlong = [];
  const missingOg = [];
  let jsonErrors = 0;
  for (const rel of all) {
    const html = read(rel);
    const title = titleOf(html);
    if ([...title].length > 60) overlong.push({ rel, length: [...title].length, title });
    if (!metaValue(html, 'og:image')) missingOg.push(rel);
    for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
      try { JSON.parse(match[1]); } catch { jsonErrors += 1; }
    }
  }
  let productPriority = 0;
  for (const rel of listHtml('content-site/products')) {
    const html = read(rel);
    let galleryStart = html.search(/<div\b[^>]*class=["'][^"']*\bgallery\b[^"']*["'][^>]*>/i);
    if (galleryStart < 0) galleryStart = Math.max(0, html.search(/<h1\b/i));
    const img = [...html.slice(galleryStart).matchAll(/<img\b[^>]*>/gi)].find((candidate) => !/\/logo\//i.test(candidate[0]))?.[0] || '';
    if (/\bwidth="\d+"/.test(img) && /\bheight="\d+"/.test(img) && /\bloading="eager"/.test(img) && /\bfetchpriority="high"/.test(img) && /aspect-ratio:\d+\s*\/\s*\d+\s*!important/.test(img)) productPriority += 1;
  }
  let evidencePages = 0;
  let twoAuthorityDomains = 0;
  const articleFiles = [...listHtml('content-site/blog'), ...listHtml('content-site/news')];
  for (const rel of articleFiles) {
    const html = read(rel);
    if (/class=["'][^"']*content-evidence/i.test(html)) evidencePages += 1;
    const domains = new Set();
    for (const match of html.matchAll(/<a\b[^>]*href=["'](https?:\/\/[^"'#]+)/gi)) {
      try {
        const host = new URL(match[1]).hostname.replace(/^www\./, '');
        if (!host.endsWith('bestpackfactory.com') && host !== 'wa.me') domains.add(host);
      } catch {}
    }
    if (domains.size >= 2) twoAuthorityDomains += 1;
  }
  return {
    htmlPages: all.length,
    overlong,
    missingOg,
    jsonErrors,
    productPriority,
    productPages: Object.keys(loadBaseline().products).length,
    evidencePages,
    twoAuthorityDomains,
    articlePages: articleFiles.length
  };
}

async function applyFixes() {
  const baseline = loadBaseline();
  verifyBaselineConstraints(baseline);
  const productImages = await reserveProductImageSpace();
  const titles = updateLongTitles();
  const ogImages = addMissingOgImages();
  const evidence = addArticleEvidence();
  verifyBaselineConstraints(baseline);
  const audit = auditResults();
  if (audit.missingOg.length) throw new Error(`Missing OG images remain: ${audit.missingOg.length}`);
  const unprotectedLong = audit.overlong.filter((item) => item.rel !== 'content-site/index.html');
  if (unprotectedLong.length) throw new Error(`Unprotected overlong titles remain: ${JSON.stringify(unprotectedLong, null, 2)}`);
  if (audit.jsonErrors) throw new Error(`JSON-LD errors remain: ${audit.jsonErrors}`);
  if (audit.productPriority !== audit.productPages) throw new Error(`Only ${audit.productPriority}/${audit.productPages} product images have reserved space and high priority`);
  if (audit.evidencePages !== audit.articlePages) throw new Error(`Only ${audit.evidencePages}/${audit.articlePages} articles have an evidence section`);
  if (audit.twoAuthorityDomains !== audit.articlePages) throw new Error(`Only ${audit.twoAuthorityDomains}/${audit.articlePages} articles cite at least two external source domains`);
  return { productImages, titles, ogImages, evidence, audit };
}

async function main() {
  const mode = process.argv[2] || '--audit';
  if (mode === '--capture-baseline') {
    const baseline = captureBaseline();
    console.log(JSON.stringify({ baseline: BASELINE_FILE, products: Object.keys(baseline.products).length, articles: Object.keys(baseline.articles).length, assets: Object.keys(baseline.assetHashes).length }, null, 2));
    return;
  }
  if (mode === '--apply') {
    console.log(JSON.stringify(await applyFixes(), null, 2));
    return;
  }
  if (mode === '--verify') {
    const baseline = loadBaseline();
    verifyBaselineConstraints(baseline);
    console.log(JSON.stringify(auditResults(), null, 2));
    return;
  }
  throw new Error(`Unknown mode: ${mode}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
