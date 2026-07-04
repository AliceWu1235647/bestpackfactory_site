# ISR / Incremental Static Update Guide for BestPackFactory

This package is currently a static HTML website. Static HTML can be updated incrementally by adding a new product HTML file, image files, internal links and sitemap entries without changing existing product URLs.

For true Vercel ISR, migrate the site to Next.js and set `revalidate` on dynamic product/article pages. The current package includes Vercel CDN `stale-while-revalidate` headers and immutable asset caching to simulate fast cached delivery for static HTML while preserving existing URLs.

## Non-destructive product publishing rule

1. Do not rename existing product files.
2. Do not change existing canonical URLs.
3. Add only the new product file under `/products/`.
4. Add only the new image files under `/assets/products/`.
5. Append the new URL to `sitemap.xml` and `ai-index.json`.
6. Add the new product card to `products.html` without editing old product content.
7. Deploy to Vercel after local link check.

## Recommended future true ISR migration

Use Next.js with dynamic routes such as `app/products/[slug]/page.tsx` and `export const revalidate = 3600;` or on-demand revalidation for product pages. Keep the same public URLs to protect Google ranking signals.
