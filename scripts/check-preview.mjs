import fs from 'node:fs';
import {
  absolutePath,
  fail,
  htmlMetadata,
  parseArgs,
  readJson,
  sha256Buffer,
  writeJson,
} from './guard-lib.mjs';

const args = parseArgs();
const identity = readJson('guardrails/site-identity.json');
const baseline = readJson('guardrails/site-baseline.json');
const rawBase = args.get('url');
const concurrency = Math.max(1, Math.min(24, Number(args.get('concurrency', '8')) || 8));
const retries = Math.max(1, Math.min(5, Number(args.get('retries', '2')) || 2));
const scope = args.get('scope', 'all');
const assetMode = args.get('asset-mode', 'hash');
if (!['all', 'pages', 'assets'].includes(scope)) fail(`Invalid --scope: ${scope}`);
if (!['hash', 'head'].includes(assetMode)) fail(`Invalid --asset-mode: ${assetMode}`);
if (!rawBase) fail('Usage: node scripts/check-preview.mjs --url https://deployment.vercel.app');

let base;
try { base = new URL(rawBase); }
catch { fail(`Invalid preview URL: ${rawBase}`); }
if (base.protocol !== 'https:') fail('Preview URL must use HTTPS.');
if (base.hostname !== new URL(identity.siteUrl).hostname && !base.hostname.endsWith('.vercel.app')) {
  fail(`Preview host is not approved: ${base.hostname}`);
}
base.pathname = '';
base.search = '';
base.hash = '';
const baseUrl = base.toString().replace(/\/$/, '');

const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '';
const headers = bypassSecret ? {
  'x-vercel-protection-bypass': bypassSecret,
  'x-vercel-set-bypass-cookie': 'true',
} : {};
const failures = [];
const results = { pages: [], assets: [], endpoints: [], r2: null };

function portableResponseBuffer(file, buffer) {
  if (!file.toLowerCase().endsWith('.svg')) return buffer;
  return Buffer.from(buffer.toString('utf8').replace(/\r\n?/g, '\n'), 'utf8');
}

async function request(url, options = {}) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...(options.headers || {}) },
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (response.status >= 500 && attempt < retries) continue;
      return response;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (attempt < retries) continue;
    }
  }
  throw lastError || new Error('request failed');
}

if (base.hostname.endsWith('.vercel.app')) {
  try {
    const accessProbe = await request(`${baseUrl}/`);
    const finalUrl = new URL(accessProbe.url);
    if (finalUrl.hostname === 'vercel.com' && finalUrl.pathname.startsWith('/login')) {
      fail('Preview access is protected. Configure a dedicated Vercel automation bypass or trusted GitHub OIDC source; public access must not be enabled just to satisfy CI.');
    }
  } catch (error) {
    fail(`Preview access probe failed: ${error.message}`);
  }
}

async function runPool(label, items, worker) {
  let cursor = 0;
  let completed = 0;
  console.log(`Checking ${items.length} ${label} with concurrency ${concurrency}...`);
  const runners = Array.from({ length: Math.min(concurrency, items.length || 1) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      await worker(item);
      completed++;
      if (completed % 50 === 0 || completed === items.length) {
        console.log(`${label}: ${completed}/${items.length}`);
      }
    }
  });
  await Promise.all(runners);
}

const pageEntries = Object.entries(baseline.pages);
if (scope !== 'assets') await runPool('pages', pageEntries, async ([file, expected]) => {
  const pathname = new URL(expected.publicUrl).pathname;
  const url = `${baseUrl}${pathname}`;
  try {
    const response = await request(url);
    const body = await response.text();
    const metadata = htmlMetadata(body);
    const expectedCanonical = expected.expectedCanonical || expected.canonical || expected.publicUrl;
    const record = { file, url, status: response.status, canonical: metadata.canonical };
    results.pages.push(record);
    if (response.status !== 200) failures.push(`Page ${pathname} returned ${response.status}`);
    if (metadata.canonical !== expectedCanonical) {
      failures.push(`Canonical mismatch at ${pathname}: expected ${expectedCanonical}, got ${metadata.canonical || '(missing)'}`);
    }
    const expectedHreflang = expected.expectedHreflang || expected.hreflang || [];
    for (const alternate of expectedHreflang) {
      const found = metadata.hreflang.some(item => item.code === alternate.code && item.href === alternate.href);
      if (!found) failures.push(`Missing hreflang ${alternate.code} at ${pathname}`);
    }
    const expectedAlternates = new Set(expectedHreflang.map(item => `${item.code}\u0000${item.href}`));
    for (const alternate of metadata.hreflang) {
      if (!expectedAlternates.has(`${alternate.code}\u0000${alternate.href}`)) {
        failures.push(`Unexpected hreflang ${alternate.code} at ${pathname}: ${alternate.href}`);
      }
    }
    for (const marker of ['products-grid-fixed', 'locale-switcher']) {
      const expectedCount = (fs.readFileSync(absolutePath(file), 'utf8').match(new RegExp(marker, 'g')) || []).length;
      if (expectedCount > 0 && !body.includes(marker)) failures.push(`Protected marker ${marker} missing at ${pathname}`);
    }
  } catch (error) {
    failures.push(`Page request failed ${pathname}: ${error.message}`);
  }
});

