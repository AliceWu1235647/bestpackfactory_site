import fs from 'node:fs';
import path from 'node:path';
import {
  absolutePath,
  git,
  htmlMetadata,
  parseSitemap,
  portableFileBuffer,
  portableSha256File,
  publicUrlForContentFile,
  readJson,
  relativePath,
  walkFiles,
  writeJson,
} from './guard-lib.mjs';
import { hreflangFor } from '../lib/locales.js';

const identity = readJson('guardrails/site-identity.json');
const protection = identity.protection;
const imagePattern = /\.(?:avif|gif|jpe?g|png|svg|webp)$/i;

function recordFiles(files) {
  const entries = {};
  for (const absolute of files) {
    const relative = relativePath(absolute);
    const portable = portableFileBuffer(absolute);
    entries[relative] = { sha256: portableSha256File(absolute), bytes: portable.length };
  }
  return entries;
}

const layoutFiles = protection.protectedLayoutFiles.map(absolutePath);
const htmlFiles = walkFiles(absolutePath(protection.protectedContentRoot), file => file.endsWith('.html'));
const assetFiles = walkFiles(absolutePath(protection.protectedAssetRoot), file => imagePattern.test(file));

const pages = {};
for (const absolute of htmlFiles) {
  const relative = relativePath(absolute);
  const html = fs.readFileSync(absolute, 'utf8');
  const metadata = htmlMetadata(html);
  const publicUrl = publicUrlForContentFile(relative, identity.siteUrl);
  const routePath = relative.replace(`${protection.protectedContentRoot}/`, '');
  const runtimeHreflang = hreflangFor(routePath)?.languages || {};
  pages[relative] = {
    sha256: portableSha256File(absolute),
    bytes: portableFileBuffer(absolute).length,
    publicUrl,
    canonical: metadata.canonical,
    expectedCanonical: identity.production.canonicalOverrides?.[new URL(publicUrl).pathname] || metadata.canonical || publicUrl,
    sourceHreflang: metadata.hreflang,
    expectedHreflang: Object.entries(runtimeHreflang)
      .map(([code, href]) => ({ code, href }))
      .sort((a, b) => `${a.code}:${a.href}`.localeCompare(`${b.code}:${b.href}`)),
    images: metadata.images,
  };
}

const localeCounts = {};
for (const locale of protection.locales) {
  const prefix = `${protection.protectedContentRoot}/${locale}/`;
  localeCounts[locale] = Object.keys(pages).filter(file => file.startsWith(prefix)).length;
}

const sitemapXml = fs.readFileSync(absolutePath(protection.sitemapFile), 'utf8');
const baseline = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  generatedFromCommit: git(['rev-parse', 'HEAD']),
  identity: {
    siteUrl: identity.siteUrl,
    repository: identity.git.repository,
    repositoryId: identity.git.repositoryId,
    vercelProjectId: identity.vercel.projectId,
  },
  counts: {
    htmlPages: htmlFiles.length,
    protectedAssets: assetFiles.length,
    localePages: localeCounts,
  },
  layoutFiles: recordFiles(layoutFiles),
  pages,
  assets: recordFiles(assetFiles),
  sitemap: parseSitemap(sitemapXml),
};

writeJson('guardrails/site-baseline.json', baseline);
console.log(`Wrote guardrails/site-baseline.json from ${baseline.generatedFromCommit}.`);
console.log(`Protected ${baseline.counts.htmlPages} HTML pages and ${baseline.counts.protectedAssets} public images.`);

