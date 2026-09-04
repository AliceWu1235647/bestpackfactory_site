/**
 * Adds the four B2B purchasing-decision rows that every product page was missing:
 * sampling time, bulk production lead time, payment terms and Incoterms.
 *
 * Buyers ask these before they ask anything else, and an audit of the 99 product
 * pages found sampling time on 0, payment terms on 0 and Incoterms on 0. The
 * values are not invented here — each one is copied from the page that already
 * states it publicly, so the product pages agree with the rest of the site:
 *
 *   Sampling time   content-site/faq.html ("physical samples in 5-7 working days")
 *   Bulk production content-site/blog/*.html ("completed within 20-30 days")
 *   Payment terms   content-site/blog/*.html ("30% T/T deposit, 70% ... shipment")
 *   Incoterms       content-site/faq.html ("FOB Shenzhen, CIF, EXW and DDP")
 *
 * Deliberately NOT added: ISO 9001, FSC, BRC or GMP. The only ISO reference on the
 * site is ISO/IEC 15415 (a barcode print-quality grade, not a factory certificate),
 * and FSC/BRC/GMP appear only inside blog posts that discuss them in general. Listing
 * them as held certifications would be a false claim on a supplier-facing spec sheet.
 */
const fs = require('fs');
const path = require('path');

const PRODUCTS_DIR = path.join(process.cwd(), 'content-site', 'products');
const MARKER = 'data-b2b-decision-specs="20260829"';

// Two-column <tr> rows, matching the existing spec-table markup on every page.
const ROWS = [
  ['Sampling time', 'Dieline and artwork proof within 24 hours; physical samples in 5–7 working days after artwork confirmation'],
  ['Bulk production', '20–30 days after final sample approval; exact schedule confirmed on the order sheet'],
  ['Payment terms', '30% T/T deposit before production, 70% balance before shipment; L/C, PayPal and Escrow also accepted'],
  ['Incoterms', 'FOB Shenzhen, CIF, EXW and DDP; freight depends on destination, quantity and packing']
];

// FAQ entries mirror the table rows so the same answers can win a rich result and
// be quoted by AI assistants, which read FAQPage JSON-LD rather than table markup.
const FAQ_ENTRIES = [
  ['How long does bulk production take?', 'Bulk production is usually completed within 20–30 days after final sample approval. Sampling takes 5–7 working days after artwork confirmation, with the dieline and artwork proof returned within 24 hours.'],
  ['What are your payment terms?', 'Standard terms are 30% T/T deposit before production and the 70% balance before shipment. Letter of credit, PayPal and Escrow are also accepted.'],
  ['Which Incoterms do you quote?', 'We quote FOB Shenzhen, CIF, EXW and DDP. Freight cost depends on the destination, order quantity and packing method.']
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Rows already present under a different wording must not be duplicated. */
function alreadyHasRow(html, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`<t[dh][^>]*>\\s*${escaped}\\s*<`, 'i').test(html);
}

function buildRows(html) {
  return ROWS.filter(([label]) => !alreadyHasRow(html, label))
    .map(([label, value]) => `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`)
    .join('');
}

/**
 * Append the rows to the last </tbody> (or </table>) of the page's spec table.
 * Both table variants on the site (`technical-spec-table`, 85 pages, and
 * `tech-table`, 13 pages) are plain two-column tables, so one insertion point works.
 */
function injectRows(html, rows) {
  const tableMatch = html.match(/<table[^>]*class="[^"]*(?:technical-spec-table|tech-table)[^"]*"[\s\S]*?<\/table>/i);
  if (!tableMatch) return null;

  const table = tableMatch[0];
  const marked = table.replace(/<table/i, `<table ${MARKER}`);
  const updated = /<\/tbody>/i.test(marked)
    ? marked.replace(/<\/tbody>/i, `${rows}</tbody>`)
    : marked.replace(/<\/table>/i, `${rows}</table>`);

  return html.replace(table, updated);
}

/** Merge the new questions into the page's existing FAQPage block, if it has one. */
function injectFaq(html) {
  const blockPattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let result = html;

  for (const match of html.matchAll(blockPattern)) {
    let data;
    try {
      data = JSON.parse(match[1].trim());
    } catch {
      continue;
    }

    const nodes = Array.isArray(data) ? data : [data];
    const faq = nodes.find(node => node && node['@type'] === 'FAQPage' && Array.isArray(node.mainEntity));
    if (!faq) continue;

    const existing = new Set(faq.mainEntity.map(entry => String(entry?.name || '').toLowerCase()));
    const additions = FAQ_ENTRIES
      .filter(([question]) => !existing.has(question.toLowerCase()))
      .map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer }
      }));
    if (!additions.length) continue;

    faq.mainEntity.push(...additions);
    const replacement = match[0].replace(match[1], JSON.stringify(data));
    result = result.replace(match[0], replacement);
    break;
  }

  return result;
}

const files = fs
  .readdirSync(PRODUCTS_DIR)
  .filter(name => name.endsWith('.html'))
  .map(name => path.join(PRODUCTS_DIR, name));

let updated = 0;
let skippedMarked = 0;
let skippedNoTable = 0;
let faqUpdated = 0;

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes(MARKER)) {
    skippedMarked += 1;
    continue;
  }

  const rows = buildRows(html);
  const withRows = rows ? injectRows(html, rows) : html;
  if (rows && !withRows) {
    skippedNoTable += 1;
    console.log(`no spec table: ${path.basename(file)}`);
    continue;
  }

  const withFaq = injectFaq(withRows);
  if (withFaq !== withRows) faqUpdated += 1;

  if (withFaq !== html) {
    fs.writeFileSync(file, withFaq);
    updated += 1;
  }
}

console.log(`product pages scanned: ${files.length}`);
console.log(`updated: ${updated}`);
console.log(`FAQ blocks extended: ${faqUpdated}`);
console.log(`skipped (already marked): ${skippedMarked}`);
console.log(`skipped (no spec table): ${skippedNoTable}`);
