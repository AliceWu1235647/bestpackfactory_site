/* The site made an FSC claim it could not be checked against.
 *
 * Five pages said some form of "BestPackFactory holds FSC Chain of Custody certification",
 * one of them adding "FSC certificate number: available on request" — while faq.html
 * answered the compliance question with only a disclaimer, "we do not claim certifications
 * we do not hold". To a procurement reviewer those two read as a contradiction, and an
 * unverifiable sustainability claim is the exact shape of claim that EU/UK greenwashing
 * enforcement targets. The blog post itself tells buyers to verify supplier certificates at
 * info.fsc.org, which the site then made impossible for its own.
 *
 * Two certificates were supplied, both held by Shenzhen Color Printing Paper Packaging
 * Co., Ltd. at Printing Industrial Park, Longhua District, Shenzhen, Guangdong 518109 —
 * byte-identical to the address in this site's own footer, which is what establishes that
 * the claims belong to this operator rather than to a trading name with no certificate.
 *
 *   SGS Hong Kong Limited   SGSHK-COC-332603 (doc CN25/00008559)   2025-12-15 -> 2030-12-14
 *   Soil Association Cert.  SA-COC-012595, licence FSC-C171757     2021-11-03 -> 2026-11-02
 *
 * So the claims were true; they were just unusable. The fix is to make them specific and
 * checkable, and to bound them the way the certificates do:
 *
 *   - scope is PAPER AND PAPERBOARD. Film, pouches, tins and bottles are outside it, so
 *     "certified materials across all paper and board products" and anything that lets a
 *     reader carry FSC over to film structures gets narrowed.
 *   - both certificates carry the FSC-STD-40-004 condition that the certificate alone is
 *     not evidence any particular product is FSC-certified: an order counts only where the
 *     FSC claim is stated on the invoice and shipping documents. Every claim now says so.
 *   - the scope is a transfer system, not credit, so the output claim matches the input.
 *   - text only. No FSC logo artwork is added anywhere: under FSC-STD-50-001 trademark
 *     artwork is released by the certification body, not by a website build.
 *
 * The licence code FSC-C171757 is printed on the Soil Association certificate; the SGS
 * certificate prints no FSC-C code (FSC A000523 on it is SGS's own trademark licence, not
 * the client's). Licence codes normally follow the organisation across a change of
 * certification body, but that could not be confirmed — search.fsc.org renders client-side
 * and returned no records to fetch. So the repeated inline claims cite only the SGS
 * certificate code, which is documented, and FSC-C171757 appears once, attributed to the
 * certificate that actually carries it. Nothing asserts it is the current licence code.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'content-site');
const apply = !process.argv.includes('--dry-run');

const SGS = 'SGSHK-COC-332603';
const HOLDER = 'Shenzhen Color Printing Paper Packaging Co., Ltd.';

const stats = { edits: 0, filesChanged: 0, skippedAlreadyDone: 0, jsonLdBlocksChecked: 0, warnings: [] };

/* Each entry is an exact string that must be present `count` times, or already replaced. */
const EDITS = [];
const edit = (file, count, from, to) => EDITS.push({ file, count, from, to });

// --- 1. the five first-person claims -----------------------------------------------
edit('blog/eco-friendly-packaging-options.html', 1,
  'BestPackFactory holds FSC CoC certification and can supply FSC-labelled packaging with the FSC licence number on the carton.',
  `BestPackFactory produces under FSC® Chain of Custody certificate ${SGS} (issued by SGS Hong Kong Limited, valid to 14 December 2030), covering FSC 100%, FSC Mix and FSC Recycled paper and paperboard on a transfer system. FSC-labelled cartons can be produced where the FSC claim is agreed at order stage and stated on the invoice and shipping documents, and where the trademark artwork has been released by the certification body.`);

edit('blog/kraft-paper-packaging-guide.html', 1,
  'BestPackFactory holds FSC Chain of Custody certification for kraft paper products.',
  `BestPackFactory holds FSC® Chain of Custody certification (certificate ${SGS}, SGS Hong Kong Limited, valid to 14 December 2030), so FSC 100%, FSC Mix or FSC Recycled kraft can be supplied where the FSC claim is specified on the order and carried on the invoice and shipping documents.`);

edit('blog/packaging-trends-2026.html', 1,
  'BestPackFactory sources FSC-certified board and can provide PCR content documentation for flexible film structures.',
  `BestPackFactory sources FSC 100%, FSC Mix and FSC Recycled board under FSC® Chain of Custody certificate ${SGS}, and can provide PCR content documentation for flexible film structures. The FSC scope covers paper and board only — film structures are evidenced by PCR content declarations rather than by an FSC claim.`);

edit('blog/sustainable-packaging-certifications-explained.html', 1,
  'BestPackFactory holds FSC chain-of-custody certification and can supply certified materials across all paper and board products.',
  `BestPackFactory holds FSC® Chain of Custody certification (certificate ${SGS}, SGS Hong Kong Limited, valid to 14 December 2030) covering FSC 100%, FSC Mix and FSC Recycled paper and paperboard. The scope is paper and board; film, tin and bottle packaging is not covered by it.`);

