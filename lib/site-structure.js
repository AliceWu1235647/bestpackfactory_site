const CANONICAL_SITE_URL = 'https://www.bestpackfactory.com';

const SITE_URL = CANONICAL_SITE_URL;

export const HYBRID_SITE_STRUCTURE = {
  site: 'BestPackFactory',
  version: '2026-07-04-v2-static-first-dynamic-backend-isr',
  mode: 'static-first hybrid: Next.js SSG + ISR + optional Cloudflare R2/CMS data source + dynamic API layer',
  standardMoq: '500 PCS',
  summary: 'Google-facing pages are static/ISR cached; management data can live in R2/CMS; product, blog and news pages can regenerate one URL at a time without breaking existing URLs.',
  urlPolicy: {
    preserveExistingUrls: true,
    canonicalProductPattern: '/products/{slug}.html',
    canonicalBlogPattern: '/blog/{slug}.html',
    canonicalNewsPattern: '/news/{slug}.html',
    cleanUrlCompatiblePatterns: ['/products/{slug}/', '/blog/{slug}/', '/news/{slug}/'],
    noOldUrlRewriteRequired: true,
    recommendation: 'Keep old .html URLs for current SEO value. New clean URLs can be introduced later with 301 redirects only after Search Console is stable.'
  },
  layers: {
    staticSeoLayer: [
      '/', '/products.html', '/industries.html', '/materials.html', '/finishes.html', '/factory.html',
      '/about.html', '/contact.html', '/blog.html', '/news.html', '/whitepapers.html'
    ],
    staticProductCategoryHubs: [
      '/products/custom-packaging-boxes.html', '/products/custom-rigid-boxes.html', '/products/custom-folding-cartons.html',
      '/products/custom-paper-bags.html', '/products/custom-stand-up-pouches.html', '/products/custom-flat-bottom-pouches.html',
      '/products/custom-spout-pouches.html', '/products/custom-coffee-bags.html', '/products/custom-food-packaging.html',
      '/products/custom-cosmetic-packaging.html', '/products/custom-pharmaceutical-packaging.html', '/products/custom-cannabis-packaging.html',
      '/products/custom-labels-stickers.html', '/products/custom-tissue-paper.html', '/products/custom-ribbon.html'
    ],
    staticIndustryHubs: [
      '/industries/food-packaging.html', '/industries/coffee-packaging.html', '/industries/pet-food-packaging.html',
      '/industries/cosmetic-packaging.html', '/industries/pharmaceutical-packaging.html', '/industries/cannabis-packaging.html',
      '/industries/gift-packaging.html', '/industries/apparel-packaging.html'
    ],
    staticMaterialHubs: [
      '/materials/kraft-paper-packaging.html', '/materials/white-cardboard-packaging.html', '/materials/corrugated-packaging.html',
      '/materials/pet-pe-aluminum-film.html', '/materials/recyclable-packaging.html', '/materials/compostable-packaging.html'
    ],
    staticFinishHubs: [
      '/finishes/foil-stamping-packaging.html', '/finishes/spot-uv-packaging.html', '/finishes/embossing-packaging.html',
      '/finishes/matte-lamination-packaging.html', '/finishes/soft-touch-packaging.html'
    ],
    staticFactoryTrustLayer: [
      '/factory.html', '/factory/about-us.html', '/factory/production-workshop.html', '/factory/quality-control.html', '/factory/exhibition.html', '/factory/certificates.html'
    ],
    detailIsrLayer: [
      '/products/{slug}.html', '/blog/{slug}.html', '/news/{slug}.html'
    ],
    dynamicApiLayer: [
      '/api/products-search', '/api/site-search', '/api/rfq', '/api/revalidate', '/api/r2-health',
      '/r2-products-sitemap.xml', '/r2-blog-sitemap.xml', '/r2-news-sitemap.xml', '/sitemap-index.xml', '/site-structure.json'
    ],
    staticAssetsLayer: [
      '/assets/hero/', '/assets/products/', '/assets/factory/', '/assets/logo/', '/css/', '/js/'
    ]
  },
  contentSources: {
    fallbackStaticHtml: 'content-site/**/*.html',
    publicAssets: 'public/assets/**',
    localR2SeedExamples: 'r2-seed/{products,blog,news}/**/*.json',
    optionalLiveR2: {
      baseUrlEnv: 'R2_PUBLIC_BASE_URL',
      products: 'products/{slug}.json + products/index.json',
      blog: 'blog/{slug}.json + blog/index.json',
      news: 'news/{slug}.json + news/index.json'
    },
    optionalRfQWebhook: 'RFQ_WEBHOOK_URL or CONTACT_WEBHOOK_URL'
  },
  seoHubs: {
    products: '/products.html',
    industries: '/industries.html',
    materials: '/materials.html',
    finishes: '/finishes.html',
    factoryTrust: '/factory.html',
    blog: '/blog.html',
    news: '/news.html'
  },
  recommendedGoogleSubmission: [
    `${SITE_URL}/sitemap-index.xml`,
    `${SITE_URL}/sitemap.xml`,
    `${SITE_URL}/r2-products-sitemap.xml`,
    `${SITE_URL}/r2-blog-sitemap.xml`,
    `${SITE_URL}/r2-news-sitemap.xml`
  ]
};

export function siteUrl() { return SITE_URL; }
