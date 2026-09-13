import fs from 'node:fs';
import path from 'node:path';
import {
  absolutePath,
  extractAttributes,
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

async function runPool(items, worker) {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length || 1) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      await worker(item);
    }
  });
  await Promise.all(runners);
}

const pageEntries = Object.entries(baseline.pages);
await runPool(pageEntries, async ([file, expected]) => {
  const pathname = new URL(expected.publicUrl).pathname;
  const url = `${baseUrl}${pathname}`;
  try {
    const response = await request(url);
    const body = await response.text();
    const metadata = htmlMetadata(body);
    const expectedCanonical = expected.canonical || expected.publicUrl;
    const record = { file, url, status: response.status, canonical: metadata.canonical };
    results.pages.push(record);
    if (response.status !== 200) failures.push(`Page ${pathname} returned ${response.status}`);
    if (metadata.canonical !== expectedCanonical) {
      failures.push(`Canonical mismatch at ${pathname}: expected ${expectedCanonical}, got ${metadata.canonical || '(missing)'}`);
    }
    for (const alternate of expected.hreflang || []) {
      const found = metadata.hreflang.some(item => item.code === alternate.code && item.href === alternate.href);
      if (!found) failures.push(`Missing hreflang ${alternate.code} at ${pathname}`);
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
await runPool(assetEntries, async ([file, expected]) => {
  const pathname = `/${file.replace(/^public\//, '')}`;
  try {
    const response = await request(`${baseUrl}${pathname}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const hash = sha256Buffer(buffer);
    const contentType = response.headers.get('content-type') || '';
    results.assets.push({ file, status: response.status, bytes: buffer.length, contentType });
    if (response.status !== 200) failures.push(`Asset ${pathname} returned ${response.status}`);
    if (!contentType.toLowerCase().startsWith('image/')) failures.push(`Asset ${pathname} has non-image type ${contentType || '(missing)'}`);
    if (buffer.length !== expected.bytes) failures.push(`Asset byte size changed ${pathname}: ${expected.bytes} -> ${buffer.length}`);
    if (hash !== expected.sha256) failures.push(`Asset bytes changed ${pathname}`);
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

console.log(`Preview gate passed: ${results.pages.length} pages, ${results.assets.length} images, and R2 health are intact.`);

