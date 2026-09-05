import fs from 'node:fs';
import path from 'node:path';

const CONTENT_DIR = path.join(process.cwd(), 'content-site');

const LOCALE_LANGS = { ar: 'ar', de: 'de', es: 'es', fr: 'fr', ja: 'ja' };
const RTL_LOCALES = new Set(['ar']);

function walkHtml(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkHtml(full));
    } else if (entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

let changed = 0;

// Fix locale directories: replace lang="en" with correct locale lang
for (const [locale, lang] of Object.entries(LOCALE_LANGS)) {
  const localeDir = path.join(CONTENT_DIR, locale);
  if (!fs.existsSync(localeDir)) continue;

  const files = walkHtml(localeDir);
  const dir = RTL_LOCALES.has(locale) ? ' dir="rtl"' : '';

  for (const file of files) {
    let html = fs.readFileSync(file, 'utf8');
    let fileChanged = false;

    // Replace <html lang="en"> or <html lang="en" ...>
    const newTag = `<html lang="${lang}"${dir}`;
    if (html.includes('<html lang="en"')) {
      html = html.replace(/<html lang="en"/, newTag);
      fileChanged = true;
    } else if (html.includes('<html lang="en" ')) {
      html = html.replace(/<html lang="en" /, `${newTag} `);
      fileChanged = true;
    }
    // Handle bare <html> (no lang at all)
    else if (/<html>\s*\n?\s*<head/i.test(html)) {
      html = html.replace(/<html>/, `<html lang="${lang}"${dir}>`);
      fileChanged = true;
    }
    // Handle <html> not followed by <head immediately
    else if (/<html>/.test(html) && !/<html\s+/i.test(html)) {
      html = html.replace(/<html>/, `<html lang="${lang}"${dir}>`);
      fileChanged = true;
    }

    if (fileChanged) {
      fs.writeFileSync(file, html);
      changed++;
      const rel = path.relative(CONTENT_DIR, file).replace(/\\/g, '/');
      console.log(`FIXED ${rel} → lang="${lang}"${dir ? ' dir="rtl"' : ''}`);
    }
  }
}

// Fix English pages with bare <html> (no lang attribute)
const enProductsDir = path.join(CONTENT_DIR, 'products');
if (fs.existsSync(enProductsDir)) {
  const files = walkHtml(enProductsDir);
  for (const file of files) {
    let html = fs.readFileSync(file, 'utf8');
    // Only fix bare <html> without any lang
    if (/<html>\s*\n?\s*<head/i.test(html) || (/<html>/.test(html) && !/<html\s+/i.test(html))) {
      html = html.replace(/<html>/, '<html lang="en">');
      fs.writeFileSync(file, html);
      changed++;
      const rel = path.relative(CONTENT_DIR, file).replace(/\\/g, '/');
      console.log(`FIXED ${rel} → lang="en"`);
    }
  }
}

// Also check top-level HTML files for bare <html>
const topFiles = fs.readdirSync(CONTENT_DIR, { withFileTypes: true })
  .filter(e => !e.isDirectory() && e.name.endsWith('.html'))
  .map(e => path.join(CONTENT_DIR, e.name));

for (const file of topFiles) {
  let html = fs.readFileSync(file, 'utf8');
  if (/<html>\s*\n?\s*<head/i.test(html) || (/<html>/.test(html) && !/<html\s+/i.test(html))) {
    html = html.replace(/<html>/, '<html lang="en">');
    fs.writeFileSync(file, html);
    changed++;
    const rel = path.relative(CONTENT_DIR, file).replace(/\\/g, '/');
    console.log(`FIXED ${rel} → lang="en"`);
  }
}

console.log(`\nDONE. ${changed} file(s) updated.`);
