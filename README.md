# BestPack Factory Website

BestPack Factory's production website is a Next.js 15 App Router project for custom packaging products, buyer resources, blogs, news, RFQs, contact-email delivery, structured data, search feeds, and static-first Cloudflare R2 content.

## Project structure

```text
bestpackfactory-site/
├── app/
│   ├── layout.js                     # Global document shell and WhatsApp widget
│   ├── page.js                       # Homepage
│   ├── WhatsAppWidget.js             # Global WhatsApp contact widget
│   ├── ContactForm.js                # Contact/RFQ form client component
│   ├── BlogIndex.js                  # Packaging blog index UI
│   ├── [...path]/page.js             # Static HTML-backed routes
│   ├── products/[slug]/page.js       # Product detail route
│   ├── blog/[slug]/page.js           # Blog detail route
│   ├── news/[slug]/page.js           # News detail route
│   ├── contact.html/page.js          # Contact page
│   ├── api/
│   │   ├── contact/route.js          # SMTP contact-form endpoint
│   │   ├── rfq/route.js              # RFQ endpoint and fallback links
│   │   ├── revalidate/route.js       # Protected ISR revalidation
│   │   ├── products-search/route.js  # Product search API
│   │   ├── site-search/route.js      # Site search API
│   │   └── ai/customer-message/      # Protected AI workbench endpoint
│   ├── sitemap-index.xml/route.js    # Sitemap index
│   ├── r2-products-sitemap.xml/      # Product sitemap route
│   ├── r2-blog-sitemap.xml/          # Blog sitemap route
│   ├── r2-news-sitemap.xml/          # News sitemap route
│   ├── image-sitemap.xml/            # Image sitemap route
│   └── feed.xml/                     # Content feed
├── lib/                              # Product, content, R2, search and AI services
├── content-site/                     # Static-first HTML content and JSON-LD
│   ├── products/                     # Product source pages
│   ├── blog/                         # Blog source pages
│   └── news/                         # News source pages
├── public/
│   ├── assets/                       # Optimized product, factory and hero images
│   ├── css/                          # Shared static-page styles
│   ├── js/                           # Shared static-page scripts
│   ├── robots.txt                    # Search and AI crawler rules
│   └── sitemap.xml                   # Generated canonical static sitemap
├── scripts/
│   ├── generate-sitemap.mjs          # Sitemap generator
│   ├── deploy.mjs                    # Cross-platform deployment helper
│   └── ...                           # Content, SEO and validation utilities
├── docs/                             # Internal implementation notes
├── chrome-extension/                 # AI inbox browser extension
├── .env.example                     # Environment-variable template
├── .gitignore                       # Credential/build-output protection
├── deploy.sh                        # Bash wrapper for deploy.mjs
├── next.config.mjs                  # Next.js configuration
├── vercel.json                      # Vercel build, region and header settings
├── package.json                     # Dependencies and commands
└── DEPLOYMENT.md                    # Complete deployment guide
```

## Mapping from the legacy Pages Router layout

The earlier project outline used the Next.js `pages/` directory. The current implementation uses App Router equivalents:

| Legacy path | Current implementation |
| --- | --- |
| `components/WhatsAppWidget.js` | `app/WhatsAppWidget.js` |
| `components/ContactForm.js` | `app/ContactForm.js` |
| `components/Schema/OrganizationSchema.js` | JSON-LD extracted from `content-site/` and rendered by App Router pages |
| `pages/index.js` | `app/page.js` |
| `pages/products/*.js` | `app/products/[slug]/page.js` plus `content-site/products/*.html` |
| `pages/blog/index.js` | `app/BlogIndex.js` through the static route layer |
| `pages/blog/[slug].js` | `app/blog/[slug]/page.js` |
| `pages/api/contact.js` | `app/api/contact/route.js` |
| `pages/api/sitemap.js` | Generated `public/sitemap.xml` plus App Router sitemap routes |
| `pages/api/robots.js` | `public/robots.txt` |
| `scripts/generate-sitemap.js` | `scripts/generate-sitemap.mjs` |
| `next.config.js` | `next.config.mjs` |

Do not add a second `pages/` implementation for these routes. Keeping one routing system prevents duplicate URLs, conflicting API handlers, and divergent SEO metadata.

## Local development

Requirements: Node.js 20 or newer.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` and `npm.cmd` if script execution policy blocks `npm.ps1`.

## Verification

```bash
npm run lint:links
npm run check:r2-content
npm run check:hybrid
npm run deploy:check
```

`deploy:check` regenerates the main sitemap through `prebuild` and creates a production build without publishing it.

## Deployment

Read [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel setup, required SMTP variables, AI configuration, production preflight, domain setup, verification, and rollback.

After Vercel Production environment variables are configured:

```bash
npm run deploy:dry-run
npm run deploy
```

Never commit `.env.local`, SMTP credentials, access tokens, or API keys.
