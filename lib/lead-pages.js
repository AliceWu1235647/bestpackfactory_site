import { SITE_URL, canonicalForRoute, siteUrl } from './seo-utils';

const CONTACT = {
  name: 'Lisa Wu',
  email: 'lisa@colorprintingpackage.com',
  whatsapp: '+86 158 8653 0985',
  whatsappUrl: 'https://wa.me/8615886530985'
};

const COMMON_FAQS = [
  {
    q: 'What is the MOQ for custom packaging?',
    a: 'Standard custom packaging projects start from MOQ 500 PCS when the size, material, printing and finish are confirmed.'
  },
  {
    q: 'What should a buyer send for an accurate quote?',
    a: 'Send product type, size, material, quantity, artwork status, finish requirements, destination country and target delivery date.'
  },
  {
    q: 'Can BestPackFactory help before artwork is ready?',
    a: 'Yes. BestPackFactory can support structure suggestions, dieline preparation, sample planning and packaging specification review before mass production.'
  }
];

const BASE_SPEC_ROWS = [
  ['MOQ', 'From 500 PCS for qualified B2B custom packaging RFQ projects.'],
  ['Quote method', 'Factory quote based on size, material, printing, finish, quantity and shipping destination.'],
  ['Workflow', 'Specification review, dieline, artwork proof, sample approval, bulk production, QC and export shipping.'],
  ['Buyer files', 'AI, PDF, PSD, EPS, high-resolution image, logo file or reference sample photos.']
];

const PAGE_LINKS = {
  boxes: { label: 'Custom Boxes', url: '/products/custom-boxes.html' },
  flexible: { label: 'Flexible Packaging', url: '/products/flexible-packaging.html' },
  coffee: { label: 'Coffee Bags', url: '/products/coffee-bags.html' },
  food: { label: 'Food Packaging', url: '/products/food-packaging.html' },
  cosmetic: { label: 'Cosmetic Packaging Boxes', url: '/products/custom-cosmetic-packaging-boxes.html' },
  pet: { label: 'Pet Food Bags', url: '/products/pet-food-bags.html' },
  pharma: { label: 'Pharma Packaging', url: '/products/pharma-packaging.html' },
  gift: { label: 'Luxury Magnetic Boxes', url: '/products/luxury-magnetic-boxes.html' },
  labels: { label: 'Labels & Stickers', url: '/products/labels-stickers.html' },
  paper: { label: 'Paper Bags', url: '/products/paper-bags.html' },
  contact: { label: 'Request Factory Quote', url: '/contact.html#rfq-form-section' },
  products: { label: 'All Packaging Products', url: '/products.html' }
};

