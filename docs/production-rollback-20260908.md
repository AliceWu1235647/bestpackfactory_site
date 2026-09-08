# Production rollback record — 2026-09-08

Recorded before the next GEO/SEO implementation begins.

## Primary rollback point

- Domain: `https://www.bestpackfactory.com/`
- Vercel project: `bestpackfactory-site-gmrk`
- Vercel project ID: `prj_xXGSQzpuzCiQrlGWUfMZ3h1ZvKf4`
- Vercel scope: `alicewu1235647s-projects`
- Production deployment ID: `dpl_24AnhPBiLhN7qrdtYhHDJVCKKgw2`
- Immutable deployment URL: `https://bestpackfactory-site-gmrk-c36r14cs2-alicewu1235647s-projects.vercel.app`
- Source commit used for this release: `c0d5a6f5ac11db88e9f34e81dba250ee7fd21ed5`
- Verified state: `READY`

## Secondary rollback point

- Previous production deployment ID: `dpl_CLPkwNUrZGC3bLAgHs85Bp9Z8ncQ`
- Immutable deployment URL: `https://bestpackfactory-site-gmrk-qml22aste-alicewu1235647s-projects.vercel.app`
- Source baseline: `0b06804aa1ab230912f01e32cec6c897399adfa2`
- Verified state: `READY`

## Recovery commands

```powershell
vercel rollback dpl_24AnhPBiLhN7qrdtYhHDJVCKKgw2 --yes
```

If the primary point is unsuitable:

```powershell
vercel rollback dpl_CLPkwNUrZGC3bLAgHs85Bp9Z8ncQ --yes
```

After rollback, inspect `https://www.bestpackfactory.com/` and confirm the active deployment ID before making further changes.