const assetEntries = Object.entries(baseline.assets);
if (scope !== 'pages') await runPool('assets', assetEntries, async ([file, expected]) => {
  const pathname = `/${file.replace(/^public\//, '')}`;
  try {
    const response = await request(`${baseUrl}${pathname}`, { method: assetMode === 'head' ? 'HEAD' : 'GET' });
    const responseBuffer = assetMode === 'hash' ? Buffer.from(await response.arrayBuffer()) : null;
    const buffer = responseBuffer ? portableResponseBuffer(file, responseBuffer) : null;
    const reportedBytes = Number(response.headers.get('content-length') || 0);
    const bytes = buffer?.length ?? reportedBytes;
    const hash = buffer ? sha256Buffer(buffer) : null;
    const contentType = response.headers.get('content-type') || '';
    results.assets.push({ file, status: response.status, bytes, contentType, mode: assetMode });
    if (response.status !== 200) failures.push(`Asset ${pathname} returned ${response.status}`);
    if (!contentType.toLowerCase().startsWith('image/')) failures.push(`Asset ${pathname} has non-image type ${contentType || '(missing)'}`);
    // HEAD cannot normalize text line endings. SVG byte identity is enforced in
    // the full hash gate; HEAD mode still verifies its status and media type.
    if (!(assetMode === 'head' && file.toLowerCase().endsWith('.svg')) && bytes !== expected.bytes) {
      failures.push(`Asset byte size changed ${pathname}: ${expected.bytes} -> ${bytes || '(missing)'}`);
    }
    if (assetMode === 'hash' && hash !== expected.sha256) failures.push(`Asset bytes changed ${pathname}`);
  } catch (error) {
    failures.push(`Asset request failed ${pathname}: ${error.message}`);
  }
});

for (const endpoint of ['/robots.txt', '/sitemap-index.xml', '/llms.txt']) {
  try {
    const response = await request(`${baseUrl}${endpoint}`);
    results.endpoints.push({ endpoint, status: response.status });
    if (response.status !== 200) failures.push(`${endpoint} returned ${response.status}`);
  } catch (error) {
    failures.push(`${endpoint} request failed: ${error.message}`);
  }
}

try {
  const response = await request(`${baseUrl}${identity.production.r2HealthPath}`, { headers: { accept: 'application/json' } });
  const health = await response.json();
  results.r2 = { status: response.status, health };
  if (response.status !== 200 || health?.ok !== true) failures.push('R2 health is not green.');
  for (const key of identity.production.requiredR2Indexes) {
    if (!health?.[key]?.hasIndex) failures.push(`R2 ${key} index is unavailable.`);
  }
} catch (error) {
  failures.push(`R2 health request failed: ${error.message}`);
}

results.pages.sort((a, b) => a.url.localeCompare(b.url));
results.assets.sort((a, b) => a.file.localeCompare(b.file));
const report = {
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  baseUrl,
  baselineCommit: baseline.generatedFromCommit,
  totals: {
    pages: results.pages.length,
    assets: results.assets.length,
    failures: failures.length,
  },
  failures,
  ...results,
};
writeJson('artifacts/guardrails/preview-report.json', report);

if (failures.length) {
  for (const message of failures.slice(0, 100)) console.error(`FAIL: ${message}`);
  if (failures.length > 100) console.error(`...and ${failures.length - 100} more failures.`);
  fail(`Preview gate failed with ${failures.length} violation(s).`);
}

console.log(`Preview gate passed: ${results.pages.length} pages, ${results.assets.length} images (${assetMode}), and R2 health are intact.`);

