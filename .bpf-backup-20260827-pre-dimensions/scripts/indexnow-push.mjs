// IndexNow push: scan content-site pages and submit full URL list to Bing/Naver/Yandex.
// Run: node scripts/indexnow-push.mjs   (after deploy so the key file is live)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const SITE = 'https://www.bestpackfactory.com';
const HOST = 'www.bestpackfactory.com';
const KEY_FILE = path.join(root, 'scripts', 'indexnow-key.txt');

// ensure key exists
let key = '';
if (fs.existsSync(KEY_FILE)) {
  key = fs.readFileSync(KEY_FILE, 'utf8').trim();
} else {
  key = crypto.randomUUID();
  fs.writeFileSync(KEY_FILE, key, 'utf8');
}
// IndexNow requires the public file to be named exactly <key>.txt at site root
const PUB_KEY = path.join(root, 'public', key + '.txt');
fs.writeFileSync(PUB_KEY, key, 'utf8'); // always refresh the public key file

// scan content-site for html files -> URLs
const urls = [SITE + '/'];
const seen = new Set([SITE + '/']);
function walk(d, baseDir) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, baseDir);
    else if (e.name.endsWith('.html')) {
      let rel = path.relative(baseDir, p).replace(/\\/g, '/');
      const u = SITE + '/' + rel;
      if (!seen.has(u)) { seen.add(u); urls.push(u); }
    }
  }
}
walk(path.join(root, 'content-site'), path.join(root, 'content-site'));
console.log('total URLs to push:', urls.length);

const payload = {
  host: HOST,
  key,
  keyLocation: `${SITE}/${key}.txt`,
  urlList: urls,
};

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});
console.log('IndexNow response:', res.status, res.statusText);
const text = await res.text();
if (text) console.log(text.slice(0, 300));
process.exit(res.status === 200 || res.status === 202 ? 0 : 1);
