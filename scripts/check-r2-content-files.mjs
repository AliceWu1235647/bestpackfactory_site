import fs from 'fs';
import path from 'path';

const root = path.join(process.cwd(), 'r2-seed');
let errors = 0;

function checkType(type, indexKey) {
  const dir = path.join(root, type);
  if (!fs.existsSync(dir)) {
    console.log(`Missing optional ${dir}`);
    return;
  }
  const indexFile = path.join(dir, 'index.json');
  if (!fs.existsSync(indexFile)) {
    console.error(`Missing ${type}/index.json`);
    errors++;
    return;
  }
  let index;
  try { index = JSON.parse(fs.readFileSync(indexFile, 'utf8')); }
  catch (e) { console.error(`Invalid ${type}/index.json`, e.message); errors++; return; }
  const items = Array.isArray(index?.[indexKey]) ? index[indexKey] : Array.isArray(index?.items) ? index.items : Array.isArray(index) ? index : [];
  for (const item of items) {
    const slug = String(item.slug || item.id || item.url || '').replace(/^\/+/, '').replace(new RegExp(`^${type}/`), '').replace(/\.html$/, '').replace(/\.json$/, '');
    if (!slug) { console.error(`Missing slug in ${type}/index.json`); errors++; continue; }
    const file = path.join(dir, `${slug}.json`);
    if (!fs.existsSync(file)) { console.error(`Missing ${type}/${slug}.json`); errors++; continue; }
    try { JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch (e) { console.error(`Invalid ${type}/${slug}.json`, e.message); errors++; }
  }
  console.log(`Checked ${items.length} ${type} R2 seed entries.`);
}

checkType('blog', 'posts');
checkType('news', 'news');
console.log(`R2 content seed check errors: ${errors}`);
process.exit(errors ? 1 : 0);
