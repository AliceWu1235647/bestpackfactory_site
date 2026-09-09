# Production rollback record — indexing fix — 2026-09-09

## Pre-deployment rollback point

- Domain: `https://www.bestpackfactory.com/`
- Vercel project: `bestpackfactory-site-gmrk`
- Vercel project ID: `prj_xXGSQzpuzCiQrlGWUfMZ3h1ZvKf4`
- Vercel scope: `alicewu1235647s-projects`
- Production deployment before this change: `dpl_697sH4yrqYGSiRdrUYATWnRJhZ7P`
- Previous source Preview: `dpl_9FZD1mCmqXj9peXZqTNUi79L7Ec8`
- GitHub repository: `AliceWu1235647/bestpackfactory_site`
- GitHub production branch: `restored-correct-20260904`
- Source commit before this change: `f3e0b2500d6bc0d74a0273a208e5bc0326ba59de`

If rollback is required, re-promote `dpl_697sH4yrqYGSiRdrUYATWnRJhZ7P` in the same Vercel project. This record identifies the exact production artifact that preceded the indexing fix.

## Release gate

- Build and link checks must pass.
- The sitemap audit must report no submitted redirect, 404, noindex, missing canonical, or canonical mismatch.
- Protected components must produce 62/62 exact matches against commit `f3e0b25` at 390 px and 1440 px.
- A Preview must be verified before production promotion.

