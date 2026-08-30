import fs from 'fs';
import path from 'path';

const root = process.cwd();
const base = 'https://www.bestpackfactory.com';
const date = '2026-08-11';

const products = [
  {
    slug:'custom-luxury-rigid-drawer-boxes-eva-inserts',
    name:'Custom Luxury Rigid Drawer Boxes with Gold Foil Logo & EVA Inserts',
    meta:'Luxury Rigid Drawer Boxes with EVA Inserts',
    desc:'Custom luxury rigid drawer boxes with gold foil logos and precision-cut EVA inserts for beauty, fragrance and premium product sets. B2B MOQ 500 PCS.',
    short:'Rigid drawer boxes with gold foil branding and product-specific EVA insert cavities.',
    image:'custom-rust-orange-rigid-drawer-box-eva-insert.png',
    structure:'Rigid sleeve-and-drawer box with thumb notch',
    insert:'Precision-cut EVA, EPE, foam, paperboard or molded pulp',
    finish:'Hot foil, embossing, debossing, spot UV or custom printing',
    use:'Beauty sets, fragrance, accessories, electronics and premium gift kits',
    overview:'This drawer-box format combines a wrapped rigid sleeve with a pull-out tray and a product-specific insert. The pictured rust-orange and ivory palette uses gold foil for a clear premium identity. Cavity dimensions, finger notches and clearance should be approved with production-intent samples so products remain secure and easy to remove.',
    faq:[['Can the EVA cavities be made for several products?','Yes. The insert can combine round, square and rectangular cavities based on confirmed product dimensions or physical samples.'],['Can the drawer box use a different outer color?','Yes. Paper, printing and foil colors are selected per project and approved with a physical sample.'],['What should buyers provide for an accurate quotation?','Provide finished box size, product dimensions and weight, quantity, artwork, insert requirements and delivery destination.']]
  },
  {
    slug:'custom-magnetic-closure-gift-boxes-pouch-tissue',
    name:'Custom Magnetic Closure Gift Boxes with Branded Pouch & Tissue Paper',
    meta:'Magnetic Gift Boxes with Pouch & Tissue',
    desc:'Custom magnetic closure gift boxes with branded tissue paper, thank-you cards and soft drawstring pouches for luxury retail and gifting. MOQ 500 PCS.',
    short:'Magnetic presentation boxes with coordinated tissue, stationery and a drawstring pouch.',
    image:'custom-ivory-magnetic-gift-box-pouch-tissue.png',
    structure:'Book-style magnetic rigid box with hinged lid',
    insert:'Tissue wrap, paper tray, foam support or drawstring pouch',
    finish:'Gold foil, blind embossing, debossing or custom print',
    use:'Jewelry, apparel, accessories, cosmetics and customer gift programs',
    overview:'This magnetic gift-box set is designed for brands that need one coordinated unboxing sequence. The rigid box provides presentation, tissue conceals the product, the pouch protects smaller items and the card carries the customer message. Each component can use related artwork while being approved separately for paper, fabric and foil differences.',
    faq:[['Can the pouch and box use matching logos?','Yes. A coordinated logo treatment can be developed, although box foil and pouch decoration require separate production approvals.'],['Can buyers order the box without every accessory?','Yes. Tissue, cards, envelopes, stickers and pouches are optional and quoted according to the required set.'],['Is the magnetic box available as a foldable structure?','Foldable and assembled rigid options can be evaluated according to presentation, freight and packing requirements.']]
  },
  {
    slug:'custom-pr-boxes-influencer-kits-compartment-inserts',
    name:'Custom PR Boxes for Influencer Kits with Multi-Compartment Inserts',
    meta:'Custom PR Boxes for Influencer Kits',
    desc:'Custom PR boxes for influencer kits and product launches with multi-compartment inserts, branded cards, tissue wraps and optional pouches. MOQ 500 PCS.',
    short:'Influencer PR boxes with organized compartments for products, cards, tissue and pouches.',
    image:'custom-teal-pr-box-compartment-insert.png',
    structure:'Large magnetic presentation box with hinged lid',
    insert:'Multi-compartment foam, EVA, paperboard or molded pulp layout',
    finish:'Gold foil, screen print, embossing, debossing or spot UV',
    use:'Influencer mailers, product launches, press kits, media gifts and brand collaborations',
    overview:'This PR-box configuration organizes several launch components in one presentation. Separate compartments can hold hero products, samples, a branded pouch, printed literature and protective tissue. The layout should follow the intended reveal order as well as product weight and removal force, helping recipients understand the collection without loose components shifting in transit.',
    faq:[['How is a PR box insert planned?','Start with the complete product list, dimensions, weights and preferred reveal order; the insert is then developed and sampled around those inputs.'],['Can a PR box include cards and pouches?','Yes. Cards, envelopes, tissue, stickers, ribbons and fabric pouches can be coordinated with the outer box artwork.'],['Can the box be sized for international shipping?','Yes. Product protection and export-carton efficiency can be considered during structural development, subject to the final packed set.']]
  },
  {
    slug:'custom-luxury-candle-boxes-rigid-inserts',
    name:'Custom Luxury Candle Boxes with Rigid Construction & Fitted Inserts',
    meta:'Luxury Candle Boxes with Fitted Inserts',
    desc:'Custom luxury candle boxes with rigid construction, gold foil logos and fitted inserts for candle jars, vessels and premium home-fragrance gifts. MOQ 500 PCS.',
    short:'Premium rigid candle boxes with fitted circular inserts and foil logo options.',
    image:'custom-black-luxury-candle-rigid-box-insert.png',
    structure:'Lift-off lid rigid box or hinged presentation box',
    insert:'Fitted paperboard, foam, molded pulp or other approved support',
    finish:'Gold foil, embossing, debossing, specialty paper or custom print',
    use:'Candle jars, home fragrance, diffusers, wax gifts and seasonal gift sets',
    overview:'This candle-box concept uses a fitted circular opening to support a jar or vessel inside a rigid presentation box. Buyers should provide the container diameter, height, weight and closure details because glass edges, lids and labels affect insert clearance. A physical sample is used to approve product retention, removal and surface protection before bulk production.',
    faq:[['Can the insert fit a specific candle jar?','Yes. The insert is developed from confirmed maximum dimensions or a physical container sample.'],['Can the box hold a candle and accessories together?','Yes. Multi-compartment layouts can accommodate a candle, matches, care card or other specified items.'],['Are different rigid box structures available?','Yes. Lift-off lid, book-style magnetic and drawer structures can be evaluated for the intended presentation and shipping method.']]
  },
  {
    slug:'custom-jewelry-packaging-boxes-inserts-pouches',
    name:'Custom Jewelry Packaging Boxes with Precision Inserts & Suede Pouches',
    meta:'Jewelry Boxes with Inserts & Suede Pouches',
    desc:'Custom jewelry packaging boxes with precision-cut inserts, suede-look pouches, gold foil logos and literature compartments. Factory-direct MOQ 500 PCS.',
    short:'Jewelry presentation boxes with fitted product cavities, literature space and soft pouches.',
    image:'custom-taupe-jewelry-box-insert-pouch.png',
    structure:'Book-style rigid box with hinged presentation lid',
    insert:'Precision-cut foam or EVA with card slot and pouch compartment',
    finish:'Gold foil, embossing, debossing, soft-touch or specialty wrap',
    use:'Jewelry sets, watches, accessories, certificates and premium gift programs',
    overview:'This jewelry packaging format combines fitted product cavities with a separate pouch compartment and space for care or authenticity literature. The arrangement supports a clear presentation while keeping metal items away from printed materials. Insert geometry, fabric contact and removal force should be checked using the actual jewelry or production-intent samples.',
    faq:[['Can the insert hold necklaces, rings and earrings together?','Yes. The cavity plan can be customized around the complete jewelry set and the intended presentation order.'],['Can a certificate or care card have a dedicated compartment?','Yes. Flat literature slots and removable card wells can be integrated into the insert.'],['Which pouch materials can be considered?','Velvet, suede-look and cotton drawstring pouches can be evaluated according to product protection, logo process and budget.']]
  },
  {
    slug:'custom-perfume-packaging-boxes-flocked-inserts',
    name:'Custom Perfume Packaging Boxes with Gold Foil Logo & Flocked Inserts',
    meta:'Perfume Boxes with Flocked Inserts',
    desc:'Custom perfume packaging boxes with gold foil logos and precision-cut flocked inserts for fragrance bottles, discovery sets and luxury launches. MOQ 500 PCS.',
    short:'Luxury perfume boxes with gold foil branding and bottle-specific flocked insert cavities.',
    image:'custom-burgundy-perfume-box-flocked-insert.png',
    structure:'Lift-off lid rigid box with wrapped base and lid',
    insert:'Precision-cut flocked foam, EVA, paperboard or molded pulp',
    finish:'Gold foil, embossing, debossing, textured paper or custom printing',
    use:'Perfume bottles, fragrance discovery sets, atomizers and launch gifts',
    overview:'This burgundy perfume box pairs a rigid lift-off lid with a light-colored fitted insert and gold foil branding. Bottle cavities should be built from decorated production-intent samples because caps, labels and spray components can change the effective dimensions. Flocking or alternative surface materials can be selected to reduce visible abrasion and support the desired presentation.',
    faq:[['Can the insert be fitted to an irregular perfume bottle?','Yes. Provide a physical bottle or approved maximum dimensions so the cavity and removal points can be sampled.'],['Can the box hold a bottle and travel spray?','Yes. Multi-cavity inserts can combine a primary bottle, atomizer, samples and literature.'],['Can the burgundy color and foil shade be customized?','Yes. Wrap color, texture and foil tone are confirmed through project-specific proofs and a physical sample.']]
  },
  {
    slug:'custom-luxury-apparel-magnetic-boxes-tissue-paper',
    name:'Custom Luxury Apparel Magnetic Boxes with Branded Tissue Paper',
    meta:'Apparel Magnetic Boxes with Tissue Paper',
    desc:'Custom luxury apparel magnetic boxes with branded tissue paper, sticker seals and foil logos for clothing, scarves and premium e-commerce orders. MOQ 500 PCS.',
    short:'Navy magnetic apparel boxes with branded tissue, seals and foil logo customization.',
    image:'custom-navy-apparel-magnetic-box-tissue.png',
    structure:'Book-style magnetic rigid box; assembled or foldable option',
    insert:'Branded tissue wrap, paper support, ribbon or optional dust bag',
    finish:'Gold foil, embossing, debossing, screen print or specialty paper',
    use:'Clothing, scarves, knitwear, accessories, uniforms and premium e-commerce orders',
    overview:'This apparel box uses a magnetic hinged structure with tissue paper and a sticker seal to create a simple, scalable unboxing sequence. The navy exterior and gold foil can be replaced with buyer-specified colors. Box depth, tissue sheet size and fold direction should be confirmed with the actual folded garment to avoid excess movement or compression.',
    faq:[['Can the box size be based on a folded garment?','Yes. Provide folded product dimensions, weight and preferred packing orientation for structural planning.'],['Can branded tissue and sticker seals be included?','Yes. Tissue paper, stickers, cards, ribbons and dust bags can be quoted as coordinated accessories.'],['Is a foldable magnetic box available for apparel?','Yes. Foldable magnetic structures can be evaluated when freight and storage efficiency are priorities.']]
  },
  {
    slug:'custom-luxury-cosmetic-boxes-eva-inserts',
    name:'Custom Luxury Cosmetic Packaging Boxes with Precision-Cut EVA Inserts',
    meta:'Luxury Cosmetic Boxes with EVA Inserts',
    desc:'Custom luxury cosmetic packaging boxes with precision-cut EVA inserts, gold foil logos and fitted cavities for skincare, makeup and beauty tools. MOQ 500 PCS.',
    short:'Black luxury cosmetic boxes with precision-cut EVA cavities and gold foil branding.',
    image:'custom-black-cosmetic-box-eva-insert.png',
    structure:'Magnetic rigid presentation box with hinged lid',
    insert:'Precision-cut EVA, EPE, foam, paperboard or molded pulp',
    finish:'Gold foil, embossing, debossing, spot UV or custom printing',
    use:'Skincare bottles, cosmetic jars, makeup sets, applicators and beauty launch kits',
    overview:'This black cosmetic box uses a high-contrast fitted insert to organize bottles, jars and tools inside a magnetic presentation structure. Each cavity should account for decorated container dimensions, pumps and labels. Buyers approve cavity retention, finger access, closure alignment and finish quality with a complete sample before mass production.',
    faq:[['How are cosmetic insert cavities specified?','Provide product samples or maximum dimensions, weights and the intended orientation for every component.'],['Can the black insert be changed to another color or material?','Yes. EVA, foam, paperboard and molded pulp options can be evaluated in project-appropriate colors.'],['Can the box include printed literature?','Yes. A card well, envelope slot or literature compartment can be integrated into the insert layout.']]
  }
];

