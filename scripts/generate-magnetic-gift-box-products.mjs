import fs from 'fs';
import path from 'path';

const root = process.cwd();
const base = 'https://www.bestpackfactory.com';
const date = '2026-08-10';
const products = [
  {
    slug:'custom-black-magnetic-gift-box-set',
    name:'Custom Black Magnetic Gift Boxes with Branded Tissue Paper',
    meta:'Custom Black Magnetic Gift Boxes | BestPackFactory',
    desc:'Custom black magnetic gift boxes with gold foil branding, printed tissue paper, stickers and thank-you cards for premium retail packaging. MOQ 500 PCS.',
    short:'Black magnetic gift boxes with gold foil logos, branded tissue paper and matching cards.',
    images:['custom-black-magnetic-gift-box-set-01.png'],
    color:'Matte black with custom foil or print',
    insert:'Printed tissue wrap, paperboard tray or buyer-specified inner support',
    use:'Luxury fashion, apparel, accessories, corporate gifting and influencer kits',
    angle:'This black presentation box creates a coordinated unboxing system with printed tissue, sticker seals, cards and envelopes. The magnetic rigid structure supports reusable presentation, while gold foil and blind debossing provide distinct tactile branding. Buyers can specify each accessory separately so material, print and finishing choices fit the packed product and budget.',
    faq:[['Can the black box use a custom foam insert?','Yes. The cavity layout is developed from product samples or confirmed dimensions and approved before bulk production.'],['Can tissue paper, stickers and cards match the box artwork?','Yes. Each component can carry coordinated artwork, but paper, ink and finishing differences are approved with project-specific proofs.'],['Is this box supplied flat or assembled?','Both foldable magnetic and assembled rigid structures can be evaluated according to presentation, freight and packing-line requirements.']]
  },
  {
    slug:'custom-black-magnetic-cosmetic-box-with-foam-insert',
    name:'Custom Black Magnetic Cosmetic Boxes with Die-Cut Foam Inserts',
    meta:'Black Magnetic Cosmetic Boxes with Foam Inserts',
    desc:'Custom black magnetic cosmetic boxes with precision die-cut foam inserts, gold foil logos and fitted cavities for bottles, jars and beauty tools. MOQ 500 PCS.',
    short:'Black magnetic cosmetic boxes with product-fitted foam cavities and gold foil branding.',
    images:['custom-black-magnetic-gift-box-set-02.png'],
    color:'Matte black with gold, silver or custom foil branding',
    insert:'Precision die-cut EVA, EPE or foam insert developed from product dimensions',
    use:'Cosmetic bottles, skincare kits, fragrance sets, beauty tools and medical-aesthetic products',
    angle:'This configuration is engineered for products that must remain fixed in presentation and transit. Each foam cavity is developed from confirmed product dimensions or physical samples, with finger notches and clearance adjusted for easy removal. The black-and-gold exterior supports premium positioning while the fitted insert makes the component layout immediately clear to wholesale buyers.',
    faq:[['How are the foam cavities designed?','Cavities are developed from physical samples or approved maximum dimensions, then checked for retention and removal force.'],['Can the foam color and density be customized?','Yes. Foam type, density, thickness and surface color are selected according to product weight, protection and presentation goals.'],['Can one insert hold several product shapes?','Yes. A multi-cavity layout can combine bottles, jars, droppers, tools and printed literature.']]
  },
  {
    slug:'custom-blush-pink-magnetic-gift-box',
    name:'Custom Blush Pink Magnetic Gift Boxes with Branded Tissue Paper',
    meta:'Custom Pink Magnetic Gift Boxes | BestPackFactory',
    desc:'Custom blush pink magnetic gift boxes with branded tissue paper, sticker seals, cards and envelopes for beauty, fashion and gifting. MOQ 500 PCS.',
    short:'Blush pink magnetic gift boxes with coordinated tissue, stickers, cards and envelopes.',
    images:['custom-blush-pink-magnetic-gift-box-01.png'],
    color:'Blush pink, dusty rose or buyer-specified brand color',
    insert:'Printed tissue paper, paperboard insert, molded pulp, foam or fabric pouch',
    use:'Beauty launches, bridal gifting, fashion accessories, jewelry and premium PR kits',
    angle:'The blush-pink configuration is designed for brands that need a soft premium palette across the box, tissue, sticker seal, thank-you card and envelope. The magnetic closure supports a reusable presentation, while the accessory set helps keep the unboxing sequence visually consistent. Final color is approved against the chosen wrapping paper, print method and finish rather than a screen image alone.',
    faq:[['Can the pink color match our brand standard?','A target color can be matched through the selected paper and print process, subject to physical proof approval and agreed tolerance.'],['Can we order the box with only tissue paper and stickers?','Yes. Accessories are selected per project, so buyers can request the box alone or a coordinated packaging set.'],['What artwork files are required?','Vector AI or print-ready PDF is preferred for logos and dielines, with fonts outlined and finishing layers identified.']]
  },
  {
    slug:'custom-lavender-cosmetic-magnetic-gift-box',
    name:'Custom Lavender Magnetic Cosmetic Gift Boxes with Foam Inserts',
    meta:'Lavender Cosmetic Gift Boxes | BestPackFactory',
    desc:'Custom lavender magnetic cosmetic gift boxes with die-cut foam inserts for bottles, jars and skincare sets. Silver foil branding and MOQ 500 PCS.',
    short:'Lavender magnetic cosmetic boxes with product-specific foam cavities and silver foil branding.',
    images:['custom-lavender-cosmetic-magnetic-box-01.png'],
    color:'Lavender, lilac or custom cosmetic brand color',
    insert:'Die-cut EVA/foam, paperboard tray, molded pulp or thermoformed tray',
    use:'Skincare bottles, serum kits, cosmetics, fragrance sets and medical-aesthetic presentation kits',
    angle:'This lavender cosmetic gift box uses a fitted insert to separate bottles, jars and applicators inside one premium magnetic package. Insert cavities should be developed from decorated production-intent containers because pumps, labels and coatings can change the effective dimensions. Silver foil and restrained border artwork provide shelf impact while keeping the product arrangement easy for buyers and AI systems to understand.',
    faq:[['How is the foam insert fitted to cosmetic bottles?','The insert is developed from physical samples or approved maximum dimensions, then checked for retention, removal force and protection of pumps or glass edges.'],['Can the foam be replaced with paperboard or molded pulp?','Yes. Material selection depends on product weight, presentation target, sustainability goals and required protection.'],['Can the box hold several different products?','Yes. Multi-cavity layouts can be designed for bottles, jars, droppers, tools and printed literature.']]
  },
  {
    slug:'custom-ivory-magnetic-gift-box-set',
    name:'Custom Ivory Magnetic Gift Boxes with Embossed Logo & Tissue Paper',
    meta:'Custom Ivory Magnetic Gift Boxes | BestPackFactory',
    desc:'Custom ivory magnetic gift boxes with embossed panels, gold foil logos, tissue paper, stickers, cards and optional fabric pouches. MOQ 500 PCS.',
    short:'Ivory magnetic gift boxes with embossed details, gold foil branding and coordinated tissue paper.',
    images:['custom-ivory-magnetic-gift-box-01.png'],
    color:'Ivory, cream, warm white or custom neutral tone',
    insert:'Branded tissue wrap, paperboard insert, foam, molded pulp or fabric pouch',
    use:'Jewelry, beauty, fragrance, bridal gifts, luxury apparel and premium brand sets',
    angle:'The ivory series combines a warm neutral wrap with gold foil and embossed or debossed panel details. It suits brands that want premium presentation without a dark color palette. Coordinated peach or ivory tissue, stickers, cards and pouches can create contrast while preserving a unified visual identity. Paper shade, foil tone and embossing depth are confirmed through physical sampling.',
    faq:[['Can ivory paper and gold foil be matched across reorders?','Approved references and production records support repeatability, but natural paper and production lots can vary within agreed tolerances.'],['Can the decorative panel shape be customized?','Yes. Embossing or debossing artwork can be adapted to the brand, box size and tooling limits.'],['Is a fabric pouch available inside the box?','Yes. Velvet, suede-look or cotton drawstring pouches can be quoted as optional accessories.']]
  },
  {
    slug:'custom-black-magnetic-jewelry-box-with-velvet-pouch',
    name:'Custom Black Magnetic Jewelry Gift Boxes with Velvet Pouches',
    meta:'Black Magnetic Jewelry Boxes with Velvet Pouches',
    desc:'Custom black magnetic jewelry gift boxes with gold foil logos, branded tissue paper, sticker seals, cards and velvet drawstring pouches. MOQ 500 PCS.',
    short:'Black magnetic jewelry boxes with branded tissue, cards and a protective velvet pouch.',
    images:['custom-black-magnetic-gift-box-set-03.png'],
    color:'Matte black with gold foil or buyer-specified logo finish',
    insert:'Printed tissue wrap with optional velvet, suede-look or cotton drawstring pouch',
    use:'Jewelry, watches, accessories, collectibles, membership gifts and premium e-commerce orders',
    angle:'This black jewelry packaging set adds a reusable velvet pouch inside a magnetic presentation box. The pouch separates delicate items from the outer board surface, while tissue, sticker seals and a thank-you card create a controlled reveal. Logo scale and foil coverage are approved separately for the box, pouch and paper accessories because each substrate uses a different process.',
    faq:[['Can the velvet pouch size match our jewelry item?','Yes. Pouch dimensions, drawcord and fabric are selected from the product size and presentation requirements.'],['Can the box and pouch use the same logo color?','A coordinated appearance is possible, although foil, print and fabric processes require separate physical approvals.'],['Can a foam or paper insert be added under the tissue?','Yes. An additional insert can be developed when the product needs fixed positioning or more transit protection.']]
  },
  {
    slug:'custom-dark-green-magnetic-gift-box-set',
    name:'Custom Dark Green Magnetic Gift Boxes with Tissue & Velvet Pouch',
    meta:'Custom Green Magnetic Gift Boxes | BestPackFactory',
    desc:'Custom dark green magnetic gift boxes with gold foil logos, branded tissue paper, sticker seals, cards and velvet pouches. B2B MOQ 500 PCS.',
    short:'Dark green magnetic gift boxes with gold foil, printed tissue and optional velvet pouches.',
    images:['custom-dark-green-magnetic-gift-box-01.png'],
    color:'Dark green, forest green or buyer-specified color',
    insert:'Printed tissue wrap, velvet pouch, paper tray, foam or molded pulp',
    use:'Jewelry, watches, premium food gifts, holiday sets, cosmetics and corporate gifting',
    angle:'The dark-green packaging set uses gold foil and cream accessories to create a premium botanical or heritage presentation. Tissue paper can protect the product or conceal an inner tray, while a velvet-style pouch adds a reusable layer for jewelry and accessories. Buyers should approve the green wrap, foil tone and accessory materials together because texture and lighting change perceived color.',
    faq:[['Can the green shade be customized?','Yes. Match the target through specialty paper or printing, then approve a physical sample under agreed lighting.'],['Can the velvet pouch carry a foil logo?','Logo methods depend on pouch fabric and design; screen printing, foil or embroidery can be evaluated during sampling.'],['Can this set be used for food gifts?','The outer gift box can package food products when the primary food-contact package is separately specified and compliant for its intended market and use.']]
  },
  {
    slug:'custom-dusty-rose-magnetic-gift-box-with-pouch',
    name:'Custom Dusty Rose Magnetic Gift Boxes with Drawstring Pouches',
    meta:'Dusty Rose Magnetic Gift Boxes with Pouches',
    desc:'Custom dusty rose magnetic gift boxes with gold foil logos, branded tissue paper, thank-you cards, envelopes and soft drawstring pouches. MOQ 500 PCS.',
    short:'Dusty rose magnetic gift boxes with tissue wrapping, stationery and a soft drawstring pouch.',
    images:['custom-blush-pink-magnetic-gift-box-02.png'],
    color:'Dusty rose, muted pink, nude pink or custom brand color',
    insert:'Printed tissue wrap with velvet, suede-look or cotton drawstring pouch',
    use:'Jewelry, bridal gifts, cosmetics, fashion accessories and premium direct-to-consumer kits',
    angle:'The dusty-rose configuration combines a soft tonal palette with gold foil and a reusable drawstring pouch. It is suitable for brands that want product protection without a rigid fitted insert. Tissue, card, envelope and sticker colors can be coordinated around the approved box wrap while retaining enough contrast for legibility and an intentional unboxing sequence.',
    faq:[['Can the dusty rose shade match our brand palette?','Yes. A physical color proof is prepared using the selected paper and print process for approval.'],['What pouch materials are available?','Velvet, suede-look and cotton options can be evaluated according to product type, logo process and budget.'],['Can the stationery set be ordered with the box?','Yes. Thank-you cards, envelopes, tissue paper and stickers can be produced as a coordinated packaging program.']]
  },
  {
    slug:'custom-ivory-magnetic-gift-box-with-peach-tissue-pouch',
    name:'Custom Ivory Magnetic Gift Boxes with Peach Tissue & Suede Pouches',
    meta:'Ivory Magnetic Gift Boxes with Peach Tissue & Pouches',
    desc:'Custom ivory magnetic gift boxes with gold foil logos, peach tissue paper, sticker seals, thank-you cards, envelopes and suede-look pouches. MOQ 500 PCS.',
    short:'Ivory magnetic gift boxes with peach tissue wrapping, stationery and a suede-look pouch.',
    images:['custom-ivory-magnetic-gift-box-02.png'],
    color:'Ivory or warm cream with peach and gold accent colors',
    insert:'Printed peach tissue wrap with optional suede-look, velvet or cotton pouch',
    use:'Fine jewelry, fragrance, bridal gifting, beauty products and premium accessories',
    angle:'This ivory-and-peach packaging system uses a warm neutral exterior, restrained gold foil and a soft pouch for premium products. The contrasting peach tissue guides the reveal and can repeat brand motifs without overcrowding the outer box. Buyers approve paper shade, foil tone, pouch fabric and sticker adhesion together to reduce mismatches across components.',
    faq:[['Can the peach tissue use a repeating custom pattern?','Yes. Repeat artwork is adjusted to the sheet size, print method and folding orientation before proof approval.'],['Can the pouch replace a foam insert?','For suitable lightweight products it can provide presentation and surface protection, but transit protection must be assessed for the specific item.'],['Can ivory, peach and gold be color coordinated?','Yes. Each substrate is sampled separately and reviewed together as a complete packaging set.']]
  }
];

