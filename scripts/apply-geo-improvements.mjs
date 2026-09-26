/**
 * apply-geo-improvements.mjs
 * GEO round-2: certifications section on homepage, FAQPage schemas,
 * GRS + How2Recycle sections on sustainable packaging blog.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ─── 1. HOMEPAGE: Add certifications section before <footer> ────────────────
{
  const filePath = path.join(root, 'content-site', 'index.html');
  let h = fs.readFileSync(filePath, 'utf8');
  if (h.includes('certs-trust-section')) {
    console.log('SKIP homepage: certs section already present');
  } else {
    const certSection = `<section class="section certs-trust-section" style="padding:2rem 1.5rem;background:#f8f9fa;border-top:1px solid #e5e7eb;">
<div style="max-width:960px;margin:0 auto;text-align:center;">
<div class="eyebrow">Factory Credentials</div>
<h2 style="font-size:1.25rem;margin-bottom:0.5rem;">Certifications &amp; Compliance</h2>
<p style="color:#555;font-size:0.95rem;margin-bottom:1.5rem;">BestPackFactory holds active third-party certifications verifiable by certificate number. Copies available on request with any RFQ.</p>
<div style="display:flex;flex-wrap:wrap;gap:1.25rem;justify-content:center;align-items:center;">
<div style="background:#fff;border:1px solid #dde3ec;border-radius:8px;padding:0.9rem 1.5rem;min-width:160px;text-align:center;">
<div style="font-weight:700;font-size:1rem;color:#1a1a2e;">BSCI</div>
<div style="font-size:0.8rem;color:#555;margin-top:0.25rem;">Business Social Compliance Initiative</div>
</div>
<div style="background:#fff;border:1px solid #dde3ec;border-radius:8px;padding:0.9rem 1.5rem;min-width:160px;text-align:center;">
<div style="font-weight:700;font-size:1rem;color:#1a1a2e;">ISO 9001</div>
<div style="font-size:0.8rem;color:#555;margin-top:0.25rem;">Quality Management System</div>
</div>
<div style="background:#fff;border:1px solid #dde3ec;border-radius:8px;padding:0.9rem 1.5rem;min-width:160px;text-align:center;">
<div style="font-weight:700;font-size:1rem;color:#1a1a2e;">FSC</div>
<div style="font-size:0.8rem;color:#555;margin-top:0.25rem;">Chain of Custody · SGSHK-COC-332603</div>
</div>
<div style="background:#fff;border:1px solid #dde3ec;border-radius:8px;padding:0.9rem 1.5rem;min-width:160px;text-align:center;">
<div style="font-weight:700;font-size:1rem;color:#1a1a2e;">AQL 2.5</div>
<div style="font-size:0.8rem;color:#555;margin-top:0.25rem;">Outgoing Inspection Standard</div>
</div>
</div>
<p style="margin-top:1.25rem;font-size:0.88rem;color:#666;"><a href="/factory/certificates.html" style="color:#2563eb;">View certificate details and validity dates →</a></p>
</div>
</section>
`;
    const insertBefore = '<footer class="footer">';
    const idx = h.indexOf(insertBefore);
    if (idx === -1) throw new Error('footer not found in index.html');
    h = h.slice(0, idx) + certSection + h.slice(idx);
    fs.writeFileSync(filePath, h, 'utf8');
    console.log('✓ homepage: certifications section added');
  }
}

// ─── 2. PRODUCTS.HTML: Add FAQPage JSON-LD Schema ──────────────────────────
{
  const filePath = path.join(root, 'content-site', 'products.html');
  let h = fs.readFileSync(filePath, 'utf8');
  if (h.includes('"FAQPage"')) {
    console.log('SKIP products.html: FAQPage schema already present');
  } else {
    const faqSchema = `<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What types of custom packaging does BestPackFactory supply?","acceptedAnswer":{"@type":"Answer","text":"BestPackFactory supplies rigid boxes, folding cartons, flexible pouches, stand-up bags, flat-bottom bags, coffee bags, paper bags, labels, stickers, PET bottles and tin boxes. All formats are produced to your exact specification from MOQ 500 PCS."}},{"@type":"Question","name":"What is the minimum order quantity for custom packaging?","acceptedAnswer":{"@type":"Answer","text":"The standard MOQ is 500 PCS per SKU for most custom packaging formats. Rigid boxes with custom tooling start at 500 PCS; digitally printed labels can start lower. Request a quote with your format and target quantity for an exact MOQ."}},{"@type":"Question","name":"How long does custom packaging production take?","acceptedAnswer":{"@type":"Answer","text":"Pre-production samples are ready in 5-7 working days after artwork confirmation. Bulk production runs 20-30 working days depending on format, finish and quantity. Lead times are confirmed at RFQ stage."}},{"@type":"Question","name":"What materials are available for custom packaging?","acceptedAnswer":{"@type":"Answer","text":"Rigid boxes use greyboard (800-2000 gsm) with wrap paper. Folding cartons use SBS board or coated art paper (250-400 gsm). Flexible pouches use multi-layer laminate film (PET/PE, PET/AL/PE, kraft-PE). All substrates available in FSC-certified versions on request."}},{"@type":"Question","name":"Does BestPackFactory ship internationally?","acceptedAnswer":{"@type":"Answer","text":"Yes. BestPackFactory ships worldwide from Shenzhen, China. Terms available: FOB Shenzhen, CIF destination port, EXW factory, DDP door-to-door. Sea freight for bulk orders reaches North America and Europe in 25-35 days transit."}}]}</script>
`;
    const headEnd = h.indexOf('</head>');
    if (headEnd === -1) throw new Error('</head> not found in products.html');
    h = h.slice(0, headEnd) + faqSchema + h.slice(headEnd);
    fs.writeFileSync(filePath, h, 'utf8');
    console.log('✓ products.html: FAQPage schema added');
  }
}

// ─── 3. SUSTAINABLE BLOG: Add GRS + How2Recycle + FAQPage Schema ───────────
{
  const filePath = path.join(root, 'content-site', 'blog', 'sustainable-packaging-certifications-explained.html');
  let h = fs.readFileSync(filePath, 'utf8');

  // 3a. Content sections
  if (h.includes('Global Recycled Standard')) {
    console.log('SKIP sustainable blog: GRS section already present');
  } else {
    const insertBefore = '<h2 style="color:#007A3F;margin-top:0;">Get a Free Factory Quote</h2>';
    const idx = h.indexOf(insertBefore);
    if (idx === -1) throw new Error('Insert point not found in sustainable blog');

    const newSections = `<h2>GRS — Global Recycled Standard</h2>
<p>The Global Recycled Standard (GRS) is an international third-party certification that verifies the recycled content in a finished product and controls chain of custody from raw material through to the end product. GRS is issued by Textile Exchange and is increasingly required by major North American and European retailers — Walmart, Target and H&amp;M all mandate GRS certification for recycled-content packaging on their supplier programmes.</p>
<p>For packaging buyers, GRS matters when you need to substantiate a "made from X% recycled materials" claim on pack. Without GRS or an equivalent accredited certification, the recycled-content claim is unverifiable and may expose your brand to greenwashing challenges in regulated markets such as the EU (Green Claims Directive) and California (SB 343). To specify GRS-certified packaging in an RFQ, state the required minimum post-consumer recycled (PCR) content percentage and whether substrate and print ink must both be certified.</p>
<h2>How2Recycle — Consumer Recycling Label</h2>
<p>How2Recycle is a US-based standardised labelling programme administered by The Sustainable Packaging Coalition (SPC). It tells consumers exactly how to recycle each component of a package — which is different from claiming a material is technically recyclable. The label system categorises recyclability as: Widely Recyclable, Check Locally, Store Drop-Off, and Not Yet Recyclable, based on real curbside collection data across North American municipalities.</p>
<p>How2Recycle is mandatory or strongly preferred by more than 200 major North American retailers and brand owners, including Walmart, Target, Amazon, Whole Foods and Costco. If your product is sold through these channels, the How2Recycle label is a practical sourcing requirement, not a voluntary signal. BestPackFactory can produce packaging pre-certified with How2Recycle labels once the brand has completed the SPC membership and material assessment process (typically 2-4 months). Buyers should factor this timeline into new product launch planning.</p>
`;
    h = h.slice(0, idx) + newSections + h.slice(idx);
    console.log('✓ sustainable blog: GRS + How2Recycle sections added');
  }

  // 3b. FAQPage schema
  if (h.includes('"FAQPage"')) {
    console.log('SKIP sustainable blog: FAQPage schema already present');
  } else {
    const faqSchema = `<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is FSC certification for packaging?","acceptedAnswer":{"@type":"Answer","text":"FSC (Forest Stewardship Council) certification verifies that paper-based packaging materials originate from responsibly managed forests. FSC chain-of-custody (CoC) certification means the supplier can trace certified fibre through production and issue FSC-labelled products. BestPackFactory FSC certificate: SGSHK-COC-332603, verifiable at info.fsc.org."}},{"@type":"Question","name":"What is the difference between FSC, PEFC and SFI certification?","acceptedAnswer":{"@type":"Answer","text":"FSC, PEFC and SFI are all third-party forest management certification systems. FSC is the most widely recognised globally and in Asia-Pacific. PEFC is dominant in Europe and endorses SFI in North America. FSC is the default specification for European and most North American buyers; SFI is acceptable for US domestic supply chains."}},{"@type":"Question","name":"What is GRS certification and when do I need it?","acceptedAnswer":{"@type":"Answer","text":"GRS (Global Recycled Standard) certifies the recycled content percentage in a finished product and the chain of custody from raw material to end product. You need GRS when making a verified recycled-content claim on packaging or when supplying to retailers such as Walmart or Target that mandate GRS for recycled-content packaging."}},{"@type":"Question","name":"What is How2Recycle labeling?","acceptedAnswer":{"@type":"Answer","text":"How2Recycle is a standardised US recycling label programme that tells consumers exactly how to recycle each packaging component based on actual curbside collection data. Categories: Widely Recyclable, Check Locally, Store Drop-Off and Not Yet Recyclable. Over 200 major North American retailers require How2Recycle labels, including Walmart, Target and Amazon."}},{"@type":"Question","name":"How do I verify a supplier FSC certificate is genuine?","acceptedAnswer":{"@type":"Answer","text":"Verify any FSC certificate at info.fsc.org using the certificate number. Check the certificate is active, the certificate holder name matches the supplier, and the product group covers the packaging type you are ordering. Always request the current certificate PDF; do not rely on a logo on a website alone."}}]}</script>
`;
    const headEnd = h.indexOf('</head>');
    if (headEnd === -1) throw new Error('</head> not found in sustainable blog');
    h = h.slice(0, headEnd) + faqSchema + h.slice(headEnd);
    console.log('✓ sustainable blog: FAQPage schema added');
  }

  fs.writeFileSync(filePath, h, 'utf8');
}

console.log('\nAll GEO improvements applied.');
