// 26 product pages carry a <title> whose product name was cut mid-phrase by whatever
// generated it, then had the boilerplate suffix appended to the stump — so the tag that
// carries the most ranking weight on the page, and is the clickable line in the search
// result, reads as broken English:
//
//   Vitamin Supplement | MOQ 500 PCS | BestPackFactory
//   Weight Loss Pill | MOQ 500 PCS | BestPackFactory
//   Custom Retort Pouches for | MOQ 500 PCS | BestPackFactory
//   PET Bottles for Candy and | MOQ 500 PCS | BestPackFactory
//
// The full product name was never lost — it is sitting in the same page's <h1>. These
// are detected, not listed by hand: a page qualifies only when its title's first
// segment is a strict prefix of its own H1, which is the signature of truncation and
// cannot match a title that was deliberately written shorter than the heading.
//
// Restoring the full name makes some titles too long for the ~60 character SERP display
// width, so the suffix is fitted rather than always appended: the MOQ segment is dropped
// first, then the brand, and the product name itself is never cut. Losing "MOQ 500 PCS"
// from a handful of titles costs less than shipping a truncated noun phrase, and the MOQ
// still appears in the meta description and on the page.
//
// og:title and twitter:title mirror <title> on every one of these pages, so all three
// are rewritten together.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'content-site', 'products');
const apply = !process.argv.includes('--dry-run');

// Google truncates the displayed title around 580px, roughly 60 characters. 65 is used
// as the fitting budget so a title is not stripped of its brand for the sake of five
// characters that may well still display.
const FIT = 65;

function decode(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function escapeAttr(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeText(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildTitle(name) {
  const candidates = [
    `${name} | MOQ 500 PCS | BestPackFactory`,
    `${name} | BestPackFactory`,
    name
  ];
  return candidates.find(candidate => candidate.length <= FIT) || name;
}

const stats = { scanned: 0, rewritten: 0, changes: [], warnings: [] };

for (const fileName of fs.readdirSync(DIR).filter(name => name.endsWith('.html'))) {
  const file = path.join(DIR, fileName);
  const original = fs.readFileSync(file, 'utf8');
  stats.scanned += 1;

  const rawTitle = (original.match(/<title>([\s\S]*?)<\/title>/i) || [])[1];
  const rawH1 = (original.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1];
  if (!rawTitle || !rawH1) continue;

  const title = decode(rawTitle.trim());
  const h1 = decode(rawH1.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
  const segment = title.split('|')[0].trim();
  if (!segment || !h1) continue;

  // Strict prefix and not equal: the title stopped partway through the heading.
  const isTruncated = h1.toLowerCase() !== segment.toLowerCase() &&
    h1.toLowerCase().startsWith(segment.toLowerCase());
  if (!isTruncated) continue;

  const newTitle = buildTitle(h1);
  let html = original;

  const beforeTitle = html;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${escapeText(newTitle)}</title>`);
  if (html === beforeTitle) { stats.warnings.push(`${fileName}: <title> not replaced`); continue; }

  // Both social titles mirrored the old truncated string; a check confirms that before
  // overwriting, so a page that deliberately set a different og:title is left alone.
  for (const [pattern, label] of [
    [/(<meta property="og:title" content=")([^"]*)(")/i, 'og:title'],
    [/(<meta name="twitter:title" content=")([^"]*)(")/i, 'twitter:title']
  ]) {
    const match = html.match(pattern);
    if (!match) continue;
    if (decode(match[2]) !== title) { stats.warnings.push(`${fileName}: ${label} differs from <title>, left unchanged`); continue; }
    html = html.replace(pattern, (_m, lead, _old, tail) => `${lead}${escapeAttr(newTitle)}${tail}`);
  }

  if (apply) fs.writeFileSync(file, html);
  stats.rewritten += 1;
  stats.changes.push({ file: fileName, from: title, to: newTitle, length: newTitle.length });
}

console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', ...stats }, null, 2));
