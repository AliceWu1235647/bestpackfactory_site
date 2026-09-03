const fs = require('fs');
const path = require('path');

const BASE = '/tmp/bestpackfactory_site/content-site';

// ── index.html ──────────────────────────────────────────────────────────────
let idx = fs.readFileSync(BASE + '/index.html', 'utf8');

// Fix broken logo URL in Organization JSON-LD (HTML attrs injected into JSON)
idx = idx.replace(
  '"logo": "https://www.bestpackfactory.com/assets/logo/bestpackfactory-logo.svg" width="270" height="60" width="270" height="60",',
  '"logo": "https://www.bestpackfactory.com/assets/logo/bestpackfactory-logo.svg",'
);

// Fix double-brace escaping inside JSON-LD blocks
idx = idx.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, function(m) {
  return m.replace(/\{\{/g, '{').replace(/\}\}/g, '}');
});

// Add FAQPage schema before </head>
const FAQ_SCHEMA = `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
{"@type":"Question","name":"What is the minimum order quantity (MOQ)?","acceptedAnswer":{"@type":"Answer","text":"Our MOQ is 500 PCS per SKU for all custom packaging products including flexible pouches, rigid boxes, labels, and specialty packaging."}},
{"@type":"Question","name":"Do you offer free dieline design?","acceptedAnswer":{"@type":"Answer","text":"Yes. BestPackFactory provides free dieline and structural design for all orders. Send us your size requirements and we will prepare the dieline file."}},
{"@type":"Question","name":"How long does sampling take?","acceptedAnswer":{"@type":"Answer","text":"Standard samples are ready in 7-10 business days after artwork approval. Express sampling is available on request."}},
{"@type":"Question","name":"What countries do you ship to?","acceptedAnswer":{"@type":"Answer","text":"We ship to 100+ countries worldwide including the USA, UK, Canada, Australia, Germany, France, and the Middle East via DHL, FedEx, sea freight, and air freight."}},
{"@type":"Question","name":"What file formats do you accept for artwork?","acceptedAnswer":{"@type":"Answer","text":"We accept AI, PDF, and PSD files. Vector logo is required. Please include 3mm bleed and use CMYK color mode."}},
{"@type":"Question","name":"Can I get OEM and ODM packaging?","acceptedAnswer":{"@type":"Answer","text":"Yes. We support both OEM (your artwork on our standard structures) and ODM (custom structure and design development from scratch)."}}
]}
</script>
`;
if (!idx.includes('FAQPage')) {
  idx = idx.replace('</head>', FAQ_SCHEMA + '</head>');
}

// Fix logo alt text
idx = idx.replace(
  /(<a class="logo"[^>]*>[\s\S]*?<img\s+alt=")[^"]*(")/,
  '$1BestPackFactory — Custom Packaging Manufacturer$2'
);

fs.writeFileSync(BASE + '/index.html', idx);
console.log('index.html: schema fixed, FAQ added, logo alt fixed');

// ── products.html ────────────────────────────────────────────────────────────
let prod = fs.readFileSync(BASE + '/products.html', 'utf8');
prod = prod.replace(/style\.css\?v=RESTORE_233221_FINAL/g, 'style.css?v=20260722_products4');
fs.writeFileSync(BASE + '/products.html', prod);
console.log('products.html: CSS version aligned');

// ── Trust bar & RFQ snippets ─────────────────────────────────────────────────
const TRUST_BAR = `<div class="product-trust-bar">
  <span class="ptb-item"><span class="ptb-icon">&#10003;</span> ISO 9001 Certified</span>
  <span class="ptb-item"><span class="ptb-icon">&#9733;</span> 50,000+ Happy Clients</span>
  <span class="ptb-item"><span class="ptb-icon">&#9992;</span> Ships to 100+ Countries</span>
  <span class="ptb-item"><span class="ptb-icon">&#9675;</span> Free Dieline Design</span>
  <span class="ptb-item"><span class="ptb-icon">&#9654;</span> MOQ 500 PCS</span>
</div>
`;

const INLINE_RFQ = `<section class="section product-rfq-section">
<div class="product-rfq-wrap">
  <div class="eyebrow">GET A FREE FACTORY QUOTE</div>
  <h2 class="product-rfq-title">Request a Quote for This Product</h2>
  <p class="product-rfq-sub">Fill in a few details and our team will reply within 1 business day with pricing, lead time, and a free dieline.</p>
  <form class="product-rfq-form" action="https://formspree.io/f/xkgjrozy" method="POST" novalidate>
    <input type="hidden" name="_subject" value="New Packaging RFQ from Website">
    <div class="rfq-row">
      <div class="rfq-field">
        <label for="rfq-company">Company Name <span aria-hidden="true">*</span></label>
        <input id="rfq-company" name="company" type="text" placeholder="Your company name" required autocomplete="organization">
      </div>
      <div class="rfq-field">
        <label for="rfq-email">Business Email <span aria-hidden="true">*</span></label>
        <input id="rfq-email" name="email" type="email" placeholder="you@company.com" required autocomplete="email">
      </div>
    </div>
    <div class="rfq-row">
      <div class="rfq-field">
        <label for="rfq-qty">Estimated Quantity</label>
        <input id="rfq-qty" name="quantity" type="number" placeholder="e.g. 5000" min="500">
      </div>
      <div class="rfq-field">
        <label for="rfq-country">Destination Country</label>
        <input id="rfq-country" name="country" type="text" placeholder="e.g. United States" autocomplete="country-name">
      </div>
    </div>
    <div class="rfq-field rfq-field--full">
      <label for="rfq-notes">Size, Material &amp; Special Requirements</label>
      <textarea id="rfq-notes" name="notes" rows="3" placeholder="e.g. 250g coffee bag, kraft + VMPET, degassing valve, matte finish, 5000 pcs, ship to LA..."></textarea>
    </div>
    <div class="rfq-actions-row">
      <button class="btn" type="submit">Send My RFQ &#8594;</button>
      <span class="rfq-privacy">&#128274; Your info is only used to prepare your quote. No spam.</span>
    </div>
  </form>
</div>
</section>
`;

// ── 58 product pages ─────────────────────────────────────────────────────────
const productDir = BASE + '/products';
const files = fs.readdirSync(productDir)
  .filter(f => f.endsWith('.html'))
  .sort();

let cssFixed = 0, altFixed = 0, trustAdded = 0, rfqAdded = 0;

for (const fname of files) {
  const fpath = path.join(productDir, fname);
  let html = fs.readFileSync(fpath, 'utf8');
  let changed = false;

  // CSS version
  if (html.includes('style.css?v=RESTORE_233221_FINAL')) {
    html = html.replace(/style\.css\?v=RESTORE_233221_FINAL/g, 'style.css?v=20260722_products4');
    cssFixed++;
    changed = true;
  }

  // Logo alt text
  if (html.includes('loading="lazy" src="../assets/logo/')) {
    html = html.replace(
      /(alt=")[^"]*(" decoding="async" loading="lazy" src="\.\.\/assets\/logo\/)/,
      '$1BestPackFactory — Custom Packaging Manufacturer$2'
    );
    altFixed++;
    changed = true;
  }

  // Product image alt text
  if (html.includes('factory direct B2B custom packaging with matte finish')) {
    const titleMatch = html.match(/<title>([^|<]+)/);
    const productName = titleMatch ? titleMatch[1].trim() : 'Custom Packaging';
    html = html.replace(
      /alt="[^"]*factory direct B2B custom packaging with matte finish"/g,
      `alt="${productName} — custom print, MOQ 500 PCS | BestPackFactory"`
    );
    changed = true;
  }

  // Trust bar after </header>
  if (!html.includes('product-trust-bar') && html.includes('</header>')) {
    html = html.replace('</header>', '</header>\n' + TRUST_BAR);
    trustAdded++;
    changed = true;
  }

  // Inline RFQ before WhatsApp widget
  if (!html.includes('product-rfq-section') && html.includes('<div class="bpf-whatsapp-chat">')) {
    html = html.replace(
      '<div class="bpf-whatsapp-chat">',
      INLINE_RFQ + '<div class="bpf-whatsapp-chat">'
    );
    rfqAdded++;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fpath, html);
  }
}

