# BestPack Factory Website — Deployment Guide

This project uses Next.js 15 and is prepared for deployment on Vercel. Use Node.js 20 or newer.

## Before you begin

- Install Node.js 20+ and Git.
- Install the Vercel CLI with `npm install --global vercel` when deploying from a terminal.
- Keep `.env.local` private. Never commit SMTP passwords, API keys, access tokens, or Vercel project metadata.
- Local environment variables are not automatically copied to Vercel. Add production values in **Vercel → Project → Settings → Environment Variables**.

## Method 1: Import from GitHub into Vercel

This workspace does not currently have a GitHub remote, so a working one-click deployment URL cannot be published yet.

1. Create a private or public GitHub repository.
2. Push this project to that repository.
3. In Vercel, select **Add New → Project** and import the GitHub repository.
4. Keep the detected framework as **Next.js**. The checked-in `vercel.json` supplies the build settings.
5. Add the production environment variables described below.
6. Select **Deploy**.
7. Add `bestpackfactory.com` and `www.bestpackfactory.com` under **Settings → Domains** and apply the DNS records shown by Vercel.

After the repository exists, a one-click button can target this URL format:

```text
https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FOWNER%2FREPOSITORY
```

Replace `OWNER` and `REPOSITORY` before publishing the link.

## Method 2: Deploy from the terminal

### 1. Install dependencies

```bash
npm ci
```

The lockfile is present, so `npm ci` is preferred for repeatable deployments. On Windows PowerShell systems that block `npm.ps1`, use `npm.cmd` instead of `npm`.

### 2. Create the local environment file

macOS/Linux:

```bash
cp .env.example .env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local` with local credentials. Do not commit it.

### 3. Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

### 4. Verify a production build

```bash
npm run deploy:check
```

This regenerates the sitemap through the existing `prebuild` hook and runs `next build`. It does not deploy anything.

### 5. Link the Vercel project

Only needed for a new checkout:

```bash
vercel link
```

### 6. Check production readiness

```bash
npm run deploy:dry-run
```

This reads the names of the Vercel Production environment variables and builds the site, but never deploys. It stops when the required contact-email configuration is incomplete.

### 7. Deploy to Production

```bash
npm run deploy
```

For a clean dependency installation before deployment, use:

```bash
npm run deploy:fresh
```

The production command is non-interactive because running it is the explicit deployment confirmation. It deploys only after the environment preflight and build both pass.

## Production environment variables

### Site and revalidation

| Variable | Recommended value | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://www.bestpackfactory.com` | Canonical and public site URL |
| `SITE_URL` | `https://www.bestpackfactory.com` | Server-side contact origin allowlist |
| `REVALIDATE_SECRET` | Long random secret | Protects the revalidation endpoint |

### Contact form email

These values are required by the production deployment preflight:

| Variable | Example |
| --- | --- |
| `SMTP_HOST` | `smtp.sendgrid.net` |
| `SMTP_USER` | Literal value `apikey` |
| `SMTP_PASS` | SendGrid API key with mail-sending permission |
| `SMTP_FROM` | Sender address verified in SendGrid |

The contact recipient values are optional because the application has a safe fallback:

| Variable | Behavior when omitted |
| --- | --- |
| `CONTACT_TO_EMAIL` | Uses `lisa@colorprintingpackage.com` |
| `CONTACT_EMAIL` | Backwards-compatible alias for `CONTACT_TO_EMAIL` |

These transport settings are also recommended:

```text
SMTP_PORT=587
SMTP_SECURE=false
SMTP_REQUIRE_TLS=true
```

For SendGrid, `SMTP_USER` must remain `apikey`; it is not the API key itself. Store the real API key in `SMTP_PASS`. Because `apikey` is not an email address, `SMTP_FROM` must be a sender identity or domain address already verified in SendGrid. Never commit the API key.

### AI customer-service workbench

Vercel cannot connect to an Ollama server running at `127.0.0.1` on a developer computer. To enable hosted AI processing, configure:

```text
AI_PROVIDER=openai
OPENAI_API_KEY=<server-side API key>
OPENAI_MODEL=<supported model name>
AI_WORKBENCH_ACCESS_TOKEN=<long random operator token>
```

The access token is required to protect the production AI endpoint. Keep `OPENAI_API_KEY` server-side; never prefix it with `NEXT_PUBLIC_`.

### Cloudflare R2 content (optional)

The site works with static fallback content when R2 is unavailable. To enable live R2 content, configure the variables documented in `.env.example`, including `R2_PUBLIC_BASE_URL`, index paths, JSON prefixes, and revalidation intervals.

### Google Analytics 4 (optional)

Set the public GA4 Measurement ID to enable analytics globally through the App Router root layout:

```text
NEXT_PUBLIC_GA_ID=G-NY2MZYDQBL
```

The analytics scripts load with Next.js `afterInteractive`, so they do not block the initial HTML render. Leaving the variable empty disables Google Analytics.

## Post-deployment checks

After Vercel reports success, verify:

1. `https://bestpackfactory.com/` loads over HTTPS.
2. `https://bestpackfactory.com/sitemap.xml` and `/sitemap-index.xml` return valid XML.
3. `https://bestpackfactory.com/robots.txt` references the correct sitemap.
4. A real contact-form submission reaches `CONTACT_TO_EMAIL`.
5. The WhatsApp link opens the correct number.
6. Product, blog, and news detail pages do not return 404 errors.
7. The `www` and non-`www` hostnames resolve to the intended canonical hostname.

## Troubleshooting

### PowerShell blocks `npm.ps1`

Use the Windows executable directly:

```powershell
npm.cmd run deploy:check
npm.cmd run deploy
```

### Deployment reports missing SMTP variables

Add `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` to the **Production** environment in Vercel, then rerun `npm run deploy:dry-run`. Adding them only to `.env.local` is insufficient. The contact recipient variables are optional fallbacks.

### Build fails

Run the following locally and fix the first reported error:

```bash
npm ci
npm run generate-sitemap
npm run build
```

### Roll back a deployment

Open the Vercel project's **Deployments** page, select the last known-good deployment, and promote it to Production. Environment-variable changes may also need to be reverted separately.
