// 110 pages — 93 of them blog posts, plus five locale homepages and about.html —
// shipped no <meta name="description"> at all. lib/static-pages.js fell through to a
// fixed string, so every one of those pages was served to Google with the identical
// description "BestPackFactory custom packaging manufacturer.", which is the worst
// possible outcome for a blog whose whole purpose is to rank on distinct questions.
//
// 106 of them already carried a written og:description sitting unused a few lines
// below. Those are promoted verbatim: the copy was written for the page, so inventing
// a second description would only create a new way for the two to disagree. The
// remaining four had neither, and are written here from their own lead paragraph and
// H2 outline.
//
// lib/static-pages.js was changed in the same pass to fall back to og:description
// before the generic string. That fixes the served output on its own; this script
// fixes the source files so the HTML is self-describing and the next page added to
// content-site/blog is not silently missing a field nobody looks at.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content-site');
const apply = !process.argv.includes('--dry-run');

// The four pages with no og:description either. Written from each page's own lead
// paragraph and H2 outline, not from the product catalogue.
const AUTHORED = {
  'blog/coffee-bag-material-guide.html':
    'How to choose between MOPP/VMPET/PE, PET/AL/PE and kraft coffee bag structures, with valve position, zipper type and the test methods used to verify barrier.',
  'blog/how-to-choose-a-magnetic-gift-box.html':
    'A buyer guide to magnetic gift box structure, greyboard thickness, magnet size and tolerance, surface finishing and inserts, with acceptance evidence.',
  'blog/pet-food-packaging-buyer-guide.html':
    'A B2B specification guide to heavy-duty pet food bags: laminate thickness, flat bottom construction, zipper strength, puncture resistance and drop testing.',
  'blog/variable-data-pharma-packaging.html':
    'GS1 DataMatrix and ECC200 coding for pharma cartons, with ISO/IEC 15415 grade targets, camera inspection requirements and anti-abrasion measures.'
};

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const stats = { promoted: 0, authored: 0, skipped: 0, warnings: [] };

for (const file of walk(CONTENT)) {
  const original = fs.readFileSync(file, 'utf8');
  if (/<meta name="description"/i.test(original)) continue;

  const rel = path.relative(CONTENT, file).split(path.sep).join('/');
  const og = (original.match(/<meta property="og:description" content="([^"]*)"/i) || [])[1];
  let description;
  let source;
  if (og && og.trim()) { description = og; source = 'og'; }
  else if (AUTHORED[rel]) { description = AUTHORED[rel]; source = 'authored'; }
  else { stats.warnings.push(`${rel}: no og:description and no authored fallback`); stats.skipped += 1; continue; }

  // og:description is already attribute-escaped in the source, so promoting it verbatim
  // is correct; only the authored strings need checking, and none of them contain
  // a quote or ampersand.
  if (source === 'authored' && /["&<>]/.test(description)) {
    stats.warnings.push(`${rel}: authored description needs escaping`);
    stats.skipped += 1;
    continue;
  }

  // Placed immediately after </title>, which every one of these pages has, so the
  // description sits where a human editor would expect rather than at the end of head.
  if (!/<\/title>/i.test(original)) {
    stats.warnings.push(`${rel}: no </title> to anchor insertion`);
    stats.skipped += 1;
    continue;
  }

  const tag = `<meta name="description" content="${description}"/>`;
  const updated = original.replace(/<\/title>/i, () => `</title>\n<meta name="description" content="${description}"/>`);
  if (updated === original) { stats.warnings.push(`${rel}: insertion made no change`); stats.skipped += 1; continue; }

  if (apply) fs.writeFileSync(file, updated);
  if (source === 'og') stats.promoted += 1; else stats.authored += 1;
  void tag;
}

if (apply) {
  const remaining = walk(CONTENT).filter(f => !/<meta name="description"/i.test(fs.readFileSync(f, 'utf8')));
  stats.stillMissing = remaining.length;
}

console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', ...stats }, null, 2));