console.log(`Product pages: ${cssFixed} CSS fixed, ${altFixed} logo alts fixed, ${trustAdded} trust bars, ${rfqAdded} RFQ forms`);

// ── style.css additions ───────────────────────────────────────────────────────
const cssPath = BASE + '/css/style.css';
let css = fs.readFileSync(cssPath, 'utf8');

if (!css.includes('product-trust-bar')) {
  const newCSS = `

/* Product Trust Bar */
.product-trust-bar{display:flex;flex-wrap:wrap;gap:8px 24px;align-items:center;justify-content:center;background:var(--bg);border-bottom:1px solid var(--line);padding:10px 5%;font-size:13px;font-weight:700;color:var(--dark)}
.ptb-item{display:flex;align-items:center;gap:5px;white-space:nowrap}
.ptb-icon{color:var(--green)}
@media(max-width:600px){.product-trust-bar{gap:6px 16px;font-size:12px;padding:8px 4%}}

/* Product Inline RFQ Form */
.product-rfq-section{background:linear-gradient(135deg,#f0f7f3,#e8f4ee);border-top:1px solid var(--line)}
.product-rfq-wrap{max-width:780px;margin:0 auto;padding:48px 5%}
.product-rfq-title{font-size:clamp(1.3rem,3vw,1.7rem);font-weight:900;margin:8px 0 10px;color:var(--dark)}
.product-rfq-sub{color:var(--muted);margin:0 0 28px;font-size:15px}
.product-rfq-form{display:flex;flex-direction:column;gap:16px}
.rfq-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.rfq-field{display:flex;flex-direction:column;gap:6px}
.rfq-field--full{grid-column:1/-1}
.rfq-field label{font-size:13px;font-weight:700;color:var(--dark)}
.rfq-field label span{color:#c0392b}
.rfq-field input,.rfq-field textarea{border:1.5px solid var(--line);border-radius:8px;padding:12px 14px;font-size:14px;font-family:inherit;background:#fff;color:var(--dark);transition:border-color .18s}
.rfq-field input:focus,.rfq-field textarea:focus{outline:none;border-color:var(--green)}
.rfq-field textarea{resize:vertical;min-height:88px}
.rfq-actions-row{display:flex;align-items:center;gap:20px;flex-wrap:wrap;margin-top:4px}
.rfq-actions-row .btn{padding:14px 32px;font-size:15px}
.rfq-privacy{font-size:12px;color:var(--muted)}
@media(max-width:640px){.rfq-row{grid-template-columns:1fr}.rfq-actions-row{flex-direction:column;align-items:flex-start}.rfq-actions-row .btn{width:100%;text-align:center;justify-content:center}}
`;
  fs.writeFileSync(cssPath, css + newCSS);
  console.log('style.css: trust bar + RFQ styles appended');
} else {
  console.log('style.css: already has new styles');
}

console.log('\nDone.');
