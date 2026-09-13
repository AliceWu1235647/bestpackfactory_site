import fs from 'node:fs';
import path from 'node:path';
import {
  absolutePath,
  git,
  htmlMetadata,
  parseSitemap,
  publicUrlForContentFile,
  readJson,
  relativePath,
  sha256File,
  walkFiles,
  writeJson,
} from './guard-lib.mjs';

const identity = readJson('guardrails/site-identity.json');
const protection = identity.protection;
const imagePattern = /\.(?:avif|gif|jpe?g|png|svg|webp)$/i;

function recordFiles(files) {
  const entries = {};
  for (const absolute of files) {
    const relative = relativePath(absolute);
    const stat = fs.statSync(absolute);
    entries[relative] = { sha256: sha256File(absolute), bytes: stat.size };
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
  pages[relative] = {
    sha256: sha256File(absolute),
    bytes: fs.statSync(absolute).size,
    publicUrl: publicUrlForContentFile(relative, identity.siteUrl),
    canonical: metadata.canonical,
    hreflang: metadata.hreflang,
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

