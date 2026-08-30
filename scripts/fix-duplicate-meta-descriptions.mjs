// backfill-meta-descriptions.mjs 的存在性检测写成了 /<meta name="description"/,
// 只认 name 属性排在前面的写法。content-site 里有大量页面用的是
// <meta content="..." name="description"/>(content 在前),检测漏掉,于是又插了一个,
// 造成 110 个页面出现两个 description —— 搜索引擎会视为异常信号。
//
// 本脚本按属性顺序无关的正则重新检测,删除重复项:
//   - 两个标签内容相同  -> 删除后插入的那个(</title> 紧邻的一个),保留页面原有写法
//   - 两个标签内容不同  -> 不动,列入报告由人工决定保留哪条文案
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content-site');
const apply = !process.argv.includes('--dry-run');

// 属性顺序无关:匹配任意 <meta ...> 中带 name="description" 的标签
const META_DESC = /<meta\b[^>]*\bname=["']description["'][^>]*>/gi;
const CONTENT_ATTR = /\bcontent=["']([^"']*)["']/i;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const stats = { scanned: 0, fixed: 0, conflicts: [], untouched: 0 };

for (const file of walk(CONTENT)) {
  const original = fs.readFileSync(file, 'utf8');
  stats.scanned += 1;

  const tags = original.match(META_DESC) || [];
  if (tags.length < 2) { stats.untouched += 1; continue; }

  const rel = path.relative(CONTENT, file).split(path.sep).join('/');
  const values = tags.map(t => (t.match(CONTENT_ATTR) || [])[1] ?? '');

  // 内容不一致:保留现状,交人工判断,避免删掉更好的那条文案
  if (new Set(values).size > 1) {
    stats.conflicts.push({ file: rel, count: tags.length, values });
    continue;
  }

  // 内容一致:删掉后插入的那个。backfill 脚本插在 </title> 之后,
  // 因此删除紧跟 </title> 的那一个,保留页面原有的标签。
  const updated = original.replace(
    /(<\/title>)\s*\n?<meta\b[^>]*\bname=["']description["'][^>]*>/i,
    '$1'
  );

  if (updated === original || (updated.match(META_DESC) || []).length !== 1) {
    stats.conflicts.push({ file: rel, count: tags.length, note: '未能安全定位重复标签' });
    continue;
  }

  if (apply) fs.writeFileSync(file, updated);
  stats.fixed += 1;
}

console.log(JSON.stringify({
  mode: apply ? 'apply' : 'dry-run',
  scanned: stats.scanned,
  fixed: stats.fixed,
  needsReview: stats.conflicts.length,
  conflicts: stats.conflicts
}, null, 2));
