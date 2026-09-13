# BestPackFactory protection bootstrap

This branch is based on production commit `10d87158910db81c62baac28c3275437d7f005cd`.

The rollback anchors are:

- Git tag: `rollback/pre-protection-bootstrap-20260914`
- Vercel deployment: `dpl_9id5CtRZ7RQzYS6oNGpeNxTSPUr1`

The guard is intentionally read-only. It records and checks existing content, assets, protected runtime files, locale page counts, sitemap URLs, and sitemap `lastmod` values. It does not participate in application runtime.

Cloudflare account identity is verified, but no R2 buckets currently exist in the account. Repository content remains the pinned content source. R2 publishing must remain disabled until a bucket and immutable release/index workflow are explicitly configured and baselined.

Run `npm run guard:site` before and after every change. Any missing or changed protected file, reduced locale count, missing sitemap URL, or changed historical `lastmod` fails closed.
