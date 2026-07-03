# R2 Product Publishing Workflow

1. Create product JSON using `r2-seed/products/sample-new-luxury-gift-box.json` as the template.
2. Upload it to Cloudflare R2 under `products/{slug}.json`.
3. Optional: update `products/index.json` in R2 for your own product management list.
4. Call the revalidation endpoint:

```bash
curl "https://bestpackfactory.com/api/revalidate?secret=YOUR_SECRET&path=/products/{slug}.html&productSlug={slug}"
```

5. Visit `/products/{slug}.html` to check the page.
6. Submit the new URL to Google Search Console if needed.

Existing static product URLs remain unchanged. This is the key reason old product ranking signals should not be affected by new product publishing.