edit('blog/sustainable-packaging-certifications-explained.html', 1,
  "BestPackFactory's FSC certificate number: available on request.",
  `BestPackFactory's FSC® Chain of Custody certificate is ${SGS}, issued by SGS Hong Kong Limited to ${HOLDER} and valid from 15 December 2025 to 14 December 2030. Verify it yourself at <strong>search.fsc.org</strong> rather than taking it on trust — that is what the database is for. Full certification detail is on our <a href="/trust-profile.html#fsc-certification">trust profile</a>.`);

edit('blog/sustainable-packaging-certifications-explained.html', 1,
  'Contact BestPackFactory for FSC-labelled packaging with our licence number displayed.',
  `Contact BestPackFactory to produce FSC-labelled packaging under certificate ${SGS}. An FSC claim can only be applied where it is agreed before production and stated on the invoice and shipping documents, and where the label artwork has been released by the certification body.`);

// --- 2. faq.html — answer the compliance question with the certificate ---------------
/* The disclaimer stays; it is the right instinct. It just needed something to sit beside. */
const FAQ_OLD = 'FDA-compliant ink/material statements, MSDS and test reports on request. Certificates are verified per order; we do not claim certifications we do not hold.';
const FAQ_NEW = `FSC® Chain of Custody certificate ${SGS} (SGS Hong Kong Limited, valid to 14 December 2030) covering FSC 100%, FSC Mix and FSC Recycled paper and paperboard, verifiable at search.fsc.org. Also FDA-compliant ink/material statements, MSDS and test reports on request. An FSC claim applies to an order only where it is agreed in advance and stated on the invoice and shipping documents. Certificates are verified per order; we do not claim certifications we do not hold.`;
edit('faq.html', 2, FAQ_OLD, FAQ_NEW); // once in the visible body, once in FAQPage JSON-LD

// --- 3. llms.txt — it listed ISO 9001 and BRC, and omitted the one we can evidence ---
/* No ISO or BRC certificate was supplied, so those are unverifiable in exactly the way the
 * FSC claim was. They are dropped rather than restated; FSC replaces them because it is the
 * one with a document behind it. If ISO/BRC certificates exist they can be added back. */
edit('llms.txt', 1,
  '- Certifications: ISO 9001, BRC, FDA compliance, ASTM D3475 for child resistant packaging',
  `- Certifications: FSC Chain of Custody certificate ${SGS} (SGS Hong Kong Limited, 15 December 2025 to 14 December 2030), scope FSC 100%/FSC Mix/FSC Recycled paper and paperboard, transfer system, verifiable at search.fsc.org. FDA-compliant ink and material statements, MSDS and test reports on request. ASTM D3475 reference for child-resistant packaging. An FSC claim applies to an order only where stated on the invoice and shipping documents.`);

const visible = s => {
  const i = s.indexOf('<body');
  return (i === -1 ? s : s.slice(i))
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};

const byFile = new Map();
for (const e of EDITS) {
  if (!byFile.has(e.file)) byFile.set(e.file, []);
  byFile.get(e.file).push(e);
}

for (const [rel, edits] of byFile) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) { stats.warnings.push(`${rel}: missing`); continue; }
  const original = fs.readFileSync(abs, 'utf8');
  let html = original;
  let applied = 0;

  for (const e of edits) {
    const have = html.split(e.from).length - 1;
    if (have === 0) {
      if (html.includes(e.to)) { stats.skippedAlreadyDone += 1; continue; }
      stats.warnings.push(`${rel}: source text not found — "${e.from.slice(0, 60)}…"`);
      continue;
    }
    if (have !== e.count) {
      stats.warnings.push(`${rel}: expected ${e.count} of "${e.from.slice(0, 40)}…", found ${have} — skipped`);
      continue;
    }
    html = html.split(e.from).join(e.to);
    applied += have;
  }

  if (html === original) continue;

  // JSON-LD must survive: the FAQ answer is embedded in a FAQPage block.
  const blocks = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
  let jsonOk = true;
  for (const b of blocks) {
    stats.jsonLdBlocksChecked += 1;
    const body = b.replace(/^<script type="application\/ld\+json">/, '').replace(/<\/script>$/, '');
    try { JSON.parse(body); } catch { jsonOk = false; }
  }
  if (!jsonOk) { stats.warnings.push(`${rel}: JSON-LD would not parse — left unchanged`); continue; }

  // These edits are deliberately visible, so assert the text GREW rather than that it matched.
  if (rel.endsWith('.html') && visible(html).length <= visible(original).length) {
    stats.warnings.push(`${rel}: visible text did not grow as expected — left unchanged`);
    continue;
  }
  // No FSC trademark artwork may be introduced by this script.
  if (/<img[^>]*fsc/i.test(html) && !/<img[^>]*fsc/i.test(original)) {
    stats.warnings.push(`${rel}: would add an FSC image — left unchanged`);
    continue;
  }

  if (apply) fs.writeFileSync(abs, html);
  stats.filesChanged += 1;
  stats.edits += applied;
}

console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', ...stats }, null, 2));
