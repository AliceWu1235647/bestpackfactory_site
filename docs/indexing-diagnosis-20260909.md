# Google indexing diagnosis — 2026-09-09

## Scope and evidence limits

This diagnosis responds to the Google Search Console coverage summary supplied by the site owner. The screenshot reports aggregate counts, but no example URLs were available through an authenticated Search Console export in this environment. The repository, generated output, live production responses, sitemap files, canonicals, redirects, robots directives, internal links, and local production build were inspected directly. The report does not guess which historical URLs make up a Search Console bucket.

## What the Search Console categories mean here

- **Page with redirect (42):** not automatically an error. Redirecting URLs are normally excluded from indexing. Two redirect aliases were still being submitted by current sitemaps and linked internally, so those current signals were corrected. The remainder may be historical or legitimate redirects and must be checked from Search Console examples.
- **Not found (404) (24):** the current sitemap audit found no 404 URL. These are therefore not assumed to be current sitemap defects. They may be old, removed, malformed, or externally linked URLs. Exact Search Console samples are required before any redirect is created.
- **Duplicate, Google chose different canonical (5):** the current sitemap audit found no canonical mismatch. Exact Search Console samples are required to distinguish a historical result, a legitimate duplicate, or a real canonical problem.
- **Alternate page with proper canonical (5):** normally an expected exclusion when the alternate correctly points to the canonical page.
- **Crawled — currently not indexed (62) / Discovered — currently not indexed (72):** these are Google selection states, not a promise that every URL will be indexed. The fixes below reduce avoidable crawl noise and false freshness. Page quality and distinct buyer value still determine whether Google selects a page.

## Verified root causes corrected

1. `/products/custom-food-packaging.html` permanently redirects to `/products/food-packaging.html`, but the alias was still present in current product/image sitemap output and a current internal link.
2. `/products/custom-paper-bags.html` permanently redirects to `/products/paper-bags.html`, but the alias was still present in current product/image sitemap output and a current internal link.
3. `ai-sitemap.xml` listed machine-readable JSON, TXT, RSS, and XML resources and was included in the Google-facing sitemap index. The resources are useful for machine discovery but are not HTML landing pages intended for Google Search results.
4. The sitemap generator assigned the build date as `lastmod` to all dieline routes on every build, even when their content had not changed. This created artificial freshness churn.

## Changes implemented

- Exclude the two redirect aliases from product and image sitemap output.
- Point current internal links and machine-readable site maps at the final canonical URLs.
- Keep `ai-sitemap.xml` and machine resources public and crawlable, but remove the AI sitemap from the Google-facing sitemap index.
- Add `X-Robots-Tag: noindex, follow` to machine-readable resources so they can be crawled without competing as Search result pages.
- Stop emitting an invented daily `lastmod` for dieline routes; omit the optional field when no verified modification date exists.
- Add `npm run audit:indexability-online` to recursively test every unique URL submitted by the sitemap index.

## Verification before deployment

- Full production build: **passed**, 729 generated pages.
- Internal link check: **0 errors**.
- Local sitemap audit: **715 unique URLs; 715 HTTP 200; 0 redirects; 0 404s; 0 other HTTP errors; 0 noindex pages; 0 missing canonicals; 0 canonical mismatches**.
- AI discoverability audit: **passed**; all 103 products remain in the AI index and the relevant bots remain allowed.
- Protected visual comparison at 390 px and 1440 px: **62/62 exact pixel matches**.
- Arabic validation: `lang="ar"` and `dir="rtl"` remain intact.

## Post-deployment Search Console actions

1. Submit or refresh only `https://www.bestpackfactory.com/sitemap-index.xml`.
2. Start **Validate fix** for the redirect and 404 categories after production verification.
3. Export the example URLs from the 404, canonical, crawled-not-indexed, and discovered-not-indexed reports if counts persist. Diagnose each example before adding any redirect or changing content.
4. Expect coverage counts to change only after Google recrawls and reprocesses URLs; deployment does not clear historical Search Console records immediately.

