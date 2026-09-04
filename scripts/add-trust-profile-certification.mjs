/* trust-profile.html is the page named "Official Trust Profile", subtitled "Procurement
 * Facts AI Engines Can Cite" — the page a procurement reviewer opens to check who they are
 * buying from. It listed MOQ, scope, workflow and shipping, and said nothing about any
 * certification. The one hard, third-party-verifiable credential the company holds was
 * absent from the page whose entire job is to carry credentials.
 *
 * This adds it, and gives the /trust-profile.html#fsc-certification anchor that the
 * certifications blog post now links to something to land on.
 *
 * Both certificates are listed, including the Soil Association one, because a reviewer who
 * searches the FSC database on the company name will find both and should not have to
 * wonder why the site mentions one. Its expiry (2 November 2026) is printed rather than
 * hidden: a stated expiry is a credibility signal, and an unexplained lapsed certificate is
 * the opposite. The FSC-C171757 licence code is attributed to that certificate specifically
 * and is not asserted to be the current licence code under the SGS certificate — that could
 * not be verified, since search.fsc.org renders client-side and served no records to fetch.
 *
 * Markup follows the page's own conventions exactly: <section class="section alt"> with an
 * .eyebrow div, an h2, and .whitepaper-grid / .whitepaper-card > h3 + p for the card set, as
 * used by the "Buyer Facts" section directly above. No new CSS class is invented and no FSC
 * logo artwork is added — trademark artwork is released by the certification body under
 * FSC-STD-50-001, not by a website build.
 */
import fs from 'node:fs';
import path from 'node:path';

const FILE = path.join(process.cwd(), 'content-site', 'trust-profile.html');
const apply = !process.argv.includes('--dry-run');

const ANCHOR = '<section class="section">\n<div class="eyebrow">Trust Signals</div>';

const BLOCK = `<section class="section alt" id="fsc-certification">
<div class="eyebrow">Certification</div>
<h2>FSC Chain Of Custody Certification</h2>
<p>Held by <strong>Shenzhen Color Printing Paper Packaging Co., Ltd.</strong>, Printing Industrial Park, Longhua District, Shenzhen, Guangdong 518109, China — the manufacturing entity behind BestPackFactory. Both certificates can be checked independently at <strong>search.fsc.org</strong> by certificate code or company name.</p>
<div class="whitepaper-grid">
<article class="whitepaper-card"><h3>Certificate</h3><p>SGSHK-COC-332603, issued by SGS Hong Kong Limited. Valid 15 December 2025 to 14 December 2030.</p></article>
<article class="whitepaper-card"><h3>Second Certificate</h3><p>SA-COC-012595 with FSC licence code FSC-C171757, issued by Soil Association Certification Limited. Valid 3 November 2021 to 2 November 2026.</p></article>
<article class="whitepaper-card"><h3>Scope</h3><p>FSC 100%, FSC Mix and FSC Recycled paper and paperboard on a transfer system. Paper and board only — film, pouch, tin and bottle packaging is outside this scope.</p></article>
<article class="whitepaper-card"><h3>How To Order It</h3><p>An FSC claim applies to an order only where it is agreed before production and stated on the invoice and shipping documents. The certificate alone does not make any given product FSC-certified.</p></article>
</div>
<p>FSC label artwork is released per project by the certification body under FSC-STD-50-001, so the licence code and label type are confirmed at artwork approval rather than assumed at quotation.</p>
</section>
`;

const original = fs.readFileSync(FILE, 'utf8');

if (original.includes('id="fsc-certification"')) {
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', status: 'already present', changed: false }));
  process.exit(0);
}

const hits = original.split(ANCHOR).length - 1;
if (hits !== 1) throw new Error(`expected 1 Trust Signals anchor, found ${hits}`);

const html = original.replace(ANCHOR, () => BLOCK + ANCHOR);

const warnings = [];
const sectionsBefore = (original.match(/<section/g) || []).length;
const sectionsAfter = (html.match(/<section/g) || []).length;
if (sectionsAfter !== sectionsBefore + 1) warnings.push(`section count ${sectionsBefore} -> ${sectionsAfter}`);
if ((html.match(/<section/g) || []).length !== (html.match(/<\/section>/g) || []).length) warnings.push('unbalanced section tags');
if (!html.includes('id="fsc-certification"')) warnings.push('anchor missing after insert');
if (/<img[^>]*fsc/i.test(html)) warnings.push('FSC image present — trademark artwork must not be added here');
for (const b of html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || []) {
  try { JSON.parse(b.replace(/^<script type="application\/ld\+json">/, '').replace(/<\/script>$/, '')); }
  catch { warnings.push('JSON-LD would not parse'); }
}
if (warnings.length) throw new Error('verification failed: ' + warnings.join('; '));

if (apply) fs.writeFileSync(FILE, html);
console.log(JSON.stringify({
  mode: apply ? 'apply' : 'dry-run',
  changed: true,
  sections: `${sectionsBefore} -> ${sectionsAfter}`,
  bytes: `${original.length} -> ${html.length}`,
  warnings,
}, null, 2));