const LEAD_PAGES = [
  {
    route: 'packaging-procurement-hub.html',
    title: 'Custom Packaging Procurement Hub | BestPackFactory',
    description: 'B2B custom packaging procurement hub for MOQ 500 PCS factory quotes, dieline, sampling, material selection, QC and worldwide shipping.',
    eyebrow: 'Procurement Hub',
    h1: 'Custom Packaging Procurement Hub',
    intent: 'B2B buyers comparing custom packaging suppliers, MOQ, lead time, materials and RFQ requirements.',
    quickAnswer: 'BestPackFactory helps B2B buyers source custom boxes, bags, pouches, labels, bottles, tins and printed packaging from MOQ 500 PCS with dieline, sampling, QC and export shipping support.',
    scenarios: ['New brand packaging development', 'Supplier replacement and cost comparison', 'Multi-category packaging sourcing', 'Factory-direct RFQ before sampling'],
    specs: BASE_SPEC_ROWS,
    links: [PAGE_LINKS.boxes, PAGE_LINKS.flexible, PAGE_LINKS.coffee, PAGE_LINKS.food, PAGE_LINKS.gift, PAGE_LINKS.contact],
    faqs: COMMON_FAQS
  },
  {
    route: 'custom-packaging-manufacturer.html',
    title: 'Custom Packaging Manufacturer | MOQ 500 PCS | BestPackFactory',
    description: 'Factory-direct custom packaging manufacturer for boxes, bags, labels, pouches, bottles and tins. MOQ 500 PCS with OEM printing.',
    eyebrow: 'Factory Direct',
    h1: 'Custom Packaging Manufacturer For B2B Buyers',
    intent: 'Buyers searching for a factory-direct custom packaging manufacturer instead of a retail packaging seller.',
    quickAnswer: 'BestPackFactory is a B2B custom packaging manufacturer supporting OEM packaging, custom size, custom printing, surface finish, accessories, samples and worldwide shipping from MOQ 500 PCS.',
    scenarios: ['Private label packaging', 'Retail shelf packaging', 'Export packaging projects', 'OEM and ODM packaging sourcing'],
    specs: [...BASE_SPEC_ROWS, ['Main categories', 'Custom boxes, flexible packaging, coffee bags, paper bags, labels, PET bottles, tin boxes and specialty packaging.']],
    links: [PAGE_LINKS.products, PAGE_LINKS.boxes, PAGE_LINKS.flexible, PAGE_LINKS.labels, PAGE_LINKS.contact],
    faqs: COMMON_FAQS
  },
  {
    route: 'custom-packaging-moq-500.html',
    title: 'Custom Packaging MOQ 500 PCS | Factory Direct | BestPackFactory',
    description: 'Custom packaging MOQ 500 PCS for B2B buyers needing factory quotes, dieline support, sample approval and export shipping.',
    eyebrow: 'MOQ 500 PCS',
    h1: 'Custom Packaging MOQ 500 PCS',
    intent: 'Buyers who need low MOQ custom packaging without retail checkout pricing.',
    quickAnswer: 'MOQ 500 PCS is suitable for B2B buyers who need custom packaging samples and small batch production with real factory materials, printing and finish options.',
    scenarios: ['First production batch', 'Product launch packaging', 'Seasonal packaging test', 'Private label packaging validation'],
    specs: [...BASE_SPEC_ROWS, ['Best fit', 'Projects that need real custom size, logo printing and export packing rather than blank stock packaging.']],
    links: [PAGE_LINKS.contact, PAGE_LINKS.boxes, PAGE_LINKS.flexible, PAGE_LINKS.paper, PAGE_LINKS.labels],
    faqs: [
      ...COMMON_FAQS,
      { q: 'Why does MOQ depend on materials and printing?', a: 'Custom printing, plate setup, die cutting, lamination, mold setup and material sourcing create fixed costs, so MOQ keeps unit cost workable.' }
    ]
  },
  {
    route: 'custom-packaging-rfq-template.html',
    title: 'Custom Packaging RFQ Template | Factory Quote | BestPackFactory',
    description: 'Use this custom packaging RFQ template to send size, material, quantity, artwork, finish and destination details for a faster quote.',
    eyebrow: 'RFQ Template',
    h1: 'Custom Packaging RFQ Template',
    intent: 'Buyers ready to request a quote and reduce back-and-forth before sampling.',
    quickAnswer: 'A strong packaging RFQ should include product type, dimensions, capacity, material, printing colors, finish, quantity, artwork status, packing method, destination country and deadline.',
    scenarios: ['Fast price comparison', 'Artwork and dieline review', 'Sample request preparation', 'Shipping cost estimate'],
    specs: [
      ['Product', 'Packaging type, product weight or capacity, filling method and target market.'],
      ['Size', 'Flat size, finished size, pouch gusset, box inner size or bottle capacity.'],
      ['Material', 'Paper weight, film structure, barrier requirement, recycled or compostable preference.'],
      ['Printing', 'CMYK, Pantone, foil, embossing, matte, gloss, soft-touch, barcode or QR code.'],
      ['Quantity', 'MOQ 500 PCS and larger tier quantities for cost comparison.']
    ],
    links: [PAGE_LINKS.contact, PAGE_LINKS.products, PAGE_LINKS.flexible, PAGE_LINKS.boxes],
    faqs: [
      ...COMMON_FAQS,
      { q: 'Can I request multiple quantity tiers?', a: 'Yes. Buyers can request 500, 1000, 3000 and 5000 PCS tiers to compare setup cost and unit price.' }
    ]
  },
  {
    route: 'industries/coffee-packaging-supplier.html',
    title: 'Coffee Packaging Supplier | Custom Coffee Bags MOQ 500 PCS',
    description: 'Custom coffee packaging supplier for valve bags, flat bottom bags, kraft bags and printed pouches. MOQ 500 PCS factory quote.',
    eyebrow: 'Coffee Packaging',
    h1: 'Custom Coffee Packaging Supplier',
    intent: 'Coffee roasters and private label brands sourcing custom printed coffee bags.',
    quickAnswer: 'BestPackFactory supports custom coffee bags with valve, zipper, high barrier film, kraft paper, matte finish, flat bottom structure and export packing from MOQ 500 PCS.',
    scenarios: ['Roasted coffee beans', 'Ground coffee', 'Single-origin product launches', 'Private label coffee packaging'],
    specs: [...BASE_SPEC_ROWS, ['Typical structures', 'Flat bottom bags, stand up pouches, side gusset bags, kraft paper coffee bags and valve bags.']],
    links: [PAGE_LINKS.coffee, PAGE_LINKS.flexible, PAGE_LINKS.contact],
    faqs: COMMON_FAQS
  },
  {
    route: 'industries/food-packaging-manufacturer.html',
    title: 'Food Packaging Manufacturer | Custom Printed MOQ 500 PCS',
    description: 'Food packaging manufacturer for custom boxes, bags, cups, bowls, burger boxes, pizza boxes and takeaway packaging. MOQ 500 PCS.',
    eyebrow: 'Food Packaging',
    h1: 'Custom Food Packaging Manufacturer',
    intent: 'Restaurants, food brands and distributors sourcing printed food packaging.',
    quickAnswer: 'BestPackFactory supports custom food packaging such as burger boxes, pizza boxes, fries boxes, bakery boxes, paper bags, cups, bowls and printed pouches with MOQ 500 PCS.',
    scenarios: ['Takeaway packaging', 'Retail food packaging', 'Bakery and dessert packaging', 'Foodservice brand packaging'],
    specs: [...BASE_SPEC_ROWS, ['Food needs', 'Confirm direct-food-contact requirements, grease resistance, moisture resistance and packing method before sampling.']],
    links: [PAGE_LINKS.food, PAGE_LINKS.paper, PAGE_LINKS.flexible, PAGE_LINKS.contact],
    faqs: COMMON_FAQS
  },
  {
    route: 'industries/cosmetic-packaging-manufacturer.html',
    title: 'Cosmetic Packaging Manufacturer | Custom Boxes MOQ 500 PCS',
    description: 'Custom cosmetic packaging manufacturer for skincare boxes, beauty kits, labels, rigid boxes and retail packaging. MOQ 500 PCS.',
    eyebrow: 'Cosmetic Packaging',
    h1: 'Custom Cosmetic Packaging Manufacturer',
    intent: 'Beauty and skincare brands sourcing premium printed cosmetic packaging.',
    quickAnswer: 'BestPackFactory supports cosmetic packaging boxes, beauty kit packaging, labels, rigid boxes, paper bags and inserts with custom printing, foil, embossing and soft-touch finish options.',
    scenarios: ['Skincare box packaging', 'Beauty kit packaging', 'Serum and bottle labels', 'Premium retail launch sets'],
    specs: [...BASE_SPEC_ROWS, ['Premium finishes', 'Foil stamping, embossing, debossing, soft-touch lamination, spot UV, inserts and ribbon options.']],
    links: [PAGE_LINKS.cosmetic, PAGE_LINKS.gift, PAGE_LINKS.labels, PAGE_LINKS.contact],
    faqs: COMMON_FAQS
  },
  {
    route: 'industries/pet-food-packaging-supplier.html',
    title: 'Pet Food Packaging Supplier | Custom Bags MOQ 500 PCS',
    description: 'Custom pet food packaging supplier for dog food bags, cat food pouches and high barrier flat bottom bags. MOQ 500 PCS.',
    eyebrow: 'Pet Food Packaging',
    h1: 'Custom Pet Food Packaging Supplier',
    intent: 'Pet food brands sourcing custom printed bags with barrier, zipper and shelf display requirements.',
    quickAnswer: 'BestPackFactory supports pet food bags, dog food flat bottom bags, cat food pouches, resealable zippers, high barrier films and custom printing from MOQ 500 PCS.',
    scenarios: ['Dog food packaging', 'Cat food pouches', 'Treat bags', 'Pet supplement packaging'],
    specs: [...BASE_SPEC_ROWS, ['Barrier needs', 'Confirm product weight, oil level, shelf life, zipper, handle, gusset and carton packing requirements.']],
    links: [PAGE_LINKS.pet, PAGE_LINKS.flexible, PAGE_LINKS.contact],
    faqs: COMMON_FAQS
  },
  {
    route: 'industries/pharmaceutical-packaging-supplier.html',
    title: 'Pharmaceutical Packaging Supplier | Custom Boxes MOQ 500 PCS',
    description: 'Pharmaceutical packaging supplier for medicine cartons, supplement boxes, labels and GS1-ready printed packaging. MOQ 500 PCS.',
    eyebrow: 'Pharma Packaging',
    h1: 'Pharmaceutical Packaging Supplier',
    intent: 'Healthcare, supplement and pharma buyers sourcing traceable printed packaging.',
    quickAnswer: 'BestPackFactory supports pharmaceutical folding cartons, supplement packaging, labels, PET bottles, GS1-ready printing, QR codes, barcodes and tamper-evident options.',
    scenarios: ['Supplement packaging', 'Medicine folding cartons', 'Medical aesthetic kits', 'Traceability label projects'],
    specs: [...BASE_SPEC_ROWS, ['Compliance details', 'Send barcode, QR code, GS1/DataMatrix requirements, warning text, batch coding and carton packing rules.']],
    links: [PAGE_LINKS.pharma, PAGE_LINKS.labels, { label: 'Medical Aesthetic Boxes', url: '/products/medical-aesthetic-packaging-boxes.html' }, PAGE_LINKS.contact],
    faqs: COMMON_FAQS
  },
  {
    route: 'industries/luxury-gift-packaging-manufacturer.html',
    title: 'Luxury Gift Packaging Manufacturer | Magnetic Boxes MOQ 500 PCS',
    description: 'Luxury gift packaging manufacturer for magnetic rigid boxes, paper bags, inserts, tissue paper and premium finishes. MOQ 500 PCS.',
    eyebrow: 'Luxury Gift Packaging',
    h1: 'Luxury Gift Packaging Manufacturer',
    intent: 'Premium retail and gift brands sourcing rigid boxes, magnetic boxes and branded gift packaging.',
    quickAnswer: 'BestPackFactory supports luxury gift packaging including magnetic rigid boxes, collapsible gift boxes, drawer boxes, paper bags, tissue paper, stickers, inserts and premium finishes.',
    scenarios: ['Gift set packaging', 'Premium retail packaging', 'Jewelry and fragrance boxes', 'Holiday campaign packaging'],
    specs: [...BASE_SPEC_ROWS, ['Presentation options', 'Magnetic closure, ribbon tab, EVA or paperboard inserts, foil logo, embossing, soft-touch lamination and tissue paper.']],
    links: [PAGE_LINKS.gift, PAGE_LINKS.paper, PAGE_LINKS.boxes, PAGE_LINKS.contact],
    faqs: COMMON_FAQS
  }
];

