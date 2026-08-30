// 修完 102 个内容相同的重复项后,剩下 8 个页面的两条 description 文案不同。
// 两条都是人写的、都通顺,差别在信息量:一条是完整版(含具体规格/测试方法),
// 一条是精简版。Google 摘要可展示约 155-160 字符,在不超限的前提下
// 信息更全的那条更有价值,因此保留较长的一条,删除较短的。
//
// 若较长的一条明显超过 SEO 上限(>200 字符)而较短的没超,则反过来保留较短的,
// 避免为了信息量而被截断。
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content-site');
const apply = !process.argv.includes('--dry-run');

const META_DESC = /<meta\b[^>]*\bname=["']description["'][^>]*>/gi;
const CONTENT_ATTR = /\bcontent=["']([^"']*)["']/i;
const MAX_SEO = 200;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const report = [];

for (const file of walk(CONTENT)) {
  const original = fs.readFileSync(file, 'utf8');
  const tags = original.match(META_DESC) || [];
  if (tags.length < 2) continue;

  const rel = path.relative(CONTENT, file).split(path.sep).join('/');
  const entries = tags.map(t => ({ tag: t, value: (t.match(CONTENT_ATTR) || [])[1] ?? '' }));
  if (new Set(entries.map(e => e.value)).size === 1) continue; // 相同的已由上一个脚本处理

  const sorted = [...entries].sort((a, b) => b.value.length - a.value.length);
  const longest = sorted[0];
  const shortest = sorted[sorted.length - 1];

  // 长的超出 SEO 上限而短的没超 -> 保留短的;否则保留长的
  const keep = (longest.value.length > MAX_SEO && shortest.value.length <= MAX_SEO)
    ? shortest
    : longest;

  let updated = original;
  for (const e of entries) {
    if (e.tag === keep.tag) continue;
    // 连同其所在行一起移除,避免留下空行
    updated = updated.replace(new RegExp(`\\n?${e.tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), '');
  }

  const remaining = (updated.match(META_DESC) || []).length;
  if (remaining !== 1) {
    report.push({ file: rel, status: 'skipped', reason: `处理后剩 ${remaining} 个,未改动` });
    continue;
  }

  if (apply) fs.writeFileSync(file, updated);
  report.push({
    file: rel,
    status: 'fixed',
    kept: `${keep.value.length} 字符`,
    removed: entries.filter(e => e.tag !== keep.tag).map(e => `${e.value.length} 字符`)
  });
}

console.log(JSON.stringify({
  mode: apply ? 'apply' : 'dry-run',
  processed: report.length,
  report
}, null, 2));