const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const json=x=>JSON.stringify(x).replace(/</g,'\\u003c');

function page(p,index){
  const url=`${base}/products/${p.slug}.html`;
  const imageUrl=`${base}/assets/products/${p.image}`;
  const specs=[['Business model','Factory-direct B2B custom manufacturing'],['MOQ','500 PCS per custom size and artwork'],['Structure',p.structure],['Insert options',p.insert],['Logo and finish options',p.finish],['Recommended applications',p.use],['Approval workflow','Dieline, material, color proof and physical sample'],['RFQ details','Finished size, product dimensions, quantity, artwork, insert and destination']];
  const productSchema={'@context':'https://schema.org','@type':'Product','@id':`${url}#product`,name:p.name,sku:`BPF-LUX-${String(index+1).padStart(2,'0')}`,description:p.desc,image:[imageUrl],category:'Custom Luxury Rigid Packaging',brand:{'@type':'Brand',name:'BestPackFactory'},manufacturer:{'@type':'Organization',name:'BestPackFactory',url:base},url,additionalProperty:specs.slice(1).map(([name,value])=>({'@type':'PropertyValue',name,value})),mainEntityOfPage:url};
  const faqSchema={'@context':'https://schema.org','@type':'FAQPage',mainEntity:p.faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))};
  const breadcrumb={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:`${base}/`},{'@type':'ListItem',position:2,name:'Products',item:`${base}/products.html`},{'@type':'ListItem',position:3,name:p.name,item:url}]};
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(p.meta)} | BestPackFactory</title><meta name="description" content="${esc(p.desc)}"/><link rel="canonical" href="${url}"/><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"/><meta property="og:title" content="${esc(p.meta)} | BestPackFactory"/><meta property="og:description" content="${esc(p.desc)}"/><meta property="og:url" content="${url}"/><meta property="og:type" content="website"/><meta property="og:site_name" content="BestPackFactory"/><meta property="og:image" content="${imageUrl}"/><meta name="twitter:card" content="summary_large_image"/><link rel="alternate" type="text/plain" href="${base}/llms.txt"/><link rel="stylesheet" href="/css/style.css?v=20260811_luxuryinsert8"/><script type="application/ld+json">${json(productSchema)}</script><script type="application/ld+json">${json(faqSchema)}</script><script type="application/ld+json">${json(breadcrumb)}</script></head><body>
<div class="topbar"><div>Custom Packaging Manufacturer | MOQ 500 PCS</div><div>Lisa Wu · lisa@colorprintingpackage.com · WhatsApp +86 158 8653 0985</div></div><header class="header"><div class="header-inner"><a class="logo" href="/index.html"><img alt="BestPackFactory" src="/assets/logo/bestpackfactory-logo.svg?v=1.2" width="270" height="60"/></a><nav class="nav"><a href="/index.html">Home</a><a href="/products.html">Products</a><a href="/about.html">About Us</a><a href="/blog.html">Blog</a><a href="/news.html">News</a><a href="/whitepapers.html">Whitepapers</a><a href="/contact.html">Contact</a></nav><a class="btn" href="/contact.html">Get Quote</a></div></header>
<main><section class="section"><div class="product-detail"><div class="gallery single-gallery bpf-new-magnetic-gallery"><img alt="${esc(p.name)} factory customization example" src="/assets/products/${p.image}" width="1254" height="1254" loading="eager" fetchpriority="high"/></div><div><div class="eyebrow">OEM &amp; CUSTOMIZE · MOQ 500 PCS</div><h1>${esc(p.name)}</h1><p><strong>${esc(p.short)}</strong> ${esc(p.desc)}</p><p>${esc(p.overview)}</p><p><small><time datetime="${date}">Updated August 11, 2026</time> · Specifications are confirmed per RFQ and approved sample.</small></p><table class="specs">${specs.slice(0,5).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table><a class="btn" href="/contact.html">Request Factory Quote</a></div></div></section>
<section class="section ai-snapshot-section"><div class="ai-snapshot"><div class="eyebrow">Quick Answer for Buyers &amp; AI Assistants</div><h2>What is this custom packaging format best for?</h2><p>${esc(p.short)} It is suitable for ${esc(p.use)}. BestPackFactory customizes the finished size, structure, insert, color and logo treatment from buyer-supplied product dimensions, artwork and order requirements.</p><ul><li>Factory-direct B2B customization from MOQ 500 PCS.</li><li>One physical sample can be approved before bulk production.</li><li>Insert geometry is developed from confirmed product dimensions or samples.</li><li>Foil, print, paper and accessory choices are project-specific.</li><li>Export packing is confirmed for the final box and finish.</li></ul></div></section>
<section class="section tech-spec-section"><div class="eyebrow">Buyer Specification</div><h2>${esc(p.name)} Specification Table</h2><p class="tech-note">These are selection fields, not fixed material claims. Final board, wrap, insert, finish, tolerance and packing are documented on the approved dieline and sample.</p><div class="spec-scroll"><table class="technical-spec-table"><tbody>${specs.map(([k,v])=>`<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table></div></section>
<section class="section"><h2>Customization and sample approval</h2><p>Start with the packed product dimensions, weight and intended presentation order. Structural development then covers finished box size, lid or drawer movement, insert retention, finger access and accessory placement. Artwork should identify print, foil, embossing, debossing and non-printing areas as separate production layers.</p><p>Approve the physical sample with the intended products or accurate dummies. Review closure alignment, corner quality, cavity fit, removal force, visible color, foil position and export-carton protection. Final performance depends on the approved combination of structure, material, finish and packed product.</p><h2>Quote-ready RFQ checklist</h2><ol><li>Finished box size or every product's maximum dimensions and weight.</li><li>Required quantity and target delivery schedule.</li><li>Vector logo artwork and reference colors.</li><li>Preferred structure, insert and accessories.</li><li>Destination country and shipping requirements.</li></ol></section>
<section class="section faq-block"><h2>Frequently Asked Questions</h2>${p.faq.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section><section class="section alt"><h2>Related custom packaging resources</h2><p><a href="/products/luxury-magnetic-boxes.html">Luxury magnetic boxes</a> · <a href="/products/custom-rigid-boxes.html">Custom rigid boxes</a> · <a href="/blog/custom-packaging-rfq-checklist.html">Packaging RFQ checklist</a></p><a class="btn" href="/contact.html">Send RFQ Details</a></section></main>
<footer class="footer"><div><h3>BestPackFactory</h3><p>B2B custom packaging manufacturer for boxes, bags, labels and printed accessories.</p></div><div><h3>Products</h3><a href="/products.html">All Products</a><a href="/products/luxury-magnetic-boxes.html">Magnetic Boxes</a></div><div><h3>Contact</h3><p>Lisa Wu<br/>lisa@colorprintingpackage.com<br/>WhatsApp +86 158 8653 0985</p></div></footer>
<div class="bpf-whatsapp-chat" id="bpfChat"><div class="bpf-whatsapp-chat__head">Need Custom Packaging?</div><div class="bpf-whatsapp-chat__body"><strong>MOQ 500 PCS · Fast Factory Quote</strong><p>Click below to contact us quickly by WhatsApp or email. We can help with dieline, samples, printing, materials and worldwide shipping.</p><a class="bpf-whatsapp-chat__btn bpf-whatsapp-chat__btn--wa" href="https://wa.me/8615886530985?text=Hello%20BestPackFactory%2C%20I%20need%20a%20custom%20luxury%20packaging%20quote." rel="noopener" target="_blank">Chat on WhatsApp</a><a class="bpf-whatsapp-chat__btn bpf-whatsapp-chat__btn--mail" href="mailto:lisa@colorprintingpackage.com?subject=Custom%20Luxury%20Packaging%20Inquiry">Email Inquiry</a><span class="bpf-whatsapp-chat__email">lisa@colorprintingpackage.com</span></div></div><script defer src="/js/main.js"></script></body></html>`;
}

const out=path.join(root,'content-site','products');
products.forEach((p,i)=>fs.writeFileSync(path.join(out,`${p.slug}.html`),page(p,i),'utf8'));

const catalogPath=path.join(root,'content-site','products.html');
let catalog=fs.readFileSync(catalogPath,'utf8');
const marker='<!-- LUXURY_INSERT_PRODUCTS_20260811 -->';
const endMarker='<!-- /LUXURY_INSERT_PRODUCTS_20260811 -->';
const anchor='<article class="product-card" data-search="medical aesthetic packaging boxes pharma kits gs1 products/medical-aesthetic-packaging-boxes.html"><a href="products/medical-aesthetic-packaging-boxes.html"><img alt="Custom Medical Aesthetic Packaging Boxes" loading="lazy" src="assets/products/pharma-packaging-01.webp"/><div class="card-body"><span class="tag">OEM &amp; CUSTOMIZE</span><h3>Medical Aesthetic Packaging Boxes</h3><p>Custom cartons and kit packaging with buyer-confirmed GS1 and artwork requirements.</p></div></a></article>';
const cards=products.map(p=>`<article class="product-card bpf-new-magnetic-product-card" data-search="${esc(`${p.name} ${p.short} products/${p.slug}.html`).toLowerCase()}"><a href="products/${p.slug}.html"><img alt="${esc(p.name)}" loading="lazy" src="assets/products/${p.image}" style="width:100%!important;height:280px!important;padding:0!important;object-fit:contain!important;object-position:center center!important;background:#fff!important"/><div class="card-body"><span class="tag">OEM &amp; CUSTOMIZE</span><h3>${esc(p.name)}</h3><p>${esc(p.short)}</p></div></a></article>`).join('\n');
const block=`${marker}\n${cards}\n${endMarker}`;
if(catalog.includes(marker)){
  const start=catalog.indexOf(marker),end=catalog.indexOf(endMarker,start);
  if(end<0) throw new Error('Luxury insert product block end not found');
  catalog=catalog.slice(0,start)+block+catalog.slice(end+endMarker.length);
}else{
  if(!catalog.includes(anchor)) throw new Error('Medical Aesthetic card anchor not found');
  catalog=catalog.replace(anchor,`${anchor}\n${block}`);
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
  const target=path.join(root,rel);if(!fs.existsSync(target))continue;let text=fs.readFileSync(target,'utf8');
  const llmMarker='## Luxury insert packaging collections (August 2026)';
  const nextMarker='## New magnetic gift box collections (August 2026)';
  const section=`${llmMarker}\n\n${products.map(p=>`- [${p.name}](${base}/products/${p.slug}.html): ${p.short}`).join('\n')}\n\n`;
  if(text.includes(llmMarker)) text=text.replace(new RegExp(`${llmMarker}[\\s\\S]*?(?=${nextMarker}|$)`),section);
  else if(text.includes(nextMarker)) text=text.replace(nextMarker,`${section}${nextMarker}`);
  else text=`${text.trimEnd()}\n\n${section}`;
  fs.writeFileSync(target,text,'utf8');
}

console.log(`Generated ${products.length} luxury insert product pages and inserted catalog cards after Medical Aesthetic Packaging Boxes.`);
