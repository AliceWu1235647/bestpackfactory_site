import fs from 'node:fs';
import path from 'node:path';
import {
  absolutePath,
  fail,
  git,
  parseArgs,
  projectRoot,
  sha256File,
  writeJson,
} from './guard-lib.mjs';

const args = parseArgs();
const source = path.resolve(projectRoot, args.get('source', 'r2-seed'));
const releaseId = args.get('release-id', git(['rev-parse', '--short=12', 'HEAD'])).toLowerCase();
const previousManifestPath = args.get('previous-manifest');
const initialMigration = args.has('initial-migration');

if (!/^[a-z0-9][a-z0-9-]{6,79}$/.test(releaseId)) {
  fail('Release ID must be 7-80 lowercase letters, digits, or hyphens.');
}
if (!fs.existsSync(source)) fail(`R2 source directory does not exist: ${source}`);
if (!previousManifestPath && !initialMigration) {
  fail('Provide --previous-manifest to prove no old slugs are lost, or use --initial-migration for the first controlled migration.');
}

const outputRoot = absolutePath(args.get('out', `guardrails/r2-releases/${releaseId}`));
if (fs.existsSync(outputRoot)) fail(`Release output already exists and will not be overwritten: ${outputRoot}`);

const definitions = {
  products: { indexKey: 'products' },
  blog: { indexKey: 'posts' },
  news: { indexKey: 'news' },
};

function itemsFromIndex(index, key) {
  if (Array.isArray(index?.[key])) return index[key];
  if (Array.isArray(index?.items)) return index.items;
  if (Array.isArray(index)) return index;
  return [];
}

function cleanSlug(item, type) {
  const raw = item?.slug || item?.id || item?.url || item?.path || item?.json || item;
  const slug = String(raw || '')
    .replace(/^\/+/, '')
    .replace(new RegExp(`^${type}/`), '')
    .replace(/\.(?:html|json)$/i, '')
    .replace(/^\/+|\/+$/g, '');
  if (!slug || slug.includes('..') || !/^[a-zA-Z0-9._/-]+$/.test(slug)) fail(`Unsafe or missing ${type} slug: ${raw}`);
  return slug;
}

let previous = null;
if (previousManifestPath) {
  const absolute = path.resolve(projectRoot, previousManifestPath);
  try { previous = JSON.parse(fs.readFileSync(absolute, 'utf8')); }
  catch (error) { fail(`Unable to read previous manifest: ${error.message}`); }
  if (previous?.schemaVersion !== 1 || !previous?.types) fail('Previous manifest has an invalid schema.');
}

const manifest = {
  schemaVersion: 1,
  releaseId,
  createdAt: new Date().toISOString(),
  sourceCommit: git(['rev-parse', 'HEAD']),
  types: {},
};
const uploadPlan = [];

for (const [type, definition] of Object.entries(definitions)) {
  const sourceDirectory = path.join(source, type);
  const sourceIndex = path.join(sourceDirectory, 'index.json');
  if (!fs.existsSync(sourceIndex)) fail(`Complete release requires ${type}/index.json.`);

  let index;
  try { index = JSON.parse(fs.readFileSync(sourceIndex, 'utf8')); }
  catch (error) { fail(`Invalid ${type}/index.json: ${error.message}`); }
  const items = itemsFromIndex(index, definition.indexKey);
  if (!items.length) fail(`${type}/index.json contains no entries.`);

  const slugs = [...new Set(items.map(item => cleanSlug(item, type)))].sort();
  const previousSlugs = previous?.types?.[type]?.slugs || [];
  const missingOld = previousSlugs.filter(slug => !slugs.includes(slug));
  if (missingOld.length) fail(`${type} release drops ${missingOld.length} old slug(s): ${missingOld.slice(0, 10).join(', ')}`);

  const jsonPrefix = `releases/${releaseId}/${type}`;
  const targetDirectory = path.join(outputRoot, 'payload', ...jsonPrefix.split('/'));
  fs.mkdirSync(targetDirectory, { recursive: true });
  const files = {};

  for (const slug of slugs) {
    const sourceFile = path.join(sourceDirectory, `${slug}.json`);
    if (!fs.existsSync(sourceFile)) fail(`Index references missing object: ${type}/${slug}.json`);
    try { JSON.parse(fs.readFileSync(sourceFile, 'utf8')); }
    catch (error) { fail(`Invalid JSON object ${type}/${slug}.json: ${error.message}`); }
    const targetFile = path.join(targetDirectory, `${slug}.json`);
    fs.mkdirSync(path.dirname(targetFile), { recursive: true });
    fs.copyFileSync(sourceFile, targetFile);
    const key = `${jsonPrefix}/${slug}.json`;
    files[key] = { sha256: sha256File(targetFile), bytes: fs.statSync(targetFile).size };
    uploadPlan.push({ order: 10, key, file: path.relative(outputRoot, targetFile).replace(/\\/g, '/'), overwrite: false });
  }

  const targetIndex = path.join(targetDirectory, 'index.json');
  fs.copyFileSync(sourceIndex, targetIndex);
  const indexPath = `${jsonPrefix}/index.json`;
  files[indexPath] = { sha256: sha256File(targetIndex), bytes: fs.statSync(targetIndex).size };
  uploadPlan.push({ order: 20, key: indexPath, file: path.relative(outputRoot, targetIndex).replace(/\\/g, '/'), overwrite: false });
  manifest.types[type] = { jsonPrefix, indexPath, count: slugs.length, slugs, files };
}

const versionedManifestFile = path.join(outputRoot, 'payload', 'manifests', `${releaseId}.json`);
writeJson(path.relative(projectRoot, versionedManifestFile), manifest);
uploadPlan.push({
  order: 30,
  key: `manifests/${releaseId}.json`,
  file: path.relative(outputRoot, versionedManifestFile).replace(/\\/g, '/'),
  overwrite: false,
});

const activationFile = path.join(outputRoot, 'activation', 'manifests', 'current.json');
writeJson(path.relative(projectRoot, activationFile), manifest);
uploadPlan.push({
  order: 100,
  key: 'manifests/current.json',
  file: path.relative(outputRoot, activationFile).replace(/\\/g, '/'),
  overwrite: true,
  condition: 'Upload last with If-Match against the previously verified pointer ETag.',
});

writeJson(path.relative(projectRoot, path.join(outputRoot, 'upload-plan.json')), {
  schemaVersion: 1,
  releaseId,
  previousReleaseId: previous?.releaseId || null,
  operations: uploadPlan.sort((a, b) => a.order - b.order || a.key.localeCompare(b.key)),
});

console.log(`Built immutable R2 release ${releaseId}.`);
for (const [type, value] of Object.entries(manifest.types)) console.log(`${type}: ${value.count} objects`);
console.log('The current manifest pointer is last in upload-plan.json. Nothing was uploaded.');

