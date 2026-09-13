import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(scriptDirectory, '..');

export function fail(message, exitCode = 1) {
  console.error(`\nGUARDRAIL FAILED: ${message}`);
  process.exit(exitCode);
}

export function relativePath(file) {
  return path.relative(projectRoot, file).replace(/\\/g, '/');
}

export function absolutePath(file) {
  return path.resolve(projectRoot, file);
}

export function readJson(file) {
  const absolute = absolutePath(file);
  try {
    return JSON.parse(fs.readFileSync(absolute, 'utf8'));
  } catch (error) {
    fail(`Unable to read JSON ${relativePath(absolute)}: ${error.message}`);
  }
}

export function sha256File(file) {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

export function sha256Buffer(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

export function walkFiles(directory, predicate = () => true) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(absolute, predicate));
    else if (entry.isFile() && predicate(absolute)) files.push(absolute);
  }
  return files.sort((a, b) => relativePath(a).localeCompare(relativePath(b)));
}

export function git(args, options = {}) {
  return execFileSync('git', args, {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: options.stdio || ['ignore', 'pipe', 'pipe'],
  }).trim();
}

export function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env: { ...process.env, NO_COLOR: '1', NEXT_TELEMETRY_DISABLED: '1' },
    encoding: 'utf8',
    shell: process.platform === 'win32',
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });
  if (result.error) fail(`Unable to run ${command}: ${result.error.message}`);
  if (result.status !== 0 && !options.allowFailure) {
    if (options.capture) {
      if (result.stdout) process.stdout.write(result.stdout);
      if (result.stderr) process.stderr.write(result.stderr);
    }
    fail(`${command} ${args.join(' ')} exited with ${result.status ?? 'unknown'}.`);
  }
  return result;
}

export function parseArgs(argv = process.argv.slice(2)) {
  const values = new Map();
  const flags = new Set();
  for (let index = 0; index < argv.length; index++) {
    const token = argv[index];
    if (!token.startsWith('--')) fail(`Unexpected argument: ${token}`);
    if (token.includes('=')) {
      const [key, ...rest] = token.slice(2).split('=');
      values.set(key, rest.join('='));
    } else if (argv[index + 1] && !argv[index + 1].startsWith('--')) {
      values.set(token.slice(2), argv[++index]);
    } else {
      flags.add(token.slice(2));
    }
  }
  return {
    get: (name, fallback = undefined) => values.has(name) ? values.get(name) : fallback,
    has: (name) => flags.has(name) || values.has(name),
  };
}

export function extractAttributes(tag) {
  const attributes = {};
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/gs)) {
    attributes[match[1].toLowerCase()] = match[3].trim();
  }
  return attributes;
}

export function htmlMetadata(html) {
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map(match => extractAttributes(match[0]));
  const canonical = links.find(item => String(item.rel || '').toLowerCase() === 'canonical')?.href || '';
  const hreflang = links
    .filter(item => item.hreflang && item.href)
    .map(item => ({ code: item.hreflang.toLowerCase(), href: item.href }))
    .sort((a, b) => `${a.code}:${a.href}`.localeCompare(`${b.code}:${b.href}`));
  const images = [...html.matchAll(/<img\b[^>]*>/gi)]
    .map(match => extractAttributes(match[0]))
    .filter(item => item.src)
    .map(item => ({ src: item.src, width: item.width || '', height: item.height || '' }));
  return { canonical, hreflang, images };
}

export function publicUrlForContentFile(relativeFile, siteUrl) {
  let route = relativeFile.replace(/^content-site\//, '').replace(/\\/g, '/');
  if (route === 'index.html') return `${siteUrl}/`;
  if (/^[a-z]{2}\/index\.html$/i.test(route)) {
    return `${siteUrl}/${route.split('/')[0]}`;
  }
  return `${siteUrl}/${route}`;
}

export function parseSitemap(xml) {
  const entries = {};
  for (const block of xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)) {
    const loc = block[1].match(/<loc>([\s\S]*?)<\/loc>/i)?.[1]?.trim();
    if (!loc) continue;
    entries[loc] = {
      lastmod: block[1].match(/<lastmod>([\s\S]*?)<\/lastmod>/i)?.[1]?.trim() || '',
    };
  }
  return entries;
}

export function writeJson(file, value) {
  const absolute = absolutePath(file);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

