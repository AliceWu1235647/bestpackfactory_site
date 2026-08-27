// Generate 80 new buyer-guide blog posts from the 4 data batches.
// Run from site root: node scripts/generate-80-posts.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const blogDir = path.join(root, 'content-site', 'blog');
const base = 'https://www.bestpackfactory.com';
const startDate = '2026-08-19';

const { posts: b1 } = await import('file:///C:/Users/Administrator/AccioWork/2026-08-19-13-33-58-921-3a969d12/80posts/batch-1/traffic-posts-batch-1.mjs');
const { posts: b2 } = await import('file:///C:/Users/Administrator/AccioWork/2026-08-19-13-33-58-921-3a969d12/80posts/batch-2/traffic-posts-batch-2.mjs');
const { posts: b3 } = await import('file:///C:/Users/Administrator/AccioWork/2026-08-19-13-33-58-921-3a969d12/80posts/batch-3/traffic-posts-batch-3.mjs');
const { posts: b4 } = await import('file:///C:/Users/Administrator/AccioWork/2026-08-19-13-33-58-921-3a969d12/80posts/batch-4/traffic-posts-batch-4.mjs');

const posts = [...b1, ...b2, ...b3, ...b4];

// De-duplicate slugs defensively.
const seen = new Set();
const unique = posts.filter((p) => {
  if (seen.has(p.slug)) {
    console.warn('DUPLICATE slug skipped:', p.slug);
    return false;
  }
  seen.add(p.slug);
  return true;
});

function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function fmtDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const json = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

