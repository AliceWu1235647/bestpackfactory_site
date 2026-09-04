// samples.html was a genuine orphan: nothing on the site linked to it, so the free
// sample-kit / 24h dieline offer had no internal authority and no crawl path. It is a
// top-of-funnel conversion page, so the footer Inquiry column is where it belongs.
// Locale mirrors are skipped deliberately — their footers are translated and this
// anchor text is English.
import fs from 'node:fs';
import path from 'node:path';

const CONTENT = path.resolve(process.cwd(), 'content-site');
const LOCALE_DIRS = new Set(['ar', 'de', 'es', 'fr', 'ja']);
const ANCHOR = '<a href="/samples.html">Free Samples &amp; Dieline</a>';
// Some pages point at /contact.html, some at ../contact.html or /contact.html#rfq-form-section.
const PATTERN = /(<h3>Inquiry<\/h3><a href="[^"]*contact\.html[^"]*">Request Quote<\/a>)/;

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs));
    else if (entry.name.endsWith('.html')) out.push(abs);
  }
  return out;
}

const apply = !process.argv.includes('--dry-run');
let changed = 0;
let skippedHasLink = 0;
let skippedNoFooter = 0;

for (const file of walk(CONTENT)) {
  const rel = path.relative(CONTENT, file).replace(/\\/g, '/');
  if (LOCALE_DIRS.has(rel.split('/')[0])) continue;
  if (rel === 'samples.html') continue;
  const html = fs.readFileSync(file, 'utf8');
  if (!PATTERN.test(html)) { skippedNoFooter += 1; continue; }
  if (/href="[^"]*\/?samples\.html"/.test(html)) { skippedHasLink += 1; continue; }
  if (apply) fs.writeFileSync(file, html.replace(PATTERN, `$1${ANCHOR}`));
  changed += 1;
}

console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', changed, skippedHasLink, skippedNoFooter }, null, 2));
