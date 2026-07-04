# R2 Dynamic Product Search Upgrade

This package upgrades the homepage and products page search boxes so they can search both:

1. Existing stable static products already inside the site package.
2. New products uploaded to Cloudflare R2 through `products/index.json`.

## New search endpoint

The frontend search calls:

```text
/api/products-search
```

The endpoint merges:

```text
content-site/products.html
+
R2_PUBLIC_BASE_URL / R2_PRODUCT_INDEX_PATH
```

Default R2 index path:

```text
products/index.json
```

## R2 `products/index.json` format

Use either:

```json
{
  "updatedAt": "2026-07-03T00:00:00.000Z",
  "products": [
    {
      "slug": "new-magnetic-rigid-box",
      "title": "New Magnetic Rigid Box",
      "description": "Custom magnetic packaging with foam insert.",
      "url": "/products/new-magnetic-rigid-box.html",
      "image": "/assets/products/custom-boxes-01.jpg",
      "keywords": ["magnetic packaging", "rigid box", "custom gift boxes", "foam insert"]
    }
  ]
}
```

or a direct array of product objects.

## Recommended R2 product publishing flow

1. Upload the product JSON:

```text
products/new-magnetic-rigid-box.json
```

2. Add the product summary to:

```text
products/index.json
```

3. Trigger on-demand ISR:

```text
/api/revalidate?secret=YOUR_SECRET&path=/products/new-magnetic-rigid-box.html&productSlug=new-magnetic-rigid-box
```

This also refreshes:

```text
/api/products-search
/r2-products-sitemap.xml
products-search tag
products:index tag
product:{slug} tag
```

## Keyword support

The browser search expands buyer keywords such as:

- box
- pouch
- rigid box
- mailer box
- corrugated mailer box
- cardstock
- cardstock product boxes
- magnetic packaging
- magnetic rigid box
- sliding drawer box
- cylinder tube packaging
- paper gift bag
- food packaging box
- foam insert

## Important

This upgrade does not change the homepage layout, mobile homepage layout, product page grid layout, or existing product image paths.
