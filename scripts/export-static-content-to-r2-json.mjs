import fs from 'fs';
import path from 'path';

const root = process.cwd();
const contentRoot = path.join(root, 'content-site');
const outRoot = path.join(root, 'r2-seed');

function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, data) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, data); }
function strip(s='') { return String(s).replace(/\s+/g, ' ').trim(); }
function match(html, re) { const m = html.match(re); return m ? strip(m[1]) : ''; }
function meta(html, key, value) {
  const re1 = new RegExp(`<meta\\s+[^>]*(?:${key})=["']${value}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i');
  const re2 = new RegExp(`<meta\\s+[^>]*content=["']([^"']*)["'][^>]*(?:${key})=["']${value}["'][^>]*>`, 'i');
  return match(html, re1) || match(html, re2);
}
function canonical(html) {
  return match(html, /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i) || match(html, /<link\s+[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["'][^>]*>/i);
}

function exportType(type) {
  const dir = path.join(contentRoot, type);
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(n => n.endsWith('.html')).sort();
  const list = [];
  for (const name of files) {
    const file = path.join(dir, name);
    const html = read(file);
    const slug = name.replace(/\.html$/, '');
    const item = {
      slug,
      type,
      title: match(html, /<title[^>]*>([\s\S]*?)<\/title>/i) || match(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i),
      description: meta(html, 'name', 'description'),
      keywords: meta(html, 'name', 'keywords').split(',').map(k => k.trim()).filter(Boolean),
      canonical: canonical(html) || `https://bestpackfactory.com/${type}/${slug}.html`,
      url: `/${type}/${slug}.html`,
      html
    };
    write(path.join(outRoot, type, `${slug}.json`), JSON.stringify(item, null, 2));
    const { html: _html, ...summary } = item;
    list.push(summary);
  }
  write(path.join(outRoot, type, 'index.json'), JSON.stringify({ [type === 'blog' ? 'posts' : 'news']: list, count: list.length, generatedAt: new Date().toISOString() }, null, 2));
  console.log(`Exported ${list.length} ${type} files to r2-seed/${type}`);
}

exportType('blog');
exportType('news');
