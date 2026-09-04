// 可重复运行的站内成长审计:标题 / canonical / 内链 / 图片 / 结构化数据。
// 输出 .growth_audit.json 并打印摘要。运行:node scripts/growth-audit.mjs
import fs from 'fs';
import path from 'path';
import { LOCALES, translatedPaths } from '../lib/locales.js';

const ROOT = 'content-site';

// locale switcher 是渲染期注入的(lib/static-pages.js -> appendLocaleSwitcher),
// 磁盘 HTML 上看不到。翻译簇内的每个页面实际都被 EN + 4 个兄弟语言链接(入度 +5)。
// 不补偿的话,110 个 locale 页会被误报为孤儿。
const CLUSTER = new Set(translatedPaths());
function switcherInDegree(urlPath) {
  const rel = urlPath.replace(/^\//, '');
  const [first, ...rest] = rel.split('/');
  const bare = LOCALES.includes(first) ? rest.join('/') : rel;
  return CLUSTER.has(bare) ? 5 : 0;
}

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

// content-site/products/foo.html -> /products/foo.html
function toUrlPath(file) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  return '/' + rel;
}

// 部分页面在磁盘上是整页 Next.js 快照(含 <head>)。渲染时 extractBody() 只取 <body>,
// 所以 head 里的 canonical / hreflang 是死标记,不会出现在线上。审计必须同样只看 body,
// 否则会把这些 alternate 误报成 25 条断链。
function servedHtml(raw) {
  const m = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return m ? m[1] : raw;
}

const files = walk(ROOT);
const pages = new Map(); // urlPath -> { file, html(served body), raw }
for (const f of files) {
  const raw = fs.readFileSync(f, 'utf8');
  pages.set(toUrlPath(f), { file: f, html: servedHtml(raw), raw });
}

// ---------- headings ----------
const missingH1 = [];
const multipleH1 = [];
for (const [url, { html }] of pages) {
  const n = (html.match(/<h1\b/gi) || []).length;
  if (n === 0) missingH1.push(url);
  else if (n > 1) multipleH1.push(url);
}

// ---------- canonicals ----------
const canonicalOf = new Map();
const canonicalDupes = {};
// canonical 只可能在 <head>,所以这里读原始文件而非 body。
for (const [url, { raw }] of pages) {
  const m = raw.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  if (!m) continue;
  canonicalOf.set(url, m[1]);
  (canonicalDupes[m[1]] ||= []).push(url);
}
const duplicateCanonicals = Object.entries(canonicalDupes)
  .filter(([, v]) => v.length > 1)
  .map(([href, urls]) => ({ href, urls }));

// ---------- internal links (in-degree) ----------
const inDegree = new Map();
for (const url of pages.keys()) inDegree.set(url, 0);
const broken = [];
// 站内链接有三种写法,都要算:
//   1. 根相对   /products/foo.html
//   2. 绝对同域 https://www.bestpackfactory.com/products/foo.html
//   3. 裸相对   products/foo.html、../contact.html —— 渲染期由 rewriteRelativeUrls() 改写
const ORIGIN_RE = /^https?:\/\/(www\.)?bestpackfactory\.com/i;
const linkRe = /href=["']([^"']+\.html)(?:[#?][^"']*)?["']/gi;

function normalizeHref(raw, fromUrl) {
  if (/^(mailto:|tel:|#)/i.test(raw)) return null;
  if (ORIGIN_RE.test(raw)) return raw.replace(ORIGIN_RE, '') || '/';
  if (/^https?:\/\//i.test(raw)) return null; // 站外
  if (raw.startsWith('/')) return raw;
  // 裸相对:相对当前页所在目录解析
  const baseDir = path.posix.dirname(fromUrl);
  return path.posix.normalize(path.posix.join(baseDir, raw));
}

for (const [from, { html }] of pages) {
  const seen = new Set();
  let m;
  while ((m = linkRe.exec(html))) {
    const target = normalizeHref(m[1].split(/[#?]/)[0], from);
    if (!target || target === from) continue;
    if (!pages.has(target)) {
      broken.push({ from, raw: m[1], target });
      continue;
    }
    if (seen.has(target)) continue; // 同页重复链接只计一次
    seen.add(target);
    inDegree.set(target, inDegree.get(target) + 1);
  }
}
// 叠加渲染期注入的 locale switcher 入链
for (const url of inDegree.keys()) inDegree.set(url, inDegree.get(url) + switcherInDegree(url));

const orphans = [...inDegree].filter(([, n]) => n === 0).map(([u]) => u);
const weak = [...inDegree].filter(([, n]) => n <= 1).map(([u, n]) => ({ url: u, inDegree: n }));

// 按目录分组的弱链统计
const weakBySection = {};
for (const { url } of weak) {
  const sec = url.split('/')[1] || '(root)';
  weakBySection[sec] = (weakBySection[sec] || 0) + 1;
}

// ---------- images ----------
let imgTotal = 0;
const missingAlt = [];
const missingDims = [];
for (const [url, { html }] of pages) {
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    imgTotal++;
    if (!/\balt\s*=/.test(tag)) missingAlt.push(url);
    if (!(/\bwidth\s*=/.test(tag) && /\bheight\s*=/.test(tag))) missingDims.push(url);
  }
}

// ---------- structured data ----------
const jsonErrors = [];
const typeCounts = {};
const ldRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
for (const [url, { html }] of pages) {
  let m;
  while ((m = ldRe.exec(html))) {
    try {
      const data = JSON.parse(m[1].trim());
      for (const node of Array.isArray(data) ? data : [data]) {
        const t = node && node['@type'];
        for (const tt of Array.isArray(t) ? t : [t]) if (tt) typeCounts[tt] = (typeCounts[tt] || 0) + 1;
      }
    } catch (e) {
      jsonErrors.push({ url, error: String(e.message).slice(0, 120) });
    }
  }
}

const report = {
  generatedFrom: ROOT,
  htmlPages: pages.size,
  headings: { missingH1Count: missingH1.length, missingH1, multipleH1Count: multipleH1.length, multipleH1 },
  canonicals: { withCanonical: canonicalOf.size, duplicateCount: duplicateCanonicals.length, duplicates: duplicateCanonicals },
  links: {
    brokenCount: broken.length,
    broken: broken.slice(0, 50),
    orphanCount: orphans.length,
    orphans,
    atMostOneInternalLinkCount: weak.length,
    atMostOneInternalLink: weak,
    weakBySection,
  },
  images: {
    total: imgTotal,
    missingAltCount: missingAlt.length,
    missingDimensionsCount: missingDims.length,
  },
  structuredData: { jsonErrorCount: jsonErrors.length, jsonErrors, typeCounts },
};

fs.writeFileSync('.growth_audit.json', JSON.stringify(report, null, 2));

console.log('pages:', report.htmlPages);
console.log('missing H1:', missingH1.length, '| multiple H1:', multipleH1.length);
console.log('duplicate canonicals:', duplicateCanonicals.length);
console.log('broken links:', broken.length);
console.log('orphans (in-degree 0):', orphans.length, orphans.slice(0, 10));
console.log('weak (in-degree <=1):', weak.length);
console.log('weak by section:', weakBySection);
console.log('images:', imgTotal, '| missing alt:', missingAlt.length, '| missing dims:', missingDims.length);
console.log('ld+json errors:', jsonErrors.length);
