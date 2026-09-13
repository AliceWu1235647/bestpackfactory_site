import fs from 'node:fs';
import path from 'node:path';
import {
  absolutePath,
  fail,
  git,
  htmlMetadata,
  parseSitemap,
  readJson,
  relativePath,
  sha256File,
  walkFiles,
} from './guard-lib.mjs';

const identity = readJson('guardrails/site-identity.json');
const baseline = readJson('guardrails/site-baseline.json');
const failures = [];
const imagePattern = /\.(?:avif|gif|jpe?g|png|svg|webp)$/i;

function verifyEntries(label, entries) {
  for (const [relative, expected] of Object.entries(entries)) {
    const absolute = absolutePath(relative);
    if (!fs.existsSync(absolute)) {
      failures.push(`${label} missing: ${relative}`);
      continue;
    }
    const actualHash = sha256File(absolute);
    if (actualHash !== expected.sha256) failures.push(`${label} changed: ${relative}`);
  }
}

try {
  git(['merge-base', '--is-ancestor', baseline.generatedFromCommit, 'HEAD']);
} catch {
  failures.push(`HEAD does not descend from baseline commit ${baseline.generatedFromCommit}`);
}

if (baseline.identity.repositoryId !== identity.git.repositoryId) failures.push('Baseline repository ID does not match site identity.');
if (baseline.identity.vercelProjectId !== identity.vercel.projectId) failures.push('Baseline Vercel project ID does not match site identity.');

verifyEntries('Protected layout', baseline.layoutFiles);
verifyEntries('Existing page', baseline.pages);
verifyEntries('Existing public asset', baseline.assets);

const currentHtml = walkFiles(absolutePath(identity.protection.protectedContentRoot), file => file.endsWith('.html'));
const currentAssets = walkFiles(absolutePath(identity.protection.protectedAssetRoot), file => imagePattern.test(file));
if (currentHtml.length < baseline.counts.htmlPages) failures.push(`HTML page count decreased: ${currentHtml.length} < ${baseline.counts.htmlPages}`);
if (currentAssets.length < baseline.counts.protectedAssets) failures.push(`Public image count decreased: ${currentAssets.length} < ${baseline.counts.protectedAssets}`);

for (const locale of identity.protection.locales) {
  const localeRoot = absolutePath(`${identity.protection.protectedContentRoot}/${locale}`);
  const count = walkFiles(localeRoot, file => file.endsWith('.html')).length;
  const expected = baseline.counts.localePages[locale];
  if (count < expected) failures.push(`Locale ${locale} page count decreased: ${count} < ${expected}`);
}

const baselinePages = new Set(Object.keys(baseline.pages));
const newPages = currentHtml.map(relativePath).filter(file => !baselinePages.has(file));
const newLocaleRelatives = new Set();
for (const file of newPages) {
  const match = file.match(/^content-site\/([a-z]{2})\/(.+\.html)$/i);
  if (match && identity.protection.locales.includes(match[1])) newLocaleRelatives.add(match[2]);

  const html = fs.readFileSync(absolutePath(file), 'utf8');
  const metadata = htmlMetadata(html);
  if (!match && !metadata.canonical) failures.push(`New English page has no canonical: ${file}`);
}

for (const relative of newLocaleRelatives) {
  const english = absolutePath(`content-site/${relative}`);
  if (!fs.existsSync(english)) failures.push(`New locale cluster has no English source: ${relative}`);
  for (const locale of identity.protection.locales) {
    const translated = absolutePath(`content-site/${locale}/${relative}`);
    if (!fs.existsSync(translated)) failures.push(`New locale cluster is incomplete: missing ${locale}/${relative}`);
  }
}

const sitemapXml = fs.readFileSync(absolutePath(identity.protection.sitemapFile), 'utf8');
const currentSitemap = parseSitemap(sitemapXml);
for (const [url, expected] of Object.entries(baseline.sitemap)) {
  if (!currentSitemap[url]) {
    failures.push(`Sitemap lost existing URL: ${url}`);
    continue;
  }
  if (currentSitemap[url].lastmod !== expected.lastmod) {
    failures.push(`Sitemap changed lastmod for unchanged URL: ${url} (${expected.lastmod} -> ${currentSitemap[url].lastmod})`);
  }
}

if (failures.length) {
  for (const message of failures.slice(0, 100)) console.error(`FAIL: ${message}`);
  if (failures.length > 100) console.error(`...and ${failures.length - 100} more failures.`);
  fail(`Site protection check found ${failures.length} violation(s).`);
}

console.log(`PASS: ${Object.keys(baseline.pages).length} existing pages are byte-identical.`);
console.log(`PASS: ${Object.keys(baseline.assets).length} existing public images are byte-identical.`);
console.log(`PASS: ${Object.keys(baseline.layoutFiles).length} protected layout/runtime files are byte-identical.`);
console.log(`PASS: ${Object.keys(baseline.sitemap).length} existing sitemap URLs and lastmod values are preserved.`);
console.log(`Site protection check passed. New pages detected: ${newPages.length}.`);

