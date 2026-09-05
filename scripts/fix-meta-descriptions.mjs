import fs from 'node:fs';
import path from 'node:path';

const CONTENT_DIR = path.join(process.cwd(), 'content-site');
const MAX_LEN = 155;

function walkHtml(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkHtml(full));
    else if (entry.name.endsWith('.html')) results.push(full);
  }
  return results;
}

function extractDesc(html) {
  const m = html.match(/<meta\s+(?:name=["']description["']\s+content=["']([^"']+)["']|content=["']([^"']+)["']\s+name=["']description["'])/i);
  return m ? (m[1] || m[2] || '') : '';
}

function truncateDesc(desc, maxLen) {
  if (desc.length <= maxLen) return desc;
  let cut = desc.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const lastPunct = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('。'), cut.lastIndexOf('、'), cut.lastIndexOf('،'));
  if (lastPunct > maxLen * 0.5) {
    cut = desc.slice(0, lastPunct + 1);
  } else if (lastSpace > maxLen * 0.5) {
    cut = desc.slice(0, lastSpace);
  }
  if (cut.length > maxLen) cut = cut.slice(0, maxLen - 1);
  if (!/[.。!！?？،]$/.test(cut)) cut += '.';
  return cut;
}

let changed = 0;
const report = [];

for (const file of walkHtml(CONTENT_DIR)) {
  const html = fs.readFileSync(file, 'utf8');
  const desc = extractDesc(html);
  if (!desc || desc.length <= MAX_LEN) continue;

  const shorter = truncateDesc(desc, MAX_LEN);
  const escaped = desc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped, 'g');
  const updated = html.replace(re, shorter);

  if (updated !== html) {
    fs.writeFileSync(file, updated);
    changed++;
    const rel = path.relative(CONTENT_DIR, file).replace(/\\/g, '/');
    report.push({ file: rel, from: desc.length, to: shorter.length });
  }
}

report.sort((a, b) => b.from - a.from);
for (const r of report) {
  console.log(`${r.file}: ${r.from} → ${r.to} chars`);
}
console.log(`\n${changed} meta descriptions shortened.`);