function render(post, date, displayDate) {
  const url = `${base}/blog/${post.slug}.html`;
  const articleSchema = { '@context': 'https://schema.org', '@type': 'Article', headline: post.title, description: post.description, datePublished: date, dateModified: date, author: { '@type': 'Organization', name: 'BestPackFactory', url: `${base}/about.html` }, publisher: { '@type': 'Organization', name: 'BestPackFactory', logo: { '@type': 'ImageObject', url: `${base}/assets/logo/bestpackfactory-logo.svg` } }, mainEntityOfPage: { '@type': 'WebPage', '@id': url } };
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: post.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
  const breadcrumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` }, { '@type': 'ListItem', position: 2, name: 'Blog', item: `${base}/blog.html` }, { '@type': 'ListItem', position: 3, name: post.title, item: url }] };
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(post.title)} | BestPackFactory</title><meta name="description" content="${esc(post.description)}"/><link rel="canonical" href="${url}"/><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"/><meta property="og:title" content="${esc(post.title)}"/><meta property="og:description" content="${esc(post.description)}"/><meta property="og:url" content="${url}"/><meta property="og:type" content="article"/><meta property="og:site_name" content="BestPackFactory"/><link rel="alternate" type="text/plain" href="${base}/llms.txt"/><link href="../css/style.css" rel="stylesheet"/><script type="application/ld+json">${json(articleSchema)}</script><script type="application/ld+json">${json(faqSchema)}</script><script type="application/ld+json">${json(breadcrumb)}</script></head><body>
<div class="topbar"><div>Custom Packaging Manufacturer | MOQ 500 PCS</div><div>Sales Manager: Lisa Wu · lisa@colorprintingpackage.com</div></div><header class="header"><div class="header-inner"><a class="logo" href="../index.html"><img alt="BestPackFactory" src="../assets/logo/bestpackfactory-logo.svg?v=1.2"/></a><nav class="nav"><a href="/index.html">Home</a><a href="/products.html">Products</a><a href="/industries.html">Industries</a><a href="/materials.html">Materials</a><a href="/finishes.html">Finishes</a><a href="/factory.html">Factory</a><a href="/blog.html">Blog</a><a href="/news.html">News</a><a href="/contact.html">Contact</a></nav><a class="btn" href="../contact.html">Get Quote</a></div></header>
<article class="section geo-article" style="max-width:920px;margin:auto"><div class="eyebrow">${esc(post.intent)}</div><h1>${esc(post.title)}</h1><p style="color:var(--muted)">Published ${displayDate} · Buyer guide · By BestPackFactory</p><section class="ai-snapshot quick-answer-box"><h2>Quick answer</h2><p>${esc(post.quick)}</p></section>
<section class="tech-spec-section geo-table-block"><h2>Decision table</h2><div class="spec-scroll"><table class="technical-spec-table"><tbody>${post.rows.map((r, i) => `<tr>${r.map((c) => `<${i ? 'td' : 'th'}>${esc(c)}</${i ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</tbody></table></div></section>
${post.sections.map(([h, p]) => `<section><h2>${esc(h)}</h2><p>${esc(p)}</p></section>`).join('\n')}
<section><h2>Buyer checklist</h2><ol>${post.checklist.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></section>
<section class="faq-block"><h2>Frequently asked questions</h2>${post.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>
${post.sources.length ? `<section><h2>Sources and further reading</h2><ul>${post.sources.map(([n, u]) => `<li><a href="${esc(u)}" rel="noopener noreferrer">${esc(n)}</a></li>`).join('')}</ul><p><small>External sources support specific regulatory, testing or buyer-problem context. Product recommendations remain project-specific.</small></p></section>` : ''}
<section><h2>Related packaging options</h2><ul>${post.links.map(([u, n]) => `<li><a href="${u}">${esc(n)}</a></li>`).join('')}</ul></section><div style="background:var(--bg);border-radius:16px;padding:2rem;margin-top:2rem"><h2>Prepare a quote-ready packaging brief</h2><p>Send product dimensions, fill weight, quantity, artwork status, material or performance requirements, destination country and target date. Recommendations and compliance documents are confirmed for the selected project specification.</p><a class="btn" href="../contact.html">Request a project quote</a></div></article>
<footer class="footer"><div><h3>BestPackFactory</h3><p>B2B custom packaging for boxes, bags, labels and printed accessories.</p></div><div><h3>Explore</h3><a href="/products.html">Products</a><a href="/blog.html">Buyer guides</a></div><div><h3>Contact</h3><p>lisa@colorprintingpackage.com</p></div></footer><script defer src="../js/main.js"></script></body></html>`;
}

fs.mkdirSync(blogDir, { recursive: true });
const written = [];
unique.forEach((post, i) => {
  const date = addDays(startDate, Math.floor(i / 8));
  const file = path.join(blogDir, `${post.slug}.html`);
  fs.writeFileSync(file, render(post, date, fmtDate(date)), 'utf8');
  written.push({ slug: post.slug, date });
});

// blog.html index card grid
const blogIndex = path.join(root, 'content-site', 'blog.html');
let indexHtml = fs.readFileSync(blogIndex, 'utf8');
const marker = '<!-- TRAFFIC_BLOGS_20260819 -->';
const cards = `${marker}\n${unique.map((p) => `<article class="whitepaper-card"><div class="eyebrow">Buyer Guide</div><h3><a href="blog/${p.slug}.html">${esc(p.title)}</a></h3><p>${esc(p.description)}</p><a class="btn light" href="blog/${p.slug}.html">Read guide</a></article>`).join('\n')}`;
if (!indexHtml.includes(marker)) {
  const gridClose = indexHtml.indexOf('</div>', indexHtml.indexOf('class="whitepaper-grid"'));
  if (gridClose < 0) throw new Error('Blog card grid not found');
  indexHtml = indexHtml.slice(0, gridClose) + cards + '\n' + indexHtml.slice(gridClose);
  fs.writeFileSync(blogIndex, indexHtml, 'utf8');
}

// ai-index.json (public + content-site)
for (const relative of ['public/ai-index.json', 'content-site/ai-index.json']) {
  const target = path.join(root, relative);
  if (!fs.existsSync(target)) continue;
  const data = JSON.parse(fs.readFileSync(target, 'utf8'));
  data.geo_guides = Array.isArray(data.geo_guides) ? data.geo_guides : [];
  for (const post of unique) {
    if (!data.geo_guides.some((item) => item.url === `blog/${post.slug}.html`)) {
      data.geo_guides.push({ title: post.title, url: `blog/${post.slug}.html`, keywords: post.intent.replace(/^.*?·\s*/, '') });
    }
  }
  data.updated = '2026-08-19';
  fs.writeFileSync(target, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

// llms.txt (public + content-site)
for (const relative of ['public/llms.txt', 'content-site/llms.txt']) {
  const target = path.join(root, relative);
  if (!fs.existsSync(target)) continue;
  let text = fs.readFileSync(target, 'utf8');
  const markerText = '## New buyer guides (late August 2026)';
  if (!text.includes(markerText)) {
    text += `\n\n${markerText}\n\n${unique.map((p) => `- [${p.title}](${base}/blog/${p.slug}.html): ${p.description}`).join('\n')}\n`;
    fs.writeFileSync(target, text, 'utf8');
  }
}

console.log(`Generated ${written.length} buyer guides (batches 1-4), updated blog index, ai-index.json and llms.txt.`);