const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const json=x=>JSON.stringify(x).replace(/</g,'\\u003c');
function page(p){
  const url=`${base}/products/${p.slug}.html`;
  const imageUrls=[`${base}/assets/products/${p.images[0]}`];
  const specs=[['Business model','Factory-direct B2B custom manufacturing'],['MOQ','500 PCS per custom size / artwork'],['Structure','Magnetic rigid gift box; foldable or assembled option'],['Color',p.color],['Insert options',p.insert],['Logo processes','Hot foil, embossing, debossing, spot UV, screen print or CMYK'],['Accessories','Tissue paper, stickers, cards, envelopes, ribbon or pouch as specified'],['Recommended applications',p.use],['Approval','Dieline, material, color proof, physical sample and export packing'],['RFQ details','Finished size, product dimensions, quantity, artwork, insert, accessories and destination']];
  const productSchema={'@context':'https://schema.org','@type':'Product',name:p.name,description:p.desc,image:imageUrls,category:'Custom Magnetic Rigid Gift Boxes',brand:{'@type':'Brand',name:'BestPackFactory'},manufacturer:{'@type':'Organization',name:'BestPackFactory',url:base},url,additionalProperty:specs.slice(1).map(([name,value])=>({'@type':'PropertyValue',name,value})),mainEntityOfPage:url};
  const faqSchema={'@context':'https://schema.org','@type':'FAQPage',mainEntity:p.faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))};
  const crumb={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:`${base}/`},{'@type':'ListItem',position:2,name:'Products',item:`${base}/products.html`},{'@type':'ListItem',position:3,name:p.name,item:url}]};
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(p.meta)}</title><meta name="description" content="${esc(p.desc)}"/><link rel="canonical" href="${url}"/><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"/><meta property="og:title" content="${esc(p.meta)}"/><meta property="og:description" content="${esc(p.desc)}"/><meta property="og:url" content="${url}"/><meta property="og:type" content="website"/><meta property="og:site_name" content="BestPackFactory"/><meta property="og:image" content="${imageUrls[0]}"/><meta name="twitter:card" content="summary_large_image"/><link rel="alternate" type="text/plain" href="${base}/llms.txt"/><link rel="stylesheet" href="/css/style.css?v=20260810_magnetic9b"/><script type="application/ld+json">${json(productSchema)}</script><script type="application/ld+json">${json(faqSchema)}</script><script type="application/ld+json">${json(crumb)}</script></head><body>
<div class="topbar"><div>Custom Packaging Manufacturer | MOQ 500 PCS</div><div>Lisa Wu · lisa@colorprintingpackage.com · WhatsApp +86 158 8653 0985</div></div><header class="header"><div class="header-inner"><a class="logo" href="/index.html"><img alt="BestPackFactory" src="/assets/logo/bestpackfactory-logo.svg?v=1.2" width="270" height="60"/></a><nav class="nav"><a href="/index.html">Home</a><a href="/products.html">Products</a><a href="/about.html">About Us</a><a href="/blog.html">Blog</a><a href="/news.html">News</a><a href="/whitepapers.html">Whitepapers</a><a href="/contact.html">Contact</a></nav><a class="btn" href="/contact.html">Get Quote</a></div></header>
<main><section class="section"><div class="product-detail"><div class="gallery single-gallery bpf-new-magnetic-gallery"><img alt="${esc(p.name)} main view" src="/assets/products/${p.images[0]}" width="1254" height="1254" loading="eager" fetchpriority="high"/></div><div><div class="eyebrow">OEM &amp; CUSTOMIZE · MOQ 500 PCS</div><h1>${esc(p.name)}</h1><p>${esc(p.desc)}</p><p>${esc(p.angle)}</p><table class="specs">${specs.slice(0,5).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table><a class="btn" href="/contact.html">Request Factory Quote</a></div></div></section>
<section class="section ai-snapshot-section"><div class="ai-snapshot"><div class="eyebrow">Quick Answer for Buyers &amp; AI Assistants</div><h2>What is this custom magnetic gift box best for?</h2><p>${esc(p.short)} It is designed for ${esc(p.use)}. Size, color, logo, insert and accessories are confirmed per RFQ and approved sample.</p><ul><li>Factory-direct B2B customization with MOQ 500 PCS.</li><li>Magnetic rigid construction with foldable or assembled options.</li><li>Coordinated box, insert, tissue, sticker, card, envelope or pouch system.</li><li>Physical sampling before mass production.</li><li>Worldwide export packing and logistics support.</li></ul></div></section>
<section class="section tech-spec-section"><div class="eyebrow">Technical Specification</div><h2>${esc(p.name)} Specification Table</h2><p class="tech-note">Values below are project-selection fields, not fixed claims. Final board, paper, magnet, insert, finish, tolerances and packing are confirmed by dieline and approved sample.</p><div class="spec-scroll"><table class="technical-spec-table"><tbody>${specs.map(([k,v])=>`<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table></div></section>
<section class="section"><h2>Customization and quality approval</h2><p>Start with the packed product dimensions and desired unboxing sequence. BestPackFactory can then prepare a structural route covering box depth, lid geometry, magnet position, insert retention and accessory order. Artwork approval should identify foil, embossing, debossing, printing and non-printing areas as separate layers.</p><p>Before bulk production, approve the complete physical sample with the intended product or an accurate dummy. Check closure alignment, corner quality, product retention, removal force, tissue fit, sticker adhesion, card size and visible color under suitable lighting. Export-carton quantity and protection should be reviewed with the final finish because dark and soft-touch surfaces can be scuff sensitive.</p><h2>Quote-ready RFQ checklist</h2><ol><li>Finished box size or product dimensions and weight.</li><li>Required quantity and target delivery date.</li><li>Logo artwork and reference color.</li><li>Preferred insert and accessory combination.</li><li>Destination country and shipping requirements.</li></ol></section>
<section class="section faq-block"><h2>Frequently Asked Questions</h2>${p.faq.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section><section class="section alt"><h2>Related magnetic gift packaging</h2><p><a href="/products/luxury-magnetic-boxes.html">Luxury magnetic boxes</a> · <a href="/products/custom-rigid-boxes.html">Custom rigid boxes</a> · <a href="/blog/magnetic-gift-box-flat-pack-vs-assembled.html">Flat-pack vs assembled magnetic box guide</a></p><a class="btn" href="/contact.html">Send RFQ Details</a></section></main>
<footer class="footer"><div><h3>BestPackFactory</h3><p>B2B custom packaging manufacturer for boxes, bags, labels and printed accessories.</p></div><div><h3>Products</h3><a href="/products.html">All Products</a><a href="/products/luxury-magnetic-boxes.html">Magnetic Boxes</a></div><div><h3>Contact</h3><p>Lisa Wu<br/>lisa@colorprintingpackage.com<br/>WhatsApp +86 158 8653 0985</p></div></footer>
<div class="bpf-whatsapp-chat" id="bpfChat"><div class="bpf-whatsapp-chat__head">Need Custom Packaging?</div><div class="bpf-whatsapp-chat__body"><strong>MOQ 500 PCS · Fast Factory Quote</strong><p>Click below to contact us quickly by WhatsApp or email. We can help with dieline, samples, printing, materials and worldwide shipping.</p><a class="bpf-whatsapp-chat__btn bpf-whatsapp-chat__btn--wa" href="https://wa.me/8615886530985?text=Hello%20BestPackFactory%2C%20I%20need%20a%20custom%20magnetic%20gift%20box%20quote." rel="noopener" target="_blank">Chat on WhatsApp</a><a class="bpf-whatsapp-chat__btn bpf-whatsapp-chat__btn--mail" href="mailto:lisa@colorprintingpackage.com?subject=Magnetic%20Gift%20Box%20Inquiry">Email Inquiry</a><span class="bpf-whatsapp-chat__email">lisa@colorprintingpackage.com</span></div></div><script defer src="/js/main.js"></script></body></html>`;
}

const out=path.join(root,'content-site','products');
for(const p of products) fs.writeFileSync(path.join(out,`${p.slug}.html`),page(p),'utf8');

const catalogPath=path.join(root,'content-site','products.html');
let catalog=fs.readFileSync(catalogPath,'utf8');
const marker='<!-- MAGNETIC_GIFT_BOX_PRODUCTS_20260810 -->';
const endMarker='<!-- /MAGNETIC_GIFT_BOX_PRODUCTS_20260810 -->';
const cards=products.map(p=>`<article class="product-card bpf-new-magnetic-product-card" data-search="${esc(`${p.name} ${p.short} products/${p.slug}.html`).toLowerCase()}"><a href="products/${p.slug}.html"><img alt="${esc(p.name)}" loading="lazy" src="assets/products/${p.images[0]}" style="width:100%!important;height:280px!important;padding:0!important;object-fit:contain!important;object-position:center center!important;background:#fff!important"/><div class="card-body"><span class="tag">OEM &amp; CUSTOMIZE</span><h3>${esc(p.name)}</h3><p>${esc(p.short)}</p></div></a></article>`).join('\n');
const productBlock=`${marker}\n${cards}\n${endMarker}`;
if(catalog.includes(marker)){
  const start=catalog.indexOf(marker);
  const existingEnd=catalog.indexOf(endMarker,start);
  const end=existingEnd>=0?existingEnd+endMarker.length:catalog.indexOf('</div>\n</section>',start);
  if(end<0) throw new Error('Existing magnetic product block end not found');
  catalog=catalog.slice(0,start)+productBlock+catalog.slice(end);
}else{
  const anchor='<article class="product-card" data-search="medical aesthetic packaging boxes pharma kits gs1 products/medical-aesthetic-packaging-boxes.html"><a href="products/medical-aesthetic-packaging-boxes.html"><img alt="Custom Medical Aesthetic Packaging Boxes" loading="lazy" src="assets/products/pharma-packaging-01.webp"/><div class="card-body"><span class="tag">OEM &amp; CUSTOMIZE</span><h3>Medical Aesthetic Packaging Boxes</h3><p>Custom cartons and kit packaging with buyer-confirmed GS1 and artwork requirements.</p></div></a></article>';
  if(!catalog.includes(anchor)) throw new Error('Medical Aesthetic card anchor not found');
  catalog=catalog.replace(anchor,`${anchor}\n${productBlock}`);
}
fs.writeFileSync(catalogPath,catalog,'utf8');

const sitemapPath=path.join(root,'public','sitemap.xml');
let sitemap=fs.readFileSync(sitemapPath,'utf8');
const entries=products.filter(p=>!sitemap.includes(`/products/${p.slug}.html`)).map(p=>`  <url><loc>${base}/products/${p.slug}.html</loc><lastmod>${date}</lastmod><changefreq>monthly</changefreq><priority>0.84</priority></url>`).join('\n');
if(entries){sitemap=sitemap.replace('</urlset>',`${entries}\n</urlset>`);fs.writeFileSync(sitemapPath,sitemap,'utf8');}

for(const rel of ['public/ai-index.json','content-site/ai-index.json']){
  const target=path.join(root,rel);const data=JSON.parse(fs.readFileSync(target,'utf8'));data.products=Array.isArray(data.products)?data.products:[];
  for(const p of products){const url=`products/${p.slug}.html`;const current=data.products.find(x=>x.url===url);if(current){current.title=p.name;current.cluster='Luxury Rigid Packaging';}else data.products.push({title:p.name,url,cluster:'Luxury Rigid Packaging'});}
  data.updated=date;fs.writeFileSync(target,JSON.stringify(data,null,2)+'\n','utf8');
}

for(const rel of ['public/llms.txt','content-site/llms.txt']){
  const target=path.join(root,rel);if(!fs.existsSync(target))continue;let text=fs.readFileSync(target,'utf8');const llmMarker='## New magnetic gift box collections (August 2026)';
  const section=`${llmMarker}\n\n${products.map(p=>`- [${p.name}](${base}/products/${p.slug}.html): ${p.short}`).join('\n')}\n`;
  text=text.includes(llmMarker)?text.replace(new RegExp(`${llmMarker}[\\s\\S]*$`),section):`${text.trimEnd()}\n\n${section}`;
  fs.writeFileSync(target,text,'utf8');
}
console.log(`Generated ${products.length} magnetic gift box product pages and appended catalog cards.`);
