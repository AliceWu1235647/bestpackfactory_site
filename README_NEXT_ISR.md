# BestPackFactory Next.js ISR Package

This package keeps the current BestPackFactory visual HTML/CSS layout while wrapping the site in a Next.js App Router project with real ISR support.

## What is preserved
- Existing URLs such as `/products.html` and `/products/coffee-bags.html`
- Existing homepage, product listing and product detail layout
- Existing assets, CSS and JavaScript
- `robots.txt`, `sitemap.xml`, `llms.txt`, `ai-index.json`

## ISR behavior
- `app/page.js` serves the homepage with `revalidate = 3600`.
- `app/[...path]/page.js` serves all existing `.html` URLs through a dynamic catch-all route with:
  - `dynamic = 'force-static'`
  - `dynamicParams = true`
  - `revalidate = 3600`
- New content can be generated on first request and then cached/revalidated by Vercel.

## On-demand revalidation
Set this environment variable in Vercel:

```bash
REVALIDATE_SECRET=your-long-secret-string
```

Then call one of these after adding or editing one page:

```bash
curl "https://your-domain.com/api/revalidate?secret=your-long-secret-string&path=/products/new-product.html"
```

or:

```bash
curl -X POST "https://your-domain.com/api/revalidate" \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-long-secret-string","path":"/products/new-product.html"}'
```

## Add a new product without changing old product URLs
1. Add the new HTML file to `content-site/products/new-product.html`.
2. Add images to `public/assets/products/`.
3. Update `public/sitemap.xml`, `public/ai-index.json` and `public/llms.txt`.
4. Deploy to Vercel.
5. Call `/api/revalidate` for only the new path.

## Important note
This package is no longer a pure static-export package. It is a Next.js server-rendered ISR project intended for Vercel deployment.
