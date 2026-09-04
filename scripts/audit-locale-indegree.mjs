// 计算 locale 页的「真实」内链入度:磁盘上的静态链接 + 渲染期注入的 locale switcher。
// 目的:区分「审计假阳性」(有 switcher 入链) 与「真孤儿」(不在翻译簇内,无任何入链)。
import fs from 'fs';
import path from 'path';
import { LOCALES, translatedPaths } from '../lib/locales.js';

const ROOT = 'content-site';
const cluster = new Set(translatedPaths()); // 相对路径,如 products/coffee-bags.html

console.log('translated cluster size (paths in EN + all 5 locales):', cluster.size);

let trueOrphans = [];
let coveredBySwitcher = [];
let missingPerLocale = {};

for (const loc of LOCALES) {
  const dir = path.join(ROOT, loc);
  if (!fs.existsSync(dir)) continue;
  const pages = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.html')) pages.push(path.relative(dir, p).split(path.sep).join('/'));
    }
  })(dir);

  const notInCluster = pages.filter((rel) => !cluster.has(rel));
  missingPerLocale[loc] = { total: pages.length, inCluster: pages.length - notInCluster.length, notInCluster: notInCluster.length };
  for (const rel of notInCluster) trueOrphans.push(`/${loc}/${rel}`);
  for (const rel of pages) if (cluster.has(rel)) coveredBySwitcher.push(`/${loc}/${rel}`);
}

console.log('\nper-locale page counts:', missingPerLocale);
console.log('\ncovered by render-time locale switcher (in-degree +5 each):', coveredBySwitcher.length);
console.log('NOT in cluster -> no switcher, genuinely weak:', trueOrphans.length);
for (const o of trueOrphans) console.log('  ', o);

// 反向:EN 里在簇内但 locale 缺失的路径(补齐这些即可扩大簇)
const enDir = ROOT;
const enPages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory() && LOCALES.includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) enPages.push(path.relative(enDir, p).split(path.sep).join('/'));
  }
})(enDir);
console.log('\nEN pages total:', enPages.length, '| in cluster:', enPages.filter((r) => cluster.has(r)).length);
