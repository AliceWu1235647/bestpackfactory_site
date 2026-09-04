// 审计:占位符 / TODO / 薄内容页面。
// 这类页面被 index 且进了 sitemap 时,会拖累站点整体质量信号(Google thin-content)。
import fs from 'fs';
import path from 'path';

const ROOT = 'content-site';

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

function servedBody(raw) {
  const m = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return m ? m[1] : raw;
}

// 去掉 script/style/标签,得到可见正文
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const PLACEHOLDER_RE = /\bTODO\b|\bplaceholder\b|\bTBD\b|\bcoming soon\b|\blorem ipsum\b|\[[^\]]{3,40}—\s*TODO\]/i;

const rows = [];
for (const f of walk(ROOT)) {
  const raw = fs.readFileSync(f, 'utf8');
  const body = servedBody(raw);
  const text = visibleText(body);
  const words = text ? text.split(' ').length : 0;

  // 注意:TODO 必须大小写敏感。西班牙语常用词 "todo/método" 会命中 /todo/i,
  // 之前用 gi 导致 22 个 es 页面全是误报。
  const hits = [];
  const ph = text.match(/\bTODO\b/g);
  if (ph) hits.push(`TODO x${ph.length}`);
  if (/\bplaceholder\b/i.test(text)) hits.push('placeholder');
  if (/\bcoming soon\b/i.test(text)) hits.push('coming soon');
  if (/\bTBD\b/.test(text)) hits.push('TBD');
  if (/lorem ipsum/i.test(text)) hits.push('lorem');

  const robots = (raw.match(/<meta name="robots" content="([^"]*)"/i) || [])[1] || '';
  const noindex = /noindex/i.test(robots);

  if (hits.length || words < 300) {
    rows.push({
      url: '/' + path.relative(ROOT, f).split(path.sep).join('/'),
      words,
      hits: hits.join(', '),
      noindex,
    });
  }
}

rows.sort((a, b) => a.words - b.words);

const indexedProblems = rows.filter((r) => !r.noindex);
console.log('pages flagged (placeholder markers or <300 words):', rows.length);
console.log('of which INDEXED (real SEO risk):', indexedProblems.length);
console.log('');
console.log('words  noindex  markers                url');
for (const r of rows) {
  console.log(
    String(r.words).padStart(5),
    r.noindex ? '  yes  ' : '  NO   ',
    (r.hits || '-').padEnd(22),
    r.url
  );
}
