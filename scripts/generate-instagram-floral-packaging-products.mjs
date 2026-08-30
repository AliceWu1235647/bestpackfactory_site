import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const root = process.cwd();
const base = 'https://www.bestpackfactory.com';
const date = '2026-08-14';
const generatedRoot = 'E:/codex/codex-home/generated_images/019f9af9-7e7a-7a31-8a44-cb72d4673175';

const products = [
  {
    slug: 'custom-embossed-floral-jewelry-gift-boxes-ribbon-pull',
    name: 'Custom Embossed Floral Jewelry Gift Boxes with Ribbon Pull',
    title: 'Embossed Floral Jewelry Gift Boxes | BestPackFactory',
    meta: 'Custom embossed floral jewelry gift boxes with ribbon-pull opening, foil logo and premium paper wrap for jewelry, accessories and beauty sets. MOQ 500 PCS.',
    short: 'White floral rigid gift boxes with embossed botanical artwork, ribbon-pull opening and custom foil logo.',
    image: 'custom-embossed-floral-jewelry-gift-box-ribbon-pull.webp',
    source: 'exec-398bc115-2639-45a0-b7a3-7bfa81f50819.png',
    structure: 'Rigid ribbon-pull drawer or lift-open presentation box',
    finish: 'Blind embossing, rose-gold foil, textured wrap and ribbon pull',
    insert: 'Paperboard, foam, EVA, molded pulp or fabric-covered insert',
    use: 'Jewelry, small accessories, cosmetics, keepsakes and gift cards',
    overview: 'This white rigid gift box uses raised botanical details and a ribbon pull to create a tactile presentation for compact products. The pictured rose-gold decoration is a customization example; box size, embossing artwork, ribbon color and insert geometry are confirmed from buyer artwork and packed-product dimensions.',
    faqs: [
      ['Can the floral embossing be replaced with our own pattern?', 'Yes. Supply vector artwork or a clear motif reference so the embossing area, depth and production method can be evaluated on a dieline and sample.'],
      ['Can this box hold rings, earrings or a jewelry set?', 'Yes. A fitted paperboard, foam, EVA or fabric-covered insert can be developed from the jewelry dimensions and desired display position.'],
      ['What information is needed for a quotation?', 'Send the finished box size or product dimensions, quantity, logo artwork, preferred paper and finish, insert requirement and delivery destination.']
    ]
  },
  {
    slug: 'custom-floral-embossed-beauty-gift-boxes-skincare-sets',
    name: 'Custom Floral Embossed Beauty Gift Boxes for Skincare Sets',
    title: 'Floral Embossed Beauty Gift Boxes | BestPackFactory',
    meta: 'Custom floral embossed beauty gift boxes for skincare, cosmetics and wellness sets with premium paper, foil logo and fitted insert options. B2B MOQ 500 PCS.',
    short: 'Ivory beauty gift boxes with pink floral embossing, clean foil branding and optional product-fitted inserts.',
    image: 'custom-floral-embossed-beauty-gift-box-skincare.webp',
    source: 'exec-f7092c25-068d-4985-a072-feb43130daef.png',
    structure: 'Square rigid lift-off lid or magnetic presentation box',
    finish: 'Two-level floral embossing, foil logo and specialty paper wrap',
    insert: 'Paperboard divider, foam, EVA or molded pulp insert',
    use: 'Skincare routines, cosmetic collections, wellness kits and beauty gifts',
    overview: 'This square ivory box combines subtle blind embossing with selected pink raised details for a restrained beauty-packaging look. Buyers can adapt the floral area, logo process, board depth and internal layout to the bottles, jars, tubes or accessories included in the set.',
    faqs: [
      ['Can the pink embossed flowers use another color?', 'Yes. Embossed details, foil and wrap colors are selected per project and approved through proofs and a physical sample.'],
      ['Can the box include cavities for skincare bottles and jars?', 'Yes. Provide decorated container samples or confirmed maximum dimensions so the insert can be developed with suitable clearance and finger access.'],
      ['Is the pictured design a stocked retail item?', 'No. It is a customization example for factory-direct B2B production; final size, artwork, material and finish are made to the buyer specification.']
    ]
  },
  {
    slug: 'custom-blush-pink-floral-rigid-gift-boxes-lift-off-lid',
    name: 'Custom Blush Pink Floral Rigid Gift Boxes with Lift-Off Lid',
    title: 'Blush Pink Floral Rigid Gift Boxes | BestPackFactory',
    meta: 'Custom blush pink floral rigid gift boxes with lift-off lids, botanical printing and foil logos for cosmetics, fragrance, jewelry and gifts. MOQ 500 PCS.',
    short: 'Blush pink two-piece rigid boxes with botanical printing and custom gold foil logo options.',
    image: 'custom-blush-pink-floral-rigid-gift-box.webp',
    source: 'exec-033c7d63-288f-4d3d-83d9-25983aafaf27.png',
    structure: 'Two-piece rigid box with separate lift-off lid and base',
    finish: 'Botanical print, gold foil, embossing, debossing or soft-touch wrap',
    insert: 'Fitted paperboard, foam, EVA, molded pulp or fabric insert',
    use: 'Fragrance, cosmetics, jewelry, accessories and boutique gift sets',
    overview: 'This blush two-piece rigid box presents a clean lid area above a detailed wildflower border. The simple lift-off structure works for a broad range of premium retail products, while the internal depth and insert can be matched to the exact packed set.',
    faqs: [
      ['Can the botanical artwork be printed around the box sides?', 'Yes. Artwork can continue across the lid and side panels when it is prepared on the approved production dieline.'],
      ['Can this structure be made in a deeper size?', 'Yes. Finished length, width and depth are customized after the product dimensions, weight and presentation requirements are confirmed.'],
      ['Can we combine foil and embossing on the logo?', 'Yes. Combined foil and relief effects can be evaluated during artwork review and confirmed on a physical sample.']
    ]
  },
  {
    slug: 'custom-keepsake-gift-boxes-compartments-baby-book-sets',
    name: 'Custom Keepsake Gift Boxes with Compartments for Baby & Book Sets',
    title: 'Keepsake Gift Boxes with Compartments | BestPackFactory',
    meta: 'Custom keepsake gift boxes with compartments, hinged rigid lids, ribbon closures and botanical printing for baby gifts, books and curated sets. MOQ 500 PCS.',
    short: 'Large hinged keepsake boxes with empty custom compartments, ribbon closure and soft botanical decoration.',
    image: 'custom-keepsake-gift-box-compartments-baby-book.webp',
    source: 'exec-12cd04a9-3fd0-43d8-8c15-520f5dcc11e0.png',
    structure: 'Large book-style hinged rigid box with ribbon closure',
    finish: 'Botanical print, foil logo, matte lamination and ribbon accessory',
    insert: 'Custom paperboard wells, dividers, foam or molded pulp compartments',
    use: 'Baby keepsakes, books, stationery, welcome kits and curated gift sets',
    overview: 'This large presentation format separates a primary item from smaller accessories using custom compartments. It is suitable when the buyer needs a controlled reveal order and secure placement for products with different sizes. Compartment walls, ribbon placement and lid clearance are sampled around the complete packed set.',
    faqs: [
      ['Can the compartments be changed for different products?', 'Yes. The number, size and position of compartments are developed from a complete product list, dimensions, weights and preferred reveal order.'],
      ['Can the box include a printed name or event message?', 'Yes. Variable project artwork can be printed or foiled, subject to the selected production process and order requirements.'],
      ['Can the ribbon closure be removed?', 'Yes. Magnetic, ribbon, lift-off and other closure approaches can be evaluated according to structure, appearance and shipping needs.']
    ]
  },
  {
    slug: 'custom-cosmetic-compact-packaging-boxes-die-cut-inserts',
    name: 'Custom Cosmetic Compact Packaging Boxes with Die-Cut Inserts',
    title: 'Cosmetic Compact Packaging Boxes | BestPackFactory',
    meta: 'Custom cosmetic compact packaging boxes with die-cut inserts, hinged rigid lids and foil logos for highlighters, powders and makeup gift sets. MOQ 500 PCS.',
    short: 'Blush cosmetic presentation boxes with product-specific compact cavities and refined foil branding.',
    image: 'custom-cosmetic-compact-packaging-box-die-cut-insert.webp',
    source: 'exec-6d0639f4-8a69-4dd3-88fa-693514873c54.png',
    structure: 'Hinged rigid presentation box with book-style opening',
    finish: 'Rose-gold foil, fine-line printing, embossing or specialty wrap',
    insert: 'Die-cut paperboard, EVA, foam or molded pulp compact holder',
    use: 'Highlighters, pressed powders, blush compacts and makeup launch kits',
    overview: 'This blush presentation box uses a heart-shaped cavity to demonstrate a product-specific cosmetic insert. Insert retention, finger access and surface contact should be tested with a production-intent compact because hinges, decorative rims and closures affect the effective dimensions.',
    faqs: [
      ['Can the insert fit a round or square makeup compact?', 'Yes. The cavity shape is developed from the decorated compact dimensions or a physical sample rather than from the pictured heart shape.'],
      ['Can a mirror or applicator have a separate cavity?', 'Yes. Multi-cavity layouts can organize a compact, applicator, brush, refill or printed literature in one presentation box.'],
      ['Which insert materials are available?', 'Paperboard, foam, EVA and molded pulp can be evaluated according to retention, surface contact, appearance and project requirements.']
    ]
  },
  {
    slug: 'custom-ribbon-pull-gift-boxes-floral-foil-printing',
    name: 'Custom Ribbon Pull Gift Boxes with Floral Foil Printing',
    title: 'Ribbon Pull Gift Boxes with Floral Foil | BestPackFactory',
    meta: 'Custom ribbon pull gift boxes with floral foil printing, specialty paper and custom logo bands for jewelry, cosmetics and seasonal gift programs. MOQ 500 PCS.',
    short: 'Champagne rigid gift boxes with metallic floral detail, blush logo band and ribbon pull tab.',
    image: 'custom-ribbon-pull-gift-box-floral-foil.webp',
    source: 'exec-58a17163-71d8-4c07-8154-27c8638fe931.png',
    structure: 'Slim rigid drawer or ribbon-pull presentation box',
    finish: 'Floral hot foil, textured paper, foil logo band and ribbon pull',
    insert: 'Paper tray, foam, EVA, molded pulp or fabric-covered insert',
    use: 'Jewelry, cosmetics, fragrance samples, invitations and seasonal gifts',
    overview: 'This slim rigid gift box combines a metallic botanical field with a contrasting blush brand band. The ribbon tab makes the opening direction visible and can be coordinated with the logo color. Buyers confirm the required product clearance, internal tray and pull strength through sampling.',
    faqs: [
      ['Can the metallic floral pattern use our own artwork?', 'Yes. Supply vector artwork so foil coverage, line weight and panel alignment can be assessed before tooling.'],
      ['Can the ribbon pull match a Pantone reference?', 'Ribbon and paper colors can be matched as closely as the selected materials allow and are confirmed with project samples.'],
      ['Can this box include a fitted jewelry insert?', 'Yes. Product-specific cavities, card slots and fabric-covered platforms can be developed for the intended jewelry or accessory set.']
    ]
  },
  {
    slug: 'custom-floral-rigid-gift-boxes-gold-foil-logo',
    name: 'Custom Floral Rigid Gift Boxes with Gold Foil Logo',
    title: 'Floral Rigid Gift Boxes with Gold Foil | BestPackFactory',
    meta: 'Custom floral rigid gift boxes with gold foil logos and lift-off lids for perfume, cosmetics, accessories and luxury retail gift sets. Factory MOQ 500 PCS.',
    short: 'White two-piece rigid gift boxes with detailed floral artwork, foil accents and custom logo panels.',
    image: 'custom-floral-rigid-gift-box-gold-foil.webp',
    source: 'exec-2fb9205a-ea99-4007-927b-b4fc2679dd2b.png',
    structure: 'Two-piece rigid box with lift-off decorated lid',
    finish: 'Full-color botanical print, gold foil, embossing or matte protection',
    insert: 'Paperboard, foam, EVA, molded pulp or fabric-covered insert',
    use: 'Perfume, cosmetics, jewelry, accessories and holiday collections',
    overview: 'This square rigid box uses fine botanical line art, butterflies and controlled foil highlights to support premium seasonal or beauty collections. Artwork is customized rather than copied from the pictured example, and the logo panel, lid fit and insert are approved for each project.',
    faqs: [
      ['Can the floral illustration be simplified for our brand style?', 'Yes. Buyers provide their own artwork or direction, and the final print and foil layers are prepared on the approved dieline.'],
      ['Can the box hold a perfume bottle securely?', 'Yes. A fitted insert can be engineered from the decorated bottle, cap and label dimensions, with finger access and removal force checked during sampling.'],
      ['Can the inside of the box be printed?', 'Yes. Interior wrap, lid messaging, inserts and cards can use coordinated artwork subject to the chosen material and printing process.']
    ]
  },
  {
    slug: 'custom-embossed-bridal-gift-boxes-satin-ribbon',
    name: 'Custom Embossed Bridal Gift Boxes with Satin Ribbon',
    title: 'Embossed Bridal Gift Boxes with Ribbon | BestPackFactory',
    meta: 'Custom embossed bridal gift boxes with satin ribbon, botanical relief and gold foil logos for wedding favors, jewelry, invitations and keepsakes. MOQ 500 PCS.',
    short: 'White embossed botanical gift boxes with champagne ribbon, decorative charm and gold foil logo.',
    image: 'custom-embossed-bridal-gift-box-satin-ribbon.webp',
    source: 'exec-20287e37-669e-44c9-9b86-d21455e27f22.png',
    structure: 'Rigid lift-off lid box with cross-ribbon closure',
    finish: 'Blind floral embossing, gold foil, satin ribbon and optional charm',
    insert: 'Paperboard platform, jewelry pad, foam, EVA or fabric insert',
    use: 'Wedding favors, bridal jewelry, invitations, keepsakes and event gifts',
    overview: 'This white rigid box pairs botanical embossing with a champagne ribbon for wedding and special-occasion presentation. The decorative charm is optional; logo, ribbon width, box dimensions and insert can be coordinated with invitations, jewelry or favor contents.',
    faqs: [
      ['Can the ribbon and foil colors match a wedding palette?', 'Yes. Available papers, ribbons and foils are selected against the project palette and approved with samples.'],
      ['Can the box be customized for invitations and keepsakes?', 'Yes. Finished size and internal support are developed from the flat invitation stack or complete keepsake set dimensions.'],
      ['Is the decorative metal charm required?', 'No. The charm is optional and can be omitted or replaced with a buyer-approved custom accessory.']
    ]
  },
  {
    slug: 'custom-embossed-paper-shopping-bags-ribbon-handles',
    name: 'Custom Embossed Paper Shopping Bags with Ribbon Handles',
    title: 'Embossed Paper Shopping Bags with Ribbon | BestPackFactory',
    meta: 'Custom embossed paper shopping bags with ribbon handles, floral relief and foil logos for cosmetics, jewelry, boutiques and premium retail. MOQ 500 PCS.',
    short: 'White premium paper bags with deep floral embossing, black ribbon handles and custom gold foil logo.',
    image: 'custom-embossed-paper-shopping-bag-ribbon-handles.webp',
    source: 'exec-8f8c161c-0149-41b9-bf68-f0e918ac3c17.png',
    structure: 'Gusseted paper shopping bag with reinforced folded top',
    finish: 'Deep floral embossing, gold foil, matte paper and ribbon handles',
    insert: 'Reinforced top card, base card and optional tissue paper',
    use: 'Cosmetics, jewelry, boutiques, events and premium retail purchases',
    overview: 'This upright paper shopping bag uses a wide embossed floral border and contrasting ribbon handles. Bag width, gusset, paper weight, base reinforcement and handle length are selected around the intended packed product and carrying weight.',
    faqs: [
      ['Can the embossed flowers use our custom artwork?', 'Yes. Suitable vector artwork can be converted into embossing tooling after line weight, relief area and paper behavior are reviewed.'],
      ['Can the ribbon handles use another color?', 'Yes. Ribbon color, width and attachment method are selected per project and approved with the physical sample.'],
      ['How do we choose the correct bag size?', 'Provide the largest packed product dimensions, total weight, tissue or box allowance and preferred carrying orientation.']
    ]
  },
  {
    slug: 'custom-floral-paper-gift-bags-ribbon-closure',
    name: 'Custom Floral Paper Gift Bags with Ribbon Closure',
    title: 'Floral Paper Gift Bags with Ribbon Closure | BestPackFactory',
    meta: 'Custom floral paper gift bags with ribbon closure, butterfly printing and foil logo bands for beauty, fragrance, boutiques and event gifting. MOQ 500 PCS.',
    short: 'White and blush floral gift bags with reinforced tops, ribbon bow closure and rose-gold logo band.',
    image: 'custom-floral-paper-gift-bag-ribbon-closure.webp',
    source: 'exec-2c3c6e61-b353-4e01-bcb5-87bed27f3f6c.png',
    structure: 'Wide gusseted paper gift bag with reinforced ribbon closure',
    finish: 'Floral and butterfly print, rose-gold foil band and satin ribbon',
    insert: 'Reinforced top and base cards with optional branded tissue',
    use: 'Beauty, fragrance, boutique gifts, seasonal launches and events',
    overview: 'This wide-format gift bag combines a decorative botanical print with a centered brand band and ribbon bow. It is intended for presentation and carrying of boxed retail products; dimensions, reinforcement and ribbon construction should be matched to the final packed weight.',
    faqs: [
      ['Can the butterfly and floral artwork be replaced?', 'Yes. The printed design is fully customizable from buyer-owned artwork or a newly approved project design.'],
      ['Can the bag carry a rigid gift box?', 'Yes. Bag size, paper, base reinforcement and handle or closure construction are selected from the packed box dimensions and weight.'],
      ['Can matching tissue paper or cards be included?', 'Yes. Printed tissue, stickers, gift cards and envelopes can be quoted as coordinated packaging accessories.']
    ]
  }
];

