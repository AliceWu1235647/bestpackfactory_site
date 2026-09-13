import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function createSeed(root, overrides = {}) {
  const definitions = {
    products: { key: 'products', slugs: overrides.products || ['protected-product'] },
    blog: { key: 'posts', slugs: overrides.blog || ['protected-blog'] },
    news: { key: 'news', slugs: overrides.news || ['protected-news'] },
  };
  for (const [type, definition] of Object.entries(definitions)) {
    writeJson(path.join(root, type, 'index.json'), {
      [definition.key]: definition.slugs.map(slug => ({ slug })),
    });
    for (const slug of definition.slugs) {
      writeJson(path.join(root, type, `${slug}.json`), { slug, title: slug });
    }
  }
}

function runBuilder(args) {
  return spawnSync(process.execPath, ['scripts/build-r2-release.mjs', ...args], {
    cwd: projectRoot,
    encoding: 'utf8',
  });
}

test('R2 release builder writes immutable objects and activates the pointer last', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'bpf-r2-guard-'));
  try {
    const seed = path.join(temp, 'seed');
    const output = path.join(temp, 'release-one');
    createSeed(seed);
    const result = runBuilder([
      '--source', seed,
      '--out', output,
      '--release-id', 'release-test-001',
      '--initial-migration',
    ]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const plan = JSON.parse(fs.readFileSync(path.join(output, 'upload-plan.json'), 'utf8'));
    assert.equal(plan.operations.at(-1).key, 'manifests/current.json');
    assert.equal(plan.operations.at(-1).overwrite, true);
    assert.ok(plan.operations.slice(0, -1).every(operation => operation.overwrite === false));
    assert.ok(fs.existsSync(path.join(output, 'payload', 'releases', 'release-test-001', 'products', 'protected-product.json')));
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('R2 release builder rejects removal of an old slug', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'bpf-r2-guard-'));
  try {
    const firstSeed = path.join(temp, 'seed-one');
    const firstOutput = path.join(temp, 'release-one');
    createSeed(firstSeed);
    const first = runBuilder([
      '--source', firstSeed,
      '--out', firstOutput,
      '--release-id', 'release-test-001',
      '--initial-migration',
    ]);
    assert.equal(first.status, 0, first.stderr || first.stdout);

    const secondSeed = path.join(temp, 'seed-two');
    const secondOutput = path.join(temp, 'release-two');
    createSeed(secondSeed, { products: ['replacement-product'] });
    const previous = path.join(firstOutput, 'payload', 'manifests', 'release-test-001.json');
    const second = runBuilder([
      '--source', secondSeed,
      '--out', secondOutput,
      '--release-id', 'release-test-002',
      '--previous-manifest', previous,
    ]);
    assert.notEqual(second.status, 0);
    assert.match(`${second.stdout}\n${second.stderr}`, /drops 1 old slug/);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('R2 release resolver refuses a configured but unavailable manifest', async () => {
  const originalFetch = global.fetch;
  const originalBase = process.env.R2_PUBLIC_BASE_URL;
  const originalManifest = process.env.R2_RELEASE_MANIFEST_PATH;
  try {
    process.env.R2_PUBLIC_BASE_URL = 'https://assets.example.test';
    process.env.R2_RELEASE_MANIFEST_PATH = 'manifests/current.json';
    global.fetch = async () => new Response('missing', { status: 404 });
    const module = await import(`../lib/r2-release.js?test=${Date.now()}`);
    const resolved = await module.resolveR2TypeLocation('products', {
      prefix: 'products',
      indexPath: 'products/index.json',
    });
    assert.equal(resolved, null);
  } finally {
    global.fetch = originalFetch;
    if (originalBase === undefined) delete process.env.R2_PUBLIC_BASE_URL;
    else process.env.R2_PUBLIC_BASE_URL = originalBase;
    if (originalManifest === undefined) delete process.env.R2_RELEASE_MANIFEST_PATH;
    else process.env.R2_RELEASE_MANIFEST_PATH = originalManifest;
  }
});

