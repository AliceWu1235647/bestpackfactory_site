import fs from 'fs';
import path from 'path';

const root = path.join(process.cwd(), 'content-site');
const publicRoot = path.join(process.cwd(), 'public');
let errors = 0;

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    const st = fs.statSync(abs);
    if (st.isDirectory()) walk(abs, files);
    else if (name.endsWith('.html')) files.push(abs);
  }
  return files;
}

function existsForHref(from, href) {
  if (!href || /^(https?:|mailto:|tel:|#|javascript:|data:|\/\/)/i.test(href)) return true;
  const clean = href.split('#')[0].split('?')[0];
  if (!clean) return true;
  if (clean.startsWith('/assets/') || clean.startsWith('/css/') || clean.startsWith('/js/')) return fs.existsSync(path.join(publicRoot, clean.slice(1)));
  if (clean.startsWith('/')) return fs.existsSync(path.join(root, clean.slice(1))) || fs.existsSync(path.join(publicRoot, clean.slice(1)));
  return fs.existsSync(path.resolve(path.dirname(from), clean));
}

for (const file of walk(root)) {
  const html = fs.readFileSync(file, 'utf8');
  const re = /\s(?:href|src)=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    if (!existsForHref(file, m[1])) {
      console.error('Missing link:', path.relative(root, file), '->', m[1]);
      errors++;
    }
  }
}
console.log(`Checked links. Errors: ${errors}`);
process.exit(errors ? 1 : 0);
