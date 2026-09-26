/**
 * expand-thin-pages.mjs
 * Adds B2B process notes and spec tables to thin finish pages and samples.html
 * to bring them above 300 words.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const FINISH_CONTENT = {
  'finishes/spot-uv-packaging.html': {
    insertBefore: '<section class="rfq-template-box">',
    html: `<section class="section tech-spec-section">
<div class="eyebrow">Process Notes</div>
<h2>How Spot UV Coating Works on Packaging</h2>
<p>Spot UV (also called local UV or partial UV) is a UV-curable varnish applied through a screen or flexo plate to selected areas of a printed surface — typically a logo, icon or headline — while the rest of the panel stays uncoated or matte laminated. The coated area cures under a UV lamp in seconds, producing a hard, high-gloss layer that contrasts sharply with the surrounding substrate.</p>
<p>Because the finish is purely additive — it sits on top of the printed ink without replacing it — spot UV can be layered over CMYK, Pantone, foil or emboss to build multi-texture packaging that catches light and invites touch. The most common combination for premium gift boxes and cosmetic cartons is: matte lamination over the full panel + spot UV on the logo area. This two-finish combination maximises the gloss-versus-matte contrast that drives perceived quality.</p>
<h3>Specification Reference for B2B RFQ</h3>
<table class="specs">
<tr><td>Typical UV layer thickness</td><td>3–8 µm (standard); 15–30 µm for raised / 3D spot UV</td></tr>
<tr><td>Minimum spot area</td><td>2 mm × 2 mm; smaller detail fills solid on press</td></tr>
<tr><td>Substrate compatibility</td><td>Coated art paper, kraft, SBS board, rigid box wrap paper</td></tr>
<tr><td>Finish options</td><td>Gloss UV, matte UV, glitter UV, soft-feel UV, raised (3D) UV</td></tr>
<tr><td>Common applications</td><td>Luxury rigid boxes, folding carton cosmetics, wine packaging, premium label stickers</td></tr>
<tr><td>MOQ</td><td>500 PCS (quoted per project with artwork)</td></tr>
<tr><td>Lead time for sample</td><td>5–7 working days after artwork confirmation</td></tr>
</table>
</section>`,
  },

  'finishes/embossing-packaging.html': {
    insertBefore: '<section class="rfq-template-box">',
    html: `<section class="section tech-spec-section">
<div class="eyebrow">Process Notes</div>
<h2>How Embossing and Debossing Work on Packaging</h2>
<p>Embossing creates a raised relief in paper or board by pressing the substrate between a male die (raised) and female die (recessed) under heat and pressure. Debossing is the reverse — the design is pressed inward. Both processes use a custom steel or copper die machined to the approved artwork, so the dimensional pattern is permanent and replicable across the entire production run.</p>
<p>Blind emboss (no ink or foil) produces a subtle tactile signature that reads as premium in low-light conditions. Combined emboss-foil (a foil stamping die and emboss die registered together) places metallic colour and texture on the same element simultaneously, which is the standard treatment for luxury gift box logos. The depth of the relief — typically 0.3 mm to 1.2 mm — is limited by paper weight and direction of grain; BestPackFactory will advise on the maximum practical depth for the chosen substrate before production.</p>
<h3>Specification Reference for B2B RFQ</h3>
<table class="specs">
<tr><td>Emboss depth</td><td>0.3–1.2 mm typical; up to 2.0 mm on thick board (1800gsm+)</td></tr>
<tr><td>Die material</td><td>Steel die (standard, cost-efficient); copper die (high detail, longer life)</td></tr>
<tr><td>Substrate compatibility</td><td>Coated art paper 128gsm+, specialty papers, rigid box wrap paper, greyboard</td></tr>
<tr><td>Finish options</td><td>Blind emboss, colour emboss, combined foil + emboss</td></tr>
<tr><td>Common applications</td><td>Rigid gift boxes, luxury cartons, wine labels, paper shopping bags, book covers</td></tr>
<tr><td>MOQ</td><td>500 PCS (die cost amortised over run)</td></tr>
<tr><td>Lead time for sample</td><td>7–10 working days (die fabrication + press run)</td></tr>
</table>
</section>`,
  },

  'finishes/matte-lamination-packaging.html': {
    insertBefore: '<section class="rfq-template-box">',
    html: `<section class="section tech-spec-section">
<div class="eyebrow">Process Notes</div>
<h2>How Matte Lamination Works on Packaging</h2>
<p>Matte lamination is a thin biaxially-oriented polypropylene (BOPP) film applied by heat and pressure to the printed surface of paper or board. The matte version uses a micro-roughened film surface that diffuses light rather than reflecting it, producing a flat, non-glare finish across the entire panel. The laminate also adds tear and moisture resistance, protects the ink layer from scuffing, and improves stiffness slightly — all without changing the printed colour appearance, since the film is optically clear.</p>
<p>Matte lamination is the most widely specified base coat for premium packaging because it serves as the foundation for secondary finishes: spot UV logos print cleanly on top of it, hot foil adheres to it reliably, and emboss dies work well on laminated board. For B2B buyers who need a single-finish option that reads as quality at low unit cost, full-panel matte lamination on a 350gsm coated board is the industry default for folding cartons, cosmetic boxes and premium mailer boxes.</p>
<h3>Specification Reference for B2B RFQ</h3>
<table class="specs">
<tr><td>Film thickness</td><td>12–25 µm BOPP (standard 15 µm for most carton work)</td></tr>
<tr><td>Surface gloss level</td><td>Approx. 8–15 GU (60° geometry) vs 80–90 GU for gloss lam</td></tr>
<tr><td>Substrate compatibility</td><td>Coated art paper 80gsm+, SBS board 250–400gsm, greyboard wrap paper</td></tr>
<tr><td>Finish options</td><td>Matte BOPP, soft-touch BOPP (velvet feel), anti-fingerprint matte</td></tr>
<tr><td>Common applications</td><td>Cosmetic cartons, mailer boxes, rigid box wrap, food carton outer</td></tr>
<tr><td>MOQ</td><td>500 PCS</td></tr>
<tr><td>Lead time for sample</td><td>5–7 working days after artwork confirmation</td></tr>
</table>
</section>`,
  },

  'finishes/soft-touch-packaging.html': {
    insertBefore: '<section class="rfq-template-box">',
    html: `<section class="section tech-spec-section">
<div class="eyebrow">Process Notes</div>
<h2>How Soft-Touch Lamination Works on Packaging</h2>
<p>Soft-touch lamination (also called velvet lamination or rubber-feel coating) uses a specialised BOPP film with a micro-texture surface engineered to mimic the feel of suede or velvet. When a consumer picks up packaging with soft-touch lamination, the tactile signal immediately communicates premium quality — the coating has become the dominant finish for high-margin cosmetics, fragrance, electronics accessories and luxury chocolate packaging.</p>
<p>From a production standpoint, soft-touch film behaves similarly to standard matte BOPP lamination — it is adhesive-bonded to the printed substrate by heat and pressure — but requires a slightly higher temperature and pressure setting to achieve uniform adhesion without surface orange-peel. The finish is compatible with spot UV overprint, hot foil stamping and embossing, though the foil adhesion threshold must be verified on the specific film grade; BestPackFactory routinely tests combinations before committing to a production run. The velvety surface is slightly more susceptible to fingerprint and scuff marks than standard matte lam, so buyers should specify packaging with minimal handling surfaces or pair with anti-fingerprint coating where needed.</p>
<h3>Specification Reference for B2B RFQ</h3>
<table class="specs">
<tr><td>Film type</td><td>Soft-touch BOPP (specialised grade); also available as water-based soft-touch coating</td></tr>
<tr><td>Tactile character</td><td>Suede / velvet feel; coefficient of friction higher than standard matte BOPP</td></tr>
<tr><td>Substrate compatibility</td><td>Coated art paper 100gsm+, SBS board, rigid box wrap paper</td></tr>
<tr><td>Secondary finish compatibility</td><td>Spot UV (verified adhesion required); hot foil (grade-dependent); emboss</td></tr>
<tr><td>Common applications</td><td>Luxury cosmetic boxes, fragrance cartons, electronics accessory packaging, premium chocolate boxes</td></tr>
<tr><td>MOQ</td><td>500 PCS</td></tr>
<tr><td>Lead time for sample</td><td>5–7 working days after artwork confirmation</td></tr>
</table>
</section>`,
  },

  'finishes/foil-stamping-packaging.html': {
    insertBefore: '<section class="rfq-template-box">',
    html: `<section class="section tech-spec-section">
<div class="eyebrow">Process Notes</div>
<h2>How Hot Foil Stamping Works on Packaging</h2>
<p>Hot foil stamping transfers a thin metallic or pigment foil from a carrier film to the substrate using a heated die and controlled pressure. The die — machined from the approved vector artwork in magnesium, zinc or copper — is heated to 80–140°C. When it contacts the foil carrier against the substrate for 0.05–0.3 seconds, the thermo-adhesive layer releases and the foil bonds permanently to the printed surface. The result is a crisp, opaque metallic element that catches light from every angle and communicates premium brand positioning more effectively than any ink or varnish finish.</p>
<p>Foil stamping is available in gold, silver, rose gold, holographic, pigment (any Pantone-matched colour), and brushed-metal effects. Holographic foil adds a prismatic rainbow shift that is highly visible on retail shelves. For luxury rigid boxes, the most common brief is: matte laminate + blind emboss + gold foil on the brand mark — a three-finish combination that reads as a premium unboxing experience. Minimum text height for clean transfer is 4 pt for serif fonts; finer detail benefits from copper-die fabrication over standard magnesium.</p>
<h3>Specification Reference for B2B RFQ</h3>
<table class="specs">
<tr><td>Die material</td><td>Magnesium (standard, lower cost); zinc; copper (fine detail, longer run life)</td></tr>
<tr><td>Foil types</td><td>Gold, silver, rose gold, bronze, holographic, brushed metal, pigment (custom Pantone)</td></tr>
<tr><td>Minimum text height</td><td>4 pt serif / 3 pt sans-serif (copper die); coarser on magnesium die</td></tr>
<tr><td>Substrate compatibility</td><td>Coated paper, art board, kraft, greyboard wrap, textured specialty paper</td></tr>
<tr><td>Common applications</td><td>Luxury gift boxes, wine labels, cosmetic cartons, jewellery packaging, certificate covers</td></tr>
<tr><td>MOQ</td><td>500 PCS (die cost included in first run quote)</td></tr>
<tr><td>Lead time for sample</td><td>7–10 working days (die fabrication included)</td></tr>
</table>
</section>`,
  },
};

for (const [rel, { insertBefore, html }] of Object.entries(FINISH_CONTENT)) {
  const filePath = path.join(root, 'content-site', rel);
  if (!fs.existsSync(filePath)) {
    console.warn('SKIP (not found):', rel);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('Process Notes')) {
    console.log('SKIP (already expanded):', rel);
    continue;
  }
  const idx = content.indexOf(insertBefore);
  if (idx === -1) {
    console.warn('SKIP (insert point not found):', rel, insertBefore);
    continue;
  }
  content = content.slice(0, idx) + html + '\n' + content.slice(idx);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('expanded:', rel);
}

// samples.html — add content after the existing intro paragraph
const samplesPath = path.join(root, 'content-site', 'samples.html');
if (fs.existsSync(samplesPath)) {
  let s = fs.readFileSync(samplesPath, 'utf8');
  if (!s.includes('What is Included in a BestPackFactory Sample Order')) {
    const insertPoint = '</section>';
    const extraContent = `
<section class="section tech-spec-section">
<div class="eyebrow">Sampling Process</div>
<h2>What is Included in a BestPackFactory Sample Order</h2>
<p>A BestPackFactory sample order is a pre-production proof that lets you verify structure, print quality, surface finish, dimensions and material before committing to a mass-production deposit. Each sample is produced using the same tooling, inks, lamination and finishing process as the bulk run — it is not a generic stock sample.</p>
<p>The standard sample set includes: one production-specification unit with your approved artwork, a printed dieline showing all cut, fold and glue lines, a material data sheet for the substrate and lamination, and a colour proof (physical Pantone swatch or digital PDF). If the packaging includes an insert, foam tray or accessory, the sample will include that component too so you can verify the fit before finalising quantities.</p>
<h3>Sample Order Reference</h3>
<table class="specs">
<tr><td>What is included</td><td>Printed unit + dieline PDF + material data sheet + colour proof</td></tr>
<tr><td>Sample quantity</td><td>Typically 1–3 units per design (additional units quoted on request)</td></tr>
<tr><td>Lead time</td><td>5–7 working days after artwork confirmation (dieline-only: 24 hours)</td></tr>
<tr><td>Sample cost</td><td>Quoted per project; deducted from bulk order value on confirmation</td></tr>
<tr><td>Revisions</td><td>Up to 2 rounds of structural revision included; major artwork changes quoted separately</td></tr>
<tr><td>How to request</td><td>Email lisa@colorprintingpackage.com with packaging type, dimensions, print file and quantity</td></tr>
</table>
<h3>How to Request a Sample</h3>
<ol>
<li>Send your packaging brief: type (box, pouch, bag), size, material preference and quantity target.</li>
<li>Attach your artwork file (AI, PDF or PSD) — or request a blank dieline template first.</li>
<li>Confirm the sample specification and receive a cost and lead-time confirmation from Lisa Wu.</li>
<li>Approve the digital proof and pay the sample fee to start production.</li>
<li>Receive the physical sample for inspection and provide written approval before bulk order.</li>
</ol>
</section>`;
    // Insert before the first </section> close
    const pos = s.indexOf('</section>');
    if (pos !== -1) {
      s = s.slice(0, pos + '</section>'.length) + extraContent + s.slice(pos + '</section>'.length);
      fs.writeFileSync(samplesPath, s, 'utf8');
      console.log('expanded: samples.html');
    }
  }
}

// thank-you.html — add noindex meta tag
const tyPath = path.join(root, 'content-site', 'thank-you.html');
if (fs.existsSync(tyPath)) {
  let t = fs.readFileSync(tyPath, 'utf8');
  if (!t.includes('noindex')) {
    t = t.replace('<meta name="robots" content="index, follow',
      '<meta name="robots" content="noindex, follow');
    if (!t.includes('noindex')) {
      t = t.replace('</head>', '<meta name="robots" content="noindex, follow"/>\n</head>');
    }
    fs.writeFileSync(tyPath, t, 'utf8');
    console.log('noindex added: thank-you.html');
  }
}
console.log('\nDone.');
