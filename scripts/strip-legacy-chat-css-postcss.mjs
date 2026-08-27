// Strip all retired .bpf-whatsapp-chat rules from style.css using postcss (AST-safe).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const cssPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'css', 'style.css');
const css = fs.readFileSync(cssPath, 'utf8');

const root = postcss.parse(css);

function isChatSelector(rule) {
  return rule.selectors && rule.selectors.some((s) => s.includes('bpf-whatsapp-chat'));
}

root.walk((node) => {
  if (node.type === 'rule' && isChatSelector(node)) {
    node.remove();
  }
});

// Remove now-empty at-rules (media queries that lost all their rules).
let changed = true;
while (changed) {
  changed = false;
  root.walkAtRules((at) => {
    if (!at.nodes || at.nodes.length === 0) {
      at.remove();
      changed = true;
    }
  });
}

const cleaned = root.toString();
fs.writeFileSync(cssPath, cleaned, 'utf8');
const remaining = (cleaned.match(/bpf-whatsapp-chat/g) || []).length;
console.log(`postcss strip done. remaining bpf-whatsapp-chat references: ${remaining}`);
