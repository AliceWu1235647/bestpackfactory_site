import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const textRoots = ['content-site', 'public', 'app', 'lib'];
const textExtensions = new Set(['.html', '.js', '.json', '.txt']);
const failures = [];

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else if (textExtensions.has(path.extname(entry.name).toLowerCase())) files.push(absolute);
  }
  return files;
}

const banned = [
  ['former production address', /Printing Industrial Park, Longhua District/i],
  ['old founding year in structured data', /"foundingDate"\s*:\s*"2010"/i],
  ['old visible founding year', /(?:Established|established)\s+(?:in\s+)?2010/i],
  ['unverified 15-year history claim', /15\+\s*years(?:\s+of)?\s+experience/i],
  ['blanket food-contact claim', /All our food packaging materials comply with FDA, EU, and GB standards/i],
];

for (const relativeRoot of textRoots) {
  const directory = path.join(root, relativeRoot);
  for (const file of await walk(directory)) {
    const text = await fs.readFile(file, 'utf8');
    for (const [label, pattern] of banned) {
      if (pattern.test(text)) failures.push(`${label}: ${path.relative(root, file)}`);
    }
  }
}

const required = new Map([
  ['content-site/factory/certificates.html', [
    '91440300MA5DA1RR87',
    '2016-04-05',
    'Huixin Zhichuang Park, 108 Huarong Road',
    'XNO250418226BX2-1',
    'not FDA approval',
    'Expired 3 September 2026',
    'Relationship Pending',
  ]],
  ['public/llms.txt', ['## Identity and evidence status', 'XNO250418226BX2-1']],
  ['content-site/faq.html', ['XNO250418226BX2-1', 'relationship-pending']],
  ['content-site/trust-profile.html', ['91440300MA5DA1RR87', 'FSC Certificate-holder Relationship Pending']],
]);

for (const [relativePath, needles] of required) {
  const text = await fs.readFile(path.join(root, relativePath), 'utf8');
  for (const needle of needles) {
    if (!text.includes(needle)) failures.push(`missing "${needle}": ${relativePath}`);
  }
}

for (const relativePath of ['content-site/ai-index.json', 'public/ai-index.json', 'public/geo-answer-guide.json']) {
  const data = JSON.parse(await fs.readFile(path.join(root, relativePath), 'utf8'));
  if (data.factory_identity?.established !== '2016-04-05') failures.push(`wrong establishment date: ${relativePath}`);
  if (!data.factory_identity?.production_address?.startsWith('Huixin Zhichuang Park, 108 Huarong Road')) {
    failures.push(`wrong production address: ${relativePath}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Verified entity, address and scoped compliance claims are consistent.');
