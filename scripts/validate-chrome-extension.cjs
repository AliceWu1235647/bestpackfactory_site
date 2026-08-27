const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(process.cwd(), 'chrome-extension');
const manifestPath = path.join(root, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

if (manifest.manifest_version !== 3) throw new Error('Chrome extension must use Manifest V3.');
if (Number(manifest.minimum_chrome_version) < 116) throw new Error('Chrome 116+ is required for sidePanel.open().');

const requiredFiles = [
  manifest.background?.service_worker,
  manifest.side_panel?.default_path,
  manifest.options_page,
  'sidepanel.js',
  'sidepanel.css',
  'options.js',
  'options.css'
].filter(Boolean);

for (const file of requiredFiles) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) throw new Error(`Missing extension file: ${file}`);
}

for (const file of ['service-worker.js', 'sidepanel.js', 'options.js']) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  new vm.Script(source, { filename: file });
  if (/\b(?:innerHTML|outerHTML|eval|Function)\s*(?:=|\()/.test(source)) {
    throw new Error(`Unsafe dynamic code or HTML API in ${file}`);
  }
}

for (const file of ['sidepanel.html', 'options.html']) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  if (/<script(?![^>]+src=)[^>]*>/i.test(source)) throw new Error(`Inline script found in ${file}`);
  for (const match of source.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const referenced = match[1];
    if (/^[a-z]+:/i.test(referenced)) throw new Error(`Remote resource found in ${file}: ${referenced}`);
    if (!fs.existsSync(path.join(root, referenced))) throw new Error(`Missing resource in ${file}: ${referenced}`);
  }
}

const allowedHosts = new Set(['http://localhost:3000/*', 'http://127.0.0.1:3000/*']);
for (const host of manifest.host_permissions || []) {
  if (!allowedHosts.has(host)) throw new Error(`Unexpected host permission: ${host}`);
}

const optionalHosts = manifest.optional_host_permissions || [];
if (optionalHosts.length !== 1 || optionalHosts[0] !== 'http://*/*') {
  throw new Error('LAN access must use one runtime-granted optional HTTP host permission.');
}

console.log(`Chrome extension validation passed (${requiredFiles.length + 3} checked files).`);
