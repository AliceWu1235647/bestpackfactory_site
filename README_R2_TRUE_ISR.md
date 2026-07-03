# BestPackFactory Next.js + Cloudflare R2 True ISR Upgrade

This package keeps the existing BestPackFactory HTML/CSS website layout stable while adding a real Next.js ISR product architecture:

- Existing pages still live in `content-site/` and keep their original URLs.
- Existing product URLs continue to work, for example `/products/coffee-bags.html`.
- New products can be published from Cloudflare R2 as JSON files without adding new HTML files to GitHub.
- Product pages use dynamic routing plus `fetch(..., { next: { revalidate, tags } })`.
- On-demand ISR is available through `app/api/revalidate/route.js` using `revalidatePath()` and `revalidateTag()`.

## 1. Required Vercel Environment Variables

Set these in Vercel Project Settings → Environment Variables:

```bash
REVALIDATE_SECRET=use-a-long-random-secret
NEXT_PUBLIC_SITE_URL=https://bestpackfactory.com
```

To enable Cloudflare R2 product JSON as the live product data source, also set:

```bash
R2_PUBLIC_BASE_URL=https://your-r2-public-domain.example.com
R2_PRODUCT_JSON_PREFIX=products
R2_PRODUCT_INDEX_PATH=products/index.json
R2_PRODUCT_REVALIDATE_SECONDS=3600
```

`R2_PUBLIC_BASE_URL` can be a public R2 URL or a custom domain connected to your R2 bucket.

## 2. Product JSON Path Convention

If your product slug is:

```text
sample-new-luxury-gift-box
```

Upload the product JSON file to R2 here:

```text
products/sample-new-luxury-gift-box.json
```

The product page will be available at:

```text
/products/sample-new-luxury-gift-box.html
```

## 3. Product JSON Schema

Use the sample file:

```text
r2-seed/products/sample-new-luxury-gift-box.json
```

Important fields:

```json
{
  "slug": "sample-new-luxury-gift-box",
  "title": "Sample New Luxury Gift Box",
  "seoTitle": "Sample New Luxury Gift Box | Magnetic Rigid Box Supplier",
  "metaDescription": "SEO description here.",
  "description": "Buyer-friendly product summary.",
  "quickAnswer": "Short AI-friendly answer.",
  "keywords": ["custom gift boxes", "magnetic rigid box"],
  "images": ["/assets/products/luxury-magnetic-boxes-01.webp"],
  "specs": {
    "Box type": "Magnetic rigid box",
    "MOQ": "500 PCS"
  },
  "procurementChecklist": ["Confirm product size", "Approve dieline"],
  "faq": [
    {"question": "Can this be revalidated alone?", "answer": "Yes."}
  ]
}
```

You can also provide full HTML inside the `html` field. If `html` exists, the system renders that HTML body and metadata.

## 4. On-Demand ISR Revalidation

After uploading or updating a product JSON file in R2, call:

```bash
curl "https://your-domain.com/api/revalidate?secret=YOUR_SECRET&path=/products/sample-new-luxury-gift-box.html&productSlug=sample-new-luxury-gift-box"
```

Or POST:

```bash
curl -X POST "https://your-domain.com/api/revalidate" \
  -H "Content-Type: application/json" \
  -d '{
    "secret":"YOUR_SECRET",
    "path":"/products/sample-new-luxury-gift-box.html",
    "productSlug":"sample-new-luxury-gift-box"
  }'
```

This calls both:

- `revalidatePath('/products/sample-new-luxury-gift-box.html')`
- `revalidateTag('product:sample-new-luxury-gift-box')`
- `revalidateTag('products')`

## 5. Health Check

After deployment, open:

```text
/api/r2-health
```

This checks whether R2 is configured and whether the product index JSON can be fetched.

## 6. Safe Rollback

If the Next.js + R2 ISR version has any visual or deployment issue, use the included backup package:

```text
Backup_BestPackFactory_NextJS_True_ISR_Revalidate_Package.zip
```

The previous SEO/GEO package backup is also preserved separately in the conversation.



## Dynamic R2 product search upgrade

This package includes `/api/products-search`.

The homepage and products page search boxes now load search data from:

```text
/api/products-search
```

That endpoint merges existing stable static products with Cloudflare R2:

```text
${R2_PUBLIC_BASE_URL}/products/index.json
```

When you upload a new R2 product and add it to `products/index.json`, it can appear in the homepage search suggestions and products page search without editing the old product pages.

Recommended revalidate call after uploading a new product:

```bash
curl "https://bestpackfactory.com/api/revalidate?secret=$REVALIDATE_SECRET&path=/products/new-product.html&productSlug=new-product"
```

This refreshes:
- `/products/new-product.html`
- `/api/products-search`
- `/r2-products-sitemap.xml`
- `product:{slug}` tag
- `products:index` tag
- `products-search` tag

Search aliases are built in for buyer terms including:
`box`, `pouch`, `rigid box`, `mailer box`, `corrugated mailer box`, `cardstock`, `magnetic packaging`, `magnetic rigid box`, `sliding drawer box`, `cylinder tube packaging`, `paper gift bag`, `food packaging box`, and `foam insert`.