const LEAD_PAGE_MAP = new Map(LEAD_PAGES.map((page) => [page.route, page]));

function escapeHtml(value = '') {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function leadMessage(page) {
  return encodeURIComponent(`Hello BestPackFactory, I need a quote for ${page.h1}. Quantity: MOQ 500 PCS or more. Please help with material, dieline, sample and shipping.`);
}

function pageHeader() {
  return `
<div class="topbar"><div>Custom Packaging Manufacturer | MOQ 500 PCS | Free Design | Fast Delivery Worldwide</div><div>Email: ${CONTACT.email} | WhatsApp: ${CONTACT.whatsapp}</div></div>
<header class="header">
<div class="header-inner">
<a class="logo" href="/"><img alt="BestPackFactory" decoding="async" loading="lazy" src="/assets/logo/bestpackfactory-logo.svg?v=1.2" width="270" height="60"/></a>
<form action="/products.html" class="search" data-product-search="true" method="get" role="search"><input aria-label="Search custom packaging products" autocomplete="off" name="q" placeholder="Search products: coffee bags, pet food, pharma, cannabis..."/><button type="submit">Search</button></form>
<nav class="nav"><a href="/">Home</a><a href="/products.html">Products</a><a href="/about.html">About Us</a><a href="/blog.html">Blog</a><a href="/news.html">News</a><a href="/whitepapers.html">Whitepapers</a><a href="/contact.html">Contact</a></nav>
<button aria-controls="mobileNavPanel" aria-expanded="false" aria-label="Open mobile menu" class="mobile-menu-toggle" type="button">Menu</button><a class="btn" href="/contact.html">Get Quote</a>
</div>
<div aria-hidden="true" class="mobile-nav-panel" id="mobileNavPanel"><div class="mobile-nav-head"><strong>BestPackFactory</strong><button aria-label="Close mobile menu" class="mobile-menu-close" type="button">&times;</button></div><div class="mobile-nav-links"><a href="/">Home</a><a href="/products.html">Products</a><a href="/about.html">About Us</a><a href="/blog.html">Blog</a><a href="/news.html">News</a><a href="/whitepapers.html">Whitepapers</a><a href="/contact.html">Contact</a></div><div class="mobile-nav-actions"><a class="mobile-action-wa" href="${CONTACT.whatsappUrl}?text=${encodeURIComponent('Hello BestPackFactory, I need a custom packaging quote.')}" rel="noopener" target="_blank">WhatsApp Quote</a><a class="mobile-action-email" href="mailto:${CONTACT.email}?subject=Packaging Inquiry">Email Inquiry</a></div></div><div aria-hidden="true" class="mobile-backdrop"></div>
</header>`;
}

function footer() {
  return `
<footer class="footer">
<div><h3>BestPackFactory</h3><p>B2B custom packaging manufacturer for boxes, bags, labels, bottles, tins and printing.</p><p>${CONTACT.name} | ${CONTACT.email} | WhatsApp ${CONTACT.whatsapp}</p><p>Address: Printing Industrial Park, Longhua District, Shenzhen, Guangdong Province, 518109, China</p></div>
<div><h3>Products</h3><a href="/products.html">All Products</a><a href="/products/luxury-magnetic-boxes.html">Magnetic Boxes</a><a href="/products/flexible-packaging.html">Flexible Packaging</a><a href="/products/coffee-bags.html">Coffee Bags</a></div>
<div><h3>Inquiry</h3><a href="/contact.html#rfq-form-section">Request Quote</a><a href="mailto:${CONTACT.email}">Email Lisa</a><a href="${CONTACT.whatsappUrl}" rel="noopener" target="_blank">WhatsApp</a></div>
</footer>`;
}

function renderCards(items = []) {
  return items.map((item) => `<article class="whitepaper-card"><h3>${escapeHtml(item)}</h3><p>${escapeHtml(item)} projects should confirm product size, material, finish, quantity, artwork and destination before sampling.</p></article>`).join('');
}

function renderSpecs(rows = []) {
  return `<div class="spec-scroll"><table class="technical-spec-table"><tbody>${rows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join('')}</tbody></table></div>`;
}

function renderLinks(links = []) {
  return links.map((link) => `<a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>`).join('');
}

function renderFaqs(faqs = []) {
  return faqs.map((faq) => `<details><summary>${escapeHtml(faq.q)}</summary><p>${escapeHtml(faq.a)}</p></details>`).join('');
}

function pageBody(page) {
  const whatsapp = `${CONTACT.whatsappUrl}?text=${leadMessage(page)}`;
  return `${pageHeader()}
<main class="geo-article">
<section class="section whitepaper-hero">
<div class="eyebrow">${escapeHtml(page.eyebrow)}</div>
<h1>${escapeHtml(page.h1)}</h1>
<p>${escapeHtml(page.quickAnswer)}</p>
<div class="rfq-actions"><a class="btn" href="/contact.html#rfq-form-section">Request Factory Quote</a><a class="btn light" href="${whatsapp}" rel="noopener" target="_blank">Send WhatsApp RFQ</a></div>
</section>
<section class="section">
<div class="eyebrow">Quick Answer</div>
<h2>Best Fit For This Search</h2>
<div class="ai-snapshot"><p><strong>Buyer intent:</strong> ${escapeHtml(page.intent)}</p><p>${escapeHtml(page.quickAnswer)}</p></div>
</section>
<section class="section alt">
<div class="eyebrow">Use Cases</div>
<h2>Common Projects</h2>
<div class="whitepaper-grid">${renderCards(page.scenarios)}</div>
</section>
<section class="section">
<div class="eyebrow">RFQ Specs</div>
<h2>Information Needed For A Fast Quote</h2>
${renderSpecs(page.specs)}
</section>
<section class="section alt">
<div class="eyebrow">Related Products</div>
<h2>Continue To Product Pages Or RFQ</h2>
<ul class="internal-links">${renderLinks(page.links)}</ul>
</section>
<section class="section faq-block">
<div class="eyebrow">FAQ</div>
<h2>Buyer Questions</h2>
${renderFaqs(page.faqs)}
</section>
</main>
${footer()}`;
}

function pageJsonLd(page) {
  const canonical = canonicalForRoute(page.route);
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a }
    }))
  };
  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.h1,
    provider: {
      '@type': 'Organization',
      name: 'BestPackFactory',
      url: SITE_URL
    },
    areaServed: 'Worldwide',
    serviceType: 'B2B custom packaging manufacturing',
    description: page.quickAnswer,
    offers: {
      '@type': 'Offer',
      url: canonical,
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'PriceSpecification',
        description: 'Factory RFQ required. MOQ 500 PCS for qualified B2B custom packaging projects.'
      }
    }
  };
  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: canonical,
    isPartOf: { '@type': 'WebSite', name: 'BestPackFactory', url: `${SITE_URL}/` },
    about: page.links.map((link) => ({ '@type': 'Thing', name: link.label, url: siteUrl(link.url) }))
  };
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: page.h1, item: canonical }
    ]
  };
  return [webPage, service, faq, breadcrumbs].map((item) => JSON.stringify(item));
}

export function listLeadPageRoutes() {
  return LEAD_PAGES.map((page) => page.route);
}

export function getLeadPage(routePath = '') {
  const route = String(routePath || '').replace(/^\/+/, '').replace(/\/+$/, '');
  const page = LEAD_PAGE_MAP.get(route);
  if (!page) return null;
  const canonical = canonicalForRoute(route);
  return {
    body: pageBody(page),
    metadata: {
      title: page.title,
      description: page.description,
      alternates: { canonical },
      openGraph: {
        title: page.title,
        description: page.description,
        url: canonical,
        siteName: 'BestPackFactory',
        type: 'website'
      },
      twitter: {
        card: 'summary',
        title: page.title,
        description: page.description
      }
    },
    jsonLd: pageJsonLd(page)
  };
}
