# R2 Blog / News ISR Publishing Workflow

This site supports R2-powered blog and news pages without changing old URLs.

## Why this protects old blog/news weight

Old URLs such as `/blog/coffee-bag-material-guide.html` and `/news/bestpackfactory-one-stop-strategy-design-manufacturing-logistics-model.html` remain stable. New posts can be added as new slugs in R2. Existing HTML files, title tags, descriptions, canonical URLs and internal links do not need to be changed.

## Publish a new blog post

1. Create a JSON file:

```text
blog/new-custom-gift-box-guide.json
```

2. Add it to:

```text
blog/index.json
```

3. Upload both files to Cloudflare R2.

4. Revalidate only the new post and blog sitemap:

```text
/api/revalidate?secret=YOUR_SECRET&path=/blog/new-custom-gift-box-guide.html&blogSlug=new-custom-gift-box-guide
```

## Publish a new news post

1. Create a JSON file:

```text
news/new-factory-update.json
```

2. Add it to:

```text
news/index.json
```

3. Upload both files to Cloudflare R2.

4. Revalidate only the new post and news sitemap:

```text
/api/revalidate?secret=YOUR_SECRET&path=/news/new-factory-update.html&newsSlug=new-factory-update
```

## R2 environment variables

```bash
R2_PUBLIC_BASE_URL=https://your-r2-public-domain
R2_BLOG_JSON_PREFIX=blog
R2_BLOG_INDEX_PATH=blog/index.json
R2_NEWS_JSON_PREFIX=news
R2_NEWS_INDEX_PATH=news/index.json
R2_CONTENT_REVALIDATE_SECONDS=3600
```

## Recommended content structure for AI search

Every blog/news post should include:

- Quick Answer
- Parameter table
- FAQ
- Procurement checklist
- CTA
- Internal links

This is more extractable for Google AI search, ChatGPT, Gemini, Claude and Perplexity.
