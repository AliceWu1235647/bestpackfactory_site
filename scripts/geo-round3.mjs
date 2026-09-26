/**
 * geo-round3.mjs
 * 1. Material blog: add "Typical Spec" column to decision table + sustainability section
 * 2. Products page: add "By Industry" quick-reference section after Compare table
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ─── 1. MATERIAL BLOG: Add Typical Spec column to decision table ──────────
{
  const filePath = path.join(root, 'content-site', 'blog', 'custom-packaging-material-selection-guide.html');
  let h = fs.readFileSync(filePath, 'utf8');

  if (h.includes('Typical spec')) {
    console.log('SKIP material blog: Typical spec column already present');
  } else {
    // Replace the table header
    h = h.replace(
      '<tr><th>Buyer need</th><th>Recommended material path</th><th>Best for</th></tr>',
      '<tr><th>Buyer need</th><th>Recommended material path</th><th>Typical spec</th><th>Best for</th></tr>'
    );
    // Add spec to each row
    h = h.replace(
      '<td>Premium gift or retail box</td><td>Rigid board, wrapped paper, magnetic closure, foam or paper insert</td><td>Luxury gift boxes, cosmetics, jewelry, electronics</td>',
      '<td>Premium gift or retail box</td><td>Rigid board, wrapped paper, magnetic closure, foam or paper insert</td><td>1.5–2.5 mm greyboard + 128 gsm coated wrap</td><td>Luxury gift boxes, cosmetics, jewelry, electronics</td>'
    );
    h = h.replace(
      '<td>Lightweight ecommerce shipping</td><td>Corrugated board or paperboard mailer</td><td>Mailer boxes, subscription boxes, apparel packaging</td>',
      '<td>Lightweight ecommerce shipping</td><td>Corrugated board or paperboard mailer</td><td>E-flute 1.5 mm / B-flute 3 mm; or 350–450 gsm SBS mailer</td><td>Mailer boxes, subscription boxes, apparel packaging</td>'
    );
    h = h.replace(
      '<td>Natural food or bakery look</td><td>Kraft paper, food-grade paperboard, PE/PLA/water-based coating</td><td>Burger boxes, bakery boxes, paper bags</td>',
      '<td>Natural food or bakery look</td><td>Kraft paper, food-grade paperboard, PE/PLA/water-based coating</td><td>250–350 gsm food-grade kraft; PE coat ≥ 15 µm or PLA bio-coat</td><td>Burger boxes, bakery boxes, paper bags</td>'
    );
    h = h.replace(
      '<td>High aroma or moisture barrier</td><td>PET/AL/PE, MOPP/VMPET/PE or other laminated films</td><td>Coffee bags, pet food bags, supplement pouches</td>',
      '<td>High aroma or moisture barrier</td><td>PET/AL/PE, MOPP/VMPET/PE or other laminated films</td><td>80–120 µm total; typical: PET 12 / AL 7 / PE 80 µm</td><td>Coffee bags, pet food bags, supplement pouches</td>'
    );
    h = h.replace(
      '<td>Clear product visibility</td><td>PET window, clear film, transparent label or window patch</td><td>Retail cartons, food boxes, labels and bags</td>',
      '<td>Clear product visibility</td><td>PET window, clear film, transparent label or window patch</td><td>12–25 µm PET film; window patch die-cut ± 0.5 mm</td><td>Retail cartons, food boxes, labels and bags</td>'
    );
    console.log('✓ material blog: Typical spec column added');
  }

  // Add sustainability section before "Related packaging buyer resources"
  const sustainInsert = '<h2>Related packaging buyer resources</h2>';
  if (h.includes('Material Sustainability')) {
    console.log('SKIP material blog: sustainability section already present');
  } else {
    const sustainSection = `<h2>Material Sustainability &amp; Certification Compatibility</h2>
<p>Sustainability requirements are now a standard question in B2B packaging RFQs, particularly for North American and European buyers. The table below shows which substrate types are compatible with the major certification programmes and which meet common retailer mandates.</p>
<table class="technical-spec-table"><tbody>
<tr><th>Material</th><th>Recyclable</th><th>FSC / PEFC compatible</th><th>Compostable option</th><th>Notes</th></tr>
<tr><td>Rigid greyboard + coated wrap</td><td>Yes (paper stream)</td><td>Yes — FSC-certified greyboard &amp; wrap available</td><td>No</td><td>Most common for luxury gift boxes; recycled greyboard (RCB) also available</td></tr>
<tr><td>Corrugated board</td><td>Yes (paper stream)</td><td>Yes — FSC Mix or 100% certified</td><td>No</td><td>High post-consumer recycled content (60–80% PCR) available as standard</td></tr>
<tr><td>SBS / CRB folding carton</td><td>Yes (paper stream)</td><td>Yes — specify FSC at RFQ stage</td><td>No</td><td>CRB (recycled board) reduces virgin fibre use; SBS gives better print surface</td></tr>
<tr><td>Kraft paper bags / wraps</td><td>Yes (paper stream)</td><td>Yes</td><td>If uncoated or water-based coated</td><td>Avoid PE lamination if compostability is required; use PLA or aqueous coating</td></tr>
<tr><td>Laminated film pouch (PET/AL/PE)</td><td>No (multi-layer barrier)</td><td>N/A</td><td>No</td><td>Highest barrier performance; specify mono-material PE/PE or BOPP/PE for recyclability</td></tr>
<tr><td>Mono-material PE or BOPP pouch</td><td>Yes (flexible film stream)</td><td>N/A</td><td>No</td><td>Recyclable via store drop-off (How2Recycle compatible); lower barrier than PET/AL/PE</td></tr>
<tr><td>PLA-coated kraft pouch</td><td>No (conventional recycling)</td><td>Yes (paper layer)</td><td>Yes (OK Compost Industrial)</td><td>Requires industrial composting facility; verify retailer acceptance before specifying</td></tr>
</tbody></table>
<p>BestPackFactory can supply FSC-certified substrates (certificate SGSHK-COC-332603) across rigid box, corrugated and folding carton product lines. For food contact applications, migration test reports (FDA 21 CFR 177.1520; EU Regulation 10/2011) are available on request. Specify sustainability requirements in the RFQ to receive substrate recommendations with matching certification documentation.</p>
`;
    const idx = h.indexOf(sustainInsert);
    if (idx === -1) throw new Error('Insert point not found in material blog');
    h = h.slice(0, idx) + sustainSection + h.slice(idx);
    console.log('✓ material blog: sustainability section added');
  }

  fs.writeFileSync(filePath, h, 'utf8');
}

// ─── 2. PRODUCTS PAGE: Add "By Industry" section after Compare table ───────
{
  const filePath = path.join(root, 'content-site', 'products.html');
  let h = fs.readFileSync(filePath, 'utf8');

  if (h.includes('By Industry')) {
    console.log('SKIP products.html: By Industry section already present');
  } else {
    // Insert after the closing div of the Compare section, before "Route the project" H2
    const insertBefore = '<h2>Route the project by product and buying requirement</h2>';
    const idx = h.indexOf(insertBefore);
    if (idx === -1) throw new Error('Insert point not found in products.html');

    const industrySection = `<div class="blog-section"><div class="blog-section-inner">
<h2>Select Packaging By Industry</h2>
<p>Different industries require different structural, compliance and aesthetic specifications. Use this table as a starting filter — then browse the product families above or <a href="/contact.html">request a quote</a> for your specific format.</p>
<div class="spec-scroll"><table class="technical-spec-table">
<thead><tr><th>Industry</th><th>Recommended formats</th><th>Key spec requirements</th></tr></thead>
<tbody>
<tr><td><strong>Food &amp; Beverage</strong></td><td>Folding cartons, stand-up pouches, paper bags, flat-bottom bags, PET bottles</td><td>Food-grade substrate; FDA 21 CFR or EU 10/2011 compliance; barrier film for moisture / oxygen; grease-resistant coating for bakery</td></tr>
<tr><td><strong>Coffee &amp; Tea</strong></td><td>Coffee bags (valve), flat-bottom bags, stand-up pouches</td><td>One-way degassing valve; PET/AL/PE or MOPP/VMPET/PE barrier; resealable zipper; roast date window or clear gusset</td></tr>
<tr><td><strong>Beauty &amp; Cosmetics</strong></td><td>Rigid gift boxes, folding cartons, paper bags, labels, stickers</td><td>Matte or soft-touch lamination; spot UV or foil stamping; pantone-matched printing; magnetic closure for gift sets</td></tr>
<tr><td><strong>Health &amp; Supplements</strong></td><td>Folding cartons, stand-up pouches, flat-bottom bags, labels</td><td>Moisture barrier; tamper-evident seal; FDA compliance for film; GMP-friendly carton printing; lot number / expiry date variable printing</td></tr>
<tr><td><strong>Pharmaceutical</strong></td><td>Folding cartons, labels, blister cartons</td><td>GS1 DataMatrix ready; serialisation-compatible; EN 16679 tamper-evident; child-resistant options; CMYK + Braille</td></tr>
<tr><td><strong>Pet Food</strong></td><td>Stand-up pouches, flat-bottom bags, side-gusset bags, labels</td><td>High-barrier PET/AL/PE or MOPP/VMPET/PE; zipper reseal; matte or gloss lamination; front-facing window optional</td></tr>
<tr><td><strong>E-commerce &amp; Subscription</strong></td><td>Mailer boxes, corrugated shipper boxes, paper bags, tissue paper, stickers</td><td>ISTA / ASTM D4169 transit-tested corrugated; print-ready outer for brand experience; easy-open tear strip; void-fill compatible inner</td></tr>
<tr><td><strong>Luxury &amp; Gifting</strong></td><td>Rigid magnetic boxes, drawer boxes, lid-and-base sets, ribbon, tissue</td><td>1.5–2.5 mm greyboard; soft-touch or velvet wrap; foil + emboss logo; foam or paper pulp insert; certificate of authenticity card</td></tr>
</tbody>
</table></div>
</div></div>
`;
    // Find the closing div before the insert point
    // We need to insert before the h2, but also after the current section's closing div
    const searchBack = h.lastIndexOf('</div>', idx);
    const insertAt = searchBack + 6; // after </div>
    h = h.slice(0, insertAt) + '\n' + industrySection + h.slice(insertAt);
    console.log('✓ products.html: By Industry section added');
  }

  fs.writeFileSync(filePath, h, 'utf8');
}

console.log('\nGEO Round 3 applied.');
