import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const identityPath = path.join(root, 'guardrails', 'site-identity.json');
const baselinePath = path.join(root, 'guardrails', 'site-baseline.json');
const mode = process.argv.includes('--capture') ? 'capture' : 'check';

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function relative(file) {
  return path.relative(root, file).replaceAll('\\', '/');
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(absolute));
    else if (entry.isFile()) files.push(absolute);
  }
  return files.sort((a, b) => relative(a).localeCompare(relative(b)));
}

function sha256(file) {
  const extension = path.extname(file).toLowerCase();
  const portableText = new Set(['.css', '.html', '.js', '.json', '.md', '.mjs', '.svg', '.txt', '.xml', '.yml', '.yaml']);
  const bytes = portableText.has(extension)
    ? Buffer.from(fs.readFileSync(file, 'utf8').replaceAll('\r\n', '\n'))
    : fs.readFileSync(file);
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function fileRecords(files) {
  return Object.fromEntries(files.map(file => [relative(file), {
    bytes: fs.statSync(file).size,
    sha256: sha256(file),
  }]));
}

function sitemapRecords(file) {
  const xml = fs.readFileSync(file, 'utf8');
  const urls = {};
  for (const match of xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>([\s\S]*?)<\/url>/g)) {
    const lastmod = match[2].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] || null;
    urls[match[1]] = { lastmod };
  }
  return urls;
}

function verifyIdentity(identity) {
  const packageJson = readJson(path.join(root, 'package.json'));
  const checks = [
    [packageJson.name === identity.packageName, 'package sentinel mismatch'],
    [identity.git.allowedRemoteUrls.includes(git(['remote', 'get-url', 'origin'])), 'Git remote mismatch'],
    [git(['rev-parse', '--show-toplevel']).replaceAll('\\', '/').toLowerCase() === root.replaceAll('\\', '/').toLowerCase(), 'Git root mismatch'],
  ];
  try {
    git(['merge-base', '--is-ancestor', identity.production.lastApprovedCommit, 'HEAD']);
  } catch {
    checks.push([false, 'HEAD does not descend from the approved production commit']);
  }
  for (const [ok, message] of checks) if (!ok) fail(message);
}

const identity = readJson(identityPath);
verifyIdentity(identity);
if (process.exitCode) process.exit();

if (mode === 'capture') {
  const protectedFiles = identity.protection.protectedFiles.map(file => path.join(root, file));
  const missing = protectedFiles.filter(file => !fs.existsSync(file));
  if (missing.length) {
    for (const file of missing) fail(`protected file is missing: ${relative(file)}`);
    process.exit();
  }

  const contentFiles = identity.protection.contentRoots.flatMap(directory => walk(path.join(root, directory)));
  const sitemap = sitemapRecords(path.join(root, identity.protection.sitemapFile));
  const localeCounts = Object.fromEntries(identity.protection.locales.map(locale => [
    locale,
    walk(path.join(root, 'content-site', locale)).filter(file => file.endsWith('.html')).length,
  ]));
  const baseline = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    generatedFromCommit: identity.production.lastApprovedCommit,
    identity: {
      repositoryId: identity.git.repositoryId,
      vercelProjectId: identity.vercel.projectId,
      rollbackTag: identity.production.rollbackTag,
    },
    counts: {
      contentFiles: contentFiles.length,
      htmlPages: contentFiles.filter(file => file.endsWith('.html')).length,
      localePages: localeCounts,
      sitemapUrls: Object.keys(sitemap).length,
    },
    protectedFiles: fileRecords(protectedFiles),
    contentFiles: fileRecords(contentFiles),
    sitemap,
  };
  fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
  fs.writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
  console.log(`Captured ${baseline.counts.contentFiles} content/assets files and ${baseline.counts.sitemapUrls} sitemap URLs.`);
  process.exit();
}

if (!fs.existsSync(baselinePath)) {
  fail('guardrails/site-baseline.json is missing; run npm run guard:capture on the approved baseline');
  process.exit();
}

const baseline = readJson(baselinePath);
if (baseline.identity.repositoryId !== identity.git.repositoryId) fail('baseline repository identity mismatch');
if (baseline.identity.vercelProjectId !== identity.vercel.projectId) fail('baseline Vercel project identity mismatch');

const failures = [];
for (const group of ['protectedFiles', 'contentFiles']) {
  for (const [file, expected] of Object.entries(baseline[group])) {
    const absolute = path.join(root, file);
    if (!fs.existsSync(absolute)) failures.push(`missing ${file}`);
    else if (sha256(absolute) !== expected.sha256) failures.push(`changed ${file}`);
  }
}

const currentContent = identity.protection.contentRoots.flatMap(directory => walk(path.join(root, directory)));
if (currentContent.length < baseline.counts.contentFiles) failures.push(`content/assets count decreased: ${currentContent.length} < ${baseline.counts.contentFiles}`);
for (const locale of identity.protection.locales) {
  const count = walk(path.join(root, 'content-site', locale)).filter(file => file.endsWith('.html')).length;
  if (count < baseline.counts.localePages[locale]) failures.push(`locale ${locale} pages decreased: ${count} < ${baseline.counts.localePages[locale]}`);
}

const sitemap = sitemapRecords(path.join(root, identity.protection.sitemapFile));
for (const [url, expected] of Object.entries(baseline.sitemap)) {
  if (!sitemap[url]) failures.push(`sitemap URL missing: ${url}`);
  else if (sitemap[url].lastmod !== expected.lastmod) failures.push(`sitemap lastmod changed: ${url}`);
}

if (failures.length) {
  for (const message of failures.slice(0, 100)) fail(message);
  if (failures.length > 100) console.error(`FAIL: ${failures.length - 100} additional violations omitted`);
  process.exit();
}

console.log(`PASS: ${Object.keys(baseline.protectedFiles).length} critical runtime files are unchanged.`);
console.log(`PASS: ${Object.keys(baseline.contentFiles).length} existing content/assets files are unchanged.`);
console.log(`PASS: ${Object.keys(baseline.sitemap).length} existing sitemap URLs and lastmod values are preserved.`);
