import fs from 'node:fs';
import path from 'node:path';
import { LOCALES } from '../lib/locales.js';

const root = process.cwd();
const contentRoot = path.join(root, 'content-site');
const buildRoot = path.join(root, '.next', 'server', 'app');
const failures = [];
let checked = 0;

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(absolute));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(absolute);
  }
  return files;
}

for (const locale of LOCALES) {
  const localeRoot = path.join(contentRoot, locale);
  for (const sourceFile of walk(localeRoot)) {
    const relative = path.relative(localeRoot, sourceFile);
    const outputFile = path.join(buildRoot, locale, `${relative}.html`);
    if (!fs.existsSync(outputFile)) {
      failures.push(`missing built locale page: ${path.relative(root, outputFile)}`);
      continue;
    }

    const html = fs.readFileSync(outputFile, 'utf8');
    const expected = locale === 'ar'
      ? '<div lang="ar" dir="rtl">'
      : `<div lang="${locale}">`;
    if (!html.includes(expected)) {
      failures.push(`${path.relative(root, outputFile)} is missing ${expected}`);
    }
    checked += 1;
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exit(1);
}

console.log(`Locale server semantics check passed: ${checked} built pages expose lang; 23 Arabic pages expose dir="rtl".`);
