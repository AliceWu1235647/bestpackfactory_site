# Production rollback record — 2026-09-09 trust and schema fixes

Recorded before creating or promoting a new deployment.

- Vercel project: `bestpackfactory-site-gmrk`
- Vercel project ID: `prj_xXGSQzpuzCiQrlGWUfMZ3h1ZvKf4`
- Account/team: `alicewu1235647` / `team_imNQTfSTG7UsB1hYxcv1bok0`
- Production deployment ID: `dpl_J3w2u7vXpDM3pyX77Tz3LcJWDWMu`
- Production deployment URL: `bestpackfactory-site-gmrk-bj9lykkdu-alicewu1235647s-projects.vercel.app`
- Production aliases: `www.bestpackfactory.com`, `bestpackfactory.com`
- Source commit: `3e8e5330d40d9f3c541ea2c76bc8300ed72f93d2`
- GitHub branch: `restored-correct-20260904`
- Local branch: `codex/indexing-fix-20260909`

## Recovery procedure

If the new release must be reversed, promote deployment `dpl_J3w2u7vXpDM3pyX77Tz3LcJWDWMu` from the Vercel dashboard or with the Vercel CLI while linked to the project above. Verify both production aliases, then test the homepage, one product page, Arabic RTL, the quote form and the WhatsApp button.

This record contains no login credentials or secrets.