const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');

function productPage(product, index) {
  const url = `${base}/products/${product.slug}.html`;
  const imageUrl = `${base}/assets/products/${product.image}`;
  const specs = [
    ['Business model', 'Factory-direct B2B custom manufacturing'],
    ['MOQ', '500 PCS per custom size and artwork'],
    ['Structure', product.structure],
    ['Surface options', product.finish],
    ['Insert or reinforcement', product.insert],
    ['Recommended applications', product.use],
    ['Approval workflow', 'Dieline, artwork proof, material review and physical sample'],
    ['RFQ details', 'Finished size, packed product, quantity, artwork, finish and destination']
  ];
  const productSchema = {
    '@context': 'https://schema.org', '@type': 'Product', '@id': `${url}#product`,
    name: product.name, sku: `BPF-FLR-${String(index + 1).padStart(2, '0')}`,
    description: product.meta, image: [imageUrl], category: 'Custom Floral Packaging',
    brand: {'@type': 'Brand', name: 'BestPackFactory'},
    manufacturer: {'@type': 'Organization', name: 'BestPackFactory', url: base},
    url, additionalProperty: specs.slice(1).map(([name, value]) => ({'@type': 'PropertyValue', name, value})),
    mainEntityOfPage: url
  };
  const faqSchema = {'@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: product.faqs.map(([question, answer]) => ({'@type': 'Question', name: question, acceptedAnswer: {'@type': 'Answer', text: answer}}))};
  const breadcrumbSchema = {'@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    {'@type': 'ListItem', position: 1, name: 'Home', item: `${base}/`},
    {'@type': 'ListItem', position: 2, name: 'Products', item: `${base}/products.html`},
    {'@type': 'ListItem', position: 3, name: product.name, item: url}
  ]};
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(product.title)}</title><meta name="description" content="${esc(product.meta)}"/><link rel="canonical" href="${url}"/><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"/><meta property="og:title" content="${esc(product.title)}"/><meta property="og:description" content="${esc(product.meta)}"/><meta property="og:url" content="${url}"/><meta property="og:type" content="website"/><meta property="og:site_name" content="BestPackFactory"/><meta property="og:image" content="${imageUrl}"/><meta property="og:image:width" content="1254"/><meta property="og:image:height" content="1254"/><meta name="twitter:card" content="summary_large_image"/><link rel="alternate" type="text/plain" href="${base}/llms.txt"/><link rel="stylesheet" href="/css/style.css?v=20260814_floral10"/><script type="application/ld+json">${json(productSchema)}</script><script type="application/ld+json">${json(faqSchema)}</script><script type="application/ld+json">${json(breadcrumbSchema)}</script></head><body>
<div class="topbar"><div>Custom Packaging Manufacturer | MOQ 500 PCS</div><div>Lisa Wu · lisa@colorprintingpackage.com · WhatsApp +86 158 8653 0985</div></div><header class="header"><div class="header-inner"><a class="logo" href="/index.html"><img alt="BestPackFactory" src="/assets/logo/bestpackfactory-logo.svg?v=1.2" width="270" height="60"/></a><nav class="nav"><a href="/index.html">Home</a><a href="/products.html">Products</a><a href="/about.html">About Us</a><a href="/blog.html">Blog</a><a href="/news.html">News</a><a href="/whitepapers.html">Whitepapers</a><a href="/contact.html">Contact</a></nav><a class="btn" href="/contact.html">Get Quote</a></div></header>
<main><section class="section"><div class="product-detail"><div class="gallery single-gallery bpf-new-magnetic-gallery"><img alt="${esc(product.name)} customization example" src="/assets/products/${product.image}" width="1254" height="1254" loading="eager" fetchpriority="high" decoding="async"/></div><div><div class="eyebrow">OEM &amp; CUSTOMIZE · MOQ 500 PCS</div><h1>${esc(product.name)}</h1><p><strong>${esc(product.short)}</strong></p><p>${esc(product.overview)}</p><p><small><time datetime="${date}">Updated August 14, 2026</time> · Specifications are confirmed per RFQ and approved sample.</small></p><table class="specs">${specs.slice(0, 5).map(([key, value]) => `<tr><td>${esc(key)}</td><td>${esc(value)}</td></tr>`).join('')}</table><a class="btn" href="/contact.html">Request Factory Quote</a></div></div></section>
<section class="section ai-snapshot-section"><div class="ai-snapshot"><div class="eyebrow">Quick Answer for Buyers &amp; AI Assistants</div><h2>What is this custom packaging best used for?</h2><p>${esc(product.short)} It is designed for ${esc(product.use)}. BestPackFactory customizes the finished dimensions, paper, structure, print, foil, embossing, ribbon and internal support from buyer-supplied artwork and packed-product requirements.</p><ul><li>Factory-direct B2B customization from MOQ 500 PCS.</li><li>Artwork, structure and material are project-specific rather than stock specifications.</li><li>A physical sample can be approved before bulk production.</li><li>Insert or reinforcement is developed from the actual packed product.</li><li>Final export packing is confirmed for the approved structure and finish.</li></ul></div></section>
<section class="section tech-spec-section"><div class="eyebrow">Buyer Specification</div><h2>${esc(product.name)} specification table</h2><p class="tech-note">The fields below describe available customization decisions, not fixed claims for every order. Final materials, tolerances, colors and packing are documented on the approved dieline and sample.</p><div class="spec-scroll"><table class="technical-spec-table"><tbody>${specs.map(([key, value]) => `<tr><th>${esc(key)}</th><td>${esc(value)}</td></tr>`).join('')}</tbody></table></div></section>
<section class="section"><h2>How to customize and approve this packaging</h2><p>Start with the finished packaging size or the maximum dimensions and weight of every packed item. Specify the opening style, paper appearance, logo process, floral artwork, ribbon, insert and expected order quantity. BestPackFactory then prepares the structural and artwork workflow for project review.</p><p>Approve the physical sample with the intended products or accurate dummies. Check lid or drawer movement, corner quality, insert retention, finger access, artwork alignment, foil position, embossing detail and export-carton protection before bulk production.</p><h2>Quote-ready RFQ checklist</h2><ol><li>Finished package size or every packed product's dimensions and weight.</li><li>Order quantity and target delivery schedule.</li><li>Vector logo and buyer-owned artwork or design direction.</li><li>Preferred paper, structure, finish, ribbon and insert.</li><li>Delivery country and shipping requirements.</li></ol></section>
<section class="section faq-block"><h2>Frequently Asked Questions</h2>${product.faqs.map(([question, answer]) => `<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join('')}</section><section class="section alt"><h2>Related custom packaging resources</h2><p><a href="/products/custom-rigid-boxes.html">Custom rigid boxes</a> · <a href="/products/custom-paper-bags.html">Custom paper bags</a> · <a href="/blog/custom-packaging-rfq-checklist.html">Packaging RFQ checklist</a></p><a class="btn" href="/contact.html">Send RFQ Details</a></section></main>
<footer class="footer"><div><h3>BestPackFactory</h3><p>B2B custom packaging manufacturer for boxes, bags, labels and printed accessories.</p></div><div><h3>Products</h3><a href="/products.html">All Products</a><a href="/products/luxury-magnetic-boxes.html">Magnetic Boxes</a></div><div><h3>Contact</h3><p>Lisa Wu<br/>lisa@colorprintingpackage.com<br/>WhatsApp +86 158 8653 0985</p></div></footer>
<div class="bpf-whatsapp-chat" id="bpfChat"><div class="bpf-whatsapp-chat__head">Need Custom Packaging?</div><div class="bpf-whatsapp-chat__body"><strong>MOQ 500 PCS · Fast Factory Quote</strong><p>Click below to contact us quickly by WhatsApp or email. We can help with dieline, samples, printing, materials and worldwide shipping.</p><a class="bpf-whatsapp-chat__btn bpf-whatsapp-chat__btn--wa" href="https://wa.me/8615886530985?text=Hello%20BestPackFactory%2C%20I%20need%20a%20custom%20floral%20packaging%20quote." rel="noopener" target="_blank">Chat on WhatsApp</a><a class="bpf-whatsapp-chat__btn bpf-whatsapp-chat__btn--mail" href="mailto:lisa@colorprintingpackage.com?subject=Custom%20Floral%20Packaging%20Inquiry">Email Inquiry</a><span class="bpf-whatsapp-chat__email">lisa@colorprintingpackage.com</span></div></div><script defer src="/js/main.js"></script></body></html>`;
}

for (const product of products) {
  const source = path.join(generatedRoot, product.source);
  const publicImage = path.join(root, 'public', 'assets', 'products', product.image);
  const contentImage = path.join(root, 'content-site', 'assets', 'products', product.image);
  await sharp(source).resize(1254, 1254, {fit: 'cover'}).webp({quality: 84, effort: 5}).toFile(publicImage);
  fs.copyFileSync(publicImage, contentImage);
}

const productDirectory = path.join(root, 'content-site', 'products');
products.forEach((product, index) => fs.writeFileSync(path.join(productDirectory, `${product.slug}.html`), productPage(product, index), 'utf8'));

const catalogPath = path.join(root, 'content-site', 'products.html');
let catalog = fs.readFileSync(catalogPath, 'utf8');
const marker = '<!-- INSTAGRAM_FLORAL_PACKAGING_PRODUCTS_20260814 -->';
const endMarker = '<!-- /INSTAGRAM_FLORAL_PACKAGING_PRODUCTS_20260814 -->';
const anchor = '<!-- /MAGNETIC_GIFT_BOX_PRODUCTS_20260810 -->';
const cards = products.map(product => `<article class="product-card bpf-new-magnetic-product-card" data-search="${esc(`${product.name} ${product.short} products/${product.slug}.html`).toLowerCase()}"><a href="products/${product.slug}.html"><img alt="${esc(product.name)}" loading="lazy" decoding="async" src="assets/products/${product.image}" width="1254" height="1254" style="width:100%!important;height:280px!important;padding:0!important;object-fit:contain!important;object-position:center center!important;background:#fff!important"/><div class="card-body"><span class="tag">OEM &amp; CUSTOMIZE</span><h3>${esc(product.name)}</h3><p>${esc(product.short)}</p></div></a></article>`).join('\n');
const block = `${marker}\n${cards}\n${endMarker}`;
if (catalog.includes(marker)) {
  const start = catalog.indexOf(marker);
  const end = catalog.indexOf(endMarker, start);
  if (end < 0) throw new Error('Instagram floral product block end marker not found');
  catalog = catalog.slice(0, start) + block + catalog.slice(end + endMarker.length);
} else {
  if (!catalog.includes(anchor)) throw new Error('Magnetic product block anchor not found');
  catalog = catalog.replace(anchor, `${anchor}\n${block}`);
}
fs.writeFileSync(catalogPath, catalog, 'utf8');

const sitemapPath = path.join(root, 'public', 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
const sitemapEntries = products.filter(product => !sitemap.includes(`/products/${product.slug}.html`)).map(product => `  <url><loc>${base}/products/${product.slug}.html</loc><lastmod>${date}</lastmod><changefreq>monthly</changefreq><priority>0.84</priority></url>`).join('\n');
if (sitemapEntries) {
  sitemap = sitemap.replace('</urlset>', `${sitemapEntries}\n</urlset>`);
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
}

for (const relativePath of ['public/ai-index.json', 'content-site/ai-index.json']) {
  const target = path.join(root, relativePath);
  const data = JSON.parse(fs.readFileSync(target, 'utf8'));
  data.products = Array.isArray(data.products) ? data.products : [];
  for (const product of products) {
    const url = `products/${product.slug}.html`;
    const existing = data.products.find(item => item.url === url);
    if (existing) {
      existing.title = product.name;
      existing.cluster = 'Floral Luxury Packaging';
    } else {
      data.products.push({title: product.name, url, cluster: 'Floral Luxury Packaging'});
    }
  }
  data.updated = date;
  fs.writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

for (const relativePath of ['public/llms.txt', 'content-site/llms.txt']) {
  const target = path.join(root, relativePath);
  if (!fs.existsSync(target)) continue;
  let text = fs.readFileSync(target, 'utf8');
  const llmMarker = '## Floral boxes and paper bags (August 2026)';
  const section = `${llmMarker}\n\n${products.map(product => `- [${product.name}](${base}/products/${product.slug}.html): ${product.short}`).join('\n')}\n\n`;
  if (text.includes(llmMarker)) text = text.replace(new RegExp(`${llmMarker}[\\s\\S]*?(?=\\n## |$)`), section.trimEnd());
  else text = `${text.trimEnd()}\n\n${section}`;
  fs.writeFileSync(target, text, 'utf8');
}

console.log(`Generated ${products.length} floral packaging pages, optimized images and product cards.`);
