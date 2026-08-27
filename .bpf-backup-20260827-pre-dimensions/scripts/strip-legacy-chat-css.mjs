// Strip all retired .bpf-whatsapp-chat rules from style.css (brace-aware).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cssPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'css', 'style.css');
const css = fs.readFileSync(cssPath, 'utf8');

// Split into top-level chunks: selector/at-rule + balanced body.
function stripCss(input) {
  let out = '';
  let i = 0;
  const n = input.length;
  while (i < n) {
    const open = input.indexOf('{', i);
    if (open < 0) {
      out += input.slice(i);
      break;
    }
    const header = input.slice(i, open);
    // find matching close brace
    let depth = 1;
    let j = open + 1;
    while (j < n && depth > 0) {
      if (input[j] === '{') depth += 1;
      else if (input[j] === '}') depth -= 1;
      j += 1;
    }
    const body = input.slice(open + 1, j - 1);
    if (header.includes('bpf-whatsapp-chat')) {
      // drop the rule entirely (and its media wrapper is handled by the parent loop)
      i = j;
      continue;
    }
    if (header.startsWith('@media') || header.startsWith('@supports') || header.startsWith('@container')) {
      const inner = stripCss(body);
      if (inner.trim()) {
        out += header + '{' + inner + '}';
      }
      i = j;
      continue;
    }
    out += header + '{' + body + '}';
    i = j;
  }
  return out;
}

const cleaned = stripCss(css);
fs.writeFileSync(cssPath, cleaned, 'utf8');
const remaining = (cleaned.match(/bpf-whatsapp-chat/g) || []).length;
console.log(`style.css cleaned. remaining bpf-whatsapp-chat references: ${remaining}`);
